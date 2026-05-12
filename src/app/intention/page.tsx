"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import {
  Sun, Moon, Flame, CheckCircle2, ChevronRight, Sparkles,
  Shield, BookOpen, Scale, Zap,
} from "lucide-react";
import toast from "react-hot-toast";

type Intention = {
  id: string;
  dateKey: string;
  intention: string;
  acceptanceFocus: string;
  virtue: string;
  completed: boolean;
  completedNote: string | null;
};

type PageState = {
  today: Intention | null;
  streak: number;
  history: Intention[];
};

const VIRTUES = [
  {
    key: "wisdom",
    label: "Wisdom",
    latin: "Sapientia",
    icon: BookOpen,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    activeColor: "bg-blue-600 text-white border-blue-600",
    desc: "Sound judgement, clear thinking, knowing what matters.",
  },
  {
    key: "courage",
    label: "Courage",
    latin: "Fortitudo",
    icon: Zap,
    color: "text-orange-600 bg-orange-50 border-orange-200",
    activeColor: "bg-orange-600 text-white border-orange-600",
    desc: "Acting rightly despite fear, discomfort, or opposition.",
  },
  {
    key: "justice",
    label: "Justice",
    latin: "Iustitia",
    icon: Scale,
    color: "text-green-600 bg-green-50 border-green-200",
    activeColor: "bg-green-600 text-white border-green-600",
    desc: "Acting fairly toward others; your duties to the whole.",
  },
  {
    key: "temperance",
    label: "Temperance",
    latin: "Temperantia",
    icon: Shield,
    color: "text-purple-600 bg-purple-50 border-purple-200",
    activeColor: "bg-purple-600 text-white border-purple-600",
    desc: "Moderation, self-discipline, resisting excess.",
  },
] as const;

type VirtueKey = "wisdom" | "courage" | "justice" | "temperance";

const PHILOSOPHER_QUOTES: Record<VirtueKey, { text: string; author: string }> = {
  wisdom: {
    text: "The first rule is to keep an untroubled spirit. The second is to look things in the face and know them for what they are.",
    author: "Marcus Aurelius",
  },
  courage: {
    text: "It is not death that a man should fear, but he should fear never beginning to live.",
    author: "Marcus Aurelius",
  },
  justice: {
    text: "Never esteem anything as of advantage to you that will make you break your word or lose your self-respect.",
    author: "Marcus Aurelius",
  },
  temperance: {
    text: "Seek not the good in external things; seek it in yourselves.",
    author: "Epictetus",
  },
};

