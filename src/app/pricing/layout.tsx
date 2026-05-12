import type { Metadata } from "next";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "PriceSpecification",
  name: "Limitum Pricing",
  url: "https://limitum.ai/pricing",
  description: "Free and premium plans for AI-powered life decision intelligence.",
  offers: [
    {
      "@type": "Offer",
      name: "Free Plan",
      price: "0",
      priceCurrency: "USD",
      description: "3 AI reflections per month, access to all 5 calculators",
    },
    {
      "@type": "Offer",
      name: "Premium Plan",
      price: "19",
      priceCurrency: "USD",
      billingIncrement: "month",
      description: "Unlimited AI reflections, scenario simulator, analytics, and Virtue Compass",
    },
  ],
};

export const metadata: Metadata = {
  title: "Pricing — Free & Premium Plans | Limitum",
  description:
    "Limitum is free to start. Upgrade to Premium for unlimited AI Stoic reflections, scenario simulation, longitudinal analytics, and Virtue Compass. No credit card required for the free tier.",
  keywords: [
    "limitum pricing",
    "decision intelligence app pricing",
    "stoic app free",
    "life calculator premium",
    "AI reflection tool cost",
  ],
  alternates: { canonical: "https://limitum.ai/pricing" },
  openGraph: {
    title: "Pricing — Limitum",
    description: "Start free. Upgrade for unlimited AI reflections, the scenario simulator, and longitudinal analytics.",
    url: "https://limitum.ai/pricing",
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
