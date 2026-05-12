"use client";

import { useEffect, useState } from "react";
import { Target, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

type Props = {
  calculatorType: string;
  currentScore: number;
};

type Goal = {
  targetScore: number;
  startScore: number | null;
  currentScore: number | null;
  reachedAt: string | null;
};

export function GoalSetter({ calculatorType, currentScore }: Props) {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(75);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/goals")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const existing = json.goals.find(
            (g: { calculatorType: string }) => g.calculatorType === calculatorType
          );
          if (existing) {
            setGoal(existing);
            setTarget(existing.targetScore);
          }
        }
      })
      .finally(() => setLoaded(true));
  }, [calculatorType]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calculatorType, targetScore: target }),
      });
      const json = await res.json();
      if (json.success) {
        setGoal({ ...json.goal, currentScore });
        setOpen(false);
        toast.success("Goal set!");
      } else {
        toast.error("Could not save goal.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return null;

  const reached = goal && (goal.reachedAt || currentScore >= goal.targetScore);
  const pct = goal ? Math.min(100, Math.round((currentScore / goal.targetScore) * 100)) : 0;

  return (
    <div className="mt-6 pt-6 border-t border-stone-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-soft-gold" />
          <span className="text-sm font-semibold text-matte-black">
            {goal ? "Your Goal" : "Set a Score Goal"}
          </span>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 text-xs text-slate-calm hover:text-matte-black transition-colors"
        >
          {goal ? "Edit" : "Add goal"}
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Existing goal display */}
      {goal && !open && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Current: {Math.round(currentScore)}</span>
            <span>Target: {goal.targetScore}</span>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${reached ? "bg-green-400" : "bg-soft-gold"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {reached ? (
            <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Goal reached!
            </div>
          ) : (
            <p className="text-xs text-stone-400">
              {goal.targetScore - Math.round(currentScore)} points to go · {pct}% there
            </p>
          )}
        </div>
      )}

      {/* Set/edit form */}
      {open && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-500">Target score</label>
              <span className="text-sm font-bold text-soft-gold">{target}</span>
            </div>
            <input
              type="range"
              min={Math.ceil(currentScore) + 1}
              max={100}
              step={1}
              value={target}
              onChange={(e) => setTarget(parseInt(e.target.value))}
              className="w-full accent-soft-gold h-2 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-300 mt-1">
              <span>{Math.ceil(currentScore) + 1} (current + 1)</span>
              <span>100</span>
            </div>
          </div>
          <p className="text-xs text-stone-500">
            You need <strong className="text-matte-black">{target - Math.round(currentScore)} more points</strong> to hit this target.
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : goal ? "Update Goal" : "Set Goal"}
            </Button>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-slate-calm hover:text-matte-black px-3"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Empty state — no goal yet, form closed */}
      {!goal && !open && (
        <p className="text-xs text-stone-400">
          Set a target score to track your progress over time.
        </p>
      )}
    </div>
  );
}
