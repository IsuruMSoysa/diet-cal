import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  console.warn("GOOGLE_GENERATIVE_AI_API_KEY is not defined");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function analyzeMeal(
  imageBase64: string,
  mimeType: string,
  userDescription?: string
) {
  const modelsToTry = [
    "gemini-2.5-flash-image",
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash-001",
  ];

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting to analyze with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      const descriptionContext = userDescription
        ? `\n\nUser notes: ${userDescription}\nPlease consider these details when estimating portions and nutritional values.`
        : "";

      const prompt = `
        Analyze this image of a meal. Identify the food items and estimate the total calories and macronutrients.${descriptionContext}
        Return the result as a JSON object with the following structure:
        {
          "foodItems": ["item1", "item2"],
          "totalCalories": number,
          "macros": {
            "protein": "number (g)",
            "carbs": "number (g)",
            "fat": "number (g)"
          },
          "description": "A brief description of the meal"
        }
        Do not include markdown formatting (like \`\`\`json). Just return the raw JSON string.
      `;

      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType,
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      const cleanedText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      return JSON.parse(cleanedText);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.warn(`Failed with model ${modelName}:`, errorMessage);
      // If it's the last model, throw the error
      if (modelName === modelsToTry[modelsToTry.length - 1]) {
        console.error("All models failed.");
        if (error instanceof Error && "response" in error) {
          console.error(
            "Gemini API Error Response:",
            JSON.stringify((error as { response: unknown }).response, null, 2)
          );
        }
        const lastError =
          error instanceof Error ? error.message : "Unknown error";
        throw new Error(
          `Failed to analyze meal image with any model. Last error: ${lastError}`
        );
      }
      // Otherwise continue to next model
    }
  }
}
