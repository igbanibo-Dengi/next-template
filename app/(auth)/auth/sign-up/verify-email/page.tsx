import { Button } from "@/components/ui/button";
import { verifyCredentialsEmailAction } from "@/lib/actions/auth/verify-credentials-email-action";
import { findVerificationTokenByToken } from "@/resources/verification-token-queries";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

type PageProps = { searchParams: Promise<{ token: string }> };

export default async function Page(props: PageProps) {
    const searchParams = await props.searchParams;
    const verificationToken = await findVerificationTokenByToken(
        searchParams.token,
    );

    if (!verificationToken?.expires) return <TokenIsInvalidState />;

    const isExpired = new Date(verificationToken.expires) < new Date();

    if (isExpired) return <TokenIsInvalidState />;

    const res = await verifyCredentialsEmailAction(searchParams.token);

    if (!res.success) return <TokenIsInvalidState />;

    return (
        <main className="h-full w-full">
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex h-full w-full flex-col items-center justify-center md:border-r-2 gap-6 lg:w-1/2 p-8">
                    <div className="text-center space-y-4">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                        <h1 className="text-3xl font-bold tracking-tight">Email Verified</h1>
                    </div>

                    <div className="bg-muted h-px w-full max-w-md" />

                    <div className="text-center space-y-2">
                        <p className="text-xl font-semibold">Your email has been successfully verified!</p>
                        <p className="text-muted-foreground">You can now sign in to your account.</p>
                    </div>

                    <div className="bg-muted h-px w-full max-w-md" />

                    <div className="space-y-4 w-full max-w-md">
                        <Button variant="default" className="w-full" asChild>
                            <Link href="/auth/sign-in">Sign In</Link>
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/">Back to Home</Link>
                        </Button>
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
                        <h1 className="text-3xl font-bold tracking-tight">Invalid Token</h1>
                    </div>

                    <div className="bg-muted h-px w-full max-w-md" />

                    <div className="text-center space-y-2">
                        <p className="text-xl font-semibold">The verification token is invalid or has expired.</p>
                        <p className="text-muted-foreground">Please try signing up again to receive a new verification email.</p>
                    </div>

                    <div className="bg-muted h-px w-full max-w-md" />

                    <div className="space-y-4 w-full max-w-md">
                        <Button variant="default" className="w-full" asChild>
                            <Link href="/auth/sign-up">Sign Up Again</Link>
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href="/">Back to Home</Link>
                        </Button>
                    </div>
                </div>
                <div className="hidden h-screen lg:flex lg:w-1/2 bg-muted"></div>
            </div>
        </main>
    );
};