"use client";

import { useEffect, useState } from "react";
import { getMealsAction, deleteMealAction } from "@/actions/meal-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";

export function MealHistory() {
  const [meals, setMeals] = useState<any[]>([]);
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
  }, []);

  const handleDelete = async (mealId: string) => {
    if (!confirm("Are you sure you want to delete this meal?")) {
      return;
    }

    const { auth } = await import("@/lib/firebase/client");
    if (!auth.currentUser) {
      alert("You must be logged in to delete meals");
      return;
    }

    setDeletingId(mealId);
    const result = await deleteMealAction(mealId, auth.currentUser.uid);
    setDeletingId(null);

    if (result.success) {
      // Remove from local state
      setMeals(meals.filter(m => m.id !== mealId));
    } else {
      alert(`Failed to delete meal: ${result.error}`);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No meals recorded yet. Start by adding one!
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {meals.map((meal) => (
        <Card key={meal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative h-48 w-full">
            <Image 
              src={meal.imageUrl} 
              alt={meal.description || "Meal image"} 
              fill 
              className="object-cover"
            />
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold truncate flex-1">{meal.description}</h3>
              <div className="flex items-center gap-2 ml-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {meal.createdAt ? formatDistanceToNow(new Date(meal.createdAt), { addSuffix: true }) : ""}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(meal.id)}
                  disabled={deletingId === meal.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {meal.labels && meal.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {meal.labels.map((label: string, index: number) => (
                  <Badge key={`${label}-${index}`} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="text-muted-foreground">Calories:</div>
              <div className="font-medium">{meal.totalCalories} kcal</div>
              <div className="text-muted-foreground">Protein:</div>
              <div>{meal.macros?.protein}</div>
              <div className="text-muted-foreground">Carbs:</div>
              <div>{meal.macros?.carbs}</div>
              <div className="text-muted-foreground">Fat:</div>
              <div>{meal.macros?.fat}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
