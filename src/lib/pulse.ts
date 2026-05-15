export const DIMENSIONS = [
  {
    key: "energy",
    label: "Energy",
    emoji: "⚡",
    color: "#F59E0B",
    description: "How vital and present do you feel right now?",
    lowLabel: "Depleted",
    highLabel: "Vibrant",
  },
  {
    key: "calm",
    label: "Calm",
    emoji: "🌊",
    color: "#0EA5E9",
    description: "How settled and at peace is your mind?",
    lowLabel: "Turbulent",
    highLabel: "Serene",
  },
  {
    key: "clarity",
    label: "Clarity",
    emoji: "🎯",
    color: "#8B5CF6",
    description: "How sharp and focused is your thinking?",
    lowLabel: "Foggy",
    highLabel: "Crystal clear",
  },
  {
    key: "gratitude",
    label: "Gratitude",
    emoji: "✨",
    color: "#10B981",
    description: "How much appreciation are you carrying today?",
    lowLabel: "Struggling",
    highLabel: "Abundant",
  },
  {
    key: "connection",
    label: "Connection",
    emoji: "💛",
    color: "#F43F5E",
    description: "How connected do you feel to others and yourself?",
    lowLabel: "Isolated",
    highLabel: "Deeply connected",
  },
] as const;

export type DimensionKey = (typeof DIMENSIONS)[number]["key"];

