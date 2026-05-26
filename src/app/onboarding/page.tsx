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
  Eye, EyeOff, Crown, Zap,
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

// Marcus Aurelius quotes keyed to score contexts
const AURELIUS_QUOTES = [
  {
    text: "You have power over your mind, not outside events. Realize this, and you will find strength.",
    context: "opening",
  },
  {
    text: "The happiness of your life depends upon the quality of your thoughts.",
    context: "opening",
  },
  {
    text: "Waste no more time arguing about what a good man should be. Be one.",
    context: "cta",
  },
  {
    text: "Never let the future disturb you. You will meet it with the same weapons of reason and spirit you use today.",
    context: "cta",
  },
  {
    text: "Begin — to begin is half the work. Let half still remain; again begin this, and thou wilt have finished.",
    context: "cta",
  },
  {
    text: "If it is not right, do not do it; if it is not true, do not say it. But above all else, have clarity about what you are doing and why.",
    context: "tool",
  },
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

const passwordRequirements = [
  { regex: /.{8,}/, label: "At least 8 characters" },
  { regex: /[A-Z]/, label: "One uppercase letter" },
  { regex: /[0-9]/, label: "One number" },
];

function ScoreMeter({ score, label, animate = true }: { score: number; label: string; animate?: boolean }) {
  const color = score >= 70 ? "bg-emerald-500" : score >= 50 ? "bg-soft-gold" : "bg-rose-400";
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-slate-calm">{label}</span>
        <span className="text-sm font-bold text-matte-black">{score}<span className="text-xs font-normal text-stone-400">/100</span></span>
      </div>
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: animate ? `${score}%` : `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function LockedMeter({ label }: { label: string }) {
  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-stone-400">{label}</span>
        <span className="text-sm font-bold text-stone-300 blur-sm select-none">??/100</span>
      </div>
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden relative">
        {/* Fake blurred bar */}
        <div className="h-full rounded-full bg-stone-300 blur-sm" style={{ width: "60%" }} />
        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-end pr-2">
          <Lock className="w-3 h-3 text-stone-400" />
        </div>
      </div>
    </div>
  );
}

function AureliusQuote({ quote }: { quote: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex gap-3 items-start"
    >
      <div className="w-0.5 bg-gradient-to-b from-soft-gold to-transparent rounded-full self-stretch shrink-0 min-h-[40px]" />
      <div>
        <p className="text-sm font-serif italic text-slate-calm leading-relaxed">&ldquo;{quote}&rdquo;</p>
        <p className="text-xs text-stone-400 mt-1.5">— Marcus Aurelius, Meditations</p>
      </div>
    </motion.div>
  );
}

function scoreToLabel(score: number): { label: string; color: string; description: string } {
  if (score >= 80) return { label: "Strong Foundation", color: "text-emerald-600", description: "Your life sustainability indicators are robust. There is clear clarity and intentionality in how you navigate your world." };
  if (score >= 65) return { label: "Developing Balance", color: "text-soft-gold", description: "Your patterns show meaningful strengths alongside areas ready for intentional refinement. You are closer than you think." };
  if (score >= 50) return { label: "In Transition", color: "text-amber-600", description: "Your current state reflects real pressures and genuine growth opportunities. This is the exact moment that self-awareness matters most." };
  return { label: "Rebuilding Ground", color: "text-rose-500", description: "Your patterns reflect significant pressure across multiple dimensions. Clarity about where you stand is itself a powerful first act." };
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [guestScores, setGuestScores] = useState<PreviewScores | null>(null);

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
      const scores = calculateOverallAssessment({
        stressPerception: data.stressPerception,
        financialComfort: data.financialComfort,
        timeFreedom: data.timeFreedom,
        relationshipSupport: data.relationshipSupport,
        energyLevels: data.energyLevels,
        cognitiveLoad: data.cognitiveLoad,
      });
      setGuestScores(scores);
      try { sessionStorage.setItem("pendingOnboarding", JSON.stringify(data)); } catch { /* ignore */ }
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
        } catch { /* optional */ }
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

  const handleGuestRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    try {
      const result = await register(regName, regEmail, regPassword);
      if (result.success) {
        try {
          await fetch("/api/onboarding", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
        } catch { /* non-fatal */ }
        try { sessionStorage.removeItem("pendingOnboarding"); } catch { /* ignore */ }
        await refreshUser();
        toast.success("Profile saved. Welcome to your sanctuary.");
        router.push("/dashboard");
      } else {
        toast.error(result.error || "Registration failed.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setRegLoading(false);
  };

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

          {/* ─── Step 1 ─── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }}>
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
                      <button key={age} onClick={() => setData({ ...data, ageRange: age })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${data.ageRange === age ? "bg-soft-gold text-white shadow-gold" : "bg-white border border-stone-200 text-slate-calm hover:border-soft-gold"}`}>
                        {age}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label-field text-base">How would you describe your primary role?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                    {WORK_TYPES.map((wt) => (
                      <button key={wt.value} onClick={() => setData({ ...data, workType: wt.value })}
                        className={`flex items-center gap-2 px-3 py-3 rounded-2xl text-sm font-medium transition-all ${data.workType === wt.value ? "bg-soft-gold text-white shadow-gold" : "bg-white border border-stone-200 text-slate-calm hover:border-soft-gold"}`}>
                        <span>{wt.emoji}</span><span>{wt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-10">
                <Button variant="gold" size="lg" onClick={() => setStep(2)} icon={<ArrowRight className="w-4 h-4" />} iconPosition="right" disabled={!data.ageRange || !data.workType}>Continue</Button>
              </div>
            </motion.div>
          )}

          {/* ─── Step 2 ─── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }}>
              <div className="text-center mb-10">
                <span className="text-xs font-semibold text-soft-gold uppercase tracking-widest mb-2 block">Step 2 of 3</span>
                <h2 className="font-serif text-3xl font-bold text-matte-black mb-2">{STEPS[1].title}</h2>
                <p className="text-slate-calm">{STEPS[1].subtitle}</p>
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-premium space-y-8">
                <SliderField label="Perceived stress level" value={data.stressPerception} onChange={(v) => setData({ ...data, stressPerception: v })} minLabel="Very calm" maxLabel="Very stressed" description="How would you rate your average daily stress over the past month?" />
                <SliderField label="Financial comfort" value={data.financialComfort} onChange={(v) => setData({ ...data, financialComfort: v })} minLabel="High pressure" maxLabel="Very comfortable" description="How comfortable do you feel with your current financial situation?" />
                <SliderField label="Time freedom" value={data.timeFreedom} onChange={(v) => setData({ ...data, timeFreedom: v })} minLabel="No free time" maxLabel="Abundant free time" description="How much genuine free time do you have for yourself?" />
                <SliderField label="Relationship support" value={data.relationshipSupport} onChange={(v) => setData({ ...data, relationshipSupport: v })} minLabel="Isolated" maxLabel="Strongly supported" description="How supported do you feel by your close relationships?" />
                <SliderField label="Energy levels" value={data.energyLevels} onChange={(v) => setData({ ...data, energyLevels: v })} minLabel="Depleted" maxLabel="Full of energy" description="How would you rate your average physical and mental energy?" />
                <SliderField label="Cognitive load" value={data.cognitiveLoad} onChange={(v) => setData({ ...data, cognitiveLoad: v })} minLabel="Minimal" maxLabel="Overwhelming" description="How much mental space do you feel you are currently using?" />
              </div>
              <div className="flex justify-between mt-10">
                <Button variant="secondary" onClick={() => setStep(1)} icon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
                <Button variant="gold" size="lg" onClick={() => setStep(3)} icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">Continue</Button>
              </div>
            </motion.div>
          )}

          {/* ─── Step 3 ─── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }}>
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
                      <button key={r} onClick={() => setData({ ...data, majorResponsibilities: toggleArrayItem(data.majorResponsibilities, r) })}
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${data.majorResponsibilities.includes(r) ? "bg-soft-gold text-white" : "bg-stone-50 border border-stone-200 text-slate-calm hover:border-soft-gold"}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label-field text-base mb-3 block">What are you hoping to achieve? (select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {GOALS.map((g) => (
                      <button key={g} onClick={() => setData({ ...data, goals: toggleArrayItem(data.goals, g) })}
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${data.goals.includes(g) ? "bg-muted-blue text-white" : "bg-stone-50 border border-stone-200 text-slate-calm hover:border-muted-blue"}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-10">
                <Button variant="secondary" onClick={() => setStep(2)} icon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
                <Button variant="gold" size="lg" onClick={handleSubmit} loading={submitting} icon={<Sparkles className="w-4 h-4" />} iconPosition="right">Generate My Profile</Button>
              </div>
            </motion.div>
          )}

          {/* ─── Step 4A: GUEST — Partial results + signup wall ─── */}
          {step === 4 && isGuest && guestScores && (() => {
            const scoreInfo = scoreToLabel(guestScores.overallScore);
            const openingQuote = AURELIUS_QUOTES[guestScores.overallScore % 2 === 0 ? 0 : 1];
            const ctaQuote = AURELIUS_QUOTES[guestScores.overallScore % 2 === 0 ? 2 : 4];

            return (
              <motion.div key="step4-guest" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>

                {/* ── Opening Aurelius quote ── */}
                <div className="mb-8">
                  <AureliusQuote quote={openingQuote.text} />
                </div>

                {/* ── Score ring + label ── */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-center mb-6"
                >
                  <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    <Lock className="w-3 h-3" /> Partial preview — sign up to unlock your full profile
                  </div>

                  <div className="relative inline-flex items-center justify-center mb-4">
                    <svg width="132" height="132" viewBox="0 0 132 132" className="-rotate-90">
                      <circle cx="66" cy="66" r="57" fill="none" stroke="#f5f0e8" strokeWidth="10" />
                      <motion.circle
                        cx="66" cy="66" r="57"
                        fill="none"
                        stroke="url(#scoreGrad)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 57}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 57 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 57 * (1 - guestScores.overallScore / 100) }}
                        transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
                      />
                      <defs>
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#C9A84C" />
                          <stop offset="100%" stopColor="#8B6914" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute text-center">
                      <motion.span
                        className="text-4xl font-bold text-matte-black block"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        {guestScores.overallScore}
                      </motion.span>
                      <span className="text-xs text-stone-400">/ 100</span>
                    </div>
                  </div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                    <h2 className={`font-serif text-2xl font-bold mb-2 ${scoreInfo.color}`}>{scoreInfo.label}</h2>
                    <p className="text-sm text-slate-calm max-w-sm mx-auto leading-relaxed">{scoreInfo.description}</p>
                  </motion.div>
                </motion.div>

                {/* ── Partial + locked dimensions ── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-3xl p-6 shadow-premium mb-4 relative"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-matte-black">Your Life Dimensions</h3>
                    <span className="text-xs text-stone-400 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-full">
                      2 of 6 visible
                    </span>
                  </div>

                  <div className="space-y-4 mb-5">
                    <ScoreMeter score={guestScores.peaceScore} label="Peace Score" />
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm text-slate-calm">Burnout Risk</span>
                        <span className={`text-sm font-bold ${guestScores.burnoutRisk >= 60 ? "text-rose-500" : guestScores.burnoutRisk >= 40 ? "text-amber-500" : "text-emerald-600"}`}>
                          {guestScores.burnoutRisk >= 60 ? "High risk" : guestScores.burnoutRisk >= 40 ? "Moderate" : "Low risk"}
                        </span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${guestScores.burnoutRisk >= 60 ? "bg-rose-400" : guestScores.burnoutRisk >= 40 ? "bg-soft-gold" : "bg-emerald-500"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${100 - guestScores.burnoutRisk}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Locked dimensions */}
                  <div className="relative">
                    <div className="space-y-4 blur-sm pointer-events-none select-none" aria-hidden>
                      <LockedMeter label="Financial Stability" />
                      <LockedMeter label="Emotional Recovery" />
                      <LockedMeter label="Time Freedom" />
                      <LockedMeter label="Future Sustainability" />
                    </div>
                    {/* Lock overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm border border-stone-200 rounded-2xl px-5 py-3 text-center shadow-sm">
                        <Lock className="w-4 h-4 text-stone-400 mx-auto mb-1" />
                        <p className="text-xs font-semibold text-matte-black">4 dimensions locked</p>
                        <p className="text-xs text-slate-calm mt-0.5">Sign up free to reveal all</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* ── Partial interpretation (blurred) ── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  className="bg-white rounded-3xl p-6 shadow-premium mb-4 relative overflow-hidden"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-soft-gold" />
                    <h3 className="text-sm font-semibold text-matte-black">Your Personalised Interpretation</h3>
                  </div>

                  {/* Visible first sentence */}
                  <p className="text-sm text-slate-calm leading-relaxed mb-2">
                    {guestScores.overallScore >= 65
                      ? "Your baseline profile reflects genuine strengths in key life dimensions — particularly in your relational foundation and energy reserves."
                      : "Your baseline profile identifies real pressure points that are worth addressing — particularly in how stress and cognitive load are affecting your overall sustainability."}
                  </p>

                  {/* Blurred remainder */}
                  <div className="relative">
                    <p className="text-sm text-slate-calm leading-relaxed blur-sm select-none pointer-events-none" aria-hidden>
                      Your financial comfort and time freedom patterns reveal an important tension between what you value and how you currently allocate your limited resources. The cognitive load dimension in particular suggests that deliberate mental space — even brief — would generate compounding returns across your other dimensions. Based on your goals, the highest-leverage area for your specific profile is likely your approach to daily decision-making.
                    </p>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm border border-amber-200 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
                        <Lock className="w-3.5 h-3.5 text-soft-gold" />
                        <span className="text-xs font-semibold text-matte-black">Sign up to read your full interpretation</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* ── What you unlock ── */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                  className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-6 mb-4"
                >
                  <p className="text-xs text-stone-400 uppercase tracking-widest font-semibold mb-3">Free account unlocks</p>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {[
                      { icon: "📊", text: "All 6 dimensions revealed" },
                      { icon: "🔍", text: "Full personalised interpretation" },
                      { icon: "🧮", text: "5 specialist life calculators" },
                      { icon: "📓", text: "Decision Journal & Intentions" },
                      { icon: "📈", text: "Progress tracking over time" },
                      { icon: "🎯", text: "Goal-setting per dimension" },
                    ].map((item) => (
                      <div key={item.text} className="flex items-center gap-2">
                        <span className="text-sm">{item.icon}</span>
                        <span className="text-xs text-stone-300 leading-tight">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Aurelius quote */}
                  <div className="border-t border-stone-700 pt-4 mb-5">
                    <p className="text-xs font-serif italic text-stone-400 leading-relaxed">
                      &ldquo;{ctaQuote.text}&rdquo;
                    </p>
                    <p className="text-[10px] text-stone-600 mt-1">— Marcus Aurelius</p>
                  </div>

                  {/* Inline signup form */}
                  <form onSubmit={handleGuestRegister} className="space-y-2.5">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      minLength={2}
                      autoComplete="name"
                      className="w-full bg-stone-700/60 border border-stone-600 text-white placeholder-stone-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-soft-gold transition-colors"
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full bg-stone-700/60 border border-stone-600 text-white placeholder-stone-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-soft-gold transition-colors"
                    />
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        className="w-full bg-stone-700/60 border border-stone-600 text-white placeholder-stone-500 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-soft-gold transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {regPassword.length > 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-x-4 gap-y-1 px-1">
                        {passwordRequirements.map((req) => {
                          const met = req.regex.test(regPassword);
                          return (
                            <div key={req.label} className="flex items-center gap-1">
                              <CheckCircle2 className={`w-3 h-3 ${met ? "text-emerald-400" : "text-stone-600"}`} />
                              <span className={`text-xs ${met ? "text-emerald-400" : "text-stone-500"}`}>{req.label}</span>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      variant="gold"
                      fullWidth
                      size="lg"
                      loading={regLoading}
                      icon={<ArrowRight className="w-4 h-4" />}
                      iconPosition="right"
                    >
                      Unlock My Full Results — Free
                    </Button>
                  </form>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-stone-500">
                      Already have an account?{" "}
                      <Link href="/login" className="text-soft-gold hover:text-amber-400 transition-colors">Sign In</Link>
                    </p>
                    <p className="text-xs text-stone-600">No credit card</p>
                  </div>
                </motion.div>

                {/* ── Premium teaser ── */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="border border-stone-200 rounded-2xl p-4 flex items-start gap-3"
                >
                  <Crown className="w-4 h-4 text-soft-gold mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-matte-black mb-0.5">Want even deeper insight?</p>
                    <p className="text-xs text-slate-calm">
                      Premium unlocks AI coaching reflections from Logos, scenario simulations, and longitudinal trend analytics — starting at $19/mo.{" "}
                      <Link href="/pricing" className="text-soft-gold hover:text-brand-600 transition-colors">View plans →</Link>
                    </p>
                  </div>
                </motion.div>

                <p className="text-center text-xs text-stone-400 mt-5 px-4">
                  By creating an account you agree to our{" "}
                  <Link href="/legal/terms" className="underline">Terms</Link>
                  {" "}and{" "}
                  <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.
                </p>
              </motion.div>
            );
          })()}

          {/* ─── Step 4B: AUTHENTICATED — Completion ─── */}
          {step === 4 && !isGuest && (
            <motion.div key="step4-auth" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🏛️</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-matte-black mb-3">Your foundation is established.</h2>
              <p className="text-slate-calm mb-8 max-w-md mx-auto leading-relaxed">
                Your Peace Intelligence baseline is ready. You now have a rational, grounded mirror of where you stand today — and from here, every step is clarity.
              </p>
              {aiInsight && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-3xl p-6 shadow-premium mb-8 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-soft-gold" />
                    <span className="text-xs font-semibold text-soft-gold uppercase tracking-widest">Logos — AI Reflection</span>
                  </div>
                  <p className="text-sm text-slate-calm leading-relaxed italic">{aiInsight}</p>
                  <p className="text-xs text-stone-400 mt-3">This reflection is provided for educational self-awareness purposes and does not constitute advice of any kind.</p>
                </motion.div>
              )}
              <Button variant="gold" size="lg" onClick={() => router.push("/dashboard")} icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                Enter My Sanctuary
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
