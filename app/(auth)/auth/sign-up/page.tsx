import Link from "next/link";
import { SignupForm } from "../_components/SignUpForm";
import { Button } from "@/components/ui/button";

const SignUpPage = () => {
  return (
    <main className="h-full w-full">
      <div className="flex h-screen w-full items-center justify-center md:gap-10">
        <div className="flex h-full w-full flex-col items-center justify-center md:border-r-2 lg:w-1/2">
          <h1>Sign Up</h1>
          <SignupForm />
          <Button
            variant={"link"}
            className="mt-8 text-muted-foreground hover:underline"
            asChild
          >
            <Link href="/auth/sign-in">Already have an account? Sign in</Link>
          </Button>
        </div>
        <div className="hidden h-screen lg:flex lg:w-1/2"></div>
      </div>
    </main>
  );
};

export default SignUpPage;
