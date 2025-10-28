"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "./googleSignInButton";

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-green-400">Welcome!</CardTitle>
          <CardDescription>Sign In with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <GoogleSignInButton />
              </Field>
              <Field>
                <FieldDescription className="text-center">
                  Already have an account?
                  <Button
                    variant="link"
                    type="button"
                    className="underline cursor-pointer"
                    onClick={() => {
                      router.push("/login");
                    }}
                  >
                    Log in
                  </Button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
