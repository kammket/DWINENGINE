"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import {
  BookOpen, Plus, Trash2, ChevronDown, ChevronUp, CheckCircle2,
  Pencil, X, Clock, Target, Sparkles, CircleDot, Search, Filter,
  Lightbulb,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import toast from "react-hot-toast";
import { formatRelativeTime } from "@/lib/utils";

type JournalEntry = {
  id: string;
  title: string;
  context: string;
  options: string[];
  decisionScore: number | null;
  chosenOption: string | null;
  outcome: string | null;
  outcomeDate: string | null;
  controlCategory: string | null;
  createdAt: string;
  updatedAt: string;
};

type NewEntryForm = {
  title: string;
  context: string;
  options: string[];
  decisionScore: string;
  chosenOption: string;
  controlCategory: string;
};

const CONTROL_OPTIONS = [
  { key: "in_control", label: "In my control", color: "text-green-700 bg-green-50 border-green-200", dot: "bg-green-500" },
  { key: "partial", label: "Partially", color: "text-amber-700 bg-amber-50 border-amber-200", dot: "bg-amber-500" },
  { key: "outside_control", label: "Outside my control", color: "text-rose-700 bg-rose-50 border-rose-200", dot: "bg-rose-500" },
] as const;

const EMPTY_FORM: NewEntryForm = {
  title: "",
  context: "",
  options: ["", ""],
  decisionScore: "",
  chosenOption: "",
  controlCategory: "",
};

type ContextPrompt = {
  label: string;
  emoji: string;
  moodScore: number | null;
  calcScore: number | null;
  prompt: string;
  href: string;
};

const DIMENSION_PROMPTS: Record<string, { emoji: string; label: string; href: string; prompt: (mood: number | null, calc: number | null) => string }> = {
  financialMood: {
    emoji: "💰",
    label: "Financial",
    href: "/calculators/financial-peace",
    prompt: (mood) =>
      mood !== null && mood <= 5
        ? `Your Financial mood was ${mood}/10 this week. Is there a money decision — spending, saving, an opportunity — that you've been putting off logging?`
        : "Is there a financial decision you're weighing right now? Getting it out of your head and onto paper often clarifies the path forward.",
  },
  burnoutMood: {
    emoji: "⚡",
    label: "Energy",
    href: "/calculators/burnout-risk",
    prompt: (mood) =>
      mood !== null && mood <= 5
        ? `Your Energy mood was ${mood}/10 this week. What's been draining you most? Logging the decision behind it could surface options you haven't considered.`
        : "Even when energy is good, there are often choices about how you spend it. Is there a time or work decision worth examining?",
  },
  relationshipMood: {
    emoji: "🤝",
    label: "Relationship",
    href: "/calculators/relationship-sustainability",
    prompt: (mood) =>
      mood !== null && mood <= 5
        ? `Your Relationship mood was ${mood}/10 this week. Is there a conversation or commitment decision you've been avoiding? Writing it out often reduces the weight.`
        : "Relationships often involve unspoken decisions. Is there a boundary, commitment, or expectation worth examining?",
  },
  decisionMood: {
    emoji: "🧠",
    label: "Decision Clarity",
    href: "/calculators/decision-regret",
    prompt: (mood) =>
      mood !== null && mood <= 5
        ? `You rated your Decision Clarity ${mood}/10 this week — this is exactly the right moment to log a decision before uncertainty clouds it further.`
        : "A week of clear thinking is a good time to log a decision you're sitting with, while your reasoning is sharp.",
  },
  timeMood: {
    emoji: "⏳",
    label: "Time Freedom",
    href: "/calculators/time-value",
    prompt: (mood) =>
      mood !== null && mood <= 5
        ? `Your Time Freedom mood was ${mood}/10 this week. Is there a commitment you said yes to that deserves a second look? Log it here.`
        : "How you spend your time is a series of decisions. Is there one worth examining — something you said yes or no to recently?",
  },
};

