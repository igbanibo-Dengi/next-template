"use client";

import { users } from "@/database/drizzle/schema";
import { toggleEmailVerifiedAction } from "@/lib/actions/admin/toggle-email-verification.actions";
import { useTransition } from "react";

type ToggleEmailVerifiedInputProps = {
    email: (typeof users.$inferSelect)["email"];
    emailVerified: (typeof users.$inferSelect)["emailVerified"];
    isAdmin: boolean;
};

export const ToggleEmailVerifiedInput = ({
    email,
    emailVerified,
    isAdmin,
}: ToggleEmailVerifiedInputProps) => {
    const [isPending, startTransition] = useTransition();

    const clickHandler = (email: string, isCurrentlyVerified: boolean) => {
        startTransition(async () => {
            await toggleEmailVerifiedAction(email, isCurrentlyVerified);
        });
    };

    return (
        <div className="flex items-center justify-center">
            <input
                disabled={isAdmin || isPending}
                type="checkbox"
                checked={!!emailVerified}
                className="scale-150 enabled:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                readOnly
                onClick={clickHandler.bind(null, email, !!emailVerified)}
            />
        </div>
    );
};