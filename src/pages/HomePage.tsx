import KenteBorder from "@/components/KenteBorder";
import CalorieBadge from "@/components/CalorieBadge";
import HeroCard from "@/components/HeroCard";
import DailyProgress from "@/components/DailyProgress";
import { Leaf } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <KenteBorder />
      <header className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <Leaf className="h-7 w-7 text-earth" />
          <div>
            <h1 className="font-display text-xl font-bold leading-tight">NutriGhana</h1>
            <p className="text-xs text-muted-foreground">AI Nutrition for Ghana 🇬🇭</p>
          </div>
        </div>
        <CalorieBadge />
      </header>
      <main className="space-y-4 px-4">
        <HeroCard />
        <DailyProgress />
      </main>
      <footer className="mt-8 pb-4 text-center text-xs text-muted-foreground">
        Developed by <span className="font-semibold text-foreground">Daryl Tech & Educational Network</span> · © 2026
      </footer>
    </div>
  );
}
