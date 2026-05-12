import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Time Value Calculator",
  url: "https://limitum.ai/calculators/time-value",
  applicationCategory: "ProductivityApplication",
  description:
    "Free time value calculator. Assess how you spend your time, measure time autonomy, and get your time sustainability score.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://limitum.ai" },
      { "@type": "ListItem", position: 2, name: "Calculators", item: "https://limitum.ai/calculators" },
      { "@type": "ListItem", position: 3, name: "Time Value", item: "https://limitum.ai/calculators/time-value" },
    ],
  },
};

export const metadata: Metadata = {
  title: "Time Value Calculator — How You Really Spend Your Time | Limitum",
  description:
    "Free time value calculator. Assess sleep, deep work, exercise, relationships, and personal growth time. Calculate your time sustainability score and get a Stoic reflection on how you spend your hours.",
  keywords: [
    "time value calculator",
    "how do I spend my time",
    "time management assessment",
    "time audit calculator",
    "work life balance calculator",
    "time sustainability score",
    "stoic time management",
    "productivity calculator",
  ],
  alternates: { canonical: "https://limitum.ai/calculators/time-value" },
  openGraph: {
    title: "Time Value Calculator — Free | Limitum",
    description: "Discover how you really spend your time. Score sleep, deep work, exercise, and relationships. Get your time sustainability index.",
    url: "https://limitum.ai/calculators/time-value",
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
