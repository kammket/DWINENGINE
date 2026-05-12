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
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const passwordRequirements = [
  { regex: /.{8,}/, label: "At least 8 characters" },
  { regex: /[A-Z]/, label: "One uppercase letter" },
  { regex: /[0-9]/, label: "One number" },
];

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const dailyReflection = getDailyReflection();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await register(name, email, password);

    if (result.success) {
      toast.success("Account created. Let's calibrate your baseline.");
      router.push("/onboarding");
    } else {
      toast.error(result.error || "Registration failed.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-premium flex items-center justify-center px-4 py-12">
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
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏛️</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-matte-black mb-2">
              Begin with clarity.
            </h1>
            <p className="text-sm text-slate-calm">
              Your free account is the first step toward a more examined life.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-field">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-calm" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  minLength={2}
                  autoComplete="name"
                  className="input-field pl-10"
                />
              </div>
            </div>

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
                  placeholder="Create a strong password"
                  required
                  autoComplete="new-password"
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

              {/* Password requirements */}
              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 space-y-1"
                >
                  {passwordRequirements.map((req) => {
                    const met = req.regex.test(password);
                    return (
                      <div key={req.label} className="flex items-center gap-1.5">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${met ? "text-green-500" : "text-stone-300"}`} />
                        <span className={`text-xs ${met ? "text-green-600" : "text-stone-400"}`}>
                          {req.label}
                        </span>
                      </div>
                    );
                  })}
                </motion.div>
              )}
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
              Create Free Account
            </Button>
          </form>

          {/* What you gain */}
          <div className="mt-6 pt-6 border-t border-stone-100 space-y-2">
            {[
              "Free dashboard with core metrics",
              "5 calculator assessments included",
              "10 Logos Insight Credits",
              "No credit card · No pressure",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                <span className="text-xs text-slate-calm">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-calm">
              Already have an account?{" "}
              <Link href="/login" className="text-soft-gold font-medium hover:text-brand-600 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-6">
          <DailyReflection reflection={dailyReflection} variant="inline" />
        </div>

        <p className="text-center text-xs text-stone-400 mt-6 px-4">
          By creating an account, you agree to our{" "}
          <Link href="/legal/terms" className="underline">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </motion.div>
    </div>
  );
}
