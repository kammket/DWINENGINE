"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import {
  Flame, CheckCircle2, ChevronRight, Sparkles,
  DollarSign, Brain, Heart, Lightbulb, Clock,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { getStoicQuoteForContext } from "@/lib/stoic";
import toast from "react-hot-toast";

type WeeklyCheckin = {
  id: string;
  weekKey: string;
  financialMood: number;
  burnoutMood: number;
  relationshipMood: number;
  decisionMood: number;
  timeMood: number;
  note: string | null;
  createdAt: string;
};

type CheckinState = {
  streak: number;
  thisWeek: WeeklyCheckin | null;
  history: WeeklyCheckin[];
};

const SLIDERS = [
  {
    key: "financialMood" as const,
    label: "Financial Ease",
    icon: DollarSign,
    description: "How stable and secure do you feel financially right now?",
    color: "text-blue-600",
    fill: "#3B82F6",
    track: "bg-blue-100",
  },
  {
    key: "burnoutMood" as const,
    label: "Energy & Vitality",
    icon: Brain,
    description: "How rested and energised are you this week?",
    color: "text-orange-600",
    fill: "#F97316",
    track: "bg-orange-100",
  },
  {
    key: "relationshipMood" as const,
    label: "Relationship Quality",
    icon: Heart,
    description: "How supported and connected do you feel by the people around you?",
    color: "text-rose-600",
    fill: "#F43F5E",
    track: "bg-rose-100",
  },
  {
    key: "decisionMood" as const,
    label: "Decision Clarity",
    icon: Lightbulb,
    description: "How clear-headed and decisive have you felt this week?",
    color: "text-amber-600",
    fill: "#F59E0B",
    track: "bg-amber-100",
  },
  {
    key: "timeMood" as const,
    label: "Time Freedom",
    icon: Clock,
    description: "How in control of your time and schedule have you been?",
    color: "text-purple-600",
    fill: "#8B5CF6",
    track: "bg-purple-100",
  },
];

const MOOD_EMOJI: Record<number, string> = {
  1: "😓", 2: "😔", 3: "😕", 4: "😐", 5: "🙂",
  6: "😊", 7: "😄", 8: "🌟", 9: "💪", 10: "🔥",
};

const STREAK_BADGES = [
  { weeks: 4, label: "4-Week Discipline", icon: "🏛️" },
  { weeks: 8, label: "8-Week Resolve", icon: "⚡" },
  { weeks: 12, label: "12-Week Mastery", icon: "🔱" },
];

function moodLabel(v: number): string {
  if (v <= 2) return "Struggling";
  if (v <= 4) return "Below average";
  if (v <= 6) return "Moderate";
  if (v <= 8) return "Good";
  return "Excellent";
}

function moodColor(v: number): string {
  if (v <= 3) return "text-red-500";
  if (v <= 5) return "text-amber-500";
  if (v <= 7) return "text-yellow-500";
  return "text-green-600";
}

