'use server'

import * as v from 'valibot'
import { SignupSchema } from "@/validators/signup-validator"
import bcrypt from 'bcrypt'
import db from '@/database/drizzle'
import { lower, users } from '@/database/drizzle/schema'
import { eq } from 'drizzle-orm'
import { USER_ROLES } from '@/lib/constants'
import { findAdminUserEmailAddresses } from '@/resources/admin-user-email-address-queries'
import { createVerificationTokenAction } from '../admin/create-verification-token-action'
import { headers } from 'next/headers'
import ratelimit from '@/lib/ratelimit'
import { workflowClient } from '@/lib/workflow'
import config from '@/lib/config'

type Res =
    | { success: true, redirectTo?: string }
    | { success: false; error: v.FlatErrors<undefined>; statusCode: 400, redirectTo?: string }
    | { success: false; error: string; statusCode: 409 | 500, redirectTo?: string }

export async function signUpAction(values: unknown): Promise<Res> {
    const parsedValues = v.safeParse(SignupSchema, values);

    const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1";
    const { success } = await ratelimit.limit(ip);

    const productionUrl = config.env.prodApiEndpoint

    if (!success) {
        return {
            success: false,
            redirectTo: "/too-fast",
            error: "Too many requests",
            statusCode: 409,
        }
    }

    if (!parsedValues.success) {
        const flatErors = v.flatten(parsedValues.issues);
        console.log(flatErors)
        return { success: false, error: flatErors, statusCode: 400 }

    }
    const { name, email, password } = parsedValues.output;

    // Case-insensitive email handling in PostgreSQL with Drizzle
    try {
        const existingUser = await db
            .select({ id: users.id, email: users.email, emailVerified: users.emailVerified })
            .from(users)
            .where(eq(lower(users.email), email.toLowerCase()))
            .then(res => res[0] ?? null);

        if (existingUser?.id) {
            if (!existingUser.emailVerified) {
                const verificationToken = await createVerificationTokenAction(existingUser.email)
                console.log('token', verificationToken.token, 'productionUrl', productionUrl);

                // send vefification email
                await workflowClient.trigger({
                    url: `${productionUrl}/api/workflows/onboarding`,
                    body: {
                        email,
                        name,
                        token: verificationToken.token,
                        productionUrl
                    },
                });


                return {
                    success: false,
                    error: "User exists, but is not verified. Verification link resent. Check your email",
                    statusCode: 409
                }
            } else {
                return { success: false, error: "A user with this email already exists", statusCode: 409 }
            }
        }
    } catch (err) {
        console.error(err);
        return { success: false, error: "Internal Server Error", statusCode: 500 };
    }


    try {
        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        const adminEmails = await findAdminUserEmailAddresses();
        const isAdmin = adminEmails.includes(email.toLowerCase());


        //Save user to database
        const newUser = await db
            .insert(users)
            .values({
                name,
                email,
                password: hashedPassword,
                role: isAdmin ? USER_ROLES.ADMIN : USER_ROLES.USER
            })
            .returning({ id: users.id, email: users.email, emailVerified: users.emailVerified })
            .then((res) => res[0])

        // console.log({ inseredId: newUser.id });

        const verificationToken = await createVerificationTokenAction(newUser.email)
        console.log('token', verificationToken.token, 'productionUrl', productionUrl);



        await workflowClient.trigger({
            url: `${productionUrl}/api/workflows/onboarding`,
            body: {
                email,
                name,
                token: verificationToken.token,
                productionUrl
            },
        });


        // send verification email


        return { success: true }

    } catch (err) {
        console.error(err)
        return { success: false, error: "Internal Server Error", statusCode: 500 }
    }
}