"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import DietCalLogo from "@/components/dietCalLogo";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, redirect to dashboard
        router.push("/dashboard");
      } else {
        // No user is signed in, show the landing page
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-green-300 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-start py-2 relative pt-20"
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
      <div className="mt-16 mb-8 relative z-10">
        <DietCalLogo />
      </div>
      <h1 className="text-5xl font-bold relative z-10 text-green-300">
        Ready to take control of your diet?
      </h1>
      <p className="mt-4 text-lg text-gray-400 relative z-10">
        Welcome to your one-stop solution for diet management.
      </p>
      {/* get started button */}
      <button
        className="mt-6 rounded px-4 py-2 font-bold text-white bg-green-600 hover:bg-green-700 relative z-10"
        onClick={() => router.push("/login")}
      >
        Get Started
      </button>
    </div>
  );
}
