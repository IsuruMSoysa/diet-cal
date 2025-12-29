"use server";

import { adminFirestore as db } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";

export async function getUserSettingsAction(userId: string) {
  try {
    const userSettingsDoc = await db
      .collection("userSettings")
      .doc(userId)
      .get();

    if (!userSettingsDoc.exists) {
      // Create default settings for new user
      const defaultSettings = {
        dailyCalorieGoal: 2000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.collection("userSettings").doc(userId).set(defaultSettings);
      return { success: true, data: defaultSettings };
    }

    const data = userSettingsDoc.data();
    return {
      success: true,
      data: {
        dailyCalorieGoal: data?.dailyCalorieGoal || 2000,
        ...data,
      },
    };
  } catch (error) {
    console.error("Get user settings error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch user settings";
    return { success: false, error: errorMessage };
  }
}

export async function updateUserSettingsAction(
  userId: string,
  settings: { dailyCalorieGoal?: number }
) {
  try {
    const userSettingsDoc = await db
      .collection("userSettings")
      .doc(userId)
      .get();

    const existingData = userSettingsDoc.exists ? userSettingsDoc.data() : {};

    const updatedSettings = {
      ...existingData,
      ...settings,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (!userSettingsDoc.exists) {
      updatedSettings.createdAt = new Date().toISOString();
    }

    await db.collection("userSettings").doc(userId).set(updatedSettings);

    revalidatePath("/dashboard");
    return { success: true, data: updatedSettings };
  } catch (error) {
    console.error("Update user settings error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update user settings";
    return { success: false, error: errorMessage };
  }
}
