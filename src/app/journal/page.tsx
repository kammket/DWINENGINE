"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/Button";
import {
  BookOpen, Plus, Trash2, ChevronDown, ChevronUp, CheckCircle2,
  Pencil, X, Clock, Target, Sparkles, CircleDot,
} from "lucide-react";
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

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NewEntryForm>(EMPTY_FORM);

  const fetchEntries = useCallback(async () => {
    const res = await fetch("/api/journal?limit=20");
    const json = await res.json();
    if (json.success) {
      setEntries(json.entries);
      setTotal(json.total);
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

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-matte-black">Decision Journal</h1>
            <p className="text-slate-calm text-sm mt-1">
              Log decisions before you make them. Return to record the outcome.
            </p>
          </div>
          <Button onClick={() => setShowForm((s) => !s)} size="sm">
            {showForm ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
            {showForm ? "Cancel" : "New Entry"}
          </Button>
        </div>

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
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-10 h-10 text-stone-200 mx-auto mb-4" />
            <h3 className="font-serif text-lg font-bold text-matte-black mb-2">No entries yet</h3>
            <p className="text-sm text-slate-calm max-w-xs mx-auto mb-6">
              Logging decisions before you make them is one of the most powerful habits you can build.
            </p>
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Log your first decision
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
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
