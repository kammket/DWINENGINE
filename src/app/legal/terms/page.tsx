import { PublicHeader, Footer } from "@/components/layout/PublicLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Constavita",
  description: "Read the Constavita Terms of Service. Understand your rights, subscription policies, usage rules, and our educational disclaimer before using the platform.",
  alternates: { canonical: "https://constavita.com/legal/terms" },
  robots: { index: true, follow: false },
  openGraph: {
    title: "Terms of Service — Constavita",
    description: "Understand your rights and responsibilities when using the Constavita platform.",
    url: "https://constavita.com/legal/terms",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <PublicHeader />
      <main className="pt-24 pb-20 max-w-3xl mx-auto px-4">
        <h1 className="font-serif text-3xl font-bold text-matte-black mb-2">Terms of Service</h1>
        <p className="text-xs text-slate-calm mb-8">Last updated: January 2025</p>

        <div className="space-y-6 text-sm text-matte-black leading-relaxed">
          <section>
            <h2 className="font-serif text-xl font-bold mb-2">1. Acceptance of Terms</h2>
            <p>By creating an account or using Constavita, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use our services.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">2. Description of Service</h2>
            <p>
              Constavita provides AI-powered self-reflection tools, educational indices, and scenario modeling for
              personal development purposes. Our calculators produce <strong>educational indices only</strong> —
              they are not financial, medical, legal, psychological, or therapeutic advice.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">3. Eligibility</h2>
            <p>You must be at least 18 years old to use Constavita. By using the service, you represent that you meet this requirement.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">4. Account Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must provide accurate registration information.</li>
              <li>You may not share your account or allow others to use it.</li>
              <li>Notify us immediately of any unauthorized access at security@constavita.app.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">5. Prohibited Uses</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Attempt to reverse engineer, scrape, or extract data from the platform.</li>
              <li>Use the service to harm, harass, or defraud others.</li>
              <li>Attempt to circumvent authentication or security mechanisms.</li>
              <li>Use automated bots or scripts to access the API without authorization.</li>
              <li>Violate any applicable laws or regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">6. Payment & Subscriptions</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Subscription fees are billed in advance on a monthly or annual basis.</li>
              <li>You may cancel at any time; access continues until the end of the billing period.</li>
              <li>Refunds are available within 7 days of your first payment — contact support@constavita.app.</li>
              <li>We reserve the right to change pricing with 30 days&apos; notice to existing subscribers.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">7. Intellectual Property</h2>
            <p>
              All platform content, code, design, and AI-generated text is owned by or licensed to Constavita.
              You retain ownership of the data you input. You grant us a limited license to process it
              solely to provide the service.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">8. Disclaimer of Warranties</h2>
            <p>
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTIES OF ANY KIND. WE DO NOT WARRANT THAT
              THE RESULTS OF OUR CALCULATORS WILL BE ACCURATE, COMPLETE, OR SUITABLE FOR ANY PARTICULAR PURPOSE.
              ALL INDICES ARE EDUCATIONAL AND ILLUSTRATIVE ONLY.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, LIMITUM WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES RESULTING FROM YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY
              TO YOU WILL NOT EXCEED THE AMOUNT YOU PAID IN THE LAST 12 MONTHS.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">10. Governing Law</h2>
            <p>These terms are governed by applicable law. Disputes will be resolved through binding arbitration, waiving class action claims.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">11. Contact</h2>
            <p>Questions about these terms? Contact us at <a href="mailto:legal@constavita.app" className="text-soft-gold underline">legal@constavita.app</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
