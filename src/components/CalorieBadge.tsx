import { useMealLog } from "@/contexts/MealLogContext";

export default function CalorieBadge() {
  const { todayCalories, dailyGoal } = useMealLog();
  return (
    <div className="flex flex-col items-center rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5">
      <span className="text-sm font-bold font-display text-primary">{todayCalories}</span>
      <span className="text-[10px] text-muted-foreground">/ {dailyGoal} kcal</span>
    </div>
  );
}
