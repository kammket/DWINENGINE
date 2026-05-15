import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Constavita",
  description: "Your personal Constavita dashboard. View your peace scores, goals, achievements, and daily Stoic intention.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
