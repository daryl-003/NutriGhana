import { useState } from "react";
import { User, Bell, Target, ChevronRight, LogOut, TrendingUp } from "lucide-react";
import KenteBorder from "@/components/KenteBorder";
import { useMealLog } from "@/contexts/MealLogContext";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { dailyGoal, setDailyGoal, loggedMeals, user } = useMealLog();
  const [notifications, setNotifications] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(dailyGoal.toString());
  const navigate = useNavigate();

  const totalMealsLogged = loggedMeals.length;
  const uniqueDays = new Set(loggedMeals.map((m) => m.date)).size;
  const avgCalories = totalMealsLogged > 0 ? Math.round(loggedMeals.reduce((s, m) => s + m.meal.calories_kcal * m.servings, 0) / Math.max(uniqueDays, 1)) : 0;

  const handleSaveGoal = () => {
    const val = parseInt(goalInput);
    if (val > 0 && val < 10000) {
      setDailyGoal(val);
      setEditingGoal(false);
      toast.success("Daily goal updated!");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-background pb-24">
      <KenteBorder />
      <header className="px-4 py-4">
        <h1 className="font-display text-xl font-bold">Profile & Settings</h1>
      </header>

      <main className="space-y-4 px-4">
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 card-shadow">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold">{displayName}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center rounded-xl border border-border bg-card p-3 card-shadow">
            <span className="font-display text-2xl font-bold text-primary">{totalMealsLogged}</span>
            <span className="text-xs text-muted-foreground">Meals Logged</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-border bg-card p-3 card-shadow">
            <span className="font-display text-2xl font-bold text-earth">{uniqueDays}</span>
            <span className="text-xs text-muted-foreground">Active Days</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-border bg-card p-3 card-shadow">
            <span className="font-display text-2xl font-bold text-primary">{avgCalories}</span>
            <span className="text-xs text-muted-foreground">Avg kcal/day</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 card-shadow">
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="font-display font-semibold">Daily Calorie Goal</h3>
          </div>
          {editingGoal ? (
            <div className="flex gap-2">
              <input
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                type="number"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button onClick={handleSaveGoal} className="gold-gradient rounded-lg px-4 py-2 font-display text-sm font-semibold text-foreground">
                Save
              </button>
            </div>
          ) : (
            <button onClick={() => setEditingGoal(true)} className="flex w-full items-center justify-between">
              <span className="font-display text-2xl font-bold">{dailyGoal} kcal</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 card-shadow">
          <div className="mb-3 flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-display font-semibold">Notifications</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Push Notifications</span>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Meal Reminders</span>
              <Switch checked={mealReminders} onCheckedChange={setMealReminders} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 card-shadow">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-earth" />
            <h3 className="font-display font-semibold">Health Insights</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {totalMealsLogged > 0
              ? `You've been tracking for ${uniqueDays} day${uniqueDays !== 1 ? "s" : ""}. ${avgCalories > dailyGoal ? "Your average intake exceeds your goal — consider lighter options like Kontomire Stew or Garden Egg Stew." : "Great job staying within your calorie goal! Keep it up!"}`
              : "Start logging meals to see personalized health insights and recommendations."}
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </main>
    </div>
  );
}
