import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Reflections — Constavita",
  description: "View all your saved AI Stoic reflections from past calculator sessions.",
  robots: { index: false, follow: false },
};

export default function ReflectionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
