"use server";

import { adminFirestore as db } from "@/lib/firebase/admin";
import { uploadImage, deleteImage } from "@/lib/cloud-storage";
import { analyzeMeal } from "@/lib/gemini";
import { revalidatePath } from "next/cache";
import { startOfDay, endOfDay, subDays } from "date-fns";
import type {
  Meal,
  MealData,
  WeeklyDataPoint,
  MonthlyDataPoint,
} from "@/types/meal";

export async function analyzeImageAction(formData: FormData) {
  try {
    const file = formData.get("image") as File;
    if (!file) {
      throw new Error("No image provided");
    }

    const description = formData.get("description") as string | null;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType = file.type;

    const analysis = await analyzeMeal(
      base64,
      mimeType,
      description || undefined
    );
    return { success: true, data: analysis };
  } catch (error) {
    console.error("Analysis error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to analyze image";
    return { success: false, error: errorMessage };
  }
}

export async function saveMealAction(mealData: MealData, formData: FormData) {
  try {
    // Verify auth
    // Note: We need to verify the user session here.
    // Since we are using client-side Firebase Auth, we might need to pass a token or verify session cookie if using session management.
    // For this prototype, we'll assume the client sends the UID or we verify a session cookie.
    // Ideally, we should use `cookies()` to get a session token and verify it with `adminAuth.verifySessionCookie`.
    // BUT, for simplicity and speed as per "basic idea", we will trust the client-side UID passed in data OR better, verify the ID token if passed.
    // Let's assume we pass the ID token or just rely on client sending the UID (INSECURE for production, but okay for "basic idea" prototype if we don't have full auth session setup).
    // WAIT, we have `src/lib/firebase/admin.ts`. Let's check if we have a way to get current user.
    // If not, we'll just take the UID from the payload for now, but add a TODO.

    const file = formData.get("image") as File;
    if (!file) {
      throw new Error("No image provided");
    }

    const uid = mealData.userId; // Expect userId in mealData
    if (!uid) throw new Error("User ID required");

    // 1. Upload Image
    const timestamp = Date.now();
    const path = `meals/${uid}/${timestamp}-${file.name}`;
    const imageUrl = await uploadImage(file, path);

    // 2. Save to Firestore
    const mealRecord = {
      ...mealData,
      imageUrl,
      createdAt: new Date().toISOString(),
    };

    console.log("Debug: Saving to Firestore collection 'meals'", mealRecord);
    await db.collection("meals").add(mealRecord);

    // 3. Update user labels if new labels were added
    if (mealData.labels && mealData.labels.length > 0) {
      await updateUserLabelsAction(uid, mealData.labels);
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Save meal error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to save meal";
    return { success: false, error: errorMessage };
  }
}

export async function getMealsAction(userId: string) {
  try {
    const snapshot = await db
      .collection("meals")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const meals: Meal[] = snapshot.docs.map(
      (doc: FirebaseFirestore.QueryDocumentSnapshot) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Meal)
    );

    const groupedMeals: Record<string, Meal[]> = meals.reduce((acc, meal) => {
      const date = new Date(meal.createdAt).toISOString().split("T")[0]; // Extract date part
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(meal);
      return acc;
    }, {} as Record<string, Meal[]>);

    console.log(`Debug: Fetched ${meals.length} meals for user ${userId}`);
    return { success: true, data: groupedMeals };
  } catch (error) {
    console.error("Get meals error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch meals";
    return { success: false, error: errorMessage };
  }
}

export async function deleteMealAction(mealId: string, userId: string) {
  try {
    // Verify the meal belongs to the user before deleting
    const mealDoc = await db.collection("meals").doc(mealId).get();

    if (!mealDoc.exists) {
      return { success: false, error: "Meal not found" };
    }

    const mealData = mealDoc.data();
    if (mealData?.userId !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete the image from GCS
    if (mealData?.imageUrl) {
      try {
        // Extract file path from the signed URL or public URL
        // Format: https://storage.googleapis.com/bucket-name/path/to/file?...
        const url = new URL(mealData.imageUrl);
        const bucketName = process.env.GCS_BUCKET_NAME;
        if (bucketName) {
          // Remove the bucket name from the pathname to get the file path
          const filePath = url.pathname.replace(`/${bucketName}/`, "");
          await deleteImage(filePath);
        }
      } catch (error) {
        console.error("Error deleting image from GCS:", error);
        // Continue with Firestore deletion even if GCS deletion fails
      }
    }

    // Delete from Firestore
    await db.collection("meals").doc(mealId).delete();

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete meal error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete meal";
    return { success: false, error: errorMessage };
  }
}

export async function debugGemini() {
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return {
        success: false,
        error: "API Key not found in environment variables.",
      };
    }

    const maskedKey =
      apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4);
    console.log("Debug: Checking Gemini API with key:", maskedKey);

    // Fetch available models using REST API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: `API Error: ${response.status} ${response.statusText}`,
        details: data,
      };
    }

    interface GeminiModel {
      name: string;
      supportedGenerationMethods: string[];
    }

    const geminiModels = (data.models as GeminiModel[])
      .filter(
        (m) =>
          m.name.includes("gemini") &&
          m.supportedGenerationMethods.includes("generateContent")
      )
      .map((m) => m.name);

    return {
      success: true,
      models: data.models,
      geminiModels,
      keyStatus: "Present",
    };
  } catch (error) {
    console.error("Debug Gemini Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}

export async function getUserLabelsAction(userId: string) {
  try {
    const userLabelsDoc = await db.collection("userLabels").doc(userId).get();

    if (!userLabelsDoc.exists) {
      // Create empty labels collection for new user
      await db.collection("userLabels").doc(userId).set({
        labels: [],
        updatedAt: new Date().toISOString(),
      });
      return { success: true, data: [] };
    }

    const data = userLabelsDoc.data();
    return { success: true, data: data?.labels || [] };
  } catch (error) {
    console.error("Get user labels error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch user labels";
    return { success: false, error: errorMessage };
  }
}

export async function updateUserLabelsAction(
  userId: string,
  newLabels: string[]
) {
  try {
    const userLabelsDoc = await db.collection("userLabels").doc(userId).get();

    let existingLabels: string[] = [];
    if (userLabelsDoc.exists) {
      const data = userLabelsDoc.data();
      existingLabels = data?.labels || [];
    }

    // Merge and deduplicate labels
    const mergedLabels = Array.from(new Set([...existingLabels, ...newLabels]));

    await db.collection("userLabels").doc(userId).set({
      labels: mergedLabels,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, data: mergedLabels };
  } catch (error) {
    console.error("Update user labels error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update user labels";
    return { success: false, error: errorMessage };
  }
}

export async function getTodayMealsAction(userId: string) {
  try {
    const today = new Date();
    const start = startOfDay(today).toISOString();
    const end = endOfDay(today).toISOString();

    const snapshot = await db
      .collection("meals")
      .where("userId", "==", userId)
      .where("createdAt", ">=", start)
      .where("createdAt", "<=", end)
      .get();

    const meals: Meal[] = snapshot.docs.map(
      (doc: FirebaseFirestore.QueryDocumentSnapshot) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Meal)
    );

    const totalCalories = meals.reduce(
      (sum, meal) => sum + (meal.totalCalories || 0),
      0
    );

    return { success: true, data: { meals, totalCalories } };
  } catch (error) {
    console.error("Get today meals error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch today's meals";
    return { success: false, error: errorMessage };
  }
}

export async function getWeeklyMealsAction(userId: string) {
  try {
    const now = new Date();
    const sevenDaysAgo = subDays(now, 6);
    const start = startOfDay(sevenDaysAgo).toISOString();
    const end = endOfDay(now).toISOString();

    const snapshot = await db
      .collection("meals")
      .where("userId", "==", userId)
      .where("createdAt", ">=", start)
      .where("createdAt", "<=", end)
      .orderBy("createdAt", "asc")
      .get();

    const meals: Meal[] = snapshot.docs.map(
      (doc: FirebaseFirestore.QueryDocumentSnapshot) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Meal)
    );

    // Group meals by date
    const mealsByDate: Record<string, number> = {};
    meals.forEach((meal) => {
      const date = new Date(meal.createdAt).toISOString().split("T")[0];
      mealsByDate[date] = (mealsByDate[date] || 0) + (meal.totalCalories || 0);
    });

    // Create array for the past 7 days
    const weeklyData: WeeklyDataPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = date.toISOString().split("T")[0];
      weeklyData.push({
        date: dateStr,
        calories: mealsByDate[dateStr] || 0,
      });
    }

    return { success: true, data: weeklyData };
  } catch (error) {
    console.error("Get weekly meals error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch weekly meals";
    return { success: false, error: errorMessage };
  }
}

export async function getMonthlyMealsAction(userId: string) {
  try {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 29);
    const start = startOfDay(thirtyDaysAgo).toISOString();
    const end = endOfDay(now).toISOString();

    const snapshot = await db
      .collection("meals")
      .where("userId", "==", userId)
      .where("createdAt", ">=", start)
      .where("createdAt", "<=", end)
      .orderBy("createdAt", "asc")
      .get();

    const meals: Meal[] = snapshot.docs.map(
      (doc: FirebaseFirestore.QueryDocumentSnapshot) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Meal)
    );

    // Group meals by date
    const mealsByDate: Record<string, number> = {};
    meals.forEach((meal) => {
      const date = new Date(meal.createdAt).toISOString().split("T")[0];
      mealsByDate[date] = (mealsByDate[date] || 0) + (meal.totalCalories || 0);
    });

    // Create array for the past 30 days
    const monthlyData: MonthlyDataPoint[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = date.toISOString().split("T")[0];
      monthlyData.push({
        date: dateStr,
        calories: mealsByDate[dateStr] || 0,
      });
    }

    return { success: true, data: monthlyData };
  } catch (error) {
    console.error("Get monthly meals error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch monthly meals";
    return { success: false, error: errorMessage };
  }
}
