import React from "react";
import { getCurrentUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";

async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardClient
      userId={user.uid}
      userName={user.name}
      userEmail={user.email}
      userImage={user.image}
    />
  );
}

export default Dashboard;
