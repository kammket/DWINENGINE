import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Decision Journal — Limitum",
  description: "Log and reflect on your decisions. Track outcomes, apply Dichotomy of Control, and build decision clarity over time.",
  robots: { index: false, follow: false },
};

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
