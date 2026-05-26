"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SliderField } from "@/components/ui/FormFields";
import { useAuth } from "@/components/providers/AuthProvider";
import { calculateOverallAssessment } from "@/lib/calculations";
import {
  ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Lock,
  Eye, EyeOff, Crown, Zap, Building2,
} from "lucide-react";
import toast from "react-hot-toast";

const WORK_TYPES = [
  { value: "employee", label: "Employee", emoji: "💼" },
  { value: "entrepreneur", label: "Entrepreneur", emoji: "🚀" },
  { value: "freelancer", label: "Freelancer", emoji: "🌐" },
  { value: "executive", label: "Executive", emoji: "🏢" },
  { value: "student", label: "Student", emoji: "📚" },
  { value: "caregiver", label: "Caregiver", emoji: "🤝" },
  { value: "other", label: "Other", emoji: "✨" },
];

const AGE_RANGES = ["18–24", "25–34", "35–44", "45–54", "55–64", "65+"];

const RESPONSIBILITIES = [
  "Children / Family care",
  "Mortgage / Rent",
  "Supporting parents",
  "Business obligations",
  "Medical conditions",
  "Student debt",
  "Caregiving duties",
];

const GOALS = [
  "Reduce financial stress",
  "Prevent burnout",
  "Improve work-life balance",
  "Make a major life decision",
  "Improve relationships",
  "Gain clarity on my direction",
  "Optimize time use",
];

const STEPS = [
  { id: 1, title: "Let's understand your world.", subtitle: "A few context questions — nothing diagnostic, just calibration for a more accurate profile." },
  { id: 2, title: "How is life feeling right now?", subtitle: "Rate your current experience honestly. There are no wrong answers, only honest ones." },
  { id: 3, title: "What is present in your mind lately?", subtitle: "Select the areas most relevant to your current situation. This shapes your profile." },
  { id: 4, title: "Your foundation is established.", subtitle: "Your Peace Intelligence baseline has been created." },
];

type OnboardingData = {
  ageRange: string;
  workType: string;
  stressPerception: number;
  financialComfort: number;
  timeFreedom: number;
  relationshipSupport: number;
  energyLevels: number;
  cognitiveLoad: number;
  majorResponsibilities: string[];
  goals: string[];
};

type PreviewScores = ReturnType<typeof calculateOverallAssessment>;

const FREE_FEATURES = [
  "Full assessment dashboard",
  "All 5 life calculators",
  "Decision Journal & Morning Intention",
  "Burnout risk tracking",
  "30-day history",
  "Weekly virtues compass",
];

const PREMIUM_FEATURES = [
  "Everything in Free",
  "AI reflections (Logos)",
  "Scenario simulator",
  "Advanced trend analytics",
  "1-year history",
  "PDF & CSV data export",
];

const ENTERPRISE_FEATURES = [
  "Everything in Premium",
  "Team dashboards",
  "API access",
  "Custom AI configuration",
  "SSO & Security",
  "Unlimited history",
];

