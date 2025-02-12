// generateRecipes.ts
export interface GenerateRecipesParams {
    ingredients?: string[];
    priority?: "tasty" | "calorie" | "dessert";
    maxCalories?: number;
    numPeople?: string;
    mealType?: string;
    cookingTime?: string;
    cuisine?: string;
    notes?: string;
  }
  
  export interface RecipeData {
    recipes: any; // you can type this more strictly if desired
    reasoningEn: string;
    reasoningHi: string;
  }
  
  export async function generateRecipes(
    params: GenerateRecipesParams
  ): Promise<RecipeData> {
    // Apply default values
    const {
      ingredients = [],
      priority = "tasty",
      maxCalories = 500,
      numPeople = "2",
      mealType = "",
      cookingTime = "30",
      cuisine = "",
      notes = "",
    } = params;
  
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
  
    // 3) Call the external API (OpenRouter)
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // WARNING: Exposing your API key on the client side is not recommended.
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ""}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
      }),
    });
  
    if (!res.ok) {
      throw new Error(`OpenRouter API error: ${res.statusText}`);
    }
  
    const data = await res.json();
    const rawText = data?.choices?.[0]?.message?.content || "";
  
    let recipes = null;
    let reasoningEn = "";
    let reasoningHi = "";
  
    try {
      let jsonText = rawText.trim();
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
  
    return { recipes, reasoningEn, reasoningHi };
  }
  