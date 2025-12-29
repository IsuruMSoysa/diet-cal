"use client";

import { useState, useEffect } from "react";
import {
  getUserSettingsAction,
  updateUserSettingsAction,
} from "@/actions/user-actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSettingsUpdated?: () => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  userId,
  onSettingsUpdated,
}: SettingsDialogProps) {
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && userId) {
      const fetchSettings = async () => {
        setLoading(true);
        const result = await getUserSettingsAction(userId);
        if (result.success && result.data) {
          setDailyGoal(result.data.dailyCalorieGoal || 2000);
        }
        setLoading(false);
      };
      fetchSettings();
    }
  }, [open, userId]);

  const handleSave = async () => {
    if (!userId || dailyGoal < 0) return;

    setSaving(true);
    const result = await updateUserSettingsAction(userId, {
      dailyCalorieGoal: Math.round(dailyGoal),
    });

    setSaving(false);

    if (result.success) {
      onSettingsUpdated?.();
      onOpenChange(false);
    } else {
      toast.error(`Failed to save settings: ${result.error}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your daily calorie goal and preferences.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="daily-goal">Daily Calorie Goal (kcal)</Label>
              <Input
                id="daily-goal"
                type="number"
                min="0"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                placeholder="2000"
              />
              <p className="text-xs text-muted-foreground">
                Set your target daily calorie intake.
              </p>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
