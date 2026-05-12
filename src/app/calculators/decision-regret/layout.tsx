import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Decision Regret Calculator",
  url: "https://limitum.ai/calculators/decision-regret",
  applicationCategory: "LifestyleApplication",
  description:
    "Free decision quality calculator. Score your decision process quality, reversibility, information quality, and emotional alignment.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://limitum.ai" },
      { "@type": "ListItem", position: 2, name: "Calculators", item: "https://limitum.ai/calculators" },
      { "@type": "ListItem", position: 3, name: "Decision Quality", item: "https://limitum.ai/calculators/decision-regret" },
    ],
  },
};

export const metadata: Metadata = {
  title: "Decision Regret Calculator — Measure Decision Quality | Limitum",
  description:
    "Free decision quality calculator. Score your decision-making process across reversibility, information quality, values alignment, and emotional impact. Reduce future regret with Stoic clarity.",
  keywords: [
    "decision regret calculator",
    "decision quality score",
    "how to make better decisions",
    "decision making assessment",
    "decision fatigue calculator",
    "regret minimisation",
    "stoic decision making",
    "life decision calculator",
  ],
  alternates: { canonical: "https://limitum.ai/calculators/decision-regret" },
  openGraph: {
    title: "Decision Regret Calculator — Free | Limitum",
    description: "Score your decision quality and reduce future regret. Assess reversibility, information, values, and emotional alignment.",
    url: "https://limitum.ai/calculators/decision-regret",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
