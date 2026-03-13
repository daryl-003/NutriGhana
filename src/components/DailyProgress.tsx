import { useMealLog } from "@/contexts/MealLogContext";
import { getMealEmoji } from "@/data/meals";
import { Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DailyProgress() {
  const { todayCalories, dailyGoal, todayMeals, removeMeal } = useMealLog();
  const pct = Math.min((todayCalories / dailyGoal) * 100, 100);
  const remaining = Math.max(dailyGoal - todayCalories, 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-shadow">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Today's Progress</h3>
        <span className="text-sm text-muted-foreground">{Math.round(pct)}% of goal</span>
      </div>
      <div className="mb-2 h-3 overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="progress-gradient h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="mb-4 flex justify-between text-xs text-muted-foreground">
        <span>{todayCalories} kcal eaten</span>
        <span>{remaining} remaining</span>
      </div>
      <AnimatePresence>
        {todayMeals.map((logged) => (
          <motion.div
            key={logged.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="mb-2 flex items-center justify-between rounded-xl border border-border bg-background p-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getMealEmoji(logged.meal.meal_name)}</span>
              <div>
                <p className="text-sm font-semibold">{logged.meal.meal_name}</p>
                <p className="text-xs text-muted-foreground">{logged.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-primary">
                {logged.meal.calories_kcal * logged.servings} kcal
              </span>
              <button onClick={() => removeMeal(logged.id)} className="rounded-full p-1 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {todayMeals.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">No meals logged today. Scan or search to add!</p>
      )}
    </div>
  );
}
