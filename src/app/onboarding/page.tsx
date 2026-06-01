"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SliderField } from "@/components/ui/FormFields";
import { useAuth } from "@/components/providers/AuthProvider";
import { ArrowRight, ArrowLeft, Sparkles, Lock, UserPlus } from "lucide-react";
import Link from "next/link";
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

type PreviewScores = {
  peaceScore: number;
  burnoutRisk: number;
  financialStab: number;
  emotionalRec: number;
  timeFreedom: number;
  futureSustain: number;
};

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [previewScores, setPreviewScores] = useState<PreviewScores | null>(null);
  const router = useRouter();
  const { user, refreshUser } = useAuth();

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
    setSubmitting(true);
    try {
      if (!user) {
        // Guest flow — calculate scores without saving
        const res = await fetch("/api/onboarding/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (json.success) {
          // Persist data so register page can save it after signup
          try { sessionStorage.setItem("pendingOnboarding", JSON.stringify(data)); } catch { /* non-fatal */ }
          setPreviewScores(json.scores);
          setIsPreview(true);
          setStep(4);
        } else {
          toast.error(json.error || "Could not generate your profile.");
        }
      } else {
        // Authenticated flow — save to DB
        const res = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (json.success) {
          // Fetch AI insight
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
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-premium flex flex-col items-center justify-center px-4 py-12">
      {/* Step indicator */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Thin fill bar */}
        <div className="h-1 bg-stone-100">
          <motion.div
            className="h-full bg-gradient-to-r from-soft-gold to-brand-500"
            initial={{ width: "0%" }}
            animate={{ width: `${(Math.min(step, 3) / 3) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        {/* Numbered dots — only show for steps 1–3 */}
        {step < 4 && (
          <div className="flex justify-center gap-6 pt-3 pb-2 bg-white/80 backdrop-blur-sm">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-col items-center gap-1">
                <motion.div
                  animate={{
                    backgroundColor: s < step ? "#C9A84C" : s === step ? "#C9A84C" : "#E7E5E4",
                    scale: s === step ? 1.15 : 1,
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ color: s <= step ? "#fff" : "#94A3B8" }}
                >
                  {s < step ? "✓" : s}
                </motion.div>
                <span className={`text-[10px] font-medium ${s === step ? "text-soft-gold" : "text-stone-400"}`}>
                  {["You", "Life now", "Goals"][s - 1]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logo */}
      <div className="fixed top-6 left-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-soft-gold to-brand-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xs">L</span>
          </div>
          <span className="font-serif font-semibold text-matte-black">Constavita</span>
        </div>
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
                {/* Age range */}
                <div>
                  <label className="label-field text-base">What's your age range?</label>
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

                {/* Work type */}
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
                  description="How much mental space do you feel you're currently using?"
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

          {/* Step 4: Complete or Preview */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {isPreview && previewScores ? (
                /* ── Guest preview ── */
                <>
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">🏛️</span>
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-matte-black mb-2">
                    Your profile is ready.
                  </h2>
                  <p className="text-slate-calm mb-8 max-w-md mx-auto leading-relaxed">
                    Here&apos;s a preview of what the platform revealed about you.
                  </p>

                  {/* Peace Score — shown in full */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl p-8 shadow-premium mb-4 text-center"
                  >
                    <p className="text-xs font-semibold text-soft-gold uppercase tracking-widest mb-3">Your Peace Score</p>
                    <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-full bg-amber-50 border-4 border-amber-200 mb-4">
                      <span className="text-4xl font-bold text-matte-black tabular-nums">{previewScores.peaceScore}</span>
                    </div>
                    <p className="text-sm text-slate-calm max-w-xs mx-auto">
                      {previewScores.peaceScore >= 75
                        ? "You're operating from a position of relative stability."
                        : previewScores.peaceScore >= 50
                        ? "There are clear areas of strength alongside some pressure points."
                        : "Your data indicates meaningful areas worth addressing — that's what this platform is for."}
                    </p>
                  </motion.div>

                  {/* Blurred sub-scores teaser */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="relative bg-white rounded-3xl p-6 shadow-premium mb-6 overflow-hidden"
                  >
                    {/* Blurred score rows */}
                    <div className="blur-sm select-none pointer-events-none space-y-3">
                      {[
                        { label: "Burnout Risk", value: previewScores.burnoutRisk },
                        { label: "Financial Stability", value: previewScores.financialStab },
                        { label: "Emotional Recovery", value: previewScores.emotionalRec },
                        { label: "Future Sustainability", value: previewScores.futureSustain },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center gap-3">
                          <div className="w-32 text-left text-xs font-medium text-matte-black">{s.label}</div>
                          <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-soft-gold rounded-full"
                              style={{ width: `${s.value}%` }}
                            />
                          </div>
                          <div className="w-8 text-right text-xs font-bold text-matte-black">{s.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Overlay CTA */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-3xl">
                      <Lock className="w-5 h-5 text-stone-400 mb-2" />
                      <p className="text-sm font-semibold text-matte-black mb-1">Full breakdown locked</p>
                      <p className="text-xs text-slate-calm">Create a free account to unlock all 5 scores</p>
                    </div>
                  </motion.div>

                  {/* Signup CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3"
                  >
                    <Link href={`/register?from=onboarding`}>
                      <Button
                        variant="gold"
                        size="lg"
                        icon={<UserPlus className="w-4 h-4" />}
                        iconPosition="right"
                        className="w-full"
                      >
                        Save my profile &amp; unlock full results
                      </Button>
                    </Link>
                    <p className="text-xs text-stone-400">
                      Free forever · No card required ·{" "}
                      <Link href="/login" className="text-soft-gold hover:underline font-medium">
                        Already have an account? Sign in
                      </Link>
                    </p>
                  </motion.div>
                </>
              ) : (
                /* ── Authenticated completion ── */
                <>
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
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
