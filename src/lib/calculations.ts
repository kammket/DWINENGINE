/**
 * Core calculation engines for Limitum platform.
 * All calculations are transparent, explainable, and non-deterministic.
 * They produce educational indices — not diagnoses or predictions.
 */

import {
  BurnoutRiskInputs,
  FinancialPeaceInputs,
  RelationshipSustainabilityInputs,
  DecisionRegretInputs,
  TimeValueInputs,
} from "@/types";
import type { CalculatorResult, SimulationResults, ProjectionData } from "@/types";
import { clamp as clampFn, weightedAverage as wAvg } from "./utils";

// ─────────────────────────────────────────────────────
// FINANCIAL PEACE CALCULATOR
// Measures perceived financial sustainability (educational index)
// ─────────────────────────────────────────────────────

export function calculateFinancialPeace(
  inputs: FinancialPeaceInputs
): Omit<CalculatorResult, "id" | "userId" | "createdAt"> {
  const {
    monthlyIncome,
    monthlyExpenses,
    emergencyFundMonths,
    debtToIncomeRatio,
    savingsRate,
    financialStressLevel,
    investmentDiversification,
  } = inputs;

  // Expense ratio (lower is better)
  const expenseRatio = clampFn(monthlyExpenses / Math.max(monthlyIncome, 1), 0, 2);
  const expenseScore = clampFn((1 - expenseRatio) * 100, 0, 100);

  // Emergency fund score (6 months = 100)
  const emergencyScore = clampFn((emergencyFundMonths / 6) * 100, 0, 100);

  // Debt-to-income (< 20% = healthy, per educational standards)
  const debtScore = clampFn((1 - debtToIncomeRatio / 50) * 100, 0, 100);

  // Savings rate (20%+ is considered healthy in personal finance education)
  const savingsScore = clampFn((savingsRate / 20) * 100, 0, 100);

  // Stress perception (inverted — lower stress = higher score)
  const stressScore = clampFn((1 - (financialStressLevel - 1) / 9) * 100, 0, 100);

  // Investment diversification
  const investScore = clampFn(investmentDiversification * 10, 0, 100);

  const scores = [expenseScore, emergencyScore, debtScore, savingsScore, stressScore, investScore];
  const weights = [0.25, 0.20, 0.20, 0.15, 0.10, 0.10];

  const finalScore = Math.round(wAvg(scores, weights));

  const interpretation =
    finalScore >= 80
      ? "Your financial patterns suggest strong sustainability and peace. Current allocation models indicate healthy buffer zones."
      : finalScore >= 65
      ? "Your financial balance shows reasonable stability. Some optimization in savings or debt management may enhance long-term peace."
      : finalScore >= 50
      ? "Current financial patterns may generate moderate pressure over time. Building emergency reserves and reducing expense ratios can meaningfully shift this index."
      : finalScore >= 35
      ? "Current patterns indicate elevated financial pressure. Attention to expense-to-income ratio and emergency preparedness may reduce long-term strain."
      : "Current financial patterns suggest significant sustainability challenges. Small, consistent rebalancing steps can shift this trajectory meaningfully over time.";

  const suggestions: string[] = [];
  if (expenseScore < 60) suggestions.push("Review your expense-to-income ratio — even a 5% reduction can meaningfully improve your sustainability index.");
  if (emergencyScore < 60) suggestions.push("Building toward 3–6 months of emergency reserves creates a measurable buffer against life disruptions.");
  if (debtScore < 60) suggestions.push("Reducing debt-to-income below 20% is associated with significantly lower financial stress in behavioral research.");
  if (savingsScore < 60) suggestions.push("Even a 1% increase in savings rate compounds into meaningful financial peace over a 5-year horizon.");
  if (stressScore < 60) suggestions.push("Financial stress perception often improves with clarity — consider tracking your cash flow weekly.");
  if (suggestions.length === 0) suggestions.push("Maintain your current financial discipline — consistency is the foundation of lasting peace.");

  return {
    type: "FINANCIAL_PEACE",
    inputs: inputs as Record<string, number>,
    outputs: {
      expenseScore,
      emergencyScore,
      debtScore,
      savingsScore,
      stressScore,
      investScore,
    },
    score: finalScore,
    interpretation,
    suggestions,
  };
}

