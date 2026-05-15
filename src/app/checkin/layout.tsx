import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly Check-in — Constavita",
  description: "Log your weekly mood across five life dimensions and maintain your Stoic streak.",
  robots: { index: false, follow: false },
};

export default function CheckinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
