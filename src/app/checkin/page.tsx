"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import {
  Flame, CheckCircle2, Circle, ChevronRight, Sparkles,
  DollarSign, Brain, Heart, Lightbulb, Clock,
} from "lucide-react";
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
    track: "bg-blue-500",
  },
  {
    key: "burnoutMood" as const,
    label: "Energy & Vitality",
    icon: Brain,
    description: "How rested and energised are you this week?",
    color: "text-orange-600",
    track: "bg-orange-500",
  },
  {
    key: "relationshipMood" as const,
    label: "Relationship Quality",
    icon: Heart,
    description: "How supported and connected do you feel by the people around you?",
    color: "text-rose-600",
    track: "bg-rose-500",
  },
  {
    key: "decisionMood" as const,
    label: "Decision Clarity",
    icon: Lightbulb,
    description: "How clear-headed and decisive have you felt this week?",
    color: "text-amber-600",
    track: "bg-amber-500",
  },
  {
    key: "timeMood" as const,
    label: "Time Freedom",
    icon: Clock,
    description: "How in control of your time and schedule have you been?",
    color: "text-purple-600",
    track: "bg-purple-500",
  },
];

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

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-matte-black">Weekly Check-in</h1>
            <p className="text-slate-calm text-sm mt-1">
              A brief honest pulse — no judgment, just clarity.
            </p>
          </div>
          {/* Streak badge */}
          <div className="flex flex-col items-center bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 min-w-[80px]">
            <Flame className={`w-6 h-6 ${streak > 0 ? "text-orange-500" : "text-stone-300"}`} />
            <span className="font-bold text-xl text-matte-black leading-none mt-0.5">{streak}</span>
            <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wide">
              {streak === 1 ? "week" : "weeks"}
            </span>
          </div>
        </div>

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

        {/* Success state */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl p-4"
            >
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">This week is logged.</p>
                <p className="text-xs text-green-700">You can still update your scores below.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        {!loading && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-white border border-stone-200 rounded-2xl shadow-premium divide-y divide-stone-50">
              {SLIDERS.map((s, i) => {
                const val = form[s.key];
                const Icon = s.icon;
                return (
                  <div key={s.key} className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${s.color}`} />
                        <span className="text-sm font-semibold text-matte-black">{s.label}</span>
                      </div>
                      <span className={`text-xs font-bold tabular-nums ${moodColor(val)}`}>
                        {val}/10 · {moodLabel(val)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mb-3">{s.description}</p>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={val}
                      onChange={(e) => setForm((f) => ({ ...f, [s.key]: parseInt(e.target.value) }))}
                      className="w-full accent-soft-gold h-2 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-300 mt-1">
                      <span>Struggling</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5">
                Reflection note <span className="font-normal text-stone-400">(optional)</span>
              </label>
              <textarea
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="What's on your mind this week? Any decisions you're sitting with?"
                rows={3}
                maxLength={500}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-matte-black placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-soft-gold/30 resize-none"
              />
              <p className="text-right text-[10px] text-stone-300 mt-1">{form.note.length}/500</p>
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Saving…" : done ? "Update This Week's Check-in" : "Submit Check-in"}
              {!saving && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </form>
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
