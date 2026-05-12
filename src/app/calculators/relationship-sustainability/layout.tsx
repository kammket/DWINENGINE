import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Relationship Sustainability Calculator",
  url: "https://limitum.ai/calculators/relationship-sustainability",
  applicationCategory: "LifestyleApplication",
  description:
    "Free relationship sustainability calculator. Score communication quality, shared values, conflict resolution, emotional support, and growth alignment.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://limitum.ai" },
      { "@type": "ListItem", position: 2, name: "Calculators", item: "https://limitum.ai/calculators" },
      { "@type": "ListItem", position: 3, name: "Relationship Sustainability", item: "https://limitum.ai/calculators/relationship-sustainability" },
    ],
  },
};

export const metadata: Metadata = {
  title: "Relationship Sustainability Calculator — Free Score | Limitum",
  description:
    "Calculate your relationship health score. Assess communication, shared values, conflict resolution, emotional support, and personal growth alignment. Get a Stoic AI perspective.",
  keywords: [
    "relationship calculator",
    "relationship health score",
    "relationship compatibility test",
    "relationship sustainability",
    "is my relationship healthy",
    "relationship assessment",
    "communication quality test",
    "stoic relationships",
  ],
  alternates: { canonical: "https://limitum.ai/calculators/relationship-sustainability" },
  openGraph: {
    title: "Relationship Sustainability Calculator — Free | Limitum",
    description: "Score your relationship health across communication, values, conflict resolution, and growth. Free Stoic-grounded assessment.",
    url: "https://limitum.ai/calculators/relationship-sustainability",
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
