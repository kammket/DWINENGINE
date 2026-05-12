import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Limitum",
  description: "Your personal Limitum dashboard. View your peace scores, goals, achievements, and daily Stoic intention.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
