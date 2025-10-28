"use client";
import { LoginForm } from "@/components/login-form";
import DietCalLogo from "@/components/dietCalLogo";

export default function LoginPage() {
  return (
    <div
      className=" flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for reduced opacity */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(0,0,0,0.6)",
          pointerEvents: "none",
        }}
      />
      <div className="flex w-full max-w-sm flex-col gap-6 relative z-10">
        <DietCalLogo />
        <LoginForm />
      </div>
    </div>
  );
}
