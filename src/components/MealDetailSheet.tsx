import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Meal, getMealEmoji } from "@/data/meals";
import { useMealLog } from "@/contexts/MealLogContext";
import { Plus, Heart, Flame, Wheat, Droplets } from "lucide-react";
import { toast } from "sonner";

interface Props {
  meal: Meal | null;
  open: boolean;
  onClose: () => void;
}

export default function MealDetailSheet({ meal, open, onClose }: Props) {
  const { addMeal } = useMealLog();

  if (!meal) return null;

  const handleLog = () => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    addMeal(meal, time);
    toast.success(`${meal.meal_name} logged!`);
    onClose();
  };

  const macros = [
    { label: "Calories", value: meal.calories_kcal, unit: "kcal", icon: Flame, color: "text-primary" },
    { label: "Protein", value: meal.protein_g, unit: "g", icon: Heart, color: "text-warm-red" },
    { label: "Carbs", value: meal.carbs_g, unit: "g", icon: Wheat, color: "text-primary" },
    { label: "Fat", value: meal.fat_g, unit: "g", icon: Droplets, color: "text-earth" },
  ];

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl">
        <SheetHeader className="mb-4">
          <div className="mx-auto mb-2 text-5xl">{getMealEmoji(meal.meal_name)}</div>
          <SheetTitle className="font-display text-xl">{meal.meal_name}</SheetTitle>
          <p className="text-sm text-muted-foreground">{meal.local_name} · {meal.region}</p>
        </SheetHeader>

        <div className="mb-4 grid grid-cols-4 gap-2">
          {macros.map((m) => (
            <div key={m.label} className="flex flex-col items-center rounded-xl border border-border bg-secondary/50 p-3">
              <m.icon className={`mb-1 h-4 w-4 ${m.color}`} />
              <span className="font-display text-lg font-bold">{m.value}</span>
              <span className="text-[10px] text-muted-foreground">{m.unit} {m.label}</span>
            </div>
          ))}
        </div>

        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fiber</span>
            <span className="font-medium">{meal.fiber_g}g</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Iron</span>
            <span className="font-medium">{meal.iron_mg}mg</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Calcium</span>
            <span className="font-medium">{meal.calcium_mg}mg</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Vitamin C</span>
            <span className="font-medium">{meal.vitamin_c_mg}mg</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Health Score</span>
            <span className="font-medium">{meal.health_score}/100</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Portion</span>
            <span className="font-medium">{meal.portion_description} ({meal.portion_size_g}g)</span>
          </div>
        </div>

        <div className="mb-4 rounded-xl bg-secondary/50 p-3">
          <p className="mb-1 text-xs font-semibold text-muted-foreground">INGREDIENTS</p>
          <p className="text-sm">{meal.main_ingredients}</p>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {meal.suitable_for_diabetics === "Yes" && <span className="rounded-full bg-earth/10 px-3 py-1 text-xs font-medium text-earth">Diabetic Friendly</span>}
          {meal.suitable_for_weight_loss === "Yes" && <span className="rounded-full bg-earth/10 px-3 py-1 text-xs font-medium text-earth">Weight Loss</span>}
          {meal.suitable_for_hypertension === "Yes" && <span className="rounded-full bg-earth/10 px-3 py-1 text-xs font-medium text-earth">Heart Healthy</span>}
          {meal.is_street_food && <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Street Food</span>}
        </div>

        <p className="mb-5 text-xs text-muted-foreground">{meal.notes}</p>

        <button
          onClick={handleLog}
          className="gold-gradient flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-display font-semibold text-foreground transition-transform active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Log This Meal
        </button>
      </SheetContent>
    </Sheet>
  );
}
