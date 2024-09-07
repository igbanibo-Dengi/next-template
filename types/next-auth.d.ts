import type { JWT as DefaultJWT } from "next-auth/jwt"
import type { User as DefaultUserr } from "next-auth"
import { users } from "@drizzle/schema"

declare module "next-auth" {
    interface User extends DefaultUser {
        role: (typeof users.$inferSelect)["role"]
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultUser {
        id: (typeof users.$inferSelect)["id"];
        role: (typeof users.$inferSelect)["role"]
    }
}