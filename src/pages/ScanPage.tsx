import { useState, useRef } from "react";
import { Camera, Upload, Search, X } from "lucide-react";
import { meals, searchMeals, getMealEmoji, Meal } from "@/data/meals";
import MealDetailSheet from "@/components/MealDetailSheet";
import KenteBorder from "@/components/KenteBorder";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ScanPage() {
  const [query, setQuery] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recognizedMeal, setRecognizedMeal] = useState<Meal | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [aiDescription, setAiDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const results = query.length > 0 ? searchMeals(query) : [];

  const handleMealClick = (meal: Meal) => {
    setSelectedMeal(meal);
    setSheetOpen(true);
  };

  const recognizeFood = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setCapturedImage(previewUrl);
    setIsProcessing(true);
    setRecognizedMeal(null);

    try {
      // Convert to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke("recognize-food", {
        body: { image: base64 },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        setIsProcessing(false);
        return;
      }

      if (data.meal_name === "unknown") {
        toast.info(data.description || "Could not identify the dish. Try searching manually.");
        setAiDescription(data.description);
        setIsProcessing(false);
        return;
      }

      // Match to dataset
      const match = meals.find(
        (m) => m.meal_name.toLowerCase() === data.meal_name.toLowerCase()
      );

      if (match) {
        setRecognizedMeal(match);
        setConfidence(Math.round((data.confidence || 0) * 100));
        setAiDescription(data.description || "");
      } else {
        toast.info(`Identified as "${data.meal_name}" but not in our dataset. Try searching.`);
      }
    } catch (err: any) {
      console.error("Recognition error:", err);
      toast.error("Failed to identify meal. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) recognizeFood(file);
  };

  const clearCapture = () => {
    setCapturedImage(null);
    setRecognizedMeal(null);
    setIsProcessing(false);
    setAiDescription("");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <KenteBorder />
      <header className="px-4 py-4">
        <h1 className="font-display text-xl font-bold">Scan & Identify</h1>
        <p className="text-sm text-muted-foreground">Upload a photo or search for a meal</p>
      </header>

      <main className="space-y-4 px-4">
        {!capturedImage && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="hero-gradient flex flex-col items-center gap-2 rounded-2xl p-6 text-primary-foreground transition-transform active:scale-95"
            >
              <Camera className="h-8 w-8" />
              <span className="font-display text-sm font-semibold">Take Photo</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-6 text-primary transition-transform active:scale-95"
            >
              <Upload className="h-8 w-8" />
              <span className="font-display text-sm font-semibold">Upload</span>
            </button>
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </div>
        )}

        {capturedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative overflow-hidden rounded-2xl">
            <img src={capturedImage} alt="Captured food" className="h-56 w-full object-cover" />
            <button onClick={clearCapture} className="absolute right-3 top-3 rounded-full bg-foreground/60 p-1.5 text-background">
              <X className="h-4 w-4" />
            </button>
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <span className="font-display text-sm font-semibold text-primary-foreground">AI identifying meal...</span>
                </div>
              </div>
            )}
            {recognizedMeal && !isProcessing && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm p-4">
                <div className="mb-1 flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">AI identified:</p>
                  <span className="rounded-full bg-earth/10 px-2 py-0.5 text-[10px] font-medium text-earth">{confidence}% confident</span>
                </div>
                <button onClick={() => handleMealClick(recognizedMeal)} className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getMealEmoji(recognizedMeal.meal_name)}</span>
                    <div className="text-left">
                      <span className="font-display font-semibold">{recognizedMeal.meal_name}</span>
                      {aiDescription && <p className="text-xs text-muted-foreground">{aiDescription}</p>}
                    </div>
                  </div>
                  <span className="font-display font-bold text-primary">{recognizedMeal.calories_kcal} kcal</span>
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Ghanaian meals..."
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          {(query ? results : meals).map((meal) => (
            <motion.button
              key={meal.meal_id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleMealClick(meal)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getMealEmoji(meal.meal_name)}</span>
                <div>
                  <p className="text-sm font-semibold">{meal.meal_name}</p>
                  <p className="text-xs text-muted-foreground">{meal.local_name} · {meal.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-sm font-bold text-primary">{meal.calories_kcal}</p>
                <p className="text-[10px] text-muted-foreground">kcal</p>
              </div>
            </motion.button>
          ))}
        </div>
      </main>

      <MealDetailSheet meal={selectedMeal} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
