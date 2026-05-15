import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trends & Analytics — Constavita",
  description: "Track your evolution across all five life dimensions over time. View your activity heatmap and goal progress.",
  robots: { index: false, follow: false },
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
