import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Leaf, Mail, ArrowLeft } from "lucide-react";
import KenteBorder from "@/components/KenteBorder";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Password reset link sent to your email!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <KenteBorder />
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-2">
            <Leaf className="h-10 w-10 text-earth" />
            <h1 className="font-display text-2xl font-bold">Forgot Password</h1>
            <p className="text-center text-sm text-muted-foreground">Enter your email to receive a password reset link</p>
          </div>

          {sent ? (
            <div className="rounded-2xl border border-border bg-card p-6 text-center card-shadow">
              <Mail className="mx-auto mb-3 h-12 w-12 text-primary" />
              <h2 className="font-display text-lg font-semibold">Check Your Email</h2>
              <p className="mt-2 text-sm text-muted-foreground">We've sent a password reset link to <strong>{email}</strong></p>
              <Link to="/auth" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="hero-gradient flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-display font-semibold text-primary-foreground transition-transform active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  "Send Reset Link"
                )}
              </button>
              <Link to="/auth" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> Back to Sign In
              </Link>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
