import { PublicHeader, Footer } from "@/components/layout/PublicLayout";

export const metadata = {
  title: "GDPR Rights — Constavita",
};

export default function GdprPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <PublicHeader />
      <main className="pt-24 pb-20 max-w-3xl mx-auto px-4">
        <h1 className="font-serif text-3xl font-bold text-matte-black mb-2">Your GDPR Rights</h1>
        <p className="text-xs text-slate-calm mb-8">Last updated: January 2025 · Applies to users in the European Economic Area (EEA), UK, and Switzerland</p>

        <div className="space-y-6 text-sm text-matte-black leading-relaxed">
          <section>
            <h2 className="font-serif text-xl font-bold mb-2">1. Data Controller</h2>
            <p>
              Constavita acts as the data controller for your personal data. For data-related inquiries,
              contact us at <a href="mailto:privacy@constavita.app" className="text-soft-gold underline">privacy@constavita.app</a>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">2. Legal Basis for Processing</h2>
            <p>We process your data under the following legal bases:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Contract performance:</strong> Processing necessary to provide the service you signed up for.</li>
              <li><strong>Legitimate interests:</strong> Analytics and security monitoring to improve and protect our platform.</li>
              <li><strong>Legal obligation:</strong> Where required by applicable law.</li>
              <li><strong>Consent:</strong> For marketing communications (which you can withdraw at any time).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">3. Your Rights Under GDPR</h2>
            <p>As an EEA/UK resident, you have the following rights:</p>

            <div className="space-y-4 mt-3">
              {[
                {
                  right: "Right of Access (Art. 15)",
                  description: "You can request a copy of all personal data we hold about you, including your account details, calculator history, and AI reflections.",
                  action: "Email privacy@constavita.app with subject: 'Data Access Request'",
                },
                {
                  right: "Right to Rectification (Art. 16)",
                  description: "You can correct inaccurate personal data. Most profile data can be updated directly in Settings.",
                  action: "Update in Settings or email privacy@constavita.app",
                },
                {
                  right: "Right to Erasure (Art. 17)",
                  description: "You can request deletion of all your personal data. You can do this via Settings → Data & Privacy → Delete Account.",
                  action: "Settings → Data & Privacy, or email privacy@constavita.app",
                },
                {
                  right: "Right to Restriction (Art. 18)",
                  description: "You can request that we restrict processing of your data in certain circumstances (e.g., while disputing accuracy).",
                  action: "Email privacy@constavita.app",
                },
                {
                  right: "Right to Data Portability (Art. 20)",
                  description: "You can request your personal data in a machine-readable format (JSON or CSV) to transfer to another service.",
                  action: "Email privacy@constavita.app with subject: 'Data Portability Request'",
                },
                {
                  right: "Right to Object (Art. 21)",
                  description: "You can object to processing based on legitimate interests at any time.",
                  action: "Email privacy@constavita.app",
                },
                {
                  right: "Right to Withdraw Consent",
                  description: "Where processing is based on consent (e.g., marketing), you can withdraw it at any time without affecting the lawfulness of prior processing.",
                  action: "Account settings or email privacy@constavita.app",
                },
              ].map((item) => (
                <div key={item.right} className="bg-white border border-stone-200 rounded-xl p-4">
                  <p className="font-semibold text-matte-black mb-1">{item.right}</p>
                  <p className="text-slate-calm mb-2">{item.description}</p>
                  <p className="text-xs font-medium text-soft-gold">How: {item.action}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">4. Data Transfers</h2>
            <p>
              Our infrastructure uses providers with US-based servers (Vercel, OpenAI). Where data is
              transferred outside the EEA, we rely on Standard Contractual Clauses (SCCs) as the legal
              transfer mechanism. OpenAI is subject to the EU-US Data Privacy Framework.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">5. Response Times</h2>
            <p>
              We will respond to all data subject requests within <strong>30 days</strong>.
              Complex requests may take up to 90 days; we will notify you if this is the case.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">6. Right to Lodge a Complaint</h2>
            <p>
              If you believe your rights have been violated, you have the right to lodge a complaint
              with your local data protection authority. For UK residents:{" "}
              <a href="https://ico.org.uk" className="text-soft-gold underline" target="_blank" rel="noopener noreferrer">ICO (ico.org.uk)</a>.
              For EEA residents, contact your national supervisory authority.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">7. Contact Our Data Protection Contact</h2>
            <p>
              Email: <a href="mailto:privacy@constavita.app" className="text-soft-gold underline">privacy@constavita.app</a><br />
              Subject line: &ldquo;GDPR Request — [Your Right]&rdquo;<br />
              We will verify your identity before processing your request.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
