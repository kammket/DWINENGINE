import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — Constavita",
  description: "Manage your profile, Stoic philosopher guide, password, subscription, and account data.",
  robots: { index: false, follow: false },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
