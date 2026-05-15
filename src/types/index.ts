// Global type definitions for Constavita platform

export type User = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: "USER" | "ADMIN";
  onboardingDone: boolean;
  subscription?: Subscription;
};

export type UserProfile = {
  ageRange?: string;
  workType?: string;
  stressPerception: number;
  financialComfort: number;
  timeFreedom: number;
  relationshipSupport: number;
  energyLevels: number;
  cognitiveLoad: number;
  majorResponsibilities: string[];
  goals: string[];
};

export type Assessment = {
  id: string;
  userId: string;
  peaceScore: number;
  burnoutRisk: number;
  financialStab: number;
  emotionalRec: number;
  timeFreedom: number;
  cognitiveLoad: number;
  decisionStab: number;
  futureSustain: number;
  overallScore: number;
  createdAt: string;
};

export type CalculatorType =
  | "FINANCIAL_PEACE"
  | "BURNOUT_RISK"
  | "RELATIONSHIP_SUSTAINABILITY"
  | "DECISION_REGRET"
  | "TIME_VALUE";

export type CalculatorResult = {
  id: string;
  type: CalculatorType;
  inputs: Record<string, number | string | boolean>;
  outputs: Record<string, number | string>;
  score: number;
  interpretation: string;
  suggestions: string[];
  createdAt: string;
};

export type AiReflection = {
  id: string;
  prompt: string;
  reflection: string;
  createdAt: string;
};

export type ScenarioSimulation = {
  id: string;
  scenarioType: string;
  title: string;
  parameters: Record<string, number | string>;
  results: SimulationResults;
  projections: ProjectionData[];
  createdAt: string;
};

export type SimulationResults = {
  currentScore: number;
  projectedScore: number;
  stressChange: number;
  financialChange: number;
  recoveryCapacity: number;
  timeFreedomChange: number;
  sustainabilityIndex: number;
};

export type ProjectionData = {
  month: number;
  peaceScore: number;
  burnoutRisk: number;
  financialStab: number;
  emotionalRec: number;
};

export type TrendData = {
  month: number;
  year: number;
  peaceScore: number;
  burnoutRisk: number;
  financialStab: number;
  emotionalRec: number;
  timeFreedom: number;
};

export type Subscription = {
  tier: "FREE" | "PREMIUM" | "ENTERPRISE";
  status: "ACTIVE" | "CANCELED" | "PAST_DUE" | "TRIALING" | "INCOMPLETE";
  currentPeriodEnd?: string;
};

export type Payment = {
  id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
  description?: string;
  createdAt: string;
};

// Calculator Inputs
export type FinancialPeaceInputs = {
  monthlyIncome: number;
  monthlyExpenses: number;
  emergencyFundMonths: number;
  debtToIncomeRatio: number;
  savingsRate: number;
  financialStressLevel: number;
  investmentDiversification: number;
};

export type BurnoutRiskInputs = {
  workHoursPerWeek: number;
  vacationDaysPerYear: number;
  sleepHoursPerNight: number;
  exerciseDaysPerWeek: number;
  stressLevel: number;
  autonomyLevel: number;
  purposeAlignment: number;
  socialSupport: number;
  worklifeBalance: number;
};

export type RelationshipSustainabilityInputs = {
  communicationQuality: number;
  sharedValues: number;
  emotionalSupport: number;
  conflictResolution: number;
  growthAlignment: number;
  timeTogetherQuality: number;
  trustLevel: number;
  independenceBalance: number;
};

export type DecisionRegretInputs = {
  decisionClarity: number;
  valueAlignment: number;
  riskTolerance: number;
  informationAvailability: number;
  timeHorizon: string;
  reversibility: number;
  emotionalInvolvement: number;
  alternativeOptions: number;
};

export type TimeValueInputs = {
  hourlyWage: number;
  workHoursPerWeek: number;
  commutHoursPerWeek: number;
  freeHoursPerDay: number;
  purposefulActivities: number;
  timeWastedPercent: number;
  sleepQuality: number;
};

// Score interpretation
export type ScoreLevel = "excellent" | "good" | "moderate" | "concerning" | "critical";

export function getScoreLevel(score: number): ScoreLevel {
  if (score >= 80) return "excellent";
  if (score >= 65) return "good";
  if (score >= 50) return "moderate";
  if (score >= 35) return "concerning";
  return "critical";
}

export function getScoreColor(score: number): string {
  const level = getScoreLevel(score);
  switch (level) {
    case "excellent": return "#22C55E";
    case "good": return "#84CC16";
    case "moderate": return "#F59E0B";
    case "concerning": return "#D97706"; // warm amber — informative, not alarming
    case "critical": return "#92400E";  // warm brown — serious but grounded, not panic-inducing
  }
}

export function getScoreLabel(score: number): string {
  const level = getScoreLevel(score);
  switch (level) {
    case "excellent": return "Flourishing";
    case "good": return "On Solid Ground";
    case "moderate": return "Room to Grow";
    case "concerning": return "Requires Attention";
    case "critical": return "Building Foundations"; // empowering, hopeful — never panic-inducing
  }
}

// API response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};