export default function CheckinPage() {
  const [data, setData] = useState<CheckinState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  // Stepper state: 0–4 = individual sliders, 5 = note + submit
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    financialMood: 5,
    burnoutMood: 5,
    relationshipMood: 5,
    decisionMood: 5,
    timeMood: 5,
    note: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/checkin");
      const json = await res.json();
      if (json.success) {
        setData(json);
        if (json.thisWeek) {
          const w = json.thisWeek;
          setForm({
            financialMood: w.financialMood,
            burnoutMood: w.burnoutMood,
            relationshipMood: w.relationshipMood,
            decisionMood: w.decisionMood,
            timeMood: w.timeMood,
            note: w.note ?? "",
          });
          setDone(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setData((prev) => prev ? { ...prev, streak: json.streak, thisWeek: json.checkin } : prev);
        setDone(true);
        toast.success("Check-in saved! Keep the streak alive.");
      } else {
        toast.error("Could not save check-in.");
      }
    } finally {
      setSaving(false);
    }
  }

  const streak = data?.streak ?? 0;
  const nextBadge = STREAK_BADGES.find((b) => b.weeks > streak);
  const weeksToNext = nextBadge ? nextBadge.weeks - streak : null;
  const stoicQuote = getStoicQuoteForContext("checkin");

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">

        <PageHeader
          title="Weekly Check-in"
          description="A brief honest pulse — no judgment, just clarity."
          badge={done ? { label: "This week logged", color: "green" } : undefined}
          action={
            <div className="flex flex-col items-center bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 min-w-[72px]">
              <Flame className={`w-5 h-5 ${streak > 0 ? "text-orange-500" : "text-stone-300"}`} />
              <span className="font-bold text-xl text-matte-black leading-none mt-0.5">{streak}</span>
              <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wide">
                {streak === 1 ? "week" : "weeks"}
              </span>
            </div>
          }
        />

        {/* Stoic grounding quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3"
        >
          <p className="text-[12px] text-amber-900/70 italic leading-relaxed">
            &ldquo;{stoicQuote.text}&rdquo;
          </p>
          {stoicQuote.author && (
            <p className="text-[11px] text-amber-700/60 font-semibold mt-1 not-italic">
              — {stoicQuote.author}
            </p>
          )}
        </motion.blockquote>

        {/* Streak progress */}
        {nextBadge && (
          <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-4 shadow-premium">
            <span className="text-2xl">{nextBadge.icon}</span>
            <div className="flex-1">
              <p className="text-xs font-semibold text-matte-black">Next: {nextBadge.label}</p>
              <p className="text-xs text-stone-400 mt-0.5">
                {weeksToNext} more {weeksToNext === 1 ? "week" : "weeks"} to unlock
              </p>
              <div className="mt-2 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-soft-gold rounded-full transition-all"
                  style={{ width: `${(streak / nextBadge.weeks) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Success summary card */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm font-semibold text-green-800">This week is logged — you can still update below.</p>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {SLIDERS.map((s) => {
                  const val = form[s.key];
                  return (
                    <div key={s.key} className="flex flex-col items-center gap-1 bg-white rounded-xl p-2 border border-green-100">
                      <span className="text-lg">{MOOD_EMOJI[val]}</span>
                      <span className="text-xs font-bold tabular-nums" style={{ color: s.fill }}>{val}</span>
                      <span className="text-[9px] text-stone-400 text-center leading-tight">{s.label.split(" ")[0]}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form — stepper for new check-ins, flat form for edits */}
        {!loading && (
          done ? (
            /* ── Edit mode (already submitted this week) ── */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-white border border-stone-200 rounded-2xl shadow-premium divide-y divide-stone-50">
                {SLIDERS.map((s) => {
                  const val = form[s.key];
                  const Icon = s.icon;
                  const pct = ((val - 1) / 9) * 100;
                  return (
                    <div key={s.key} className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${s.color}`} />
                          <span className="text-sm font-semibold text-matte-black">{s.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{MOOD_EMOJI[val]}</span>
                          <span className={`text-sm font-bold tabular-nums ${moodColor(val)}`}>
                            {val}<span className="text-xs font-normal text-stone-300">/10</span>
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-stone-400 mb-3">{s.description}</p>
                      <div className="relative">
                        <input
                          type="range" min={1} max={10} step={1} value={val}
                          onChange={(e) => setForm((f) => ({ ...f, [s.key]: parseInt(e.target.value) }))}
                          className="w-full h-2.5 rounded-full appearance-none cursor-pointer"
                          style={{ background: `linear-gradient(to right, ${s.fill} ${pct}%, #E7E5E4 ${pct}%)`, outline: "none" }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] mt-1.5">
                        <span className="text-stone-300">😓 Struggling</span>
                        <span className="text-stone-300">🔥 Excellent</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1.5">
                  Reflection note <span className="font-normal text-stone-400">(optional)</span>
                </label>
                <textarea
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="What's on your mind this week?"
                  rows={3} maxLength={500}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-matte-black placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-soft-gold/30 resize-none"
                />
                <p className="text-right text-[10px] text-stone-300 mt-1">{form.note.length}/500</p>
              </div>
              <Button type="submit" variant="gold" disabled={saving} fullWidth loading={saving} icon={<ChevronRight className="w-4 h-4" />} iconPosition="right">
                Update This Week
              </Button>
            </form>
          ) : (
            /* ── Stepper mode for new check-ins ── */
            <div className="space-y-5">
              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2">
                {SLIDERS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`transition-all rounded-full ${
                      i === step ? "w-6 h-2 bg-soft-gold" : i < step ? "w-2 h-2 bg-amber-300" : "w-2 h-2 bg-stone-200"
                    }`}
                  />
                ))}
                <button
                  onClick={() => setStep(5)}
                  className={`transition-all rounded-full ${step === 5 ? "w-6 h-2 bg-soft-gold" : "w-2 h-2 bg-stone-200"}`}
                />
              </div>

              <AnimatePresence mode="wait">
                {step < 5 ? (
                  /* ── Individual slider card ── */
                  <motion.div
                    key={`slider-${step}`}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white border border-stone-200 rounded-2xl shadow-premium overflow-hidden"
                  >
                    {(() => {
                      const s = SLIDERS[step];
                      const val = form[s.key];
                      const Icon = s.icon;
                      const pct = ((val - 1) / 9) * 100;
                      return (
                        <div className="p-7">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.track}`}>
                                <Icon className={`w-5 h-5 ${s.color}`} />
                              </div>
                              <div>
                                <p className="font-semibold text-matte-black">{s.label}</p>
                                <p className="text-xs text-stone-400">{step + 1} of {SLIDERS.length}</p>
                              </div>
                            </div>
                            <span className="text-4xl">{MOOD_EMOJI[val]}</span>
                          </div>

                          <p className="text-sm text-slate-calm mb-6 leading-relaxed">{s.description}</p>

                          <p className="text-[11px] text-amber-700/70 bg-amber-50/60 border border-amber-100/80 rounded-lg px-3 py-2 mb-6 leading-relaxed">
                            Rate how things <em>actually are</em> this week — not how you'd like them to be. Honest ratings build a useful picture over time.
                          </p>

                          {/* Large value display */}
                          <div className="text-center mb-6">
                            <span className={`text-6xl font-bold tabular-nums ${moodColor(val)}`}>{val}</span>
                            <span className="text-xl text-stone-300 font-light">/10</span>
                            <p className={`text-sm font-medium mt-1 ${moodColor(val)}`}>{moodLabel(val)}</p>
                          </div>

                          <input
                            type="range" min={1} max={10} step={1} value={val}
                            onChange={(e) => setForm((f) => ({ ...f, [s.key]: parseInt(e.target.value) }))}
                            className="w-full h-3 rounded-full appearance-none cursor-pointer mb-2"
                            style={{ background: `linear-gradient(to right, ${s.fill} ${pct}%, #E7E5E4 ${pct}%)`, outline: "none" }}
                          />
                          <div className="flex justify-between text-[10px] text-stone-300 mb-8">
                            <span>😓 Struggling</span>
                            <span>🔥 Excellent</span>
                          </div>

                          <div className="flex gap-3">
                            {step > 0 && (
                              <Button variant="secondary" fullWidth onClick={() => setStep(step - 1)}>
                                Back
                              </Button>
                            )}
                            <Button
                              variant="gold" fullWidth
                              icon={<ChevronRight className="w-4 h-4" />} iconPosition="right"
                              onClick={() => setStep(step + 1)}
                            >
                              {step === SLIDERS.length - 1 ? "Add a note" : "Next"}
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                ) : (
                  /* ── Final step: note + submit ── */
                  <motion.div
                    key="note-step"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white border border-stone-200 rounded-2xl shadow-premium p-7 space-y-5"
                  >
                    <div>
                      <p className="font-semibold text-matte-black mb-1">Almost done.</p>
                      <p className="text-sm text-stone-400">Optional: add a short reflection before submitting.</p>
                    </div>

                    {/* Summary of scores */}
                    <div className="grid grid-cols-5 gap-2">
                      {SLIDERS.map((s) => {
                        const val = form[s.key];
                        return (
                          <button
                            key={s.key}
                            onClick={() => setStep(SLIDERS.indexOf(s))}
                            className="flex flex-col items-center gap-1 bg-stone-50 hover:bg-amber-50/50 rounded-xl p-2 border border-stone-100 transition-colors"
                            title={`Edit ${s.label}`}
                          >
                            <span className="text-lg">{MOOD_EMOJI[val]}</span>
                            <span className="text-xs font-bold tabular-nums" style={{ color: s.fill }}>{val}</span>
                            <span className="text-[9px] text-stone-400 text-center leading-tight">{s.label.split(" ")[0]}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-500 mb-1.5">
                        Reflection note <span className="font-normal text-stone-400">(optional)</span>
                      </label>
                      <textarea
                        value={form.note}
                        onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                        placeholder="What's on your mind this week? Any decisions you're sitting with?"
                        rows={3} maxLength={500}
                        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-matte-black placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-soft-gold/30 resize-none"
                      />
                      <p className="text-right text-[10px] text-stone-300 mt-1">{form.note.length}/500</p>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="secondary" onClick={() => setStep(4)}>Back</Button>
                      <Button
                        variant="gold" fullWidth loading={saving} disabled={saving}
                        icon={<ChevronRight className="w-4 h-4" />} iconPosition="right"
                        onClick={(e) => { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent); }}
                      >
                        Submit Check-in
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        )}

        {/* History strip */}
        {data && data.history.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-premium">
            <h2 className="font-serif text-sm font-bold text-matte-black mb-4">
              Past 12 weeks
            </h2>
            <div className="flex gap-2 flex-wrap">
              {data.history.slice(0, 12).map((h, i) => {
                const avg = (h.financialMood + h.burnoutMood + h.relationshipMood + h.decisionMood + h.timeMood) / 5;
                const pct = ((avg - 1) / 9) * 100;
                const isThis = h.weekKey === data.thisWeek?.weekKey;
                return (
                  <div key={h.id} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                        isThis ? "ring-2 ring-soft-gold ring-offset-1" : ""
                      }`}
                      style={{
                        background: `hsl(${Math.round(pct * 1.2)}, 60%, 50%)`,
                      }}
                      title={h.weekKey}
                    >
                      {Math.round(avg)}
                    </div>
                    <span className="text-[9px] text-stone-300">{h.weekKey.split("-W")[1]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stoic nudge */}
        <div className="text-center py-2">
          <Sparkles className="w-4 h-4 text-soft-gold mx-auto mb-2" />
          <p className="text-xs text-stone-400 italic max-w-sm mx-auto">
            &ldquo;First say to yourself what you would be; then do what you have to do.&rdquo;
            <br />
            <span className="not-italic font-medium">— Epictetus</span>
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}
