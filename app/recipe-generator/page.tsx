"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, ChefHat, Sparkles, Utensils } from "lucide-react";
import { ThoughtProcessBox } from "@/components/thought-process-box";
import CuisineDropdown from "@/components/ui/CuisineDropdown";
import MealTypeDropdown from "@/components/ui/MealTypeDropdown"; // NEW custom dropdown for Meal Type

// Example recipe interface
interface Recipe {
  title: string;
  shortDescription: string;
  caloriesEstimate: string;
  healthTasteRatio: string;
  ingredients: string[];
  instructions: string[];
}
interface ModalRecipe extends Recipe {
  index: number;
}

export default function RecipeGenerator() {
  // Ingredients
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, ingredients.length);
  }, [ingredients]);

  // Priority radio + max calories
  const [priority, setPriority] = useState<"tasty" | "calorie" | "dessert">("tasty");
  const [maxCalories, setMaxCalories] = useState(500);

  // Number of People (numeric input)
  const [numPeople, setNumPeople] = useState("2");

  // MealType (custom dropdown, like Cuisine)
  const [mealType, setMealType] = useState("");

  // Cooking time in minutes (numeric input)
  const [cookingTime, setCookingTime] = useState("30");

  // Cuisine dropdown
  const [cuisine, setCuisine] = useState("");

  // Additional Notes
  const [notes, setNotes] = useState("");

  // State for generated recipes
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [reasoningMessages, setReasoningMessages] = useState<string[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Modal for a full recipe
  const [selectedRecipe, setSelectedRecipe] = useState<ModalRecipe | null>(null);

  // Handle "Add Ingredient"
  const handleAddIngredient = () => {
    setIngredients((prev) => [...prev, ""]);
    setTimeout(() => {
      const lastIndex = ingredients.length;
      inputRefs.current[lastIndex]?.focus();
    }, 0);
  };

  // Remove Ingredient
  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // Ingredient text
  const handleIngredientChange = (index: number, value: string) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  // Number-only input: remove spin buttons via CSS
  // and use inputMode + pattern for numeric only
  const numericInputClasses =
    "w-[80px] text-sm border rounded-md px-2 py-1 focus:outline-none no-spinners " +
    "focus:ring-1 ring-blue-500 bg-background text-foreground";

  // Generate
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Build request body
      const requestBody = {
        ingredients: ingredients.filter((i) => i.trim() !== ""),
        priority,
        maxCalories,
        numPeople,
        mealType,
        cookingTime,
        cuisine,
        notes,
      };

      console.log("[RECIPE-GENERATOR] POST to /api/recipe-generator:", requestBody);
      const res = await fetch("/api/recipe-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();

      if (data.error) {
        console.error("[RECIPE-GENERATOR] Server error:", data.error);
      } else {
        const { recipe, reasoning } = data;
        // Insert new recipe at top
        setRecipes((prev) => [recipe, ...prev]);
        if (reasoning) {
          setReasoningMessages((prev) => [...prev, reasoning]);
          setIsMinimized(false);
        }
      }
    } catch (err) {
      console.error("[RECIPE-GENERATOR] Client error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const openRecipeModal = (rec: Recipe, idx: number) => {
    setSelectedRecipe({ ...rec, index: idx });
  };
  const closeRecipeModal = () => setSelectedRecipe(null);

  return (
    <div className="container mx-auto p-4">
      {/* Thought process popup */}
      <ThoughtProcessBox
        reasoningMessages={reasoningMessages}
        isMinimized={isMinimized}
        setIsMinimized={setIsMinimized}
      />

      <div className="max-w-4xl mx-auto">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          AI Recipe Generator
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="w-full mb-8 hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-primary text-primary-foreground">
              <CardTitle className="text-2xl font-bold flex items-center">
                <ChefHat className="w-6 h-6 mr-2" />
                Create Your Perfect Recipe
              </CardTitle>
              <CardDescription className="text-primary-foreground/70">
                Add ingredients, pick your style, and let AI do the cooking!
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* ------------- 2-column main form ------------- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Ingredients */}
                  <div>
                    <Label className="text-lg font-semibold mb-2">
                      Ingredients
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {ingredients.map((ingredient, index) => (
                          <motion.div
                            key={index}
                            className="relative flex items-center"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Input
                              ref={(el) => (inputRefs.current[index] = el)}
                              value={ingredient}
                              onChange={(e) =>
                                handleIngredientChange(index, e.target.value)
                              }
                              placeholder="Ingredient"
                              className="pr-8 min-w-[120px]"
                              disabled={isGenerating}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveIngredient(index)}
                              className="absolute right-1 top-1/2 -translate-y-1/2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleAddIngredient}
                        className="min-w-[40px] h-[40px]"
                        disabled={isGenerating}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Priority radio */}
                  <div>
                    <Label className="block text-lg font-semibold mb-2">
                      Priority
                    </Label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="radio"
                          name="priority"
                          value="tasty"
                          checked={priority === "tasty"}
                          onChange={() => setPriority("tasty")}
                          disabled={isGenerating}
                        />
                        Tasty
                      </label>
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="radio"
                          name="priority"
                          value="calorie"
                          checked={priority === "calorie"}
                          onChange={() => setPriority("calorie")}
                          disabled={isGenerating}
                        />
                        Calorie-Controlled
                      </label>
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="radio"
                          name="priority"
                          value="dessert"
                          checked={priority === "dessert"}
                          onChange={() => setPriority("dessert")}
                          disabled={isGenerating}
                        />
                        Dessert
                      </label>
                    </div>
                    {priority === "calorie" && (
                      <div className="mt-3 flex items-center gap-2 ml-4">
                        <Label htmlFor="maxCals" className="text-sm">
                          Max Calories:
                        </Label>
                        <input
                          id="maxCals"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={maxCalories}
                          onChange={(e) => setMaxCalories(Number(e.target.value || 0))}
                          disabled={isGenerating}
                          className={
                            numericInputClasses + " w-[80px] ml-1"
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Number of People */}
                  <div className="flex items-center gap-3">
                    <Label htmlFor="people" className="text-lg font-semibold">
                      Number of People
                    </Label>
                    <input
                      id="people"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={numPeople}
                      onChange={(e) => setNumPeople(e.target.value.replace(/\D/g, ""))}
                      disabled={isGenerating}
                      className={numericInputClasses}
                    />
                  </div>

                  {/* Meal Type dropdown (custom, like Cuisine) */}
                  <div>
                    <MealTypeDropdown
                      label="Meal Type"
                      selectedMeal={mealType}
                      onChange={(val) => setMealType(val)}
                      disabled={isGenerating}
                    />
                  </div>

                  {/* Cooking Time */}
                  <div className="flex items-center gap-3">
                    <Label htmlFor="cookTime" className="text-lg font-semibold">
                      Cooking Time (mins)
                    </Label>
                    <input
                      id="cookTime"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={cookingTime}
                      onChange={(e) => setCookingTime(e.target.value.replace(/\D/g, ""))}
                      disabled={isGenerating}
                      className={numericInputClasses}
                    />
                  </div>
                </div>
              </div>

              {/* Cuisine + Additional Notes in single column */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cuisine */}
                <div>
                  <CuisineDropdown
                    label="Cuisine"
                    selectedCuisine={cuisine}
                    onChange={(val) => setCuisine(val)}
                  />
                </div>

                {/* Additional Notes */}
                <div className="border border-[hsl(0 0% 89.8%)] rounded-md p-4 bg-transparent">
                  <Label className="block text-lg font-semibold mb-1">
                    Additional Notes
                  </Label>
                  <textarea
                    disabled={isGenerating}
                    maxLength={123}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any extra details or instructions..."
                    className="w-full h-24 bg-transparent border border-[hsl(0 0% 89.8%)] text-black dark:text-white rounded-md p-2 resize-none focus:outline-none focus:ring-1 ring-blue-500"
                  />
                  <span className="font-thin text-[13px] float-end">
                    {notes.length} / 123 characters
                  </span>
                </div>
              </div>

              {/* Generate button */}
              <Button
                onClick={handleGenerate}
                className="w-full transition-all duration-300 hover:bg-primary/90 mt-4"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Utensils className="mr-2 h-4 w-4 animate-spin" />
                    Cooking up ideas...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {recipes.length > 0 ? "Regenerate Recipe" : "Generate Recipe"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Display recipes */}
          <AnimatePresence>
            {recipes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-4">Generated Recipes</h2>
                <div className="space-y-4">
                  {recipes.map((recipe, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="w-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <CardHeader>
                          <CardTitle className="text-xl font-semibold">
                            {recipe.title}
                          </CardTitle>
                          <CardDescription>
                            {recipe.shortDescription}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Calories:</strong> {recipe.caloriesEstimate}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Health/Taste Ratio:</strong> {recipe.healthTasteRatio}
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => openRecipeModal(recipe, index)}
                          >
                            View Full Recipe
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Full recipe modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:text-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-full max-w-2xl p-6 rounded shadow-lg relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setSelectedRecipe(null)}
              >
                <X className="h-5 w-5" />
              </Button>
              <h2 className="text-2xl font-bold mb-2">{selectedRecipe.title}</h2>
              <p className="text-muted-foreground mb-2 dark:text-black">
                {selectedRecipe.shortDescription}
              </p>
              <p className="text-sm text-muted-foreground mb-2 dark:text-black">
                <strong>Calories:</strong> {selectedRecipe.caloriesEstimate}
              </p>
              <p className="text-sm text-muted-foreground mb-4 dark:text-black">
                <strong>Health/Taste Ratio:</strong> {selectedRecipe.healthTasteRatio}
              </p>
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Ingredients:</h4>
                <ul className="list-disc list-inside">
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Instructions:</h4>
                <ol className="list-decimal list-inside">
                  {selectedRecipe.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
