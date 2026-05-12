import { PublicHeader, Footer } from "@/components/layout/PublicLayout";

export const metadata = {
  title: "Privacy Policy — Limitum",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-ivory">
      <PublicHeader />
      <main className="pt-24 pb-20 max-w-3xl mx-auto px-4">
        <h1 className="font-serif text-3xl font-bold text-matte-black mb-2">Privacy Policy</h1>
        <p className="text-xs text-slate-calm mb-8">Last updated: January 2025</p>

        <div className="prose prose-stone max-w-none space-y-6 text-sm text-matte-black leading-relaxed">
          <section>
            <h2 className="font-serif text-xl font-bold mb-2">1. Who We Are</h2>
            <p>
              Limitum (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates the Limitum platform at limitum.app. We provide
              AI-powered self-reflection tools for educational purposes. References to &ldquo;you&rdquo; refer to
              users of our platform.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">2. Information We Collect</h2>
            <p>We collect the following categories of information:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Account information:</strong> Name, email address, hashed password.</li>
              <li><strong>Profile data:</strong> Age range, work type, goals, and lifestyle preferences you provide during onboarding.</li>
              <li><strong>Calculator inputs and scores:</strong> The values you enter into our calculators and the resulting educational index scores.</li>
              <li><strong>AI interaction data:</strong> Prompts sent to and responses received from our AI system Logos.</li>
              <li><strong>Payment information:</strong> Processed securely by Stripe. We do not store full card numbers.</li>
              <li><strong>Usage data:</strong> Pages visited, features used, session timing — collected for product improvement.</li>
              <li><strong>Technical data:</strong> IP address, browser type, device type.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provide, operate, and improve the Limitum platform.</li>
              <li>Generate personalized educational insights and AI reflections.</li>
              <li>Process subscription payments via Stripe.</li>
              <li>Send essential account and security notifications (no unsolicited marketing without consent).</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">4. Data Sharing</h2>
            <p>We do not sell your personal data. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>OpenAI:</strong> To generate AI reflections (your anonymized scores are sent, never your name/email).</li>
              <li><strong>Stripe:</strong> To process payments.</li>
              <li><strong>Infrastructure providers:</strong> Vercel (hosting), Neon/Supabase (database) — subject to their privacy policies.</li>
              <li><strong>Law enforcement:</strong> When required by valid legal process.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">5. Data Retention</h2>
            <p>
              We retain your account data for as long as your account is active. Calculator results and
              AI reflections are stored indefinitely to power your trend analytics, unless you delete them.
              You may request deletion of all your data at any time via Settings → Data & Privacy.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">6. Security</h2>
            <p>
              We use industry-standard security: passwords are hashed with bcrypt, sessions use HTTP-only
              cookies with JWT encryption, all data is transmitted over HTTPS, and databases are encrypted
              at rest. No system is 100% secure; please use a strong unique password.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">7. Cookies</h2>
            <p>
              We use a single essential session cookie (HTTP-only) for authentication. We do not use
              advertising or tracking cookies. No third-party analytics cookies are set.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">8. Your Rights</h2>
            <p>You have the right to access, correct, export, or delete your personal data. See our <a href="/legal/gdpr" className="text-soft-gold underline">GDPR Rights page</a> for full details.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-2">9. Contact</h2>
            <p>For privacy inquiries, contact us at <a href="mailto:privacy@limitum.app" className="text-soft-gold underline">privacy@limitum.app</a>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
