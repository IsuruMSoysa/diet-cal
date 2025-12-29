"use client";

import { useState, useEffect } from "react";
import { getUserSettingsAction } from "@/actions/user-actions";
import DietCalLogo from "@/components/dietCalLogo";
import { AddMeal } from "@/components/add-meal";
import { MealHistory } from "@/components/meal-history";
import { Analytics } from "@/components/analytics";
import { DailyProgress } from "@/components/daily-progress";
import { UserMenu } from "@/components/user-menu";
import { BottomNavigation } from "@/components/bottom-navigation";
import { FloatingActionButton } from "@/components/floating-action-button";

interface DashboardClientProps {
  userId: string;
  userName?: string;
  userEmail?: string;
  userImage?: string;
}

export function DashboardClient({
  userId,
  userName,
  userEmail,
  userImage,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState("history");
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [settingsUpdated, setSettingsUpdated] = useState(0);

  useEffect(() => {
    const fetchSettings = async () => {
      const result = await getUserSettingsAction(userId);
      if (result.success && result.data) {
        setDailyGoal(result.data.dailyCalorieGoal || 2000);
      }
    };
    fetchSettings();
  }, [userId, settingsUpdated]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleFABClick = () => {
    setActiveTab("add");
  };

  const handleSettingsUpdated = () => {
    setSettingsUpdated((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md z-10">
        <DietCalLogo />
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline-block">
            Welcome, {userName || userEmail}
          </span>
          <UserMenu
            userImage={userImage}
            userName={userName || userEmail}
            userId={userId}
            onSettingsUpdated={handleSettingsUpdated}
          />
        </div>
      </div>

      <main className="container mx-auto p-4 py-8 max-w-5xl">
        {/* Title - Hidden on mobile, shown on desktop */}
        <div className="mb-8 text-center hidden md:block">
          <h1 className="text-3xl font-bold mb-2">Meal Tracker</h1>
          <p className="text-muted-foreground">
            Upload photos of your meals to get instant calorie and macro
            analysis.
          </p>
        </div>
        {/* Daily Progress */}
        <div className="mb-6">
          <DailyProgress userId={userId} dailyGoal={dailyGoal} />
        </div>

        <div>
          {activeTab === "add" && <AddMeal />}
          {activeTab === "history" && <MealHistory />}
          {activeTab === "analytics" && <Analytics userId={userId} />}
          {/* {activeTab === "profile" && (
            <div className="text-center py-10 text-muted-foreground">
              Profile settings accessible via the user menu in the header.
            </div>
          )} */}
        </div>
      </main>

      {/* Floating Action Button */}
      {activeTab !== "add" && <FloatingActionButton onClick={handleFABClick} />}

      {/* Bottom Navigation (Mobile only) */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
