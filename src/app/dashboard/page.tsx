import React from "react";
import { getCurrentUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import LogoutButton from "@/components/logoutButton";
import DietCalLogo from "@/components/dietCalLogo";
import { AddMeal } from "@/components/add-meal";
import { MealHistory } from "@/components/meal-history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function Dashboard() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userDisplayName = user.name || user.email;

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
        <DietCalLogo />
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline-block">
            Welcome, {userDisplayName}
          </span>
          {user.image && (
            <Image
              src={user.image}
              alt={user.name || "User image"}
              width={32}
              height={32}
              className="rounded-full border-2 border-primary"
            />
          )}
          <LogoutButton />
        </div>
      </div>

      <main className="container mx-auto p-4 py-8 max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Meal Tracker</h1>
          <p className="text-muted-foreground">
            Upload photos of your meals to get instant calorie and macro analysis.
          </p>
        </div>

        <Tabs defaultValue="add" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="add">Add Meal</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="add" className="mt-0">
            <AddMeal />
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <MealHistory />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default Dashboard;
