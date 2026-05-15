import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { tierGate } from "@/lib/tier";

function toCSV(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const escape = (v: string | number | boolean | null | undefined) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}

export async function GET(req: NextRequest) {
  const session = await requireAuth(req);
  if (session instanceof NextResponse) return session;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true, subscription: { select: { tier: true } } },
  });

  const gate = tierGate(user?.subscription?.tier, "PREMIUM", "Data export");
  if (gate) return gate;

  const { searchParams } = new URL(req.url);
  const dataset = searchParams.get("dataset") || "calculators"; // calculators | journal | checkins | all
  const format = searchParams.get("format") || "csv"; // csv | json

  try {
    const [calcResults, journal, checkins, intentions, virtues] = await Promise.all([
      dataset === "calculators" || dataset === "all"
        ? prisma.calculatorResult.findMany({
            where: { userId: session.userId },
            orderBy: { createdAt: "desc" },
            select: { type: true, score: true, inputs: true, createdAt: true },
          })
        : Promise.resolve([]),
      dataset === "journal" || dataset === "all"
        ? prisma.decisionJournal.findMany({
            where: { userId: session.userId },
            orderBy: { createdAt: "desc" },
            select: { title: true, context: true, chosenOption: true, outcome: true, decisionScore: true, controlCategory: true, createdAt: true },
          })
        : Promise.resolve([]),
      dataset === "checkins" || dataset === "all"
        ? prisma.weeklyCheckin.findMany({
            where: { userId: session.userId },
            orderBy: { weekKey: "desc" },
            select: { weekKey: true, financialMood: true, burnoutMood: true, relationshipMood: true, decisionMood: true, timeMood: true, note: true },
          })
        : Promise.resolve([]),
      dataset === "all"
        ? prisma.morningIntention.findMany({
            where: { userId: session.userId },
            orderBy: { dateKey: "desc" },
            select: { dateKey: true, intention: true, virtue: true, completed: true, completedNote: true },
          })
        : Promise.resolve([]),
      dataset === "all"
        ? prisma.virtueRating.findMany({
            where: { userId: session.userId },
            orderBy: { weekKey: "desc" },
            select: { weekKey: true, wisdom: true, courage: true, justice: true, temperance: true, notes: true },
          })
        : Promise.resolve([]),
    ]);

    if (format === "json") {
      const payload = {
        exportedAt: new Date().toISOString(),
        user: { name: user?.name, email: user?.email },
        calculatorResults: calcResults,
        journalEntries: journal,
        weeklyCheckins: checkins,
        morningIntentions: intentions,
        virtueRatings: virtues,
      };
      return new NextResponse(JSON.stringify(payload, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="constavita-export-${Date.now()}.json"`,
        },
      });
    }

    // CSV — one sheet per dataset
    const sections: string[] = [];

    if (calcResults.length > 0) {
      sections.push("# Calculator Results");
      sections.push(toCSV(
        ["Type", "Score", "Date"],
        calcResults.map((r) => [r.type, r.score, new Date(r.createdAt).toISOString()])
      ));
    }
    if (journal.length > 0) {
      sections.push("\n# Decision Journal");
      sections.push(toCSV(
        ["Title", "Context", "Chosen Option", "Outcome", "Decision Score", "Control Category", "Date"],
        journal.map((j) => [j.title, j.context, j.chosenOption, j.outcome, j.decisionScore, j.controlCategory, new Date(j.createdAt).toISOString()])
      ));
    }
    if (checkins.length > 0) {
      sections.push("\n# Weekly Check-ins");
      sections.push(toCSV(
        ["Week", "Financial", "Burnout", "Relationship", "Decision", "Time", "Note"],
        checkins.map((c) => [c.weekKey, c.financialMood, c.burnoutMood, c.relationshipMood, c.decisionMood, c.timeMood, c.note])
      ));
    }
    if (intentions.length > 0) {
      sections.push("\n# Morning Intentions");
      sections.push(toCSV(
        ["Date", "Intention", "Virtue", "Completed", "Reflection"],
        intentions.map((i) => [i.dateKey, i.intention, i.virtue, i.completed, i.completedNote])
      ));
    }
    if (virtues.length > 0) {
      sections.push("\n# Virtue Ratings");
      sections.push(toCSV(
        ["Week", "Wisdom", "Courage", "Justice", "Temperance", "Notes"],
        virtues.map((v) => [v.weekKey, v.wisdom, v.courage, v.justice, v.temperance, v.notes])
      ));
    }

    const csv = sections.join("\n") || "No data found for the requested dataset.";
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="constavita-export-${Date.now()}.csv"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return NextResponse.json({ success: false, error: "Export failed." }, { status: 500 });
  }
}
