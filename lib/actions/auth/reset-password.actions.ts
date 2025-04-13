"use server";

import { users, verificationTokens } from "@/database/drizzle/schema";
import { findVerificationTokenByToken } from "@/resources/verification-token-queries";
import { ResetPasswordSchema } from "@/validators/reset-password-validator";
import * as v from "valibot";
import bcrypt from 'bcrypt'
// import argon2 from "argon2";
import db from "@/database/drizzle";
import { eq } from "drizzle-orm";
import { findUserByEmail } from "@/resources/user.queries";

type Res =
    | { success: true }
    | { success: false; error: v.FlatErrors<undefined>; statusCode: 400 }
    | { success: false; error: string; statusCode: 401 | 500 };

export async function resetPasswordAction(
    email: (typeof users.$inferSelect)["email"],
    token: (typeof verificationTokens.$inferSelect)["token"],
    values: unknown,
): Promise<Res> {
    const parsedValues = v.safeParse(ResetPasswordSchema, values);

    if (!parsedValues.success) {
        const flatErrors = v.flatten(parsedValues.issues);
        return { success: false, error: flatErrors, statusCode: 400 };
    }

    const password = parsedValues.output.password;

    const existingToken = await findVerificationTokenByToken(token);

    if (!existingToken?.expires) {
        return {
            success: false,
            error: "Token is invalid",
            statusCode: 401,
        };
    }

    if (new Date(existingToken.expires) < new Date()) {
        return {
            success: false,
            error: "Token is expired",
            statusCode: 401,
        };
    }

    const existingUser = await findUserByEmail(email);

    if (
        !existingUser?.password ||
        existingUser.email !== existingToken.identifier
    ) {
        return {
            success: false,
            error: "Oops, something went wrong",
            statusCode: 401,
        };
    }

    try {
        // const hashedPassword = await argon2.hash(password);
        const hashedPassword = await bcrypt.hash(password, 10);
        // console.log(hashedPassword);


        await db
            .update(users)
            .set({ password: hashedPassword })
            .where(eq(users.email, email));

        return { success: true };
    } catch (err) {
        console.error(err);
        return { success: false, error: "Internal Server Error", statusCode: 500 };
    }
}