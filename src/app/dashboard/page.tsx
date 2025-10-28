import React from "react";
import { getCurrentUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import LogoutButton from "@/components/logoutButton";
import DietCalLogo from "@/components/dietCalLogo";

async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) {
    // If user is null, they are not authenticated (redirect already handled by middleware, but good practice to handle here too)
    redirect("/login");
  }

  const userDisplayName = user.name || user.email;

  return (
    <div className="min-h-[100vh] max-h-[100vh] overflow-y-hidden">
      <div className="p-4 border-b border-b-muted flex items-center">
        <DietCalLogo />
      </div>
      <div className="p-4 flex flex-col items-center justify-center min-h-[100vh]">
        {user.image && (
          <Image
            src={user.image}
            alt={user.name || "User image"}
            width={96}
            height={96}
            className="rounded-full w-30 h-30 mb-3 border-4 border-green-500"
          />
        )}
        <h1 className="text-3xl font-bold mb-2">Welcome, {userDisplayName}!</h1>
        <p className="text-center text-gray-400">
          Welcome to your dashboard! Here you can manage your diet plans and
          track your progress.
        </p>
        <div className="mt-6">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