// ─────────────────────────────────────────────────────
// BURNOUT RISK CALCULATOR
// Measures sustainable work-life patterns
// ─────────────────────────────────────────────────────

export function calculateBurnoutRisk(
  inputs: BurnoutRiskInputs
): Omit<CalculatorResult, "id" | "userId" | "createdAt"> {
  const {
    workHoursPerWeek,
    vacationDaysPerYear,
    sleepHoursPerNight,
    exerciseDaysPerWeek,
    stressLevel,
    autonomyLevel,
    purposeAlignment,
    socialSupport,
    worklifeBalance,
  } = inputs;

  // Work intensity (< 40h = optimal for recovery)
  const workScore = clampFn((1 - clampFn((workHoursPerWeek - 40) / 30, 0, 1)) * 100, 0, 100);

  // Vacation recovery
  const vacationScore = clampFn((vacationDaysPerYear / 20) * 100, 0, 100);

  // Sleep quality
  const sleepScore = clampFn(((sleepHoursPerNight - 5) / 3) * 100, 0, 100);

  // Exercise
  const exerciseScore = clampFn((exerciseDaysPerWeek / 4) * 100, 0, 100);

  // Stress (inverted)
  const stressScore = clampFn((1 - (stressLevel - 1) / 9) * 100, 0, 100);

  // Autonomy
  const autonomyScore = clampFn(autonomyLevel * 10, 0, 100);

  // Purpose
  const purposeScore = clampFn(purposeAlignment * 10, 0, 100);

  // Social support
  const socialScore = clampFn(socialSupport * 10, 0, 100);

  // Worklife balance perception
  const balanceScore = clampFn(worklifeBalance * 10, 0, 100);

  const scores = [workScore, vacationScore, sleepScore, exerciseScore, stressScore, autonomyScore, purposeScore, socialScore, balanceScore];
  const weights = [0.20, 0.10, 0.15, 0.10, 0.15, 0.10, 0.10, 0.05, 0.05];

  // Burnout risk is inverted — low resiliency score = high risk
  const resiliencyScore = Math.round(wAvg(scores, weights));
  const burnoutRiskScore = 100 - resiliencyScore;

  const interpretation =
    burnoutRiskScore <= 20
      ? "Your work-life patterns suggest strong resiliency and recovery capacity. Current indicators show healthy sustainability."
      : burnoutRiskScore <= 40
      ? "Your patterns show moderate resiliency. Some recovery mechanisms may benefit from reinforcement."
      : burnoutRiskScore <= 60
      ? "Current patterns may create meaningful cumulative pressure over time. Rest, autonomy, and purpose alignment are the key levers here."
      : burnoutRiskScore <= 80
      ? "Current patterns indicate elevated strain. Sustainable adjustment — even incremental — can meaningfully shift the trajectory."
      : "Current patterns suggest high cumulative pressure. Even small, consistent reductions in intensity can begin to restore balance.";

  const suggestions: string[] = [];
  if (workScore < 60) suggestions.push("Work intensity above 50 hours/week is associated with significantly reduced recovery in longitudinal studies.");
  if (sleepScore < 60) suggestions.push("Sleep quality is the single highest-leverage recovery factor — protecting 7–8 hours compound across weeks.");
  if (exerciseScore < 60) suggestions.push("Even 2–3 days of moderate movement significantly moderates stress hormone patterns.");
  if (purposeScore < 60) suggestions.push("Clarifying your 'why' creates emotional buffer against high workloads.");
  if (autonomyScore < 60) suggestions.push("Increasing decision autonomy — even in small areas — meaningfully reduces strain perception.");
  if (suggestions.length === 0) suggestions.push("Your recovery patterns are strong. Protect them intentionally as external pressures evolve.");

  return {
    type: "BURNOUT_RISK",
    inputs: inputs as Record<string, number>,
    outputs: {
      // Keys matched to what the UI MetricBars display
      workloadScore: Math.round(workScore),
      recoveryScore: Math.round((vacationScore + exerciseScore) / 2),
      sleepScore: Math.round(sleepScore),
      autonomyScore: Math.round(autonomyScore),
      burnoutRiskScore: Math.round(burnoutRiskScore),
      resiliencyScore: Math.round(resiliencyScore),
    },
    score: resiliencyScore,
    interpretation,
    suggestions,
  };
}

