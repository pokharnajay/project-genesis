import { NextRequest, NextResponse } from "next/server";

/**
 * Updated route to handle:
 * - priority (tasty, calorie, dessert)
 * - maxCalories (if calorie)
 * - numPeople
 * - mealType
 * - cookingTime
 * - cuisine
 * - notes
 * - ingredients
 *
 * Make sure you have NEXT_PUBLIC_OPENROUTER_API_KEY in .env for a successful call.
 */

export async function POST(req: NextRequest) {
  try {
    console.log("[RECIPE-GENERATOR] Incoming request...");
    const body = await req.json();

    // Extract the new fields
    const {
      ingredients = [],
      priority = "tasty",
      maxCalories = 500,
      numPeople = "2",
      mealType = "",
      cookingTime = "30",
      cuisine = "",
      notes = "",
    } = body;

    console.log("[RECIPE-GENERATOR] Parsed body:", {
      ingredients,
      priority,
      maxCalories,
      numPeople,
      mealType,
      cookingTime,
      cuisine,
      notes,
    });

    // 1) Construct system message
    const systemMessage = `
You are an AI recipe assistant. Return valid JSON in the structure:
{
  "recipes": [
    {
      "titleEn": "...",
      "titleHi": "...",
      "shortDescriptionEn": "...",
      "shortDescriptionHi": "...",
      "caloriesEstimate": "...",
      "healthTasteRatio": "...",
      "ingredientsEn": [],
      "ingredientsHi": [],
      "instructionsEn": [],
      "instructionsHi": []
    }
    // ... potentially more recipes
  ],
  "reasoningEn": "...",
  "reasoningHi": "..."
}

Constraints:
1) The user can have a priority of "tasty", "calorie", or "dessert".
   - If "calorie", keep dish under ${maxCalories} calories total if possible.
2) User wants enough for ${numPeople} people.
3) Meal type: ${mealType}
4) Cooking time: ~${cookingTime} minutes.
5) Cuisine: ${cuisine}
6) Ingredients: ${ingredients.join(", ")}
7) User notes: ${notes}
8) Assume that pantry staples, including masalas and other small spices, are already present at home.
9) If the dish does not have a specific name, invent a fun and creative name.
10) Provide a shortDescription (3-4 sentences) in both English and Hindi.
11) Provide extremely detailed step-by-step instructions in both English and Hindi.
12) Provide at least 2-3 recipes in the "recipes" array (sometimes you can give just 1 or 2).
13) Include 1-3 lines of "thought process" in both English and Hindi (reasoningEn and reasoningHi).
14) Output only JSON, no triple backticks or extra text.
15) If no ingredients are provided, generate random, fun recipes with creative names and unexpected twists.

Here are three short thought-process examples (English):
"Reviewed the ingredients and kept the recipe low-calorie while maximizing flavor. Detailed steps ensure ease of preparation."
"Balanced taste and health by reimagining a classic dish with a creative twist. Each step is clear and concise."
"Analyzed user inputs and designed a fun, efficient recipe with simple, step-by-step instructions."

Now provide the same style in both English and Hindi.
`;

    // 2) Construct user message
    const userMessage = `
User priority: ${priority}
Max calories (only if calorie): ${maxCalories}
Number of people: ${numPeople}
Meal type: ${mealType}
Cooking time: ${cookingTime} minutes
Cuisine: ${cuisine}
Additional notes: ${notes}

Ingredients: ${ingredients.join(", ")}

Return JSON with both English and Hindi fields:
- "titleEn", "titleHi"
- "shortDescriptionEn", "shortDescriptionHi"
- "ingredientsEn", "ingredientsHi"
- "instructionsEn", "instructionsHi"
- "reasoningEn", "reasoningHi"
And follow constraints above.
`;

    // 3) Make the call to OpenRouter
    console.log("[RECIPE-GENERATOR] Calling openrouter with model=deepseek/deepseek-r1:free...");
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ?? ""}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-thinking-exp:free",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      console.error("[RECIPE-GENERATOR] OpenRouter responded with error:", response.status, response.statusText);
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[RECIPE-GENERATOR] OpenRouter response data:", data);

    // The raw text response
    const rawText = data?.choices?.[0]?.message?.content || "";
    let recipes = null;
    let reasoningEn = "";
    let reasoningHi = "";

    // 4) Parse JSON
    try {
      let jsonText = rawText.trim();
      // Remove triple-backtick code fences if present
      if (jsonText.startsWith("```")) {
        const firstNewLine = jsonText.indexOf("\n");
        const lastFence = jsonText.lastIndexOf("```");
        if (firstNewLine !== -1 && lastFence !== -1) {
          jsonText = jsonText.slice(firstNewLine, lastFence).trim();
        }
      }
      const parsed = JSON.parse(jsonText);
      recipes = parsed.recipes || null;
      reasoningEn = parsed.reasoningEn || "";
      reasoningHi = parsed.reasoningHi || "";
    } catch (parseErr) {
      console.warn("[RECIPE-GENERATOR] Could not parse JSON; returning fallback values");
      recipes = [
        {
          titleEn: "Fallback Recipe",
          titleHi: "फ़ॉलबैक रेसिपी",
          shortDescriptionEn: "Could not parse short description.",
          shortDescriptionHi: "शॉर्ट विवरण पार्स नहीं हो पाया।",
          caloriesEstimate: "Unknown",
          healthTasteRatio: "Unknown",
          ingredientsEn: [],
          ingredientsHi: [],
          instructionsEn: [],
          instructionsHi: [],
        },
      ];
      reasoningEn = rawText;
      reasoningHi = "Could not parse Hindi reasoning.";
    }

    // Fallback if no recipes
    if (!recipes) {
      recipes = [
        {
          titleEn: "Unknown Title",
          titleHi: "अज्ञात शीर्षक",
          shortDescriptionEn: "No valid recipe found in AI response.",
          shortDescriptionHi: "AI प्रतिक्रिया में कोई मान्य रेसिपी नहीं मिली।",
          caloriesEstimate: "Unknown",
          healthTasteRatio: "Unknown",
          ingredientsEn: [],
          ingredientsHi: [],
          instructionsEn: [],
          instructionsHi: [],
        },
      ];
    }

    return new Response(JSON.stringify({ recipes, reasoningEn, reasoningHi }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[RECIPE-GENERATOR] Caught error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Something went wrong" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
