import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Constavita",
  url: "https://constavita.com",
  description: "AI-powered decision intelligence platform grounded in Stoic philosophy and behavioural science.",
  brand: { "@type": "Brand", name: "Constavita" },
  offers: [
    {
      "@type": "Offer",
      name: "Free Plan",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://constavita.com/register",
      description: "Access all 5 calculators, journal, Morning Intention, and 10 AI Stoic reflections.",
    },
    {
      "@type": "Offer",
      name: "Premium Plan",
      price: "19",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://constavita.com/pricing",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "19",
        priceCurrency: "USD",
        unitCode: "MON",
      },
      description: "Unlimited AI reflections, scenario simulator, longitudinal analytics, and Virtue Compass.",
    },
  ],
};

export const metadata: Metadata = {
  title: "Pricing — Free & Premium Plans | Constavita",
  description:
    "Constavita is free to start. Upgrade to Premium for unlimited AI Stoic reflections, scenario simulation, longitudinal analytics, and Virtue Compass. No credit card required for the free tier.",
  keywords: [
    "constavita pricing",
    "decision intelligence app pricing",
    "stoic app free",
    "life calculator premium",
    "AI reflection tool cost",
  ],
  alternates: { canonical: "https://constavita.com/pricing" },
  openGraph: {
    title: "Pricing — Constavita",
    description: "Start free. Upgrade for unlimited AI reflections, the scenario simulator, and longitudinal analytics.",
    url: "https://constavita.com/pricing",
    type: "website",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