export interface DailyPulseRecord {
  id: string;
  userId: string;
  date: string;
  energy: number;
  calm: number;
  clarity: number;
  gratitude: number;
  connection: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PulseValues = Pick<DailyPulseRecord, "energy" | "calm" | "clarity" | "gratitude" | "connection">;

export const STOIC_CHALLENGES = [
  { day: 1, practice: "Take one minute of still silence before your first task. Let thoughts arise without following them.", quote: "The mind that is not disturbed by pain and passion is the wise one.", author: "Marcus Aurelius" },
  { day: 2, practice: "Write down three things that are entirely within your control today.", quote: "Wish the things which happen to be as they are, and you will have a tranquil flow of life.", author: "Epictetus" },
  { day: 3, practice: "Before reacting to anything frustrating today, pause and ask: 'Is this worth my peace?'", quote: "You have power over your mind, not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { day: 4, practice: "Express genuine appreciation to one person — in writing or in person — for something they often go unthanked for.", quote: "Dwell on the beauty of life. Watch the stars, and see yourself running with them.", author: "Marcus Aurelius" },
  { day: 5, practice: "Schedule one block of uninterrupted time for deep work today. Guard it fiercely.", quote: "Waste no more time arguing what a good man should be. Be one.", author: "Marcus Aurelius" },
  { day: 6, practice: "Perform one small act of service today without any expectation of recognition.", quote: "That which is not good for the bee-hive cannot be good for the bee.", author: "Marcus Aurelius" },
  { day: 7, practice: "Eat one meal in silence today. Taste it fully. Let that be enough.", quote: "He who is not satisfied with a little, is satisfied with nothing.", author: "Epicurus" },
  { day: 8, practice: "Identify the one task you are most avoiding today. Do it first.", quote: "If it is not right, do not do it; if it is not true, do not say it.", author: "Marcus Aurelius" },
  { day: 9, practice: "At midday, stop and take three deep breaths. Simply notice where you are.", quote: "Nowhere can man find a quieter retreat than in his own soul.", author: "Marcus Aurelius" },
  { day: 10, practice: "Spend 15 minutes in nature — walking, sitting, or simply observing without agenda.", quote: "The object of life is not to be on the side of the majority, but to escape the ranks of the insane.", author: "Marcus Aurelius" },
  { day: 11, practice: "When faced with criticism today, search for the grain of truth in it before responding.", quote: "A person's worth is measured by the worth of what they value.", author: "Marcus Aurelius" },
  { day: 12, practice: "Before bed tonight, recall three moments from today that you are grateful to have experienced.", quote: "Do not indulge in expectations of what is not yet present.", author: "Marcus Aurelius" },
  { day: 13, practice: "Practice voluntary discomfort: skip one comfort habit today — coffee, snack, or scroll.", quote: "It is not the man who has too little, but the man who craves more, that is poor.", author: "Seneca" },
  { day: 14, practice: "Respond to one difficult message or conversation with uncommon patience and care.", quote: "The greatest remedy for anger is delay.", author: "Seneca" },
  { day: 15, practice: "Reflect on one past difficulty in your life and find the way it made you stronger.", quote: "Every new beginning comes from some other beginning's end.", author: "Seneca" },
  { day: 16, practice: "Limit your news and social media consumption to 20 minutes total today.", quote: "Most powerful is he who has himself in his own power.", author: "Seneca" },
  { day: 17, practice: "Spend five minutes visualising your best self one year from now. What does that person do daily?", quote: "Choose not to be harmed — and you won't feel harmed. Don't feel harmed — and you haven't been.", author: "Marcus Aurelius" },
  { day: 18, practice: "Listen without interrupting in every conversation you have today.", quote: "We have two ears and one mouth so that we can listen twice as much as we speak.", author: "Epictetus" },
  { day: 19, practice: "Identify one area in your life where you are assigning blame outward. Own your response instead.", quote: "He is a wise man who does not grieve for the things which he has not, but rejoices for those which he has.", author: "Epictetus" },
  { day: 20, practice: "Do one thing today purely for the joy of doing it — no productivity attached.", quote: "No man is free who is not master of himself.", author: "Epictetus" },
  { day: 21, practice: "Before asking for something today, ask what you can give first.", quote: "Make the best use of what is in your power, and take the rest as it happens.", author: "Epictetus" },
  { day: 22, practice: "Speak with full honesty today — without embellishment, softening, or performance.", quote: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
  { day: 23, practice: "Write a letter to your future self, one year ahead. What will matter then that you are neglecting now?", quote: "Omnia aliena sunt, tempus tantum nostrum est. — Everything is foreign to us; time alone is ours.", author: "Seneca" },
  { day: 24, practice: "Complete one task today to a higher standard than strictly required.", quote: "Dum differtur vita transcurrit. — While we delay, life passes.", author: "Seneca" },
  { day: 25, practice: "Notice and consciously release one complaint you catch yourself making today.", quote: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
  { day: 26, practice: "Move your body for 30 minutes today without distraction — no podcast, no phone.", quote: "Take care of your body. It is the only place you have to live.", author: "Seneca" },
  { day: 27, practice: "Forgive yourself for one mistake you are still carrying unnecessarily.", quote: "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.", author: "Marcus Aurelius" },
  { day: 28, practice: "Spend one hour with someone you care about — fully present, no screens, no agenda.", quote: "The best revenge is to be unlike him who performed the injury.", author: "Marcus Aurelius" },
  { day: 29, practice: "Review your top three priorities for this week. Are your daily actions reflecting them?", quote: "It is not that we have a short time to live, but that we waste a good deal of it.", author: "Seneca" },
  { day: 30, practice: "Identify one small habit you could drop this week that is not serving your values.", quote: "No person has the power to have everything they want, but it is in their power not to want what they don't have.", author: "Seneca" },
  { day: 31, practice: "Plan one specific act of generosity — large or small — and carry it out before day's end.", quote: "Not he who has little, but he who wishes for more, is poor.", author: "Seneca" },
] as const;

export function getTodayChallenge(): (typeof STOIC_CHALLENGES)[number] {
  const day = new Date().getDate() as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31;
  return STOIC_CHALLENGES.find((c) => c.day === day) ?? STOIC_CHALLENGES[0];
}

export function getDateKey(date = new Date()): string {
  return date.toISOString().split("T")[0];
}

export function computeCompositeScore(pulse: PulseValues): number {
  return Math.round(((pulse.energy + pulse.calm + pulse.clarity + pulse.gratitude + pulse.connection) / 50) * 100);
}

export function computeDailyStreak(pulses: { date: string }[]): number {
  if (!pulses.length) return 0;
  const sorted = [...pulses].sort((a, b) => b.date.localeCompare(a.date));
  const today = getDateKey();
  const yesterday = getDateKey(new Date(Date.now() - 86400000));

  const mostRecent = sorted[0].date;
  if (mostRecent !== today && mostRecent !== yesterday) return 0;

  let streak = 0;
  let expected = mostRecent;
  for (const p of sorted) {
    if (p.date === expected) {
      streak++;
      const d = new Date(expected + "T12:00:00Z");
      d.setUTCDate(d.getUTCDate() - 1);
      expected = getDateKey(d);
    } else {
      break;
    }
  }
  return streak;
}

export function generateInsight(pulse: PulseValues, streak: number): string {
  const score = computeCompositeScore(pulse);
  const dims = [
    { key: "energy", value: pulse.energy },
    { key: "calm", value: pulse.calm },
    { key: "clarity", value: pulse.clarity },
    { key: "gratitude", value: pulse.gratitude },
    { key: "connection", value: pulse.connection },
  ];
  const sorted = [...dims].sort((a, b) => a.value - b.value);
  const lowest = sorted[0];

  if (score >= 80) {
    const messages = [
      "You are flourishing. Marcus Aurelius called this the life of a rational being — aligned, present, purposeful. Carry this forward with gratitude.",
      "This is what thriving looks like — every dimension in harmony. Take a moment to anchor this feeling. Remember it on harder days.",
      "You are in harmony with yourself today. Seneca would call this wealth in its truest form. Protect it by staying close to what created it.",
    ];
    return messages[streak % 3];
  }

  if (score >= 60) {
    const insightMap: Record<string, string> = {
      energy: "Your energy is asking for attention. Even Marcus Aurelius wrote at dawn before the palace stirred — small, intentional rituals restore vital force over time.",
      calm: "Your inner weather is slightly unsettled today. Epictetus reminds us: not events themselves, but our judgements about events, disturb us. One conscious breath at a time.",
      clarity: "Your clarity is asking for space. A cluttered mind cannot see clearly. Try one 10-minute period of complete, undivided focus on a single task.",
      gratitude: "Gratitude is the dimension whispering for nourishment today. Three very specific things — however small — will shift the lens noticeably.",
      connection: "Connection is asking for attention. Even a brief, genuinely present exchange with one other person can move this dimension significantly.",
    };
    return insightMap[lowest.key] ?? "You are doing well overall. Keep cultivating the dimensions that energise you most.";
  }

  const lowMessages: Record<string, string> = {
    energy: "Low energy is a signal, not a verdict. Your body is communicating. Rest is productive. Recovery is the foundation of all sustainable performance.",
    calm: "A turbulent mind needs a calm anchor. Breathe. Reduce the inputs. Seneca wrote: 'Recede into yourself as much as you can.' Even five quiet minutes counts.",
    clarity: "Fog is temporary. When clarity is low, narrow everything down to one thing. Just one. The rest can wait — and will.",
    gratitude: "Even in difficulty, something remains. Epictetus, enslaved, found philosophy. Find one small thing — warmth, breath, safety — and let it be enough for now.",
    connection: "Isolation amplifies every difficult thing. Reach out — a message, a short call, a shared moment — connection is the oldest antidote to rumination.",
  };
  return lowMessages[lowest.key] ?? "You showed up and checked in today. That act of self-awareness is itself a Stoic practice. Every day has its own character.";
}