// ─────────────────────────────────────────────────────
// RELATIONSHIP SUSTAINABILITY CALCULATOR
// ─────────────────────────────────────────────────────

export function calculateRelationshipSustainability(
  inputs: RelationshipSustainabilityInputs
): Omit<CalculatorResult, "id" | "userId" | "createdAt"> {
  // Accept both the @/types field names and the page's UX-oriented field names
  const i = inputs as Record<string, number>;
  const communicationQuality = i.communicationQuality ?? 5;
  const sharedValues         = i.sharedValues ?? 5;
  const emotionalValue       = i.emotionalIntimacy ?? i.emotionalSupport ?? 5;   // page sends emotionalIntimacy
  const conflictResolution   = i.conflictResolution ?? 5;
  const growthValue          = i.personalGrowthSupport ?? i.growthAlignment ?? 5; // page sends personalGrowthSupport
  const timeValue            = i.qualityTimeInvestment ?? i.timeTogetherQuality ?? 5; // page sends qualityTimeInvestment
  const trustLevel           = i.trustLevel ?? 5;
  const respectValue         = i.mutualRespect ?? i.independenceBalance ?? 5;     // page sends mutualRespect

  const scores = [
    communicationQuality * 10,
    sharedValues * 10,
    emotionalValue * 10,
    conflictResolution * 10,
    growthValue * 10,
    timeValue * 10,
    trustLevel * 10,
    respectValue * 10,
  ];
  const weights = [0.20, 0.15, 0.15, 0.15, 0.10, 0.10, 0.10, 0.05];

  const finalScore = Math.round(wAvg(scores, weights));

  const interpretation =
    finalScore >= 80
      ? "Current relationship patterns reflect high sustainability indicators. Communication, trust, and support foundations appear robust."
      : finalScore >= 65
      ? "Relationship dynamics show solid foundations with room for deepening connection and alignment on growth."
      : finalScore >= 50
      ? "Some sustainability dimensions may benefit from intentional attention. Communication and conflict resolution tend to be high-leverage areas."
      : finalScore >= 35
      ? "Current patterns suggest meaningful friction in sustainability indicators. Addressing trust and communication can shift the trajectory."
      : "Relationship patterns indicate high strain across multiple dimensions. External support — such as counseling — may provide valuable perspective.";

  const suggestions: string[] = [];
  if (communicationQuality < 6) suggestions.push("Communication quality is the highest-leverage factor in relationship sustainability research.");
  if (trustLevel < 6) suggestions.push("Trust restoration — even incrementally — creates disproportionate improvements across all other dimensions.");
  if (conflictResolution < 6) suggestions.push("Learning structured conflict resolution frameworks reduces the compounding damage of unresolved tensions.");
  if (growthValue < 6) suggestions.push("Regular conversations about long-term direction prevent silent divergence over time.");
  if (suggestions.length === 0) suggestions.push("Your relationship sustainability indicators are strong. Maintain intentional investment in the dimensions that matter most.");

  return {
    type: "RELATIONSHIP_SUSTAINABILITY",
    inputs: inputs as Record<string, number>,
    outputs: scores.reduce((acc, s, idx) => {
      // Keys matched to what the UI MetricBars display
      const keys = ["communicationScore", "valuesScore", "intimacyScore", "conflictScore", "growthScore", "timeScore", "trustScore", "respectScore"];
      return { ...acc, [keys[idx]]: Math.round(s) };
    }, {}),
    score: finalScore,
    interpretation,
    suggestions,
  };
}

