import React from "react";
import { getCurrentUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import Image from "next/image";

async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) {
    // If user is null, they are not authenticated (redirect already handled by middleware, but good practice to handle here too)
    redirect("/login");
  }

  const userDisplayName = user.name || user.email;

  console.log("Authenticated user:", user);

  return (
    <div className="p-4">
      {user.image && (
        <Image
          src={user.image}
          alt={user.name || "User image"}
          width={96}
          height={96}
          className="rounded-full w-24 h-24"
        />
      )}
      <h1 className="text-3xl font-bold mb-4">Welcome, {userDisplayName}!</h1>
      <p>
        Welcome to your dashboard! Here you can manage your diet plans and track
        your progress.
      </p>
    </div>
  );
}

export default Dashboard;
