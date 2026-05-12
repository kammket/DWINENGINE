import OpenAI from "openai";

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

const SYSTEM_PROMPT = `You are Logos — the AI reflection engine of Limitum, a Stoic decision intelligence platform.

Your role is to provide calm, wise, analytical reflections that help users understand their decision patterns and life sustainability metrics. You are inspired by Marcus Aurelius, Epictetus, Seneca, and the Stoic tradition, grounded in behavioral economics, cognitive psychology, decision theory, financial reasoning, and systems thinking.

The platform exists to help users:
- understand their personal limits
- measure sustainability of current patterns
- reduce chaos and cognitive overload
- improve decision quality
- visualize tradeoffs clearly
- preserve peace of mind
- gain emotional clarity
- simulate future outcomes

IMPORTANT RULES:
- You NEVER provide medical, psychological, financial, or legal advice.
- You NEVER make deterministic predictions about the future ("you will" → always "this suggests" or "patterns indicate").
- You NEVER use fear, urgency, or manipulative language.
- You NEVER diagnose conditions or disorders.
- You ALWAYS recommend professional consultation for complex personal matters.
- You speak with warmth, wisdom, and rational clarity.
- You frame challenges as growth opportunities, not threats. A low score means a foundation to build, not a verdict.
- You reference Stoic principles naturally but not pedantically.
- You keep responses concise and actionable (3–4 short paragraphs max).
- You always end with a practical, compassionate suggestion or Stoic reflection.

Tone: calm, intelligent, supportive, rational, humanistic, hopeful — never alarming, never judgmental.

Disclaimer: Always preface reflective insights with: "This reflection is provided for educational self-awareness purposes and does not constitute advice of any kind."`;

export async function generateReflection(
  context: {
    scores: Record<string, number>;
    calculatorType?: string;
    userQuestion?: string;
    historicalTrend?: string;
  }
): Promise<string> {
  const contextSummary = `
Current metrics:
${Object.entries(context.scores)
  .map(([k, v]) => `- ${k}: ${v}/100`)
  .join("\n")}

${context.calculatorType ? `Calculator: ${context.calculatorType}` : ""}
${context.userQuestion ? `User inquiry: ${context.userQuestion}` : ""}
${context.historicalTrend ? `Historical context: ${context.historicalTrend}` : ""}
  `.trim();

  const completion = await getOpenAI().chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Please provide a Stoic-inspired reflection based on these life sustainability metrics:\n\n${contextSummary}`,
      },
    ],
    max_tokens: 600,
    temperature: 0.7,
  });

  return (
    completion.choices[0]?.message?.content ||
    "Reflection unavailable. Please try again shortly."
  );
}

export async function generateScenarioAnalysis(
  scenario: {
    type: string;
    title: string;
    currentScore: number;
    projectedScore: number;
    stressChange: number;
    financialChange: number;
  }
): Promise<string> {
  const prompt = `
Scenario: "${scenario.title}"
Current sustainability index: ${scenario.currentScore}/100
Projected index after change: ${scenario.projectedScore}/100
Estimated stress change: ${scenario.stressChange > 0 ? "+" : ""}${scenario.stressChange} points
Estimated financial pressure change: ${scenario.financialChange > 0 ? "+" : ""}${scenario.financialChange}%

Provide a brief Stoic-inspired analysis of this scenario's sustainability and key considerations.
  `.trim();

  const completion = await getOpenAI().chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return (
    completion.choices[0]?.message?.content ||
    "Analysis unavailable. Please try again shortly."
  );
}

export async function generateOnboardingInsight(profile: {
  stressPerception: number;
  financialComfort: number;
  timeFreedom: number;
  energyLevels: number;
}): Promise<string> {
  const prompt = `
New user starting their Limitum journey with these initial self-assessments (1–10 scale):
- Stress perception: ${profile.stressPerception}/10
- Financial comfort: ${profile.financialComfort}/10
- Time freedom: ${profile.timeFreedom}/10
- Energy levels: ${profile.energyLevels}/10

Provide a warm, calming welcome reflection that acknowledges their current state and gently frames the journey ahead.
  `.trim();

  const completion = await getOpenAI().chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    max_tokens: 400,
    temperature: 0.8,
  });

  return (
    completion.choices[0]?.message?.content ||
    "Welcome to Limitum. Your journey toward clarity begins here."
  );
}
