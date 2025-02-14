"use client";

import React, { useState, useRef, useEffect, memo } from "react";
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
import { Plus, X, ChefHat, Sparkles, Utensils, Languages } from "lucide-react";
import { ThoughtProcessBox } from "@/components/thought-process-box";
import CuisineDropdown from "@/components/ui/CuisineDropdown";
import MealTypeDropdown from "@/components/ui/MealTypeDropdown";
import { generateRecipes } from "@/utils/generateRecipes"; // adjust path as needed
import DietDropdown from "@/components/ui/DietDropdown";

//
// Recipe interfaces
//
interface Recipe {
  titleEn: string;
  titleHi: string;
  shortDescriptionEn: string;
  shortDescriptionHi: string;
  caloriesEstimate: string;
  healthTasteRatio: string;
  ingredientsEn: string[];
  ingredientsHi: string[];
  instructionsEn: string[];
  instructionsHi: string[];
}
interface ModalRecipe extends Recipe {
  index: number;
}

//
// A memoized FadeText component for smooth easeInOut transitions
//
const FadeText = memo(({ text }: { text: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5, ease: "easeInOut" }}
  >
    {text}
  </motion.div>
));

//
// RecipeCard component with its own local language toggle
//
const RecipeCard = ({
  recipe,
  index,
  onOpenModal,
}: {
  recipe: Recipe;
  index: number;
  onOpenModal: (recipe: Recipe, index: number) => void;
}) => {
  const [localLanguage, setLocalLanguage] = useState<"en" | "hi">("en");

  const toggleLocalLanguage = () => {
    setLocalLanguage((prev) => (prev === "en" ? "hi" : "en"));
  };

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="w-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            <FadeText text={localLanguage === "en" ? recipe.titleEn : recipe.titleHi} />
          </CardTitle>
          <CardDescription>
            <FadeText
              text={localLanguage === "en" ? recipe.shortDescriptionEn : recipe.shortDescriptionHi}
            />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            <strong>
              <FadeText text={localLanguage === "en" ? "Calories:" : "कैलोरी:"} />
            </strong>{" "}
            <FadeText text={recipe.caloriesEstimate} />
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            <strong>
              <FadeText
                text={
                  localLanguage === "en"
                    ? "Health/Taste Ratio:"
                    : "स्वास्थ्य/स्वाद अनुपात:"
                }
              />
            </strong>{" "}
            <FadeText text={recipe.healthTasteRatio} />
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenModal(recipe, index)}>
              <FadeText text={localLanguage === "en" ? "View Full Recipe" : "पूरी रेसिपी देखें"} />
            </Button>
            <Button variant="ghost" onClick={toggleLocalLanguage}>
              <Languages className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

