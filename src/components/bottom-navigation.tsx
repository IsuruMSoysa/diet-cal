"use client";

import { useRouter } from "next/navigation";
import { Plus, History, BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({
  activeTab,
  onTabChange,
}: BottomNavigationProps) {
  const navItems = [
    { id: "history", label: "History", icon: History },
    { id: "add", label: "Add Meal", icon: Plus },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    // { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border ">
      <div className="grid grid-cols-3 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
                isActive
                  ? "text-primary bg-green-700"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className={cn("text-[10px]", isActive && "font-semibold")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
