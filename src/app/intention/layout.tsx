import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Morning Intention — Limitum",
  description: "Set your daily Stoic intention, choose your virtue focus, and complete your evening review.",
  robots: { index: false, follow: false },
};

export default function IntentionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
