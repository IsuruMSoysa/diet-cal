"use client";

import { useEffect, useState } from "react";
import { getTodayMealsAction } from "@/actions/meal-actions";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface DailyProgressProps {
  userId: string;
  dailyGoal?: number;
}

export function DailyProgress({
  userId,
  dailyGoal = 2000,
}: DailyProgressProps) {
  const [consumed, setConsumed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayMeals = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const result = await getTodayMealsAction(userId);
      if (result.success && result.data) {
        setConsumed(result.data.totalCalories);
      }
      setLoading(false);
    };

    fetchTodayMeals();
  }, [userId]);

  const percentage =
    dailyGoal > 0 ? Math.min((consumed / dailyGoal) * 100, 100) : 0;
  const remaining = Math.max(dailyGoal - consumed, 0);

  // Color coding: green if under 80%, yellow if 80-100%, red if over 100%
  const getProgressColor = () => {
    if (percentage < 80) return "bg-green-500";
    if (percentage <= 100) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-2 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Daily Calories</span>
            <span className="font-semibold">
              {consumed.toLocaleString()} / {dailyGoal.toLocaleString()} kcal
            </span>
          </div>
          <Progress
            value={percentage}
            className={`h-3 ${getProgressColor()} [&>div]:bg-orange-500`}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {percentage >= 100
                ? `Over by ${Math.abs(remaining).toLocaleString()} kcal`
                : `${remaining.toLocaleString()} kcal remaining`}
            </span>
            <span>{percentage.toFixed(0)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
