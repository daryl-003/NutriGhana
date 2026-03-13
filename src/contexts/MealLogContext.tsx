import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Meal } from "@/data/meals";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LoggedMeal {
  id: string;
  meal: Meal;
  time: string;
  date: string;
  servings: number;
}

interface MealLogContextType {
  loggedMeals: LoggedMeal[];
  dailyGoal: number;
  addMeal: (meal: Meal, time: string, servings?: number) => void;
  removeMeal: (id: string) => void;
  setDailyGoal: (goal: number) => void;
  todayCalories: number;
  todayMeals: LoggedMeal[];
  user: any;
  loading: boolean;
}

const MealLogContext = createContext<MealLogContextType | undefined>(undefined);

export function MealLogProvider({ children }: { children: React.ReactNode }) {
  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>([]);
  const [dailyGoal, setDailyGoalState] = useState(2000);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load meals from DB when user changes
  useEffect(() => {
    if (!user) {
      setLoggedMeals([]);
      return;
    }
    const fetchMeals = async () => {
      const { data, error } = await supabase
        .from("meal_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching meals:", error);
        return;
      }
      if (data) {
        setLoggedMeals(
          data.map((row: any) => ({
            id: row.id,
            meal: row.meal_data as Meal,
            time: row.time,
            date: row.date,
            servings: row.servings,
          }))
        );
      }
    };

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("daily_goal")
        .eq("id", user.id)
        .single();
      if (data?.daily_goal) setDailyGoalState(data.daily_goal);
    };

    fetchMeals();
    fetchProfile();
  }, [user]);

  const today = new Date().toISOString().split("T")[0];
  const todayMeals = loggedMeals.filter((m) => m.date === today);
  const todayCalories = todayMeals.reduce((sum, m) => sum + m.meal.calories_kcal * m.servings, 0);

  const addMeal = useCallback(async (meal: Meal, time: string, servings = 1) => {
    if (!user) return;
    const id = crypto.randomUUID();
    const newMeal: LoggedMeal = { id, meal, time, date: today, servings };
    setLoggedMeals((prev) => [newMeal, ...prev]);

    const { error } = await supabase.from("meal_logs").insert({
      id,
      user_id: user.id,
      meal_name: meal.meal_name,
      meal_data: meal as any,
      time,
      date: today,
      servings,
    });
    if (error) {
      console.error("Error logging meal:", error);
      toast.error("Failed to save meal");
      setLoggedMeals((prev) => prev.filter((m) => m.id !== id));
    }
  }, [user, today]);

  const removeMeal = useCallback(async (id: string) => {
    const prev = loggedMeals;
    setLoggedMeals((p) => p.filter((m) => m.id !== id));

    const { error } = await supabase.from("meal_logs").delete().eq("id", id);
    if (error) {
      console.error("Error removing meal:", error);
      toast.error("Failed to remove meal");
      setLoggedMeals(prev);
    }
  }, [loggedMeals]);

  const setDailyGoal = useCallback(async (goal: number) => {
    setDailyGoalState(goal);
    if (user) {
      await supabase.from("profiles").update({ daily_goal: goal }).eq("id", user.id);
    }
  }, [user]);

  return (
    <MealLogContext.Provider value={{ loggedMeals, dailyGoal, addMeal, removeMeal, setDailyGoal, todayCalories, todayMeals, user, loading }}>
      {children}
    </MealLogContext.Provider>
  );
}

export function useMealLog() {
  const ctx = useContext(MealLogContext);
  if (!ctx) throw new Error("useMealLog must be used within MealLogProvider");
  return ctx;
}
