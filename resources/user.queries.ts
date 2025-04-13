import "server-only"
import db from "@/database/drizzle"
import { lower, users } from "@/database/drizzle/schema"
import {
    desc,
    eq,
    getTableColumns,
} from "drizzle-orm"
import { auth } from "@/auth"
import { USER_ROLES } from "@/lib/constants"

/* ADMIN QUERIES - THESE QUERIES REQUIRE ADMIN ACCESS */
export async function findAllUsers() {
    const session = await auth();

    if (session?.user?.role !== USER_ROLES.ADMIN) {
        throw new Error("Unauthorized");
    }

    const { password, ...rest } = getTableColumns(users);

    const allUsers = await db
        .select({ ...rest })
        .from(users)
        .orderBy(desc(users.role));

    return allUsers;
}


// FIND USER BY EMAIL
export const findUserByEmail = async (email: string): Promise<typeof users.$inferSelect | null> => {
    const user = await db
        .select()
        .from(users)
        .where(eq(lower(users.email), email.toLowerCase()))
        .then(res => res[0] ?? null)

    return user
}

// FIND USER BY ID
// type userWithoutPassword = Omit<typeof users.$inferSelect, "password">

// export const findUserById = async (
//     id: string
// ): Promise<userWithoutPassword> => {
//     const { password, ...rest } = getTableColumns(users)
//     const user = await db
//         .select(rest)
//         .from(users)
//         .where(eq(users.id, id))
//         .then((res) => res[0] ?? null)

//     if (!user) throw new Error("User not foind");

//     return user
// }


// FIND USER BY AUTH

export const findUserByAuth = async () => {
    const session = await auth()

    const sessionUserId = session?.user?.id;
    if (!sessionUserId) throw new Error("Unauthorized")

    const { password, ...rest } = getTableColumns(users)

    const user = await db
        .select(rest)
        .from(users)
        .where(eq(users.id, sessionUserId))
        .then((res) => res[0] ?? null)

    if (!user) throw new Error("User not foind");

    return user
}