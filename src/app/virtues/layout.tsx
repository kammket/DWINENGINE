import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Virtue Compass — Constavita",
  description: "Rate yourself on Wisdom, Courage, Justice, and Temperance each week. Track your Stoic virtue evolution over time.",
  robots: { index: false, follow: false },
};

export default function VirtuesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
