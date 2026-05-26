import { PublicHeader, Footer } from "@/components/layout/PublicLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Disclaimer — Constavita",
  description: "Constavita calculators produce educational indices only — not financial, medical, legal, or psychological advice. Read our full disclaimer.",
  alternates: { canonical: "https://constavita.com/legal/disclaimer" },
  robots: { index: true, follow: false },
  openGraph: {
    title: "Legal Disclaimer — Constavita",
    description: "Constavita provides educational self-reflection tools only. Learn what our indices can and cannot tell you.",
    url: "https://constavita.com/legal/disclaimer",
    type: "website",
  },
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <PublicHeader />
      <main className="pt-24 pb-20 max-w-3xl mx-auto px-4">
        <h1 className="font-serif text-3xl font-bold text-matte-black mb-2">Legal Disclaimer</h1>
        <p className="text-xs text-slate-calm mb-8">Last updated: January 2025</p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
          <p className="text-sm font-semibold text-amber-800 mb-1">Important Notice</p>
          <p className="text-sm text-amber-700">
            Constavita provides <strong>educational self-reflection tools only</strong>. Nothing on this platform
            constitutes financial, medical, psychological, legal, or professional advice of any kind.
          </p>
        </div>

        <div className="space-y-6 text-sm text-matte-black leading-relaxed">
          <section>
            <h2 className="font-serif text-xl font-bold mb-2">Not Financial Advice</h2>
            <p>
              The Financial Peace Calculator and all financial indices produced by Constavita are educational tools
              designed to promote self-awareness. They are not financial advice, investment recommendations,
              tax guidance, or financial planning services. Always consult a qualified financial advisor,
              accountant, or financial planner before making financial decisions.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">Not Medical or Psychological Advice</h2>
            <p>
              The Burnout Risk Index is an educational index derived from self-reported lifestyle data.
              It is not a medical diagnosis, mental health assessment, or clinical evaluation. It does not
              replace diagnosis or treatment by a licensed physician, psychologist, therapist, or other
              healthcare provider. If you are experiencing burnout, mental health challenges, or distress,
              please consult a qualified healthcare professional immediately.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">Not Relationship Therapy</h2>
            <p>
              The Relationship Sustainability Index provides an educational reflection on relationship
              health indicators. It is not couples therapy, counseling, or relationship advice. It cannot
              diagnose relationship disorders or replace professional couples counseling.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">AI-Generated Content</h2>
            <p>
              Logos, our AI reflection engine, generates responses based on general Stoic philosophy and
              population-level behavioral patterns. AI-generated content is for reflective and educational
              purposes only. It may be inaccurate, incomplete, or not applicable to your personal situation.
              Do not make significant life decisions based solely on AI-generated reflections.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">Accuracy of Indices</h2>
            <p>
              Our calculators use simplified mathematical models. They do not account for every individual
              circumstance, cultural context, or complex personal situation. Index scores are approximate
              and illustrative. The same inputs may yield different real-world outcomes depending on
              factors our models cannot capture.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">Scenario Projections</h2>
            <p>
              Projections from the Scenario Simulator are based on estimated behavioral change impacts
              from population research. They are not predictions, guarantees, or promises of outcome.
              Individual results will vary significantly based on personal circumstances.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">Seek Professional Help When Needed</h2>
            <p>
              If you are in crisis or experiencing severe distress, please contact emergency services
              or a crisis helpline immediately. In the US: <a href="tel:988" className="text-soft-gold underline">988 Suicide & Crisis Lifeline</a>. 
              In the UK: <a href="tel:116123" className="text-soft-gold underline">Samaritans (116 123)</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
