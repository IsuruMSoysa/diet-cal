"use client";

import { useEffect, useState } from "react";
import { getMealsAction, deleteMealAction } from "@/actions/meal-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import type { Meal } from "@/types/meal";
import { toast } from "sonner";

export function MealHistory() {
  const [meals, setMeals] = useState<Record<string, Meal[]>>({});
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeals = async () => {
      const { auth } = await import("@/lib/firebase/client");
      // Wait for auth to initialize
      // This is a bit hacky, ideally use an AuthContext
      const checkAuth = setInterval(async () => {
        if (auth.currentUser) {
          clearInterval(checkAuth);
          const result = await getMealsAction(auth.currentUser.uid);
          if (result.success && result.data) {
            setMeals(result.data);
          }
          setLoading(false);
        } else if (auth.currentUser === null && loading) {
          // If explicitly null (initialized but no user), stop loading
          // But we might be waiting for initial load.
          // Let's just wait a bit or handle the "not logged in" state.
        }
      }, 500);

      // Timeout to stop checking
      setTimeout(() => {
        clearInterval(checkAuth);
        if (loading) setLoading(false);
      }, 5000);
    };

    fetchMeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (mealId: string) => {
    if (!confirm("Are you sure you want to delete this meal?")) {
      return;
    }

    const { auth } = await import("@/lib/firebase/client");
    if (!auth.currentUser) {
      toast.error("You must be logged in to delete meals");
      return;
    }

    setDeletingId(mealId);
    const result = await deleteMealAction(mealId, auth.currentUser.uid);
    setDeletingId(null);

    if (result.success) {
      // Remove from local state
      setMeals((prevMeals) => {
        const newMeals = { ...prevMeals };
        for (const date in newMeals) {
          newMeals[date] = newMeals[date].filter((m) => m.id !== mealId);
          if (newMeals[date].length === 0) {
            delete newMeals[date];
          }
        }
        return newMeals;
      });
    } else {
      toast.error(`Failed to delete meal: ${result.error}`);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (Object.keys(meals).length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No meals recorded yet. Start by adding one!
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {Object.entries(meals).map(([date, mealsForDate]) => (
        <div key={date} className="w-full">
          {/* Date Header */}
          <h2 className="text-lg font-semibold mb-4">
            {format(new Date(date), "PPP")}
          </h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {mealsForDate.map((meal) => (
              <Card
                key={meal.id}
                className="overflow-hidden hover:shadow-xl transition-all active:scale-95 cursor-pointer pt-0 pb-2"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={meal.imageUrl}
                    alt={meal.description || "Meal image"}
                    fill
                    className="object-cover"
                  />
                  {/* Delete button overlay */}
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 bg-black/50 hover:bg-black/70 text-white hover:text-white backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(meal.id);
                      }}
                      disabled={deletingId === meal.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  {/* Calories - Large and bold */}
                  <div className="mb-3 flex items-baseline justify-between">
                    <div
                      className={`text-2xl font-bold ${
                        meal.totalCalories < 200
                          ? "text-green-500"
                          : meal.totalCalories < 500
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {meal.totalCalories} kcal
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {meal.createdAt
                        ? formatDistanceToNow(new Date(meal.createdAt), {
                            addSuffix: true,
                          })
                        : ""}
                    </span>
                  </div>
                  {/* Title and time */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-medium text-sm line-clamp-5 flex-1">
                      {meal.description}
                    </h3>
                  </div>

                  {/* Labels */}
                  {meal.labels && meal.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {meal.labels.map((label: string, index: number) => (
                        <Badge
                          key={`${label}-${index}`}
                          variant="secondary"
                          className="text-xs"
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Macros - Horizontal row with colored pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="text-xs font-medium bg-green-500/20 text-green-500 border-green-500/30">
                      P: {meal.macros?.protein || "0"}
                    </Badge>
                    <Badge className="text-xs font-medium bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                      C: {meal.macros?.carbs || "0"}
                    </Badge>
                    <Badge className="text-xs font-medium bg-orange-500/20 text-orange-500 border-orange-500/30">
                      F: {meal.macros?.fat || "0"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
