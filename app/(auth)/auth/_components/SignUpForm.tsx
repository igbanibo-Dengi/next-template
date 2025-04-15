"use client";

import { type SignupInput, SignupSchema } from "@/validators/signup-validator";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUpAction } from "@/lib/actions/auth/signUp.actions";

export const SignupForm = () => {
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const form = useForm<SignupInput>({
    resolver: valibotResolver(SignupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const { handleSubmit, control, formState, setError, reset } = form;

  const submit = async (values: SignupInput) => {
    const res = await signUpAction(values);

    //for rate limiting
    if (res.redirectTo) {
      router.push(res.redirectTo);
      return;
    }

    if (res.success) {
      router.push("/auth/sign-up/success")
    } else {
      switch (res.statusCode) {
        case 400:
          const nestedErrors = res.error.nested;

          for (const key in nestedErrors) {
            setError(key as keyof SignupInput, {
              message: nestedErrors[key]?.[0],
            });
          }
          break;
        case 500:
        default:
          const error = res.error || "Internal Server Error";
          setError("confirmPassword", { message: error });
      }
    }
  };

  if (success) {
    return (
      <div>
        <p>User Successfully Created</p>

        <span>
          CLick {""}
          <Button variant="link" size="sm" className="px-0" asChild>
            <Link href={"/auth/sign-in"}>here</Link>
          </Button>
        </span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(submit)}
        className="w-full space-y-4 px-10 md:max-w-[600px] mx-auto md:px-20"
        autoComplete="false"
      >
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name{" "}
                <span className="text-xs text-muted-foreground">
                  (Optional)
                </span>
              </FormLabel>
              <FormControl>
                <Input type="text" placeholder="e.g. John Smith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="e.g. john.smith@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="e.g. ********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="e.g. ********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size={"lg"}
          disabled={formState.isSubmitting}
          className="w-full"
        >
          Sign Up
        </Button>
      </form>
    </Form>
  );
};
