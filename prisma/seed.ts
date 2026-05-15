/**
 * Constavita — Demo Seed Script
 *
 * Creates four demo accounts covering every subscription tier plus admin.
 * Each paid account gets a completed onboarding profile and a baseline assessment
 * so the dashboard renders real data immediately.
 *
 * Run:  npm run db:seed
 *
 * Credentials (all share password pattern):
 *   demo@constavita.com          Demo1234!   FREE
 *   premium@constavita.com       Demo1234!   PREMIUM
 *   enterprise@constavita.com    Demo1234!   ENTERPRISE
 *   admin@constavita.com         Admin1234!  ADMIN (FREE tier)
 */

import { PrismaClient, SubscriptionTier, CalculatorType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ── helpers ────────────────────────────────────────────────────────────────────

async function hash(pw: string) {
  return bcrypt.hash(pw, 12);
}

function periodEnd(months: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d;
}

// ── seed accounts ──────────────────────────────────────────────────────────────

const ACCOUNTS: Array<{
  name: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
  tier: SubscriptionTier;
  withAssessment: boolean;
}> = [
  {
    name: "Demo Free",
    email: "demo@constavita.com",
    password: "Demo1234!",
    role: "USER",
    tier: "FREE",
    withAssessment: false,
  },
  {
    name: "Demo Premium",
    email: "premium@constavita.com",
    password: "Demo1234!",
    role: "USER",
    tier: "PREMIUM",
    withAssessment: true,
  },
  {
    name: "Demo Enterprise",
    email: "enterprise@constavita.com",
    password: "Demo1234!",
    role: "USER",
    tier: "ENTERPRISE",
    withAssessment: true,
  },
  {
    name: "Admin",
    email: "admin@constavita.com",
    password: "Admin1234!",
    role: "ADMIN",
    tier: "FREE",
    withAssessment: false,
  },
];

async function seedAccount(account: (typeof ACCOUNTS)[number]) {
  const {
    name,
    email,
    password,
    role,
    tier,
    withAssessment,
  } = account;

  console.log(`  → ${email} (${tier})`);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`    already exists — skipping`);
    return;
  }

  const passwordHash = await hash(password);
  const now = new Date();

  // ── core user ──────────────────────────────────────────────────────────────
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      onboardingDone: withAssessment,
      subscription: {
        create: {
          tier,
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd:
            tier !== "FREE" ? periodEnd(tier === "ENTERPRISE" ? 12 : 1) : null,
        },
      },
    },
  });

  if (!withAssessment) return;

  // ── onboarding profile ─────────────────────────────────────────────────────
  await prisma.userProfile.create({
    data: {
      userId: user.id,
      ageRange: "25-34",
      workType: tier === "ENTERPRISE" ? "executive" : "entrepreneur",
      stressPerception: 4,
      financialComfort: tier === "ENTERPRISE" ? 8 : 6,
      timeFreedom: 5,
      relationshipSupport: 7,
      energyLevels: 6,
      cognitiveLoad: 5,
      majorResponsibilities: ["Mortgage / Rent", "Business obligations"],
      goals: ["Reduce financial stress", "Prevent burnout", "Gain clarity on my direction"],
    },
  });

  // ── baseline assessment ────────────────────────────────────────────────────
  const isPremium = tier === "ENTERPRISE";
  const peaceScore     = isPremium ? 74 : 62;
  const burnoutRisk    = isPremium ? 28 : 44;
  const financialStab  = isPremium ? 78 : 58;
  const emotionalRec   = isPremium ? 70 : 55;
  const timeFreedom2   = isPremium ? 65 : 50;
  const cognitiveLoad  = isPremium ? 35 : 55;
  const decisionStab   = isPremium ? 72 : 60;
  const futureSustain  = isPremium ? 76 : 63;
  const overallScore   = Math.round(
    (peaceScore + (100 - burnoutRisk) + financialStab + emotionalRec + timeFreedom2 + decisionStab + futureSustain) / 7
  );

  await prisma.assessment.create({
    data: {
      userId: user.id,
      peaceScore,
      burnoutRisk,
      financialStab,
      emotionalRec,
      timeFreedom: timeFreedom2,
      cognitiveLoad,
      decisionStab,
      futureSustain,
      overallScore,
      rawInputs: {
        stressPerception: 4,
        financialComfort: isPremium ? 8 : 6,
        timeFreedom: 5,
        relationshipSupport: 7,
        energyLevels: 6,
        cognitiveLoad: 5,
      },
    },
  });

  // ── trend history (last 6 months) ──────────────────────────────────────────
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today);
    d.setMonth(d.getMonth() - i);
    const delta = (5 - i) * (isPremium ? 2.5 : 1.8);
    await prisma.trendHistory.upsert({
      where: { userId_month_year: { userId: user.id, month: d.getMonth() + 1, year: d.getFullYear() } },
      update: {},
      create: {
        userId: user.id,
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        peaceScore: Math.min(100, peaceScore - 12 + delta),
        burnoutRisk: Math.max(0, burnoutRisk + 10 - delta * 0.8),
        financialStab: Math.min(100, financialStab - 10 + delta),
        emotionalRec: Math.min(100, emotionalRec - 8 + delta),
        timeFreedom: Math.min(100, timeFreedom2 - 6 + delta),
      },
    });
  }

  // ── calculator results ─────────────────────────────────────────────────────
  const calcData: Array<{ type: CalculatorType; score: number; interp: string }> = [
    { type: "FINANCIAL_PEACE",             score: financialStab, interp: "Moderate financial sustainability with room to build resilience." },
    { type: "BURNOUT_RISK",                score: 100 - burnoutRisk, interp: "Manageable burnout risk. Monitor energy patterns." },
    { type: "RELATIONSHIP_SUSTAINABILITY", score: 68,            interp: "Healthy relational foundation with active support network." },
    { type: "DECISION_REGRET",             score: decisionStab,  interp: "Good decision clarity — low regret tendency." },
    { type: "TIME_VALUE",                  score: timeFreedom2,  interp: "Moderate time freedom. Opportunity to recover discretionary hours." },
  ];

  for (const c of calcData) {
    await prisma.calculatorResult.create({
      data: {
        userId: user.id,
        type: c.type,
        score: c.score,
        interpretation: c.interp,
        suggestions: ["Track weekly patterns", "Review quarterly"],
        inputs:  { demo: true },
        outputs: { score: c.score },
      },
    });
  }

  // ── payment record for paid tiers ─────────────────────────────────────────
  if (tier !== "FREE") {
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: tier === "ENTERPRISE" ? 9900 : 1900,
        currency: "usd",
        status: "SUCCEEDED",
        description: `Seed — ${tier.toLowerCase()}_monthly`,
        metadata: { seeded: true },
      },
    });
  }
}

// ── main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding Constavita demo accounts…\n");
  for (const account of ACCOUNTS) {
    await seedAccount(account);
  }
  console.log("\n✅ Seed complete.\n");
  console.log("Demo credentials:");
  console.log("  demo@constavita.com          Demo1234!   FREE");
  console.log("  premium@constavita.com       Demo1234!   PREMIUM");
  console.log("  enterprise@constavita.com    Demo1234!   ENTERPRISE");
  console.log("  admin@constavita.com         Admin1234!  ADMIN");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