// ─────────────────────────────────────────────────────
// DECISION REGRET CALCULATOR
// ─────────────────────────────────────────────────────

export function calculateDecisionRegret(
  inputs: DecisionRegretInputs
): Omit<CalculatorResult, "id" | "userId" | "createdAt"> {
  // Accept both the @/types field names and the page's UX-oriented field names
  const i = inputs as Record<string, number | string>;
  const decisionClarity  = (i.decisionClarity as number)  ?? 5;
  const valueAlignment   = (i.valueAlignment as number)   ?? 5;
  const reversibility    = (i.reversibility as number)    ?? 5;
  // Accept either naming convention for each remaining input
  const infoAdequacy  = (i.informationAdequacy as number) ?? (i.informationAvailability as number) ?? 5;
  const altOptions    = (i.alternativesConsidered as number) ?? (i.alternativeOptions as number) ?? 3;
  const regretConfidence = (i.futureRegretAnticipation as number) ?? (i.riskTolerance as number) ?? 5;
  // emotionalNeutrality (page: higher = calmer = better) vs emotionalInvolvement (legacy: lower = better)
  // Both map to the same direction: higher page value → higher emotionalScore
  const emotionalNeutrality  = i.emotionalNeutrality  as number | undefined;
  const emotionalInvolvement = i.emotionalInvolvement as number | undefined;

  const clarityScore       = clampFn(decisionClarity * 10, 0, 100);
  const valueScore         = clampFn(valueAlignment * 10, 0, 100);
  const riskScore          = clampFn(regretConfidence * 10, 0, 100);
  const infoScore          = clampFn(infoAdequacy * 10, 0, 100);
  const reversibilityScore = clampFn(reversibility * 10, 0, 100);
  const emotionalScore     = emotionalNeutrality !== undefined
    ? clampFn(emotionalNeutrality * 10, 0, 100)
    : clampFn((10 - (emotionalInvolvement ?? 5)) * 10, 0, 100);
  const alternativeScore   = clampFn((altOptions / 5) * 100, 0, 100);

  const scores = [clarityScore, valueScore, riskScore, infoScore, reversibilityScore, emotionalScore, alternativeScore];
  const weights = [0.25, 0.20, 0.10, 0.15, 0.15, 0.10, 0.05];

  const finalScore = Math.round(wAvg(scores, weights));

  const interpretation =
    finalScore >= 80
      ? "Decision quality indicators are high. Clarity, value alignment, and reversibility reduce regret probability significantly."
      : finalScore >= 65
      ? "Most decision quality indicators are solid. Addressing information completeness or reversibility planning may further reduce regret risk."
      : finalScore >= 50
      ? "Some decision quality gaps exist. Taking time to clarify values and gather information can meaningfully improve this index."
      : finalScore >= 35
      ? "Multiple decision quality dimensions show weakness. Slowing down and seeking additional perspectives may improve long-term satisfaction."
      : "Current decision conditions suggest elevated regret risk. If possible, defer the decision until clarity and information improve.";

  const suggestions: string[] = [];
  if (clarityScore < 60) suggestions.push("Articulating the decision in writing — especially the criteria — dramatically improves clarity.");
  if (valueScore < 60) suggestions.push("When decisions feel unclear, return to your core values as a decision compass.");
  if (infoScore < 60) suggestions.push("Gathering more information before committing reduces regret in reversible and irreversible decisions alike.");
  if (reversibilityScore < 60) suggestions.push("Design reversibility into your decision path where possible — test before committing fully.");
  if (suggestions.length === 0) suggestions.push("Your decision quality indicators are strong. Trust the process you've built.");

  return {
    type: "DECISION_REGRET",
    inputs: inputs as Record<string, number | string>,
    outputs: {
      // Keys matched to what the UI MetricBars display
      clarityScore:      Math.round(clarityScore),
      emotionScore:      Math.round(emotionalScore),   // page expects emotionScore
      alignmentScore:    Math.round(valueScore),        // page expects alignmentScore
      informationScore:  Math.round(infoScore),         // page expects informationScore
      reversibilityScore: Math.round(reversibilityScore),
      valueScore:        Math.round(valueScore),
      infoScore:         Math.round(infoScore),
    },
    score: finalScore,
    interpretation,
    suggestions,
  };
}

