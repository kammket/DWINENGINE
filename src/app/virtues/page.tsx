"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/Sidebar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { VirtueCompass } from "@/components/ui/VirtueCompass";
import { BookOpen, Zap, Scale, Shield, ChevronRight, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

type VirtueRating = {
  id: string;
  weekKey: string;
  wisdom: number;
  courage: number;
  justice: number;
  temperance: number;
  notes: string | null;
};

type PageState = {
  thisWeek: VirtueRating | null;
  history: VirtueRating[];
};

const VIRTUES = [
  {
    key: "wisdom" as const,
    label: "Wisdom",
    latin: "Sapientia",
    icon: BookOpen,
    color: "text-blue-600",
    bg: "bg-blue-50",
    desc: "How soundly did you reason and judge this week? Did you seek truth over comfort?",
  },
  {
    key: "courage" as const,
    label: "Courage",
    latin: "Fortitudo",
    icon: Zap,
    color: "text-orange-600",
    bg: "bg-orange-50",
    desc: "Did you act rightly despite discomfort, fear, or social pressure?",
  },
  {
    key: "justice" as const,
    label: "Justice",
    latin: "Iustitia",
    icon: Scale,
    color: "text-green-600",
    bg: "bg-green-50",
    desc: "Did you treat others fairly? Did you fulfil your duties to the community?",
  },
  {
    key: "temperance" as const,
    label: "Temperance",
    latin: "Temperantia",
    icon: Shield,
    color: "text-purple-600",
    bg: "bg-purple-50",
    desc: "Did you exercise moderation? Did you resist impulse and excess?",
  },
] as const;

const VIRTUE_INTERPRETATIONS: Record<string, string> = {
  "1-3": "Struggling — this is where the work begins.",
  "4-5": "Developing — awareness is the first step.",
  "6-7": "Practising — you are building the habit.",
  "8-9": "Strong — keep the standard.",
  "10": "Sage-level — rare and worth protecting.",
};

function getInterpretation(score: number): string {
  if (score <= 3) return VIRTUE_INTERPRETATIONS["1-3"];
  if (score <= 5) return VIRTUE_INTERPRETATIONS["4-5"];
  if (score <= 7) return VIRTUE_INTERPRETATIONS["6-7"];
  if (score <= 9) return VIRTUE_INTERPRETATIONS["8-9"];
  return VIRTUE_INTERPRETATIONS["10"];
}

export default function VirtuesPage() {
  const [data, setData] = useState<PageState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    wisdom: 5,
    courage: 5,
    justice: 5,
    temperance: 5,
    notes: "",
  });

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/virtues");
    const json = await res.json();
    if (json.success) {
      setData(json);
      if (json.thisWeek) {
        const w = json.thisWeek;
        setForm({
          wisdom: w.wisdom,
          courage: w.courage,
          justice: w.justice,
          temperance: w.temperance,
          notes: w.notes ?? "",
        });
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/virtues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setData((prev) => prev
          ? { ...prev, thisWeek: json.rating }
          : { thisWeek: json.rating, history: [json.rating] }
        );
        toast.success("Virtue rating saved.");
      } else toast.error("Could not save.");
    } finally {
      setSaving(false);
    }
  }

  const previousWeek = data?.history?.[1] ?? null;
  const currentData = data?.thisWeek
    ? { wisdom: data.thisWeek.wisdom, courage: data.thisWeek.courage, justice: data.thisWeek.justice, temperance: data.thisWeek.temperance }
    : { wisdom: form.wisdom, courage: form.courage, justice: form.justice, temperance: form.temperance };
  const prevData = previousWeek
    ? { wisdom: previousWeek.wisdom, courage: previousWeek.courage, justice: previousWeek.justice, temperance: previousWeek.temperance }
    : null;

  const avgScore = Math.round((form.wisdom + form.courage + form.justice + form.temperance) / 4 * 10) / 10;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-serif text-2xl font-bold text-matte-black">Virtue Compass</h1>
          <p className="text-slate-calm text-sm mt-1">
            The Stoics held that virtue is the only true good. Rate yourself weekly — honestly, not harshly.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Radar chart */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card padding="lg" className="h-full">
              <CardHeader>
                <CardTitle>This Week</CardTitle>
                <CardDescription>
                  {previousWeek ? "Gold = this week · Grey dashed = last week" : "Rate yourself below to see your compass"}
                </CardDescription>
              </CardHeader>
              <VirtueCompass current={currentData} previous={prevData} size="md" />
              <div className="mt-3 text-center">
                <span className="text-xs text-stone-400">Average virtue score: </span>
                <span className="text-sm font-bold text-soft-gold">{avgScore}/10</span>
              </div>
            </Card>
          </motion.div>

          {/* Rating form */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <form onSubmit={handleSubmit} className="space-y-4 h-full flex flex-col">
              <div className="bg-white border border-stone-200 rounded-2xl shadow-premium divide-y divide-stone-50 flex-1">
                {VIRTUES.map((v) => {
                  const val = form[v.key];
                  const Icon = v.icon;
                  return (
                    <div key={v.key} className="p-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg ${v.bg} flex items-center justify-center`}>
                            <Icon className={`w-3.5 h-3.5 ${v.color}`} />
                          </div>
                          <span className="text-sm font-semibold text-matte-black">{v.label}</span>
                          <span className="text-xs text-stone-400 italic">{v.latin}</span>
                        </div>
                        <span className={`text-sm font-bold tabular-nums ${v.color}`}>{val}/10</span>
                      </div>
                      <p className="text-[11px] text-stone-400 mb-2">{v.desc}</p>
                      <input
                        type="range"
                        min={1} max={10} step={1}
                        value={val}
                        onChange={(e) => setForm((f) => ({ ...f, [v.key]: parseInt(e.target.value) }))}
                        className="w-full accent-soft-gold h-1.5 cursor-pointer"
                      />
                      <p className="text-[10px] text-stone-400 mt-1 italic">{getInterpretation(val)}</p>
                    </div>
                  );
                })}

                {/* Notes */}
                <div className="p-4">
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5">
                    Reflection <span className="font-normal text-stone-400">(optional)</span>
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Where did you excel this week? Where did you fall short? Be honest."
                    rows={2}
                    maxLength={1000}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-matte-black placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-soft-gold/30 resize-none"
                  />
                </div>
              </div>

              <Button type="submit" disabled={saving || loading} className="w-full">
                {saving ? "Saving…" : data?.thisWeek ? "Update This Week's Rating" : "Save Virtue Rating"}
                {!saving && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </form>
          </motion.div>
        </div>

        {/* History table */}
        {data && data.history.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card padding="lg">
              <CardHeader>
                <CardTitle>History</CardTitle>
                <CardDescription>Your virtue arc over the past weeks</CardDescription>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-stone-400 border-b border-stone-100">
                      <th className="text-left py-2 pr-4 font-medium">Week</th>
                      <th className="text-center py-2 px-2 font-medium">Wisdom</th>
                      <th className="text-center py-2 px-2 font-medium">Courage</th>
                      <th className="text-center py-2 px-2 font-medium">Justice</th>
                      <th className="text-center py-2 px-2 font-medium">Temperance</th>
                      <th className="text-center py-2 pl-2 font-medium">Avg</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {data.history.map((r) => {
                      const avg = ((r.wisdom + r.courage + r.justice + r.temperance) / 4).toFixed(1);
                      return (
                        <tr key={r.id} className="hover:bg-stone-50 transition-colors">
                          <td className="py-2.5 pr-4 text-xs text-stone-400">{r.weekKey}</td>
                          <td className="py-2.5 px-2 text-center font-semibold text-blue-600">{r.wisdom}</td>
                          <td className="py-2.5 px-2 text-center font-semibold text-orange-600">{r.courage}</td>
                          <td className="py-2.5 px-2 text-center font-semibold text-green-600">{r.justice}</td>
                          <td className="py-2.5 px-2 text-center font-semibold text-purple-600">{r.temperance}</td>
                          <td className="py-2.5 pl-2 text-center font-bold text-soft-gold">{avg}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Stoic note */}
        <div className="text-center py-4">
          <Sparkles className="w-4 h-4 text-soft-gold mx-auto mb-2" />
          <p className="text-xs text-stone-400 italic max-w-md mx-auto">
            &ldquo;Virtue is nothing else but right reason.&rdquo;
            <br />
            <span className="not-italic font-medium">— Seneca</span>
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
}
