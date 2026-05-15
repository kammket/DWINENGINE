"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/Sidebar";
import {
  DIMENSIONS,
  getTodayChallenge,
  computeCompositeScore,
  generateInsight,
  type DailyPulseRecord,
  type PulseValues,
} from "@/lib/pulse";
import toast from "react-hot-toast";

type PageState = "loading" | "fresh" | "submitting" | "done";

const SLIDER_STYLES = `
  .pulse-slider {
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    border-radius: 3px;
    outline: none;
    cursor: pointer;
    width: 100%;
    transition: opacity 0.2s;
  }
  .pulse-slider:disabled { opacity: 0.5; cursor: not-allowed; }
  .pulse-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.18);
    cursor: pointer;
    transition: transform 0.15s;
  }
  .pulse-slider:not(:disabled)::-webkit-slider-thumb:hover { transform: scale(1.2); }
  .pulse-slider::-moz-range-thumb {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.18);
    cursor: pointer;
  }
  .ps-energy::-webkit-slider-thumb { background: #F59E0B; }
  .ps-energy::-moz-range-thumb    { background: #F59E0B; }
  .ps-calm::-webkit-slider-thumb  { background: #0EA5E9; }
  .ps-calm::-moz-range-thumb      { background: #0EA5E9; }
  .ps-clarity::-webkit-slider-thumb  { background: #8B5CF6; }
  .ps-clarity::-moz-range-thumb      { background: #8B5CF6; }
  .ps-gratitude::-webkit-slider-thumb { background: #10B981; }
  .ps-gratitude::-moz-range-thumb     { background: #10B981; }
  .ps-connection::-webkit-slider-thumb { background: #F43F5E; }
  .ps-connection::-moz-range-thumb     { background: #F43F5E; }
`;

function ScoreRing({ score }: { score: number }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#F43F5E";
  const label = score >= 80 ? "Flourishing" : score >= 60 ? "Balanced" : "Rebuilding";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="#374151" strokeWidth="8" />
          <motion.circle
            cx="48" cy="48" r={radius} fill="none"
            stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white leading-none">{score}</span>
          <span className="text-[10px] text-stone-400 mt-0.5">/ 100</span>
        </div>
      </div>
      <span className="text-xs font-medium" style={{ color }}>{label}</span>
    </div>
  );
}