// ─────────────────────────────────────────────────────
// TIME VALUE CALCULATOR
// ─────────────────────────────────────────────────────

export function calculateTimeValue(
  inputs: TimeValueInputs
): Omit<CalculatorResult, "id" | "userId" | "createdAt"> {
  // Accept the page's hours-based model (primary) with fallback to legacy field names
  const i = inputs as Record<string, number>;
  const workHoursPerWeek              = i.workHoursPerWeek ?? 45;
  const sleepHoursPerNight            = i.sleepHoursPerNight ?? 7;
  const personalGrowthHoursPerWeek    = i.personalGrowthHoursPerWeek ?? (i.purposefulActivities ?? 3);
  const socialConnectionHoursPerWeek  = i.socialConnectionHoursPerWeek ?? 5;
  const leisureHoursPerWeek           = i.leisureHoursPerWeek ?? 8;
  const purposefulActivityPercent     = i.purposefulActivityPercent ?? (i.purposefulActivities ? i.purposefulActivities * 10 : 40);
  const timeAutonomy                  = i.timeAutonomy ?? 5;

  // Derived: total waking hours per week
  const totalWakingHoursPerWeek = 7 * (24 - sleepHoursPerNight);

  // Work balance — proportion of waking time NOT consumed by work (lower ratio = more balance)
  const workBalance = clampFn(
    (1 - workHoursPerWeek / Math.max(totalWakingHoursPerWeek, 1)) * 100,
    0, 100
  );

  // Recovery quality — optimal sleep: 7–8 hrs/night
  const recoveryScore = clampFn(((sleepHoursPerNight - 5) / 3) * 100, 0, 100);

  // Personal growth allocation (10+ hrs/week = excellent benchmark)
  const growthScore = clampFn((personalGrowthHoursPerWeek / 10) * 100, 0, 100);

  // Social connection (15+ hrs/week = excellent benchmark)
  const connectionScore = clampFn((socialConnectionHoursPerWeek / 15) * 100, 0, 100);

  // Purpose ratio — % of waking hours that feel intentional
  const purposeScore = clampFn(purposefulActivityPercent, 0, 100);

  // Leisure and recovery time (15+ hrs/week = healthy)
  const leisureScore = clampFn((leisureHoursPerWeek / 15) * 100, 0, 100);

  // Time autonomy — subjective control over daily schedule
  const autonomyScore = clampFn(timeAutonomy * 10, 0, 100);

  const scores  = [workBalance, recoveryScore, growthScore, connectionScore, purposeScore, leisureScore, autonomyScore];
  const weights = [0.20, 0.20, 0.15, 0.15, 0.15, 0.10, 0.05];

  const finalScore = Math.round(wAvg(scores, weights));

  const interpretation =
    finalScore >= 80
      ? "Your time allocation reflects strong purposefulness and autonomy. High intentionality in how time is used compounds meaningfully into life satisfaction over time."
      : finalScore >= 65
      ? "Your time patterns are generally healthy. Protecting recovery time and increasing purposeful activity ratios can deepen quality-of-life improvements."
      : finalScore >= 50
      ? "Time patterns show moderate autonomy and purpose alignment. Identifying where time 'leaks' and redirecting even 10% can create meaningful, lasting shifts."
      : finalScore >= 35
      ? "Current time patterns suggest limited autonomy or purpose alignment. Even small, deliberate reclamations of intentional time begin to shift the trajectory."
      : "Your time allocation indicates significant constraint and limited recovery. Addressing one primary time commitment can begin to restore balance gradually.";

  const suggestions: string[] = [];
  if (workBalance < 60)       suggestions.push("When work consumes a large share of waking hours, even one protected morning or earlier boundary each day begins to shift the balance.");
  if (recoveryScore < 60)     suggestions.push("Sleep quality amplifies the value of all other waking hours — it is the highest-ROI time investment available to you.");
  if (growthScore < 60)       suggestions.push("Scheduling 2–3 activities that feel intrinsically meaningful raises both time quality and long-term purpose alignment.");
  if (connectionScore < 60)   suggestions.push("Brief, high-quality social connection with people who energize you is a key moderator of sustained life satisfaction.");
  if (purposeScore < 60)      suggestions.push("Distinguishing reactive time from intentional time — even roughly — reveals high-leverage opportunities for reclamation.");
  if (suggestions.length === 0) suggestions.push("Your time use patterns are strong. Protect this intentionally as external demands evolve.");

  return {
    type: "TIME_VALUE",
    inputs: inputs as Record<string, number>,
    outputs: {
      workBalance:     Math.round(workBalance),
      recoveryScore:   Math.round(recoveryScore),
      growthScore:     Math.round(growthScore),
      connectionScore: Math.round(connectionScore),
      purposeScore:    Math.round(purposeScore),
      autonomyScore:   Math.round(autonomyScore),
    },
    score: finalScore,
    interpretation,
    suggestions,
  };
}

