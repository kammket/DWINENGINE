"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DailyReflection } from "@/components/ui/DailyReflection";
import { getDailyReflection } from "@/lib/stoic";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const dailyReflection = getDailyReflection();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast.success("Welcome back.");
      router.push("/dashboard");
    } else {
      toast.error(result.error || "Login failed.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-premium flex items-center justify-center px-4">
      {/* Logo */}
      <div className="fixed top-6 left-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-soft-gold to-brand-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-serif font-semibold text-lg text-matte-black">Limitum</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card padding="lg" variant="elevated">
          <div className="text-center mb-8">
            <h1 className="font-serif text-2xl font-bold text-matte-black mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-slate-calm">
              Your clarity awaits.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-field">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-calm" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label-field">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-calm" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-calm hover:text-matte-black transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/reset-password" className="text-xs text-soft-gold hover:text-brand-600 transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="gold"
              fullWidth
              size="lg"
              loading={loading}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-calm">
              Don't have an account?{" "}
              <Link href="/register" className="text-soft-gold font-medium hover:text-brand-600 transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-6">
          <DailyReflection reflection={dailyReflection} variant="inline" />
        </div>

        <p className="text-center text-xs text-stone-400 mt-6 px-4">
          By signing in, you agree to our{" "}
          <Link href="/legal/terms" className="underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </motion.div>
    </div>
  );
}
