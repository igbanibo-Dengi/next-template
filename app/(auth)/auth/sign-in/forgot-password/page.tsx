import { Button } from "@/components/ui/button";
import { findVerificationTokenByToken } from "@/resources/verification-token-queries";
import Link from "next/link";
import { ResetPasswordForm } from "../../_components/reset-password-form";
import { KeyRound, XCircle } from "lucide-react";
import { ForgotPasswordForm } from "../../_components/forgot-password-form";

type PageProps = { searchParams: Promise<{ token: string }> };

export default async function Page(props: PageProps) {
    const searchParams = await props.searchParams;
    const verificationToken = await findVerificationTokenByToken(
        searchParams.token,
    );

    if (!verificationToken?.expires) return <TokenIsInvalidState />;

    const isExpired = new Date(verificationToken.expires) < new Date();

    if (isExpired) return <TokenIsInvalidState />;

    return (
        <main className="h-full w-full">
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex h-full w-full flex-col items-center justify-center md:border-r-2 gap-6 lg:w-1/2 p-8">
                    <div className="text-center space-y-4">
                        <KeyRound className="w-16 h-16 text-blue-500 mx-auto" />
                        <h1 className="text-3xl font-bold tracking-tight">Reset Your Password</h1>
                    </div>

                    <div className="bg-muted h-px w-full max-w-md" />

                    <div className="text-center space-y-2">
                        <p className="text-xl font-semibold">Enter your new password below</p>
                        {/* <p className="text-muted-foreground">Make sure it's at least 8 characters including a number and a lowercase letter.</p> */}
                    </div>

                    <div className="w-full max-w-md">
                        <ResetPasswordForm
                            email={verificationToken.identifier}
                            token={searchParams.token}
                        />
                    </div>

                    <div className="bg-muted h-px w-full max-w-md" />

                    <div className="text-center">
                        <span className="text-sm text-muted-foreground">
                            No longer need to reset your password?{" "}
                            <Button variant="link" size="sm" className="px-0" asChild>
                                <Link href="/auth/sign-in">Sign in here</Link>
                            </Button>
                        </span>
                    </div>
                </div>
                <div className="hidden h-screen lg:flex lg:w-1/2 bg-muted"></div>
            </div>
        </main>
    );
}

const TokenIsInvalidState = () => {
    return (
        <main className="h-full w-full">
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex h-full w-full flex-col items-center justify-center md:border-r-2 gap-6 lg:w-1/2 p-8">
                    <div className="text-center space-y-4">
                        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                        <h1 className="text-3xl font-bold tracking-tight">Invalid Reset Token</h1>
                    </div>

                    <div className="bg-muted h-px w-full max-w-md" />

                    <div className="text-center space-y-2">
                        <p className="text-xl font-semibold">The password reset token is invalid or has expired.</p>
                        <p className="text-muted-foreground">Please request a new password reset email.</p>
                    </div>

                    <div className="bg-muted h-px w-full max-w-md" />

                    <div className="space-y-4 w-full max-w-md">
                        <Button variant="outline" className="w-full" asChild>
                            {/* <Link href="/auth/forgot-password">Request New Reset Email</Link> */}
                            <ForgotPasswordForm />
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/auth/sign-in">Back to Sign In</Link>
                        </Button>
                    </div>
                </div>
                <div className="hidden h-screen lg:flex lg:w-1/2 bg-muted"></div>
            </div>
        </main>
    );
};