// ─────────────────────────────────────────────────────
// COMPREHENSIVE ASSESSMENT CALCULATOR
// Aggregates all core metrics into the main dashboard score
// ─────────────────────────────────────────────────────

export function calculateOverallAssessment(
  profile: {
    stressPerception: number;
    financialComfort: number;
    timeFreedom: number;
    relationshipSupport: number;
    energyLevels: number;
    cognitiveLoad: number;
  }
): {
  peaceScore: number;
  burnoutRisk: number;
  financialStab: number;
  emotionalRec: number;
  timeFreedom: number;
  cognitiveLoad: number;
  decisionStab: number;
  futureSustain: number;
  overallScore: number;
} {
  const {
    stressPerception,
    financialComfort,
    timeFreedom,
    relationshipSupport,
    energyLevels,
    cognitiveLoad,
  } = profile;

  // Convert 1–10 scales to 0–100
  const s = (v: number) => clampFn(((v - 1) / 9) * 100, 0, 100);

  const peaceScore = Math.round(
    wAvg([s(10 - stressPerception + 1), s(energyLevels), s(relationshipSupport)], [0.4, 0.3, 0.3])
  );
  const burnoutRisk = Math.round(100 - wAvg([s(energyLevels), s(10 - stressPerception + 1), s(timeFreedom)], [0.4, 0.35, 0.25]));
  const financialStab = Math.round(s(financialComfort));
  const emotionalRec = Math.round(wAvg([s(energyLevels), s(relationshipSupport)], [0.6, 0.4]));
  const timeFreedomScore = Math.round(s(timeFreedom));
  const cognitiveLoadScore = Math.round(100 - s(cognitiveLoad));
  const decisionStab = Math.round(wAvg([s(10 - stressPerception + 1), cognitiveLoadScore, s(energyLevels)], [0.4, 0.35, 0.25]));
  const futureSustain = Math.round(wAvg([peaceScore, financialStab, timeFreedomScore, decisionStab], [0.3, 0.3, 0.2, 0.2]));
  const overallScore = Math.round(wAvg([peaceScore, burnoutRisk > 50 ? 100 - burnoutRisk : 100 - burnoutRisk / 2, financialStab, emotionalRec, futureSustain], [0.25, 0.20, 0.20, 0.15, 0.20]));

  return {
    peaceScore,
    burnoutRisk,
    financialStab,
    emotionalRec,
    timeFreedom: timeFreedomScore,
    cognitiveLoad: cognitiveLoadScore,
    decisionStab,
    futureSustain,
    overallScore: clampFn(overallScore, 0, 100),
  };
}

