import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started — Limitum",
  description: "Set up your Limitum profile and choose your Stoic philosopher guide.",
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
