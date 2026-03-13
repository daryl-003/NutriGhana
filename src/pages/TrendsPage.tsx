import { useState, useMemo } from "react";
import KenteBorder from "@/components/KenteBorder";
import { useMealLog } from "@/contexts/MealLogContext";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";

type Period = "week" | "month";

export default function TrendsPage() {
  const [period, setPeriod] = useState<Period>("week");
  const { loggedMeals, dailyGoal } = useMealLog();

  const { calorieData, macroAvg, topMeals } = useMemo(() => {
    const now = new Date();
    const days = period === "week" ? 7 : 30;
    const dateMap: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dateMap[key] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const mealCounts: Record<string, number> = {};

    loggedMeals.forEach((m) => {
      if (dateMap[m.date]) {
        dateMap[m.date].calories += m.meal.calories_kcal * m.servings;
        dateMap[m.date].protein += m.meal.protein_g * m.servings;
        dateMap[m.date].carbs += m.meal.carbs_g * m.servings;
        dateMap[m.date].fat += m.meal.fat_g * m.servings;
      }
      mealCounts[m.meal.meal_name] = (mealCounts[m.meal.meal_name] || 0) + 1;
    });

    const calorieData = Object.entries(dateMap).map(([date, vals]) => ({
      date: new Date(date).toLocaleDateString("en", { weekday: "short", day: "numeric" }),
      calories: Math.round(vals.calories),
      goal: dailyGoal,
    }));

    const activeDays = Object.values(dateMap).filter((v) => v.calories > 0).length;
    const totals = Object.values(dateMap).reduce(
      (acc, v) => ({ protein: acc.protein + v.protein, carbs: acc.carbs + v.carbs, fat: acc.fat + v.fat }),
      { protein: 0, carbs: 0, fat: 0 }
    );
    const div = Math.max(activeDays, 1);
    const macroAvg = [
      { name: "Protein", value: Math.round(totals.protein / div), color: "hsl(8, 65%, 50%)" },
      { name: "Carbs", value: Math.round(totals.carbs / div), color: "hsl(40, 75%, 46%)" },
      { name: "Fat", value: Math.round(totals.fat / div), color: "hsl(80, 40%, 42%)" },
    ];

    const topMeals = Object.entries(mealCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return { calorieData, macroAvg, topMeals };
  }, [loggedMeals, dailyGoal, period]);

  const chartConfig = {
    calories: { label: "Calories", color: "hsl(40, 75%, 46%)" },
    goal: { label: "Goal", color: "hsl(80, 40%, 42%)" },
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <KenteBorder />
      <header className="px-4 py-4">
        <h1 className="font-display text-xl font-bold">Nutrition Trends</h1>
        <p className="text-sm text-muted-foreground">Track your progress over time</p>
      </header>

      <main className="space-y-4 px-4">
        {/* Period toggle */}
        <div className="flex rounded-xl border border-border bg-secondary/50 p-1">
          {(["week", "month"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${period === p ? "bg-card text-foreground card-shadow" : "text-muted-foreground"}`}
            >
              {p === "week" ? "This Week" : "This Month"}
            </button>
          ))}
        </div>

        {/* Calorie chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-border bg-card p-4 card-shadow">
          <h3 className="mb-3 font-display font-semibold">Daily Calories</h3>
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <BarChart data={calorieData}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={35} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="calories" fill="hsl(40, 75%, 46%)" radius={[4, 4, 0, 0]} />
              <Line dataKey="goal" stroke="hsl(80, 40%, 42%)" strokeDasharray="4 4" dot={false} type="monotone" />
            </BarChart>
          </ChartContainer>
        </motion.div>

        {/* Macro breakdown */}
        <div className="rounded-2xl border border-border bg-card p-4 card-shadow">
          <h3 className="mb-3 font-display font-semibold">Avg Daily Macros (g)</h3>
          {macroAvg[0].value === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No data yet. Start logging meals!</p>
          ) : (
            <div className="flex items-center gap-4">
              <ChartContainer config={{ protein: { label: "Protein", color: macroAvg[0].color }, carbs: { label: "Carbs", color: macroAvg[1].color }, fat: { label: "Fat", color: macroAvg[2].color } }} className="h-36 w-36">
                <PieChart>
                  <Pie data={macroAvg} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={55}>
                    {macroAvg.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              <div className="flex-1 space-y-2">
                {macroAvg.map((m) => (
                  <div key={m.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="text-sm text-muted-foreground">{m.name}</span>
                    <span className="ml-auto font-display text-sm font-bold">{m.value}g</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top meals */}
        <div className="rounded-2xl border border-border bg-card p-4 card-shadow">
          <h3 className="mb-3 font-display font-semibold">Most Logged Meals</h3>
          {topMeals.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No meals logged yet</p>
          ) : (
            <div className="space-y-2">
              {topMeals.map((m, i) => (
                <div key={m.name} className="flex items-center justify-between rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-display text-xs font-bold text-primary">{i + 1}</span>
                    <span className="text-sm font-medium">{m.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{m.count}×</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