function Sparkline({ data }: { data: DailyPulseRecord[] }) {
  const scores = data.map((p) => computeCompositeScore(p));
  if (scores.length < 2) return null;

  const W = 300;
  const H = 56;
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const range = maxScore - minScore || 10;

  const coords = scores.map((s, i) => ({
    x: (i / (scores.length - 1)) * W,
    y: H - ((s - minScore) / range) * (H - 12) - 6,
    score: s,
  }));

  const pathD = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`)
    .join(" ");

  const areaD = `${pathD} L ${W} ${H} L 0 ${H} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 64 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#spark-fill)" />
        <path d={pathD} fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x} cy={c.y}
            r={i === coords.length - 1 ? 4.5 : 3}
            fill={i === coords.length - 1 ? "#C9A84C" : "white"}
            stroke="#C9A84C"
            strokeWidth="1.5"
          />
        ))}
      </svg>
      <div className="flex justify-between mt-2">
        {data.map((p, i) => (
          <div key={p.date} className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-slate-calm">
              {new Date(p.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" })}
            </span>
            <span className={`text-[10px] font-medium ${i === data.length - 1 ? "text-soft-gold" : "text-stone-400"}`}>
              {scores[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PulsePage() {
  const [state, setState] = useState<PageState>("loading");
  const [values, setValues] = useState<PulseValues>({ energy: 7, calm: 7, clarity: 7, gratitude: 7, connection: 7 });
  const [note, setNote] = useState("");
  const [todayPulse, setTodayPulse] = useState<DailyPulseRecord | null>(null);
  const [history, setHistory] = useState<DailyPulseRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const challenge = getTodayChallenge();

  useEffect(() => {
    fetch("/api/pulse")
      .then((r) => r.json())
      .then((data) => {
        setStreak(data.streak ?? 0);
        setHistory(data.history ?? []);
        if (data.today) {
          setTodayPulse(data.today);
          setValues({
            energy: data.today.energy,
            calm: data.today.calm,
            clarity: data.today.clarity,
            gratitude: data.today.gratitude,
            connection: data.today.connection,
          });
          setNote(data.today.note ?? "");
          setState("done");
        } else {
          setState("fresh");
        }
      })
      .catch(() => setState("fresh"));
  }, []);

  const handleSubmit = async () => {
    const prevState = state;
    setState("submitting");
    try {
      const res = await fetch("/api/pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, ...(note ? { note } : {}) }),
      });
      const data = await res.json();
      if (data.success) {
        setTodayPulse(data.pulse);
        setStreak(data.streak);
        setHistory((prev) => {
          const without = prev.filter((p) => p.date !== data.pulse.date);
          return [...without, data.pulse].sort((a, b) => a.date.localeCompare(b.date));
        });
        setState("done");
        setIsEditing(false);
        toast.success("Pulse recorded. Well done.");
      } else {
        toast.error("Something went wrong. Try again.");
        setState(prevState === "done" ? "done" : "fresh");
      }
    } catch {
      toast.error("Network error. Try again.");
      setState(prevState === "done" ? "done" : "fresh");
    }
  };

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const compositeScore = todayPulse ? computeCompositeScore(todayPulse) : 0;
  const insight = todayPulse ? generateInsight(todayPulse, streak) : "";
  const last7 = [...history]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);

  const showForm = state === "fresh" || state === "submitting" || (state === "done" && isEditing);

  return (
    <DashboardLayout>
      <style>{SLIDER_STYLES}</style>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-matte-black">{greeting}</h1>
            <p className="text-slate-calm text-sm mt-0.5">{dateStr}</p>
          </div>
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5 shadow-sm"
            >
              <span className="text-xl">🔥</span>
              <div>
                <p className="text-sm font-bold text-soft-gold leading-none">{streak}</p>
                <p className="text-xs text-slate-calm mt-0.5">{streak === 1 ? "day streak" : "day streak"}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Loading skeleton */}
        {state === "loading" && (
          <div className="space-y-4 animate-pulse">
            <div className="h-40 bg-stone-100 rounded-3xl" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 bg-stone-100 rounded-2xl" />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ─── FORM (fresh / editing / submitting) ─── */}
          {showForm && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              {/* Daily challenge card */}
              <div className="relative bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-6 mb-6 overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-soft-gold/10 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
                <div className="relative">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.15em]">
                    Today&apos;s Stoic Practice
                  </span>
                  <p className="text-white font-medium mt-3 leading-relaxed text-sm">
                    {challenge.practice}
                  </p>
                  <div className="mt-4 pt-4 border-t border-stone-700/60">
                    <p className="text-stone-300 text-[13px] italic leading-relaxed">
                      &ldquo;{challenge.quote}&rdquo;
                    </p>
                    <p className="text-amber-400/80 text-xs mt-1.5">— {challenge.author}</p>
                  </div>
                </div>
              </div>

              {/* Dimension sliders */}
              <div className="space-y-3 mb-6">
                {DIMENSIONS.map((dim, idx) => {
                  const value = values[dim.key as keyof PulseValues];
                  const pct = ((value - 1) / 9) * 100;
                  return (
                    <motion.div
                      key={dim.key}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.07, duration: 0.3 }}
                      className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl w-7 text-center">{dim.emoji}</span>
                          <div>
                            <p className="text-sm font-semibold text-matte-black leading-none">{dim.label}</p>
                            <p className="text-xs text-slate-calm mt-0.5">{dim.description}</p>
                          </div>
                        </div>
                        <motion.span
                          key={value}
                          initial={{ scale: 0.85 }}
                          animate={{ scale: 1 }}
                          className="text-xl font-bold tabular-nums w-8 text-right"
                          style={{ color: dim.color }}
                        >
                          {value}
                        </motion.span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={value}
                        onChange={(e) =>
                          setValues((v) => ({ ...v, [dim.key]: Number(e.target.value) }))
                        }
                        className={`pulse-slider ps-${dim.key}`}
                        style={{
                          background: `linear-gradient(to right, ${dim.color} ${pct}%, #e7e5e4 ${pct}%)`,
                        }}
                        disabled={state === "submitting"}
                      />
                      <div className="flex justify-between mt-1.5">
                        <span className="text-[10px] text-stone-400">{dim.lowLabel}</span>
                        <span className="text-[10px] text-stone-400">{dim.highLabel}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Note */}
              <div className="mb-6">
                <label className="text-xs font-medium text-slate-calm uppercase tracking-widest block mb-2">
                  Add a note <span className="normal-case font-normal">(optional)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What's on your mind today? Any intention, observation, or gratitude..."
                  rows={3}
                  maxLength={500}
                  className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3 text-sm text-matte-black placeholder:text-stone-400 resize-none focus:outline-none focus:ring-2 focus:ring-soft-gold/30 focus:border-soft-gold transition-all"
                  disabled={state === "submitting"}
                />
                <p className="text-[10px] text-stone-400 text-right mt-1">{note.length}/500</p>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={state === "submitting"}
                className="w-full bg-gradient-to-r from-soft-gold to-brand-600 text-white font-semibold py-4 rounded-2xl text-sm shadow-lg hover:shadow-xl hover:scale-[1.015] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
              >
                {state === "submitting" ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Recording your pulse…
                  </span>
                ) : isEditing ? "Update Today's Pulse" : "Record Today's Pulse"}
              </button>

              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-full mt-3 text-sm text-slate-calm hover:text-matte-black transition-colors py-2.5"
                >
                  Cancel
                </button>
              )}
            </motion.div>
          )}

          {/* ─── RESULTS (done, not editing) ─── */}
          {state === "done" && !isEditing && todayPulse && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
            >
              {/* Score + insight card */}
              <div className="relative bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-6 mb-6 overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-soft-gold/10 rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
                <div className="relative flex items-start gap-6">
                  <ScoreRing score={compositeScore} />
                  <div className="flex-1 min-w-0 pt-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.15em]">
                      Today&apos;s Pulse
                    </span>
                    <p className="text-stone-200 text-sm leading-relaxed mt-2">{insight}</p>
                  </div>
                </div>
              </div>

              {/* Dimension breakdown */}
              <div className="grid grid-cols-5 gap-2 mb-6">
                {DIMENSIONS.map((dim) => {
                  const value = todayPulse[dim.key as keyof PulseValues];
                  return (
                    <motion.div
                      key={dim.key}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: DIMENSIONS.findIndex((d) => d.key === dim.key) * 0.06 }}
                      className="bg-white rounded-2xl p-3 text-center border border-stone-100 shadow-sm"
                    >
                      <span className="text-xl">{dim.emoji}</span>
                      <p className="text-lg font-bold mt-1 leading-none" style={{ color: dim.color }}>
                        {value}
                      </p>
                      <p className="text-[9px] text-slate-calm mt-1 leading-tight">{dim.label}</p>
                    </motion.div>
                  );
                })}
              </div>

              {/* 7-day sparkline */}
              {last7.length > 1 && (
                <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-medium text-slate-calm uppercase tracking-widest">
                      7-day trend
                    </p>
                    <p className="text-xs text-stone-400">
                      Avg {Math.round(last7.reduce((s, p) => s + computeCompositeScore(p), 0) / last7.length)}
                    </p>
                  </div>
                  <Sparkline data={last7} />
                </div>
              )}

              {/* Daily challenge */}
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100 mb-6">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.15em]">
                  Today&apos;s Stoic Practice
                </span>
                <p className="text-sm text-matte-black font-medium mt-2 leading-relaxed">
                  {challenge.practice}
                </p>
                <p className="text-stone-400 text-[13px] italic mt-3 leading-relaxed">
                  &ldquo;{challenge.quote}&rdquo;
                  <span className="not-italic text-[11px] ml-1.5">— {challenge.author}</span>
                </p>
              </div>

              {/* User note */}
              {todayPulse.note && (
                <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm mb-6">
                  <p className="text-[10px] font-medium text-slate-calm uppercase tracking-widest mb-2">
                    Your note
                  </p>
                  <p className="text-sm text-matte-black leading-relaxed">{todayPulse.note}</p>
                </div>
              )}

              {/* Edit button */}
              <button
                onClick={() => setIsEditing(true)}
                className="w-full border border-stone-200 text-slate-calm hover:text-matte-black hover:border-stone-300 hover:bg-stone-50 font-medium py-3.5 rounded-2xl text-sm transition-all duration-200"
              >
                Edit today&apos;s pulse
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
