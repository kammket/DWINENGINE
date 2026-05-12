import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scenario Simulator — Limitum",
  description: "Simulate future life scenarios — new job, reduced debt, city change — and see how they affect your peace scores.",
  robots: { index: false, follow: false },
};

export default function SimulateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