function ScoreMeter({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-soft-gold" : "bg-rose-400";
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-calm">{label}</span>
        <span className="text-xs font-semibold text-matte-black">{score}</span>
      </div>
      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function RiskMeter({ risk, label }: { risk: number; label: string }) {
  const invertedScore = 100 - risk;
  const color = invertedScore >= 70 ? "bg-emerald-500" : invertedScore >= 50 ? "bg-soft-gold" : "bg-rose-400";
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-calm">{label}</span>
        <span className={`text-xs font-semibold ${risk >= 60 ? "text-rose-500" : "text-emerald-600"}`}>
          {risk >= 60 ? "High risk" : risk >= 40 ? "Moderate" : "Low risk"}
        </span>
      </div>
      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${invertedScore}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

const passwordRequirements = [
  { regex: /.{8,}/, label: "At least 8 characters" },
  { regex: /[A-Z]/, label: "One uppercase letter" },
  { regex: /[0-9]/, label: "One number" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [guestScores, setGuestScores] = useState<PreviewScores | null>(null);

  // Inline signup state (shown on guest step 4)
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  const router = useRouter();
  const { user, register, refreshUser } = useAuth();
  const isGuest = !user;

  const [data, setData] = useState<OnboardingData>({
    ageRange: "",
    workType: "",
    stressPerception: 5,
    financialComfort: 5,
    timeFreedom: 5,
    relationshipSupport: 7,
    energyLevels: 6,
    cognitiveLoad: 5,
    majorResponsibilities: [],
    goals: [],
  });

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  const handleSubmit = async () => {
    if (isGuest) {
      // Compute scores client-side and show preview
      const scores = calculateOverallAssessment({
        stressPerception: data.stressPerception,
        financialComfort: data.financialComfort,
        timeFreedom: data.timeFreedom,
        relationshipSupport: data.relationshipSupport,
        energyLevels: data.energyLevels,
        cognitiveLoad: data.cognitiveLoad,
      });
      setGuestScores(scores);
      try {
        sessionStorage.setItem("pendingOnboarding", JSON.stringify(data));
      } catch { /* ignore if sessionStorage unavailable */ }
      setStep(4);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (json.success) {
        try {
          const aiRes = await fetch("/api/ai/reflect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              scores: json.scores,
              userQuestion: "What does my baseline profile reveal about my current life sustainability?",
            }),
          });
          const aiJson = await aiRes.json();
          if (aiJson.success) setAiInsight(aiJson.reflection);
        } catch { /* AI insight is optional */ }

        await refreshUser();
        setStep(4);
      } else {
        toast.error(json.error || "Onboarding failed.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  // Guest inline signup — register + save onboarding data + go to dashboard
  const handleGuestRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    try {
      const result = await register(regName, regEmail, regPassword);
      if (result.success) {
        // Save onboarding data now that we have an auth session
        try {
          await fetch("/api/onboarding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        } catch { /* non-fatal, user can re-run onboarding from settings */ }
        try { sessionStorage.removeItem("pendingOnboarding"); } catch { /* ignore */ }
        await refreshUser();
        toast.success("Account created. Your profile has been saved.");
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Registration failed.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setRegLoading(false);
  };

  const overallLabel =
    guestScores && guestScores.overallScore >= 75
      ? "Strong foundation"
      : guestScores && guestScores.overallScore >= 55
      ? "Developing balance"
      : "Significant growth opportunities";

  return (
    <div className="min-h-screen bg-gradient-premium flex flex-col items-center justify-center px-4 py-12">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-stone-100 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-soft-gold to-brand-500"
          initial={{ width: "0%" }}
          animate={{ width: `${(step / STEPS.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Logo */}
      <div className="fixed top-6 left-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-soft-gold to-brand-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xs">L</span>
          </div>
          <span className="font-serif font-semibold text-matte-black">Constavita</span>
        </Link>
      </div>

      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {/* Step 1: Identity */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
            >
              <div className="text-center mb-10">
                <span className="text-xs font-semibold text-soft-gold uppercase tracking-widest mb-2 block">Step 1 of 3</span>
                <h2 className="font-serif text-3xl font-bold text-matte-black mb-2">{STEPS[0].title}</h2>
                <p className="text-slate-calm">{STEPS[0].subtitle}</p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="label-field text-base">What&apos;s your age range?</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {AGE_RANGES.map((age) => (
                      <button
                        key={age}
                        onClick={() => setData({ ...data, ageRange: age })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          data.ageRange === age
                            ? "bg-soft-gold text-white shadow-gold"
                            : "bg-white border border-stone-200 text-slate-calm hover:border-soft-gold"
                        }`}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label-field text-base">How would you describe your primary role?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    {WORK_TYPES.map((wt) => (
                      <button
                        key={wt.value}
                        onClick={() => setData({ ...data, workType: wt.value })}
                        className={`flex items-center gap-2 px-3 py-3 rounded-2xl text-sm font-medium transition-all ${
                          data.workType === wt.value
                            ? "bg-soft-gold text-white shadow-gold"
                            : "bg-white border border-stone-200 text-slate-calm hover:border-soft-gold"
                        }`}
                      >
                        <span>{wt.emoji}</span>
                        <span>{wt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-10">
                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => setStep(2)}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  disabled={!data.ageRange || !data.workType}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Sliders */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
            >
              <div className="text-center mb-10">
                <span className="text-xs font-semibold text-soft-gold uppercase tracking-widest mb-2 block">Step 2 of 3</span>
                <h2 className="font-serif text-3xl font-bold text-matte-black mb-2">{STEPS[1].title}</h2>
                <p className="text-slate-calm">{STEPS[1].subtitle}</p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-premium space-y-8">
                <SliderField
                  label="Perceived stress level"
                  value={data.stressPerception}
                  onChange={(v) => setData({ ...data, stressPerception: v })}
                  minLabel="Very calm"
                  maxLabel="Very stressed"
                  description="How would you rate your average daily stress over the past month?"
                />
                <SliderField
                  label="Financial comfort"
                  value={data.financialComfort}
                  onChange={(v) => setData({ ...data, financialComfort: v })}
                  minLabel="High pressure"
                  maxLabel="Very comfortable"
                  description="How comfortable do you feel with your current financial situation?"
                />
                <SliderField
                  label="Time freedom"
                  value={data.timeFreedom}
                  onChange={(v) => setData({ ...data, timeFreedom: v })}
                  minLabel="No free time"
                  maxLabel="Abundant free time"
                  description="How much genuine free time do you have for yourself?"
                />
                <SliderField
                  label="Relationship support"
                  value={data.relationshipSupport}
                  onChange={(v) => setData({ ...data, relationshipSupport: v })}
                  minLabel="Isolated"
                  maxLabel="Strongly supported"
                  description="How supported do you feel by your close relationships?"
                />
                <SliderField
                  label="Energy levels"
                  value={data.energyLevels}
                  onChange={(v) => setData({ ...data, energyLevels: v })}
                  minLabel="Depleted"
                  maxLabel="Full of energy"
                  description="How would you rate your average physical and mental energy?"
                />
                <SliderField
                  label="Cognitive load"
                  value={data.cognitiveLoad}
                  onChange={(v) => setData({ ...data, cognitiveLoad: v })}
                  minLabel="Minimal"
                  maxLabel="Overwhelming"
                  description="How much mental space do you feel you&apos;re currently using?"
                />
              </div>

              <div className="flex justify-between mt-10">
                <Button variant="secondary" onClick={() => setStep(1)} icon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button
                  variant="gold"
                  size="lg"
                  onClick={() => setStep(3)}
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Responsibilities & Goals */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
            >
              <div className="text-center mb-10">
                <span className="text-xs font-semibold text-soft-gold uppercase tracking-widest mb-2 block">Step 3 of 3</span>
                <h2 className="font-serif text-3xl font-bold text-matte-black mb-2">{STEPS[2].title}</h2>
                <p className="text-slate-calm">{STEPS[2].subtitle}</p>
              </div>

              <div className="space-y-8 bg-white rounded-3xl p-8 shadow-premium">
                <div>
                  <label className="label-field text-base mb-3 block">Major responsibilities (select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {RESPONSIBILITIES.map((r) => (
                      <button
                        key={r}
                        onClick={() => setData({ ...data, majorResponsibilities: toggleArrayItem(data.majorResponsibilities, r) })}
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          data.majorResponsibilities.includes(r)
                            ? "bg-soft-gold text-white"
                            : "bg-stone-50 border border-stone-200 text-slate-calm hover:border-soft-gold"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="label-field text-base mb-3 block">What are you hoping to achieve? (select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {GOALS.map((g) => (
                      <button
                        key={g}
                        onClick={() => setData({ ...data, goals: toggleArrayItem(data.goals, g) })}
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          data.goals.includes(g)
                            ? "bg-muted-blue text-white"
                            : "bg-stone-50 border border-stone-200 text-slate-calm hover:border-muted-blue"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-10">
                <Button variant="secondary" onClick={() => setStep(2)} icon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button
                  variant="gold"
                  size="lg"
                  onClick={handleSubmit}
                  loading={submitting}
                  icon={<Sparkles className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Generate My Profile
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4A: GUEST — Preview results + inline signup */}
          {step === 4 && isGuest && guestScores && (
            <motion.div
              key="step4-guest"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Score reveal */}
              <div className="text-center mb-8">
                <span className="text-xs font-semibold text-soft-gold uppercase tracking-widest mb-3 block">Your Peace Intelligence Baseline</span>
                <div className="relative inline-flex items-center justify-center mb-4">
                  <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#f5f0e8" strokeWidth="10" />
                    <motion.circle
                      cx="60" cy="60" r="52"
                      fill="none"
                      stroke="url(#scoreGrad)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 52}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - guestScores.overallScore / 100) }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#C9A84C" />
                        <stop offset="100%" stopColor="#8B6914" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-bold text-matte-black">{guestScores.overallScore}</span>
                    <span className="block text-xs text-slate-calm">/ 100</span>
                  </div>
                </div>
                <h2 className="font-serif text-2xl font-bold text-matte-black mb-1">{overallLabel}</h2>
                <p className="text-sm text-slate-calm max-w-sm mx-auto">
                  Based on your responses across 6 life dimensions. Create a free account to save this and track your progress.
                </p>
              </div>

              {/* Dimension scores */}
              <div className="bg-white rounded-3xl p-6 shadow-premium mb-6">
                <h3 className="text-sm font-semibold text-matte-black mb-4">Your 6-Dimension Baseline</h3>
                <div className="space-y-3">
                  <ScoreMeter score={guestScores.peaceScore} label="Peace Score" />
                  <RiskMeter risk={guestScores.burnoutRisk} label="Burnout Risk" />
                  <ScoreMeter score={guestScores.financialStab} label="Financial Stability" />
                  <ScoreMeter score={guestScores.emotionalRec} label="Emotional Recovery" />
                  <ScoreMeter score={guestScores.timeFreedom} label="Time Freedom" />
                  <ScoreMeter score={guestScores.futureSustain} label="Future Sustainability" />
                </div>
              </div>

              {/* Tier comparison */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-matte-black mb-3 text-center">What you unlock with each plan</h3>
                <div className="grid grid-cols-3 gap-3">
                  {/* FREE */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                    <div className="flex items-center gap-1.5 mb-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-matte-black">Free</span>
                    </div>
                    <div className="text-lg font-bold text-matte-black mb-3">$0<span className="text-xs font-normal text-slate-calm">/mo</span></div>
                    <ul className="space-y-1.5">
                      {FREE_FEATURES.map((f) => (
                        <li key={f} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                          <span className="text-xs text-slate-calm leading-tight">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* PREMIUM */}
                  <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl p-4 shadow-premium border-2 border-soft-gold relative">
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <span className="bg-soft-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Popular</span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <Crown className="w-4 h-4 text-soft-gold" />
                      <span className="text-xs font-bold text-matte-black">Premium</span>
                    </div>
                    <div className="text-lg font-bold text-matte-black mb-3">$19<span className="text-xs font-normal text-slate-calm">/mo</span></div>
                    <ul className="space-y-1.5">
                      {PREMIUM_FEATURES.map((f) => (
                        <li key={f} className="flex items-start gap-1.5">
                          <Sparkles className="w-3 h-3 text-soft-gold mt-0.5 shrink-0" />
                          <span className="text-xs text-slate-calm leading-tight">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ENTERPRISE */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Building2 className="w-4 h-4 text-slate-calm" />
                      <span className="text-xs font-bold text-matte-black">Enterprise</span>
                    </div>
                    <div className="text-lg font-bold text-matte-black mb-3">$99<span className="text-xs font-normal text-slate-calm">/mo</span></div>
                    <ul className="space-y-1.5">
                      {ENTERPRISE_FEATURES.map((f) => (
                        <li key={f} className="flex items-start gap-1.5">
                          <Zap className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                          <span className="text-xs text-slate-calm leading-tight">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Inline signup form */}
              <div className="bg-white rounded-3xl p-6 shadow-premium border border-stone-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-amber-50 rounded-lg flex items-center justify-center">
                    <span className="text-sm">🏛️</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-matte-black">Save your results — it&apos;s free</h3>
                </div>
                <p className="text-xs text-slate-calm mb-4">Create an account to save your baseline, track progress, and access all free features. No credit card required.</p>

                <form onSubmit={handleGuestRegister} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    minLength={2}
                    autoComplete="name"
                    className="input-field"
                  />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="input-field"
                  />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-calm hover:text-matte-black transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {regPassword.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-1 px-1">
                      {passwordRequirements.map((req) => {
                        const met = req.regex.test(regPassword);
                        return (
                          <div key={req.label} className="flex items-center gap-1.5">
                            <CheckCircle2 className={`w-3 h-3 ${met ? "text-green-500" : "text-stone-300"}`} />
                            <span className={`text-xs ${met ? "text-green-600" : "text-stone-400"}`}>{req.label}</span>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                  <Button type="submit" variant="gold" fullWidth size="lg" loading={regLoading}
                    icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                    Create Free Account &amp; Save Results
                  </Button>
                </form>

                <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs text-slate-calm">
                    Already have an account?{" "}
                    <Link href="/login" className="text-soft-gold font-medium hover:text-brand-600 transition-colors">Sign In</Link>
                  </p>
                  <Link href="/pricing" className="text-xs text-slate-calm hover:text-matte-black transition-colors flex items-center gap-1">
                    <Lock className="w-3 h-3" /> View all plans
                  </Link>
                </div>
              </div>

              <p className="text-center text-xs text-stone-400 mt-4 px-4">
                By creating an account you agree to our{" "}
                <Link href="/legal/terms" className="underline">Terms</Link>
                {" "}and{" "}
                <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.
              </p>
            </motion.div>
          )}

          {/* Step 4B: AUTHENTICATED — Completion screen */}
          {step === 4 && !isGuest && (
            <motion.div
              key="step4-auth"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🏛️</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-matte-black mb-3">
                Your foundation is established.
              </h2>
              <p className="text-slate-calm mb-8 max-w-md mx-auto leading-relaxed">
                Your Peace Intelligence baseline is ready. You now have a rational, grounded mirror of where you stand today — and from here, every step is clarity.
              </p>

              {aiInsight && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-3xl p-6 shadow-premium mb-8 text-left"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-soft-gold" />
                    <span className="text-xs font-semibold text-soft-gold uppercase tracking-widest">Logos — AI Reflection</span>
                  </div>
                  <p className="text-sm text-slate-calm leading-relaxed italic">{aiInsight}</p>
                  <p className="text-xs text-stone-400 mt-3">This reflection is provided for educational self-awareness purposes and does not constitute advice of any kind.</p>
                </motion.div>
              )}

              <Button
                variant="gold"
                size="lg"
                onClick={() => router.push("/dashboard")}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Enter My Sanctuary
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
