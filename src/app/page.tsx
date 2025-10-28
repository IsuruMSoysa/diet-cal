"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <h1 className="text-5xl font-bold">Welcome to Diet Cal!</h1>
      <p className="mt-4 text-lg text-gray-400">
        Your one-stop solution for diet management.
      </p>

      {/* get started button */}
      <button
        className="mt-6 rounded px-4 py-2 font-bold text-white bg-green-600 hover:bg-green-700"
        onClick={() => router.push("/login")}
      >
        Get Started
      </button>
    </div>
  );
}
