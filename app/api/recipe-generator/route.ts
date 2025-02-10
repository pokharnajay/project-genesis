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
 * Make sure you have OPENROUTER_API_KEY in .env for a successful call.
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
  "recipe": {
    "title": "...",
    "shortDescription": "...",
    "caloriesEstimate": "...",
    "healthTasteRatio": "...",
    "ingredients": [],
    "instructions": []
  },
  "reasoning": "Your short chain-of-thought"
}

Constraints:
1) The user can have a priority of "tasty", "calorie" or "dessert".
   - If "calorie", keep dish under ${maxCalories} calories total if possible.
2) user wants enough for ${numPeople} people.
3) mealType: ${mealType}
4) cookingTime: ~${cookingTime} minutes
5) ingredients: ${ingredients.join(", ")}
6) user notes: ${notes}
7) user also has pantry staples (salt, pepper, oil).
8) shortDescription = 3-4 sentences
9) instructions: step-by-step
10) Return exactly one recipe plus a short "reasoning" property.
11) Output only JSON, no triple backticks or extra text.
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
Return JSON with "recipe" and "reasoning".
`;

    // 3) Make the call to OpenRouter
    console.log("[RECIPE-GENERATOR] Calling openrouter with model=deepseek/deepseek-r1:free...");
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ""}`,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
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
    let recipe = null;
    let reasoning = "";

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
      recipe = parsed.recipe || null;
      reasoning = parsed.reasoning || "";
    } catch (parseErr) {
      console.warn("[RECIPE-GENERATOR] Could not parse JSON; returning fallback values");
      recipe = {
        title: "Fallback Recipe",
        shortDescription: "Could not parse short description",
        caloriesEstimate: "Unknown",
        healthTasteRatio: "Unknown",
        ingredients: [],
        instructions: [],
      };
      reasoning = rawText;
    }

    // fallback if no recipe
    if (!recipe) {
      recipe = {
        title: "Unknown Title",
        shortDescription: "No valid recipe found in AI response.",
        caloriesEstimate: "Unknown",
        healthTasteRatio: "Unknown",
        ingredients: [],
        instructions: [],
      };
    }

    return new Response(JSON.stringify({ recipe, reasoning }), {
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
