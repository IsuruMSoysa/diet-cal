"use client";
import { CookingPot } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="bg-gray-100 text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <CookingPot className="size-4" />
          </div>
          <span className="text-2xl font-semibold">Diet Cal</span>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