// ─────────────────────────────────────────────────────
// SCENARIO SIMULATION ENGINE
// ─────────────────────────────────────────────────────

export function runScenarioSimulation(
  baselineScore: number,
  scenarioType: string,
  parameters: Record<string, number>
): { results: SimulationResults; projections: ProjectionData[] } {
  const adjustments: Record<string, Partial<SimulationResults>> = {
    FINANCIAL_IMPROVEMENT: {
      stressChange: -8,
      financialChange: +15,
      sustainabilityIndex: baselineScore + 12,
    },
    STRESS_REDUCTION: {
      stressChange: -(parameters.stressReduction ?? 15),
      financialChange: 0,
      sustainabilityIndex: baselineScore + (parameters.stressReduction ?? 15) * 0.6,
      recoveryCapacity: +(parameters.stressReduction ?? 15) * 0.5,
    },
    RELATIONSHIP_INVESTMENT: {
      stressChange: -5,
      financialChange: -(parameters.timeInvested ?? 5) * 0.5,
      sustainabilityIndex: baselineScore + (parameters.qualityTimeIncrease ?? 10) * 0.4,
    },
    WORK_LIFE_BALANCE: {
      stressChange: -(parameters.hoursReduced ?? 10) * 0.8,
      financialChange: -(parameters.hoursReduced ?? 10) * 1.5,
      sustainabilityIndex: baselineScore + (parameters.hoursReduced ?? 10) * 0.5,
      timeFreedomChange: +(parameters.hoursReduced ?? 10),
    },
    HEALTH_OPTIMIZATION: {
      stressChange: -(parameters.exerciseDaysPerWeek ?? 3) * 2,
      financialChange: -(parameters.monthlyHealthCost ?? 50),
      sustainabilityIndex: baselineScore + (parameters.exerciseDaysPerWeek ?? 3) * 3,
      recoveryCapacity: +(parameters.exerciseDaysPerWeek ?? 3) * 4,
    },
  };

  const adj = adjustments[scenarioType] ?? {};
  const results: SimulationResults = {
    currentScore: baselineScore,
    projectedScore: clampFn((adj.sustainabilityIndex ?? baselineScore), 0, 100),
    stressChange: adj.stressChange ?? 0,
    financialChange: adj.financialChange ?? 0,
    recoveryCapacity: adj.recoveryCapacity ?? 0,
    timeFreedomChange: adj.timeFreedomChange ?? 0,
    sustainabilityIndex: clampFn(adj.sustainabilityIndex ?? baselineScore, 0, 100),
  };

  // Generate 12-month projections
  const projections: ProjectionData[] = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const progression = i / 11;
    const stressDelta = (adj.stressChange ?? 0) * progression;
    const sustainDelta = (results.projectedScore - baselineScore) * progression;

    return {
      month,
      peaceScore: clampFn(baselineScore + sustainDelta * 0.6 - stressDelta * 0.3, 0, 100),
      burnoutRisk: clampFn(50 + stressDelta * 0.8, 0, 100),
      financialStab: clampFn(60 + (adj.financialChange ?? 0) * progression * 0.5, 0, 100),
      emotionalRec: clampFn(65 + sustainDelta * 0.4 - stressDelta * 0.2, 0, 100),
    };
  });

  return { results, projections };
}
