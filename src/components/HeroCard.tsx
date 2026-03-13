import { Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function HeroCard() {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="hero-gradient relative overflow-hidden rounded-2xl p-6 text-primary-foreground"
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/20" />
      <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-primary/10" />
      <div className="relative z-10">
        <div className="mb-3 text-3xl">📸</div>
        <h2 className="mb-2 font-display text-xl font-bold">Snap Your Ghanaian Meal</h2>
        <p className="mb-5 text-sm opacity-80">
          Upload a photo and our AI identifies the dish from our database of 35 Ghanaian foods and calculates its full nutritional value.
        </p>
        <button
          onClick={() => navigate("/scan")}
          className="gold-gradient flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-display font-semibold text-foreground transition-transform active:scale-95"
        >
          <Camera className="h-5 w-5" />
          Upload Food Photo
        </button>
      </div>
    </motion.div>
  );
}
