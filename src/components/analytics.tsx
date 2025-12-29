"use client";

import { useEffect, useState } from "react";
import {
  getWeeklyMealsAction,
  getMonthlyMealsAction,
} from "@/actions/meal-actions";
import { getUserSettingsAction } from "@/actions/user-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format, parseISO } from "date-fns";
import type { WeeklyDataPoint, MonthlyDataPoint } from "@/types/meal";

interface AnalyticsProps {
  userId: string;
}

export function Analytics({ userId }: AnalyticsProps) {
  const [weeklyData, setWeeklyData] = useState<WeeklyDataPoint[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // Fetch settings for daily goal
      const settingsResult = await getUserSettingsAction(userId);
      if (settingsResult.success && settingsResult.data) {
        setDailyGoal(settingsResult.data.dailyCalorieGoal || 2000);
      }

      // Fetch weekly and monthly data
      const [weeklyResult, monthlyResult] = await Promise.all([
        getWeeklyMealsAction(userId),
        getMonthlyMealsAction(userId),
      ]);

      if (weeklyResult.success && weeklyResult.data) {
        // Format weekly data with day names
        const formatted = weeklyResult.data.map((item) => ({
          ...item,
          day: format(parseISO(item.date), "EEE"),
          dateLabel: format(parseISO(item.date), "MMM d"),
        }));
        setWeeklyData(formatted);
      }

      if (monthlyResult.success && monthlyResult.data) {
        // Format monthly data
        const formatted = monthlyResult.data.map((item) => ({
          ...item,
          dateLabel: format(parseISO(item.date), "MMM d"),
        }));
        setMonthlyData(formatted);
      }

      setLoading(false);
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly Progress Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#fff"
                opacity={0.3}
              />
              <XAxis dataKey="day" stroke="#fff" style={{ fontSize: "12px" }} />
              <YAxis stroke="#fff" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <ReferenceLine
                y={dailyGoal}
                stroke="#fff"
                strokeDasharray="5 5"
                label={{
                  value: "Goal",
                  position: "right",
                  fill: "#fff",
                }}
              />
              <Bar
                dataKey="calories"
                fill="rgb(34, 197, 94)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Progress Graph */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#fff"
                opacity={0.3}
              />
              <XAxis
                dataKey="dateLabel"
                stroke="#fff"
                style={{ fontSize: "12px" }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <ReferenceLine
                y={dailyGoal}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="5 5"
                label={{
                  value: "Goal",
                  position: "right",
                  fill: "hsl(var(--muted-foreground))",
                }}
              />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="rgb(34, 197, 94)"
                strokeWidth={2}
                dot={{ fill: "rgb(34, 197, 94)", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
