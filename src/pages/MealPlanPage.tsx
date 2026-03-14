import { useState } from "react";
import { Calendar, Heart, Zap, Droplets, RefreshCw } from "lucide-react";
import KenteBorder from "@/components/KenteBorder";
import { meals, getMealEmoji, Meal } from "@/data/meals";
import MealDetailSheet from "@/components/MealDetailSheet";
import { useMealLog } from "@/contexts/MealLogContext";
import { motion } from "framer-motion";

type HealthGoal = "weight_loss" | "diabetes" | "hypertension" | "balanced";

const GOALS: { id: HealthGoal; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "balanced", label: "Balanced", icon: <Zap className="h-4 w-4" />, description: "Nutritious & varied" },
  { id: "weight_loss", label: "Weight Loss", icon: <Droplets className="h-4 w-4" />, description: "Low calorie options" },
  { id: "diabetes", label: "Diabetic-Friendly", icon: <Heart className="h-4 w-4" />, description: "Low glycemic index" },
  { id: "hypertension", label: "Heart Healthy", icon: <Heart className="h-4 w-4" />, description: "Low sodium meals" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_SLOTS = ["Breakfast", "Lunch", "Dinner"] as const;

function filterMeals(goal: HealthGoal): Meal[] {
  switch (goal) {
    case "weight_loss":
      return meals.filter((m) => m.suitable_for_weight_loss !== "No" && m.calories_kcal < 400);
    case "diabetes":
      return meals.filter((m) => m.suitable_for_diabetics !== "No" && m.glycemic_index < 65);
    case "hypertension":
      return meals.filter((m) => m.suitable_for_hypertension !== "No" && m.sodium_mg < 400);
    default:
      return meals.filter((m) => m.health_score >= 60);
  }
}

function pickMealForSlot(filtered: Meal[], slot: string, usedIds: Set<number>): Meal {
  const slotFiltered = filtered.filter((m) => {
    const type = m.meal_type.toLowerCase();
    if (slot === "Breakfast") return type.includes("breakfast") || type.includes("snack");
    return type.includes("lunch") || type.includes("dinner") || type.includes("main");
  });
  const pool = slotFiltered.length > 0 ? slotFiltered : filtered;
  const unused = pool.filter((m) => !usedIds.has(m.meal_id));
  const source = unused.length > 0 ? unused : pool;
  const pick = source[Math.floor(Math.random() * source.length)];
  usedIds.add(pick.meal_id);
  return pick;
}

function generatePlan(goal: HealthGoal): Record<string, Record<string, Meal>> {
  const filtered = filterMeals(goal);
  const usedIds = new Set<number>();
  const plan: Record<string, Record<string, Meal>> = {};
  DAYS.forEach((day) => {
    plan[day] = {};
    MEAL_SLOTS.forEach((slot) => {
      plan[day][slot] = pickMealForSlot(filtered, slot, usedIds);
    });
  });
  return plan;
}

export default function MealPlanPage() {
  const [goal, setGoal] = useState<HealthGoal>("balanced");
  const [plan, setPlan] = useState(() => generatePlan("balanced"));
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { dailyGoal } = useMealLog();

  const handleGoalChange = (g: HealthGoal) => {
    setGoal(g);
    setPlan(generatePlan(g));
  };

  const regenerate = () => setPlan(generatePlan(goal));

  const handleMealClick = (meal: Meal) => {
    setSelectedMeal(meal);
    setSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <KenteBorder />
      <header className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold">Meal Plans</h1>
            <p className="text-sm text-muted-foreground">Weekly plan · {dailyGoal} kcal goal</p>
          </div>
          <button onClick={regenerate} className="rounded-full border border-border bg-card p-2 transition-transform active:scale-90">
            <RefreshCw className="h-4 w-4 text-primary" />
          </button>
        </div>
      </header>

      <main className="space-y-4 px-4">
        {/* Goal selector */}
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map((g) => (
            <button
              key={g.id}
              onClick={() => handleGoalChange(g.id)}
              className={`flex items-center gap-2 rounded-xl border p-3 text-left transition-all ${
                goal === g.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
              }`}
            >
              {g.icon}
              <div>
                <p className="text-xs font-semibold">{g.label}</p>
                <p className="text-[10px] opacity-70">{g.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Weekly plan */}
        {DAYS.map((day, di) => {
          const dayPlan = plan[day];
          const dayCalories = MEAL_SLOTS.reduce((sum, s) => sum + dayPlan[s].calories_kcal, 0);
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: di * 0.05 }}
              className="rounded-2xl border border-border bg-card p-4 card-shadow"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <h3 className="font-display text-sm font-semibold">{day}</h3>
                </div>
                <span className={`text-xs font-medium ${dayCalories > dailyGoal ? "text-destructive" : "text-earth"}`}>
                  {dayCalories} kcal
                </span>
              </div>
              <div className="space-y-1.5">
                {MEAL_SLOTS.map((slot) => {
                  const meal = dayPlan[slot];
                  return (
                    <button
                      key={slot}
                      onClick={() => handleMealClick(meal)}
                      className="flex w-full items-center justify-between rounded-lg bg-background p-2 text-left transition-colors hover:bg-secondary/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getMealEmoji(meal.meal_name)}</span>
                        <div>
                          <p className="text-xs font-medium">{meal.meal_name}</p>
                          <p className="text-[10px] text-muted-foreground">{slot}</p>
                        </div>
                      </div>
                      <span className="font-display text-xs font-bold text-primary">{meal.calories_kcal}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </main>

      <MealDetailSheet meal={selectedMeal} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