//
// RecipeModal component (mobile-friendly) with second Close button
// and dark-mode styling for the action buttons.
//
const RecipeModal = ({
  recipe,
  onClose,
  initialLanguage,
}: {
  recipe: ModalRecipe;
  onClose: () => void;
  initialLanguage: "en" | "hi";
}) => {
  const [localLanguage, setLocalLanguage] = useState<"en" | "hi">(initialLanguage);

  const toggleLocalLanguage = () => {
    setLocalLanguage((prev) => (prev === "en" ? "hi" : "en"));
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:text-white p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-neutral-900 w-full max-w-2xl p-6 rounded shadow-lg relative overflow-y-auto max-h-[85vh]"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        {/* Top-right close icon (with dark-mode text classes) */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 dark:text-white"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        <h2 className="text-2xl font-bold mb-2">
          <FadeText text={localLanguage === "en" ? recipe.titleEn : recipe.titleHi} />
        </h2>
        <p className="text-muted-foreground mb-2 dark:text-gray-300">
          <FadeText
            text={localLanguage === "en" ? recipe.shortDescriptionEn : recipe.shortDescriptionHi}
          />
        </p>
        <p className="text-sm text-muted-foreground mb-2 dark:text-gray-300">
          <strong>
            <FadeText text={localLanguage === "en" ? "Calories:" : "कैलोरी:"} />
          </strong>{" "}
          <FadeText text={recipe.caloriesEstimate} />
        </p>
        <p className="text-sm text-muted-foreground mb-4 dark:text-gray-300">
          <strong>
            <FadeText
              text={
                localLanguage === "en"
                  ? "Health/Taste Ratio:"
                  : "स्वास्थ्य/स्वाद अनुपात:"
              }
            />
          </strong>{" "}
          <FadeText text={recipe.healthTasteRatio} />
        </p>

        <div className="mb-4">
          <h4 className="font-semibold mb-2 dark:text-white">
            <FadeText text={localLanguage === "en" ? "Ingredients:" : "सामग्री:"} />
          </h4>
          <ul className="list-disc list-inside dark:text-gray-300">
            {(localLanguage === "en" ? recipe.ingredientsEn : recipe.ingredientsHi).map(
              (ing, i) => (
                <li key={i}>{ing}</li>
              )
            )}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2 dark:text-white">
            <FadeText text={localLanguage === "en" ? "Instructions:" : "निर्देश:"} />
          </h4>
          <ol className="list-decimal list-inside space-y-1 dark:text-gray-300">
            {(localLanguage === "en"
              ? recipe.instructionsEn
              : recipe.instructionsHi
            ).map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <Button
            variant="outline"
            onClick={toggleLocalLanguage}
            className="dark:border-gray-600 dark:text-white"
          >
            <Languages className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="dark:border-gray-600 dark:text-white"
          >
            {localLanguage === "en" ? "Close" : "बंद करें"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

//
// Main RecipeGenerator component
//
export default function RecipeGenerator() {
  // Global form state for UI controls & ThoughtProcessBox
  const [formLanguage, setFormLanguage] = useState<"en" | "hi">("en");

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

  // MealType (custom dropdown)
  const [mealType, setMealType] = useState("");

  // Cooking time in minutes
  const [cookingTime, setCookingTime] = useState("30");

  // Cuisine dropdown
  const [cuisine, setCuisine] = useState("");

  // New: Veg/NonVeg
  const [dietType, setDietType] = useState<"veg" | "non-veg" | "both">("veg");

  // Additional Notes
  const [notes, setNotes] = useState("");

  // State for generated recipes and thought process messages
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [reasoningMessagesEn, setReasoningMessagesEn] = useState<string[]>([]);
  const [reasoningMessagesHi, setReasoningMessagesHi] = useState<string[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Modal for a full recipe
  const [selectedRecipe, setSelectedRecipe] = useState<ModalRecipe | null>(null);
  // For modal, store its initial language separately
  const [modalLanguage, setModalLanguage] = useState<"en" | "hi">("en");

  // Check if any ingredient is provided
  const hasIngredients = ingredients.some((ing) => ing.trim() !== "");

  // Add Ingredient
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

  // Ingredient text change
  const handleIngredientChange = (index: number, value: string) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  // Generate recipes (calls the external function)
  const handleGenerate = async () => {
    setIsGenerating(true);

    // If user clicked "Surprise Me" (meaning no ingredients),
    // by default we set dietType to "veg":
    if (!hasIngredients) {
      setDietType("veg");
    }

    try {
      const { recipes: newRecipes, reasoningEn, reasoningHi } = await generateRecipes({
        ingredients: ingredients.filter((i) => i.trim() !== ""),
        priority,
        maxCalories,
        numPeople,
        mealType,
        cookingTime,
        cuisine,
        notes,
        // Pass dietType or store it in the above object as needed:
        dietType,
      });

      // Prepend newly generated recipes
      setRecipes((prev) => [...newRecipes, ...prev]);

      // Update thought process messages (based on formLanguage)
      if (reasoningEn) setReasoningMessagesEn((prev) => [...prev, reasoningEn]);
      if (reasoningHi) setReasoningMessagesHi((prev) => [...prev, reasoningHi]);
      setIsMinimized(false);
    } catch (err) {
      console.error("[RECIPE-GENERATOR] Client error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const openRecipeModal = (rec: Recipe, index: number) => {
    setModalLanguage("en");
    setSelectedRecipe({ ...rec, index });
  };
  const closeRecipeModal = () => setSelectedRecipe(null);

  // Global form language toggle
  const toggleFormLanguage = () => {
    setFormLanguage((prev) => (prev === "en" ? "hi" : "en"));
  };

  return (
    <div className="container mx-auto p-4">
      {/* Thought Process Box uses formLanguage */}
      <ThoughtProcessBox
        reasoningMessages={formLanguage === "en" ? reasoningMessagesEn : reasoningMessagesHi}
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
          <FadeText text={formLanguage === "en" ? "AI Recipe Generator" : "एआई रेसिपी जनरेटर"} />
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
                <FadeText
                  text={
                    formLanguage === "en"
                      ? "Create Your Perfect Recipe"
                      : "अपनी परफ़ेक्ट रेसिपी बनाएँ"
                  }
                />
              </CardTitle>
              <CardDescription className="text-primary-foreground/70">
                <FadeText
                  text={
                    formLanguage === "en"
                      ? "Add ingredients, pick your style, and let AI do the cooking!"
                      : "सामग्री जोड़ें, अपनी शैली चुनें, और AI को पकाने दें!"
                  }
                />
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* 2-column main form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Ingredients */}
                  <div>
                    <Label className="text-lg font-semibold mb-2">
                      <FadeText text={formLanguage === "en" ? "Ingredients" : "सामग्री"} />
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
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                          >
                            <Input
                              ref={(el) => (inputRefs.current[index] = el)}
                              value={ingredient}
                              onChange={(e) => handleIngredientChange(index, e.target.value)}
                              placeholder={
                                formLanguage === "en" ? "Ingredient" : "सामग्री"
                              }
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

                  {/* Priority */}
                  <div>
                    <Label className="block text-lg font-semibold mb-2">
                      <FadeText text={formLanguage === "en" ? "Priority" : "प्राथमिकता"} />
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
                        {formLanguage === "en" ? "Tasty" : "स्वादिष्ट"}
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
                        {formLanguage === "en" ? "Calorie-Controlled" : "कैलोरी नियंत्रित"}
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
                        {formLanguage === "en" ? "Dessert" : "मिठाई"}
                      </label>
                    </div>
                    {priority === "calorie" && (
                      <div className="mt-3 flex items-center gap-2 ml-4">
                        <Label htmlFor="maxCals" className="text-sm">
                          {formLanguage === "en" ? "Max Calories:" : "अधिकतम कैलोरी:"}
                        </Label>
                        <input
                          id="maxCals"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={maxCalories}
                          onChange={(e) => setMaxCalories(Number(e.target.value || 0))}
                          disabled={isGenerating}
                          className="w-[80px] text-sm border rounded-md px-2 py-1 focus:outline-none no-spinners focus:ring-1 ring-blue-500 bg-background text-foreground"
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
                      <FadeText
                        text={formLanguage === "en" ? "Number of People" : "लोगों की संख्या"}
                      />
                    </Label>
                    <input
                      id="people"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={numPeople}
                      onChange={(e) => setNumPeople(e.target.value.replace(/\D/g, ""))}
                      disabled={isGenerating}
                      className="w-[80px] text-sm border rounded-md px-2 py-1 focus:outline-none no-spinners focus:ring-1 ring-blue-500 bg-background text-foreground"
                    />
                  </div>

                  {/* Meal Type dropdown */}
                  <div>
                    <MealTypeDropdown
                      label={formLanguage === "en" ? "Meal Type" : "भोजन का प्रकार"}
                      selectedMeal={mealType}
                      onChange={(val) => setMealType(val)}
                      disabled={isGenerating}
                    />
                  </div>

                  {/* Cooking Time */}
                  <div className="flex items-center gap-3">
                    <Label htmlFor="cookTime" className="text-lg font-semibold">
                      <FadeText
                        text={formLanguage === "en" ? "Cooking Time (mins)" : "पकाने का समय (मिनट)"}
                      />
                    </Label>
                    <input
                      id="cookTime"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={cookingTime}
                      onChange={(e) => setCookingTime(e.target.value.replace(/\D/g, ""))}
                      disabled={isGenerating}
                      className="w-[80px] text-sm border rounded-md px-2 py-1 focus:outline-none no-spinners focus:ring-1 ring-blue-500 bg-background text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Cuisine + Veg/NonVeg + Additional Notes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cuisine */}
                <div>
                  <CuisineDropdown
                    label={formLanguage === "en" ? "Cuisine" : "पकवान शैली"}
                    selectedCuisine={cuisine}
                    onChange={(val) => setCuisine(val)}
                  />
                </div>

                {/* Veg/Non-Veg Dropdown */}
                {/* <div>
                  <Label className="block text-lg font-semibold mb-1">
                    <FadeText text={formLanguage === "en" ? "Veg / Non Veg" : "शाकाहारी / मांसाहारी"} />
                  </Label>
                  <select
                    disabled={isGenerating}
                    value={dietType}
                    onChange={(e) => setDietType(e.target.value as "veg" | "non-veg" | "both")}
                    className="block w-full border border-[hsl(0_0%_89.8%)] rounded-md p-2 bg-background text-foreground focus:outline-none focus:ring-1 ring-blue-500"
                  >
                    <option value="veg">{formLanguage === "en" ? "Veg" : "शाकाहारी"}</option>
                    <option value="non-veg">{formLanguage === "en" ? "Non Veg" : "मांसाहारी"}</option>
                    <option value="both">{formLanguage === "en" ? "Both" : "कोई भी"}</option>
                  </select>
                </div> */}

                <DietDropdown
                  label="Veg / Non Veg"
                  selectedDiet={dietType}
                  onChange={(val) => setDietType(val as "veg" | "non-veg" | "both")}
                  disabled={isGenerating}
                />


                {/* Additional Notes */}
                <div className="border border-[hsl(0_0%_89.8%)] rounded-md p-4 bg-transparent">
                  <Label className="block text-lg font-semibold mb-1">
                    <FadeText
                      text={formLanguage === "en" ? "Additional Notes" : "अतिरिक्त नोट्स"}
                    />
                  </Label>
                  <textarea
                    disabled={isGenerating}
                    maxLength={123}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      formLanguage === "en"
                        ? "Any extra details or instructions..."
                        : "अतिरिक्त विवरण या निर्देश..."
                    }
                    className="w-full h-24 bg-transparent border border-[hsl(0_0%_89.8%)] text-black dark:text-white rounded-md p-2 resize-none focus:outline-none focus:ring-1 ring-blue-500"
                  />
                  <span className="font-thin text-[13px] float-end">
                    {notes.length} / 123{" "}
                    {formLanguage === "en" ? "characters" : "अक्षर"}
                  </span>
                </div>
              </div>

              {/* Generate/Surprise & Global Language Toggle for form controls */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleGenerate}
                  className="w-full sm:w-auto transition-all duration-300 hover:bg-primary/90"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Utensils className="mr-2 h-4 w-4 animate-spin" />
                      <FadeText
                        text={
                          formLanguage === "en"
                            ? "Cooking up ideas..."
                            : "विचार तैयार कर रहा हूँ..."
                        }
                      />
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      <FadeText
                        text={
                          hasIngredients
                            ? recipes.length > 0
                              ? formLanguage === "en"
                                ? "Regenerate Recipe"
                                : "पुनः रेसिपी बनाएं"
                              : formLanguage === "en"
                                ? "Generate Recipe"
                                : "रेसिपी जनरेट करें"
                            : formLanguage === "en"
                              ? "Surprise Me"
                              : "मुझे हैरान करें"
                        }
                      />
                    </>
                  )}
                </Button>

                {/* Global language toggle */}
                <Button variant="outline" onClick={toggleFormLanguage}>
                  <Languages className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Display generated recipes */}
          <AnimatePresence>
            {recipes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <FadeText text={formLanguage === "en" ? "Generated Recipes" : "उत्पन्न हुई रेसिपी"} />
                <div className="space-y-4 mt-4">
                  {recipes.map((recipe, index) => (
                    <RecipeCard
                      key={index}
                      recipe={recipe}
                      index={index}
                      onOpenModal={openRecipeModal}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Recipe Modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <RecipeModal
            recipe={selectedRecipe}
            onClose={closeRecipeModal}
            initialLanguage={modalLanguage}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