function scoreColor(s: number): string {
  if (s >= 75) return "text-green-600 bg-green-50";
  if (s >= 50) return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
}

function EntryCard({
  entry,
  onDelete,
  onUpdate,
}: {
  entry: JournalEntry;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<JournalEntry>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [addingOutcome, setAddingOutcome] = useState(false);
  const [outcome, setOutcome] = useState(entry.outcome ?? "");
  const [outcomeDate, setOutcomeDate] = useState(
    entry.outcomeDate ? entry.outcomeDate.substring(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);

  async function saveOutcome() {
    setSaving(true);
    try {
      const res = await fetch(`/api/journal/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome,
          outcomeDate: outcomeDate ? new Date(outcomeDate).toISOString() : null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        onUpdate(entry.id, { outcome, outcomeDate: outcomeDate || null });
        setAddingOutcome(false);
        toast.success("Outcome recorded.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this journal entry?")) return;
    const res = await fetch(`/api/journal/${entry.id}`, { method: "DELETE" });
    if ((await res.json()).success) {
      onDelete(entry.id);
      toast.success("Entry deleted.");
    }
  }

  return (
    <div className="bg-white border border-stone-200 rounded-2xl shadow-premium overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-stone-50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <p className="font-serif font-bold text-matte-black text-base leading-snug truncate">
            {entry.title}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-xs text-stone-400">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(entry.createdAt)}
            </span>
            {entry.decisionScore !== null && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scoreColor(entry.decisionScore)}`}>
                Score: {entry.decisionScore}
              </span>
            )}
            {entry.controlCategory && (() => {
              const opt = CONTROL_OPTIONS.find((o) => o.key === entry.controlCategory);
              return opt ? (
                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${opt.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
                  {opt.label}
                </span>
              ) : null;
            })()}
            {entry.outcome && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                Outcome logged
              </span>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-stone-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-stone-400 flex-shrink-0 mt-1" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-stone-100 pt-4">
              {/* Context */}
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Context</p>
                <p className="text-sm text-slate-calm leading-relaxed whitespace-pre-wrap">{entry.context}</p>
              </div>

              {/* Options */}
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Options Considered</p>
                <div className="flex flex-wrap gap-2">
                  {entry.options.map((opt, i) => (
                    <span
                      key={i}
                      className={`text-xs px-3 py-1 rounded-full border ${
                        entry.chosenOption === opt
                          ? "bg-soft-gold/10 border-soft-gold text-soft-gold font-semibold"
                          : "bg-stone-50 border-stone-200 text-slate-calm"
                      }`}
                    >
                      {entry.chosenOption === opt && "✓ "}{opt}
                    </span>
                  ))}
                </div>
              </div>

              {/* Outcome */}
              {entry.outcome ? (
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">Outcome</p>
                  <p className="text-sm text-slate-calm leading-relaxed whitespace-pre-wrap">{entry.outcome}</p>
                  {entry.outcomeDate && (
                    <p className="text-xs text-stone-400 mt-1">
                      Recorded on {new Date(entry.outcomeDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                  <button
                    onClick={() => setAddingOutcome(true)}
                    className="mt-2 text-xs text-soft-gold hover:underline flex items-center gap-1"
                  >
                    <Pencil className="w-3 h-3" /> Edit outcome
                  </button>
                </div>
              ) : (
                !addingOutcome && (
                  <button
                    onClick={() => setAddingOutcome(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-soft-gold hover:text-brand-600 transition-colors"
                  >
                    <Target className="w-3.5 h-3.5" />
                    Log outcome
                  </button>
                )
              )}

              {/* Outcome form */}
              {addingOutcome && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-matte-black">Record outcome</p>
                    <button onClick={() => setAddingOutcome(false)}>
                      <X className="w-4 h-4 text-stone-400" />
                    </button>
                  </div>
                  <textarea
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    placeholder="What actually happened? How did the decision play out?"
                    rows={3}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soft-gold/30 resize-none bg-white"
                  />
                  <div>
                    <label className="block text-xs text-stone-400 mb-1">Outcome date (optional)</label>
                    <input
                      type="date"
                      value={outcomeDate}
                      onChange={(e) => setOutcomeDate(e.target.value)}
                      className="border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-soft-gold/30 bg-white"
                    />
                  </div>
                  <Button size="sm" onClick={saveOutcome} disabled={saving || !outcome.trim()}>
                    {saving ? "Saving…" : "Save Outcome"}
                  </Button>
                </div>
              )}

              {/* Delete */}
              <div className="pt-2 border-t border-stone-100 flex justify-end">
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete entry
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type FilterChip = "all" | "in_control" | "partial" | "outside_control" | "has_outcome" | "no_outcome";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NewEntryForm>(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterChip>("all");
  const [contextPrompt, setContextPrompt] = useState<ContextPrompt | null>(null);
  const [promptDismissed, setPromptDismissed] = useState(false);

  const fetchEntries = useCallback(async () => {
    const [journalRes, checkinRes, calcRes] = await Promise.all([
      fetch("/api/journal?limit=20"),
      fetch("/api/checkin"),
      fetch("/api/calculators?limit=10"),
    ]);
    const [journalJson, checkinJson, calcJson] = await Promise.all([
      journalRes.json(),
      checkinRes.json(),
      calcRes.json(),
    ]);

    if (journalJson.success) {
      setEntries(journalJson.entries);
      setTotal(journalJson.total);
    }

    // Build contextual prompt from weakest mood dimension
    const thisWeek = checkinJson.success ? checkinJson.thisWeek : null;
    const calcResults: Array<{ type: string; score: number }> = calcJson.success ? calcJson.results || [] : [];
    const latestByType: Record<string, number> = {};
    calcResults.forEach((r) => { if (latestByType[r.type] === undefined) latestByType[r.type] = r.score; });

    if (thisWeek) {
      const moodKeys = ["financialMood", "burnoutMood", "relationshipMood", "decisionMood", "timeMood"] as const;
      const MOOD_TO_CALC: Record<string, string> = {
        financialMood: "FINANCIAL_PEACE",
        burnoutMood: "BURNOUT_RISK",
        relationshipMood: "RELATIONSHIP_SUSTAINABILITY",
        decisionMood: "DECISION_REGRET",
        timeMood: "TIME_VALUE",
      };
      // Pick the dimension with the lowest mood score
      const weakest = moodKeys.reduce((a, b) =>
        (thisWeek[a] as number) <= (thisWeek[b] as number) ? a : b
      );
      const moodScore = thisWeek[weakest] as number;
      const calcType = MOOD_TO_CALC[weakest];
      const calcScore = latestByType[calcType] ?? null;
      const meta = DIMENSION_PROMPTS[weakest];
      setContextPrompt({
        label: meta.label,
        emoji: meta.emoji,
        moodScore,
        calcScore,
        prompt: meta.prompt(moodScore, calcScore),
        href: meta.href,
      });
    }

    setLoading(false);
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  function addOption() {
    if (form.options.length < 8) {
      setForm((f) => ({ ...f, options: [...f.options, ""] }));
    }
  }

  function removeOption(i: number) {
    if (form.options.length <= 2) return;
    setForm((f) => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }));
  }

  function updateOption(i: number, val: string) {
    setForm((f) => {
      const opts = [...f.options];
      opts[i] = val;
      return { ...f, options: opts };
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const validOptions = form.options.filter((o) => o.trim());
    if (!form.title.trim() || !form.context.trim() || validOptions.length < 1) {
      toast.error("Fill in title, context, and at least one option.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          context: form.context.trim(),
          options: validOptions,
          decisionScore: form.decisionScore ? parseFloat(form.decisionScore) : undefined,
          chosenOption: form.chosenOption.trim() || undefined,
          controlCategory: form.controlCategory || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEntries((prev) => [json.entry, ...prev]);
        setTotal((t) => t + 1);
        setForm(EMPTY_FORM);
        setShowForm(false);
        toast.success("Decision logged.");
      } else {
        toast.error("Could not save entry.");
      }
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setTotal((t) => t - 1);
  }

  function handleUpdate(id: string, data: Partial<JournalEntry>) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
  }

  const filteredEntries = entries.filter((e) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || e.title.toLowerCase().includes(q) || e.context.toLowerCase().includes(q);
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "has_outcome" && !!e.outcome) ||
      (activeFilter === "no_outcome" && !e.outcome) ||
      e.controlCategory === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const FILTER_CHIPS: { key: FilterChip; label: string }[] = [
    { key: "all", label: "All" },
    { key: "in_control", label: "In control" },
    { key: "partial", label: "Partial" },
    { key: "outside_control", label: "Not in control" },
    { key: "has_outcome", label: "Outcome logged" },
    { key: "no_outcome", label: "Awaiting outcome" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">

        <PageHeader
          title="Decision Journal"
          description="Log decisions before you make them. Return to record the outcome."
          badge={total > 0 ? { label: `${total} entries`, color: "gold" } : undefined}
          action={
            <Button
              onClick={() => {
                setShowForm((s) => !s);
                setPromptDismissed(false);
              }}
              size="sm"
              icon={showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            >
              {showForm ? "Cancel" : "New Entry"}
            </Button>
          }
        />

        {/* Search + filter bar */}
        {entries.length > 0 && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or context…"
                className="w-full border border-stone-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-soft-gold/30 bg-white"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-matte-black">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              {FILTER_CHIPS.map((chip) => (
                <button
                  key={chip.key}
                  onClick={() => setActiveFilter(chip.key)}
                  className={`text-xs font-medium px-3 py-1 rounded-full border transition-all ${
                    activeFilter === chip.key
                      ? "bg-matte-black text-white border-matte-black"
                      : "bg-white text-slate-calm border-stone-200 hover:border-stone-300"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
              {(search || activeFilter !== "all") && (
                <span className="text-[11px] text-stone-400 ml-1">
                  {filteredEntries.length} of {total}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Contextual prompt — shown when form opens and not dismissed */}
        <AnimatePresence>
          {showForm && contextPrompt && !promptDismissed && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-amber-100">
                  <Lightbulb className="w-4 h-4 text-soft-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-800 mb-0.5">
                    {contextPrompt.emoji} {contextPrompt.label} — suggested focus
                  </p>
                  <p className="text-sm text-stone-700 leading-relaxed">{contextPrompt.prompt}</p>
                  {contextPrompt.calcScore !== null && contextPrompt.calcScore < 60 && (
                    <p className="text-xs text-amber-700 mt-1.5 font-medium">
                      Calculator score: {Math.round(contextPrompt.calcScore)}/100 — consider running it again after writing.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setPromptDismissed(true)}
                  className="text-stone-400 hover:text-stone-600 flex-shrink-0"
                  aria-label="Dismiss prompt"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New entry form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              onSubmit={handleCreate}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-stone-200 rounded-2xl shadow-premium p-6 space-y-5"
            >
              <h2 className="font-serif font-bold text-matte-black">Log a Decision</h2>

              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1.5">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Accept the job offer in London"
                  maxLength={200}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-soft-gold/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1.5">Context & Stakes</label>
                <textarea
                  value={form.context}
                  onChange={(e) => setForm((f) => ({ ...f, context: e.target.value }))}
                  placeholder="What's the situation? What are you weighing up? What matters most here?"
                  rows={4}
                  maxLength={3000}
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-soft-gold/30 resize-none"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-stone-500">Options</label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="text-xs text-soft-gold hover:text-brand-600 font-medium"
                  >
                    + Add option
                  </button>
                </div>
                <div className="space-y-2">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        maxLength={200}
                        className="flex-1 border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soft-gold/30"
                      />
                      {form.options.length > 2 && (
                        <button type="button" onClick={() => removeOption(i)} className="text-stone-300 hover:text-red-400">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dichotomy of Control */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CircleDot className="w-3.5 h-3.5 text-slate-calm" />
                  <label className="text-xs font-semibold text-stone-500">
                    Dichotomy of control <span className="font-normal text-stone-400">(optional)</span>
                  </label>
                </div>
                <p className="text-xs text-stone-400 mb-2">Is this outcome within your control?</p>
                <div className="flex gap-2 flex-wrap">
                  {CONTROL_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setForm((f) => ({
                        ...f,
                        controlCategory: f.controlCategory === opt.key ? "" : opt.key,
                      }))}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                        form.controlCategory === opt.key
                          ? opt.color + " ring-1 ring-offset-1 ring-current"
                          : "bg-stone-50 border-stone-200 text-stone-400 hover:border-stone-300"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${form.controlCategory === opt.key ? opt.dot : "bg-stone-300"}`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5">
                    Chosen option <span className="font-normal text-stone-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.chosenOption}
                    onChange={(e) => setForm((f) => ({ ...f, chosenOption: e.target.value }))}
                    placeholder="Which did you pick?"
                    maxLength={200}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soft-gold/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5">
                    Confidence score <span className="font-normal text-stone-400">(0–100)</span>
                  </label>
                  <input
                    type="number"
                    value={form.decisionScore}
                    onChange={(e) => setForm((f) => ({ ...f, decisionScore: e.target.value }))}
                    placeholder="e.g. 72"
                    min={0}
                    max={100}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soft-gold/30"
                  />
                </div>
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving…" : "Save Entry"}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Entries */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-stone-200 rounded-3xl shadow-premium overflow-hidden"
          >
            {/* Gold accent bar */}
            <div className="h-1 bg-gradient-to-r from-brand-400 to-soft-gold" />
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-brand-50 flex items-center justify-center mx-auto mb-4 border border-amber-100">
                <BookOpen className="w-7 h-7 text-soft-gold" />
              </div>
              <h3 className="font-serif text-lg font-bold text-matte-black mb-2">Your decision log starts here</h3>
              <p className="text-sm text-slate-calm max-w-xs mx-auto mb-1 leading-relaxed">
                Write down a decision <em>before</em> you make it. Return later to record what happened.
              </p>
              <p className="stoic-quote text-xs max-w-xs mx-auto mb-6">
                &ldquo;First say to yourself what you would be; and then do what you have to do.&rdquo; — Epictetus
              </p>
              {/* Mini how-it-works */}
              <div className="text-left max-w-xs mx-auto space-y-3 mb-6">
                {[
                  { n: "1", text: "Log the decision and your options" },
                  { n: "2", text: "Mark which option you chose" },
                  { n: "3", text: "Return to record the outcome" },
                ].map(({ n, text }) => (
                  <div key={n} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-50 border border-soft-gold/30 text-soft-gold text-xs font-bold flex items-center justify-center flex-shrink-0">{n}</span>
                    <p className="text-sm text-slate-calm">{text}</p>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setShowForm(true)}
                variant="gold"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
              >
                Log your first decision
              </Button>
            </div>
          </motion.div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-8 h-8 text-stone-200 mx-auto mb-3" />
            <p className="text-sm text-slate-calm mb-2">No entries match your search.</p>
            <button
              onClick={() => { setSearch(""); setActiveFilter("all"); }}
              className="text-xs text-soft-gold hover:underline font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}

        {/* Stoic nudge */}
        {entries.length > 0 && (
          <div className="text-center py-4">
            <Sparkles className="w-4 h-4 text-soft-gold mx-auto mb-2" />
            <p className="text-xs text-stone-400 italic max-w-sm mx-auto">
              &ldquo;The impediment to action advances action. What stands in the way becomes the way.&rdquo;
              <br />
              <span className="not-italic font-medium">— Marcus Aurelius</span>
            </p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