export default function IntentionPage() {
  const [data, setData] = useState<PageState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"morning" | "evening">("morning");

  const [form, setForm] = useState({
    intention: "",
    acceptanceFocus: "",
    virtue: "wisdom" as VirtueKey,
  });
  const [eveningNote, setEveningNote] = useState("");

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/intention");
    const json = await res.json();
    if (json.success) {
      setData(json);
      if (json.today) {
        setForm({
          intention: json.today.intention,
          acceptanceFocus: json.today.acceptanceFocus,
          virtue: json.today.virtue as VirtueKey,
        });
        setEveningNote(json.today.completedNote ?? "");
        if (json.today.completed) setView("evening");
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleMorning(e: React.FormEvent) {
    e.preventDefault();
    if (!form.intention.trim() || !form.acceptanceFocus.trim()) {
      toast.error("Please fill in all three fields.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/intention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setData((prev) => prev ? { ...prev, today: json.intention, streak: json.streak } : prev);
        toast.success("Morning intention set. Make it count.");
      } else toast.error("Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEvening(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/intention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true, completedNote: eveningNote }),
      });
      const json = await res.json();
      if (json.success) {
        setData((prev) => prev ? { ...prev, today: json.intention } : prev);
        toast.success("Day complete. Rest well.");
      } else toast.error("Could not save.");
    } finally {
      setSaving(false);
    }
  }

  const today = data?.today ?? null;
  const streak = data?.streak ?? 0;
  const selectedVirtue = VIRTUES.find((v) => v.key === form.virtue)!;
  const quote = PHILOSOPHER_QUOTES[form.virtue];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-matte-black">Morning Intention</h1>
            <p className="text-slate-calm text-sm mt-1">
              A Stoic ritual in three questions — takes two minutes, shapes the whole day.
            </p>
          </div>
          <div className="flex flex-col items-center bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 min-w-[72px]">
            <Flame className={`w-5 h-5 ${streak > 0 ? "text-orange-500" : "text-stone-300"}`} />
            <span className="font-bold text-xl text-matte-black leading-none mt-0.5">{streak}</span>
            <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wide">days</span>
          </div>
        </div>

        {/* Morning / Evening toggle */}
        {today && (
          <div className="flex rounded-xl overflow-hidden border border-stone-200 w-fit">
            {(["morning", "evening"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                  view === tab
                    ? "bg-matte-black text-warm-white"
                    : "bg-white text-slate-calm hover:bg-stone-50"
                }`}
              >
                {tab === "morning" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {tab === "morning" ? "Morning" : "Evening review"}
              </button>
            ))}
          </div>
        )}

        {/* Completed badge */}
        {today?.completed && view === "morning" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl p-4"
          >
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Day complete — evening review recorded.</p>
              <p className="text-xs text-green-700">Return tomorrow for a new intention.</p>
            </div>
          </motion.div>
        )}

        {!loading && (
          <AnimatePresence mode="wait">
            {/* Morning form */}
            {view === "morning" && (
              <motion.form
                key="morning"
                onSubmit={handleMorning}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-5"
              >
                {/* Q1: Intention */}
                <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-premium">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-soft-gold text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">1</span>
                    <p className="text-sm font-semibold text-matte-black">What do I intend to do today?</p>
                  </div>
                  <p className="text-xs text-stone-400 mb-3 pl-7">Be specific. One clear focus is worth ten vague ones.</p>
                  <textarea
                    value={form.intention}
                    onChange={(e) => setForm((f) => ({ ...f, intention: e.target.value }))}
                    placeholder="e.g. Finish the project proposal without distraction. Have an honest conversation with my manager."
                    rows={3}
                    maxLength={1000}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-matte-black placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-soft-gold/30 resize-none"
                    required
                  />
                </div>

                {/* Q2: Acceptance */}
                <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-premium">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-soft-gold text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">2</span>
                    <p className="text-sm font-semibold text-matte-black">What outside my control will I accept today?</p>
                  </div>
                  <p className="text-xs text-stone-400 mb-3 pl-7">
                    <em>Dichotomy of control</em> — name it, then release it.
                  </p>
                  <textarea
                    value={form.acceptanceFocus}
                    onChange={(e) => setForm((f) => ({ ...f, acceptanceFocus: e.target.value }))}
                    placeholder="e.g. Other people's opinions of my work. Whether the client responds today. The weather."
                    rows={3}
                    maxLength={1000}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-matte-black placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-soft-gold/30 resize-none"
                    required
                  />
                </div>

                {/* Q3: Virtue */}
                <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-premium">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-soft-gold text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">3</span>
                    <p className="text-sm font-semibold text-matte-black">Which virtue will I practice today?</p>
                  </div>
                  <p className="text-xs text-stone-400 mb-4 pl-7">Choose one to anchor your decisions through the day.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {VIRTUES.map((v) => {
                      const Icon = v.icon;
                      const active = form.virtue === v.key;
                      return (
                        <button
                          key={v.key}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, virtue: v.key }))}
                          className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                            active ? v.activeColor : `${v.color} hover:opacity-80`
                          }`}
                        >
                          <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold leading-tight">{v.label}</p>
                            <p className={`text-[10px] leading-tight mt-0.5 ${active ? "opacity-80" : "opacity-60"}`}>{v.latin}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {selectedVirtue && (
                    <p className="text-xs text-stone-400 mt-3 pl-1 italic">{selectedVirtue.desc}</p>
                  )}
                </div>

                {/* Quote */}
                {quote && (
                  <div className="text-center py-2">
                    <Sparkles className="w-4 h-4 text-soft-gold mx-auto mb-2" />
                    <p className="text-xs text-stone-400 italic max-w-sm mx-auto">
                      &ldquo;{quote.text}&rdquo;
                      <br />
                      <span className="not-italic font-medium">— {quote.author}</span>
                    </p>
                  </div>
                )}

                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Saving…" : today ? "Update Today's Intention" : "Set My Intention"}
                  {!saving && <ChevronRight className="w-4 h-4 ml-1" />}
                </Button>
              </motion.form>
            )}

            {/* Evening review */}
            {view === "evening" && today && (
              <motion.div
                key="evening"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="space-y-5"
              >
                {/* Recap of morning */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                  <p className="text-xs font-semibold text-soft-gold uppercase tracking-wider">This morning you set</p>
                  <div>
                    <p className="text-xs text-stone-400 mb-0.5">Intention</p>
                    <p className="text-sm text-matte-black font-medium leading-relaxed">{today.intention}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 mb-0.5">Acceptance</p>
                    <p className="text-sm text-matte-black leading-relaxed">{today.acceptanceFocus}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 mb-0.5">Virtue practiced</p>
                    <p className="text-sm font-semibold text-matte-black capitalize">{today.virtue}</p>
                  </div>
                </div>

                {/* Evening reflection */}
                <form onSubmit={handleEvening} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-premium space-y-4">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-muted-blue" />
                    <p className="text-sm font-semibold text-matte-black">Evening reflection</p>
                  </div>
                  <p className="text-xs text-stone-400">
                    Seneca wrote letters to himself each evening. What do you want to say about today?
                  </p>
                  <textarea
                    value={eveningNote}
                    onChange={(e) => setEveningNote(e.target.value)}
                    placeholder="Did I act with the virtue I chose? Where did I fall short? What would I do differently?"
                    rows={5}
                    maxLength={2000}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-matte-black placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-soft-gold/30 resize-none"
                  />
                  <Button type="submit" disabled={saving} className="w-full">
                    {saving ? "Saving…" : today.completed ? "Update Evening Review" : "Complete the Day"}
                    {!saving && <CheckCircle2 className="w-4 h-4 ml-1" />}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-xs text-stone-400 italic max-w-sm mx-auto">
                    &ldquo;Let us prepare our minds as if we had come to the very end of life. Let us postpone nothing.&rdquo;
                    <br />
                    <span className="not-italic font-medium">— Seneca</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* History strip */}
        {data && data.history.length > 1 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-premium">
            <h2 className="font-serif text-sm font-bold text-matte-black mb-3">Recent days</h2>
            <div className="flex gap-2 flex-wrap">
              {data.history.slice(0, 14).map((h) => {
                const virtue = VIRTUES.find((v) => v.key === h.virtue);
                return (
                  <div
                    key={h.id}
                    title={`${h.dateKey} · ${h.virtue}${h.completed ? " · ✓ reviewed" : ""}`}
                    className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                      h.completed
                        ? "border-green-400 bg-green-50"
                        : "border-soft-gold bg-amber-50"
                    }`}
                  >
                    {virtue && <virtue.icon className={`w-4 h-4 ${h.completed ? "text-green-600" : "text-soft-gold"}`} />}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-stone-400 mt-2">
              {data.history.filter((h) => h.completed).length} of {data.history.length} days fully reviewed
            </p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
