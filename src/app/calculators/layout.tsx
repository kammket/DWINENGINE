import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Decision Calculators — Constavita",
  description:
    "Five AI-powered life calculators: financial peace, burnout risk, relationship sustainability, decision quality, and time value. Free Stoic-grounded assessments.",
  keywords: [
    "life calculators",
    "decision tools",
    "burnout calculator",
    "financial peace calculator",
    "relationship calculator",
    "stoic self-assessment",
  ],
  alternates: { canonical: "https://constavita.com/calculators" },
  openGraph: {
    title: "Life Sustainability Calculators — Constavita",
    description:
      "Assess your financial peace, burnout risk, relationship health, decision quality, and time value with AI-powered calculators.",
    url: "https://constavita.com/calculators",
    type: "website",
  },
};

export default function CalculatorsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
