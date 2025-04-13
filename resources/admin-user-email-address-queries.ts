import "server-only";

import db from "@/database/drizzle";
import { adminUserEmailAddresses, lower } from "@/database/drizzle/schema";

export const findAdminUserEmailAddresses = async () => {
    const adminUserEmailAddress = await db
        .select({ email: lower(adminUserEmailAddresses.email) })
        .from(adminUserEmailAddresses);

    return adminUserEmailAddress.map((item) => item.email as string);
};