export type BlogPost = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  author: string;
  authorSlug: string;
  publishedAt: string; // ISO date
  updatedAt?: string;
  readingTime: number; // minutes
  category: string;
  tags: string[];
  keywords: string[];
  relatedCalculator?: { label: string; href: string };
  content: string; // HTML string
};

export const BLOG_POSTS: BlogPost[] = [
  // ─── Post 1 ──────────────────────────────────────────────────────────────────
  {
    slug: "how-to-calculate-burnout-risk",
    title: "How to Calculate Your Burnout Risk Before It's Too Late (2025 Guide)",
    metaTitle: "Burnout Risk Calculator: How to Measure Your Burnout Score in 2025",
    metaDescription:
      "Learn how to calculate your burnout risk score using evidence-based metrics — workload, sleep, autonomy, and more. Spot the signs before burnout takes hold.",
    excerpt:
      "Most people don't realise they are burning out until they already have. A burnout risk score gives you a measurable warning before the crash arrives.",
    author: "Constavita Editorial",
    authorSlug: "constavita-editorial",
    publishedAt: "2025-05-01",
    readingTime: 9,
    category: "Wellbeing",
    tags: ["burnout", "work-life balance", "mental health", "stress"],
    keywords: [
      "burnout risk calculator",
      "how to calculate burnout risk",
      "burnout score",
      "am I burning out",
      "burnout prevention",
      "workplace burnout assessment",
      "burnout risk factors",
    ],
    relatedCalculator: { label: "Calculate Your Burnout Risk Index", href: "/calculators/burnout-risk" },
    content: `
<h2>Why Most Burnout Conversations Start Too Late</h2>
<p>By the time someone identifies their burnout, they are typically already deep inside it. The World Health Organisation recognised burnout as an occupational phenomenon in 2019, defining it as a syndrome arising from chronic workplace stress that has not been successfully managed. Its three hallmarks: exhaustion, growing detachment from work, and reduced professional efficacy.</p>
<p>What the definition misses is the <em>gradient</em>. Burnout does not arrive overnight. It accumulates across months of sub-threshold stress, compromised sleep, eroding autonomy, and disconnection from purpose — none of which feel individually alarming. This is precisely why a quantitative burnout risk score is so valuable. It turns a vague sense of dread into a number you can act on.</p>

<h2>What a Burnout Risk Score Actually Measures</h2>
<p>A rigorous burnout risk assessment is not a mood quiz. It draws on validated occupational health research to evaluate nine distinct dimensions:</p>
<ul>
  <li><strong>Workload intensity</strong> — weekly hours worked relative to recovery capacity</li>
  <li><strong>Recovery quality</strong> — vacation frequency and true disconnection from work</li>
  <li><strong>Sleep adequacy</strong> — duration and consistency of restorative sleep</li>
  <li><strong>Exercise frequency</strong> — physical activity as a stress-regulation mechanism</li>
  <li><strong>Perceived stress level</strong> — subjective sense of overwhelm across all domains</li>
  <li><strong>Autonomy and control</strong> — degree of influence over workload and schedule</li>
  <li><strong>Purpose alignment</strong> — how meaningful the work feels relative to personal values</li>
  <li><strong>Social support</strong> — quality of collegial and personal relationships as a buffer</li>
  <li><strong>Work-life boundary strength</strong> — ability to cognitively disengage outside work hours</li>
</ul>
<p>Each dimension is scored and weighted, producing a composite <strong>Burnout Resilience Index</strong> from 0 to 100. Counterintuitively, higher scores mean greater resilience — you are scoring your protective factors, not your risk factors. A score below 50 flags serious concern; above 75 indicates a genuinely sustainable rhythm.</p>

<h2>The Warning Signs Most People Rationalise Away</h2>
<p>Before reaching for the calculator, consider whether any of these are true of the last 90 days:</p>
<ul>
  <li>You feel exhausted on Monday morning even after a full weekend</li>
  <li>Tasks that previously took an hour now take three</li>
  <li>You feel a growing cynicism toward colleagues, clients, or the organisation</li>
  <li>You are increasingly irritable at home over small things</li>
  <li>You have difficulty remembering why you chose this career</li>
  <li>You fantasise about quitting frequently but feel trapped</li>
  <li>Physical complaints — headaches, back pain, frequent illness — have increased</li>
</ul>
<p>If three or more of these apply, your burnout risk is already elevated. A score below 55 on the Burnout Resilience Index correlates strongly with these patterns.</p>

<h2>The Recovery Deficit: Why Sleep Alone Is Not Enough</h2>
<p>A common misconception is that a week's holiday or a few good nights of sleep can clear burnout. Recovery science tells a different story. Research published in the <em>Journal of Occupational Health Psychology</em> demonstrates that recovery from chronic burnout follows a logarithmic curve — initial improvement is rapid, but full restoration of cognitive and emotional capacity can take 12–18 months of sustained low stress.</p>
<p>This is why prevention, not recovery, is the correct frame. A burnout risk calculator gives you the early warning to act before the deficit compounds.</p>
<p>The four pillars of sustainable recovery capacity are:</p>
<ol>
  <li><strong>Sleep quality</strong> (7–9 hours with consistent timing)</li>
  <li><strong>Psychological detachment</strong> from work outside hours</li>
  <li><strong>Mastery activities</strong> — engaging in tasks you find absorbing outside work</li>
  <li><strong>Control experiences</strong> — choosing how to spend discretionary time</li>
</ol>
<p>Interestingly, the <em>type</em> of leisure matters more than the amount. Passive consumption (scrolling, watching television) provides minimal recovery benefit compared to active, chosen engagement.</p>

<h2>How to Interpret Your Burnout Risk Score</h2>
<p>Once you have your composite index, the subscores matter equally:</p>
<ul>
  <li><strong>Workload Balance below 40</strong> — hours are structurally unsustainable. This requires renegotiation, delegation, or role redesign, not coping strategies.</li>
  <li><strong>Sleep Health below 50</strong> — compromised sleep is both a cause and a consequence of burnout. Sleep hygiene improvements are the highest-leverage intervention.</li>
  <li><strong>Autonomy and Purpose below 45</strong> — this is the most dangerous combination. People endure extreme workloads when they feel their work matters and they control how it happens. Remove both, and the psychological contract breaks quickly.</li>
  <li><strong>Recovery Quality below 40</strong> — insufficient detachment between work cycles. Annual leave is not a substitute for weekly recovery.</li>
</ul>

<h2>A Stoic Perspective on Sustainable Work</h2>
<p>Marcus Aurelius, Roman Emperor and the most powerful person alive during his time, wrote extensively about sustainability in the <em>Meditations</em>. His prescription was not to work less — he governed an empire under constant military threat — but to work with a clear separation between what he controlled and what he did not.</p>
<blockquote>
  <p>"Nowhere can man find a quieter or more untroubled retreat than in his own soul." — Marcus Aurelius</p>
</blockquote>
<p>The Stoic insight on burnout is precise: suffering arises not from the volume of work but from the <em>quality of attention</em> you bring to it, and from attachment to outcomes outside your control. When you conflate your identity with your output, every setback becomes an existential threat. This is the psychological substrate of burnout.</p>
<p>Measuring your burnout risk is itself a Stoic act — the Stoics called it <em>prosoche</em>, self-attention. You cannot govern what you do not observe.</p>

<h2>Three Immediate Actions Based on Your Score</h2>
<h3>If your score is below 45 (High Risk)</h3>
<p>This is not a time for incremental adjustments. Identify the single largest depletion source and address it directly. Typically this is workload volume or psychological detachment. If your organisation does not permit workload reduction, a serious reassessment of fit is warranted.</p>

<h3>If your score is 45–65 (Moderate Risk)</h3>
<p>You are in the most common zone — functional but depleting. The instinct here is to push through and catch up on rest "later." Research shows this strategy reliably converts moderate risk into high risk within 6–12 months. The priority is establishing recovery rituals that are structurally protected, not dependent on willpower.</p>

<h3>If your score is 65–80 (Low Risk)</h3>
<p>You have good foundations. The goal is to identify which subscores are pulling the composite down and address them proactively. Run the assessment quarterly. Burnout risk is dynamic — a promotion, a relationship change, or a market crisis can shift your score dramatically within a quarter.</p>

<h2>The Value of Tracking Change Over Time</h2>
<p>A single burnout risk score is useful. A 12-month trend is invaluable. Month-over-month score tracking reveals which life changes had actual impact on your resilience, separating genuine improvement from favourable circumstances. This is the difference between understanding your burnout risk and managing it.</p>
<p>Constavita's burnout risk calculator saves your score history, so you can observe how life changes — a new job, a move, a relationship change — register in your resilience index over time.</p>
    `,
  },

  // ─── Post 2 ──────────────────────────────────────────────────────────────────
  {
    slug: "stoic-framework-for-better-decisions",
    title: "The Stoic Framework for Making Decisions You Won't Regret",
    metaTitle: "Stoic Decision Making: A Framework to Eliminate Regret (2025)",
    metaDescription:
      "Ancient Stoic philosophers developed a powerful decision framework that modern psychology confirms still works. Here is how to apply it to avoid regret in major life choices.",
    excerpt:
      "The Stoics solved decision regret 2,000 years ago. Modern decision science confirms their method. Here is how to apply both to the choices that matter.",
    author: "Constavita Editorial",
    authorSlug: "constavita-editorial",
    publishedAt: "2025-05-08",
    readingTime: 10,
    category: "Decision Intelligence",
    tags: ["stoicism", "decision making", "regret minimization", "philosophy"],
    keywords: [
      "stoic decision making",
      "how to make decisions without regret",
      "decision regret minimizer",
      "stoicism and decision making",
      "regret minimization framework",
      "how to make better decisions",
      "decision quality index",
    ],
    relatedCalculator: { label: "Evaluate Your Decision Quality", href: "/calculators/decision-regret" },
    content: `
<h2>Why We Regret Decisions We Thought We Made Well</h2>
<p>Regret is one of the most psychologically costly human experiences. Research by decision scientist Daniel Kahneman and Nobel laureate Vernon Smith shows that regret from actions taken (errors of commission) is typically more intense than regret from inaction — but <em>both</em> generate lasting harm to wellbeing, confidence, and future decision quality.</p>
<p>The paradox is that most decisions we regret felt reasonable at the time. We had reasons. We thought them through. And yet, reviewing them later, we can identify exactly where the process broke down — where we were emotionally reactive, where we failed to consider alternatives, where we chose comfort over clarity.</p>
<p>The Stoics saw this problem clearly and built a systematic remedy for it.</p>

<h2>The Core Stoic Decision Insight: Dichotomy of Control</h2>
<p>Epictetus, a freed slave who became the most influential Stoic teacher of his age, identified the foundational principle of Stoic decision making in his <em>Enchiridion</em>:</p>
<blockquote>
  <p>"Some things are in our control and others not. Things in our control are opinion, pursuit, desire, aversion, and, in a word, whatever are our own actions. Things not in our control are body, reputation, command, and, in one word, whatever are not our own actions."</p>
</blockquote>
<p>The immediate practical application: before making any significant decision, explicitly list what you control and what you do not. Most decision anxiety is generated by confusing the two — we agonise over outcomes (uncontrollable) rather than choices (controllable).</p>
<p>This single habit eliminates a class of regret: the regret born from holding yourself responsible for outcomes that were never within your power to guarantee.</p>

<h2>Premeditatio Malorum: The Stoic Pre-mortem</h2>
<p>The Stoic practice of <em>premeditatio malorum</em> — the premeditation of adversity — is the ancient precursor to the modern "pre-mortem" popularised by psychologist Gary Klein. The method:</p>
<ol>
  <li>Assume the decision produces the worst possible outcome</li>
  <li>Work backwards: exactly how did that happen?</li>
  <li>Identify the failure modes that were within your control</li>
  <li>Design safeguards or exit conditions before proceeding</li>
</ol>
<p>Seneca's version was blunter: "What is quite unlooked for is more crushing in its effect, and unexpectedness adds to the weight of a disaster." The goal is not pessimism — it is <em>prepared calm</em>. A decision made with clear awareness of how it can fail is structurally more robust than one made in optimistic ignorance.</p>

<h2>The Seven Dimensions of Decision Quality</h2>
<p>Modern decision science and Stoic philosophy converge on the following factors that predict whether a decision will generate regret:</p>

<h3>1. Decision Clarity</h3>
<p>Can you articulate in one sentence exactly what decision you are making and what success looks like? Vague decisions produce vague outcomes and clean-slate regret — you cannot even evaluate whether you chose well because you never defined what well means.</p>

<h3>2. Alternatives Considered</h3>
<p>The Stoics practised <em>ekpyrosis</em> — imaginative expansion of possibility. Before committing, how many genuine alternatives have you evaluated? Research shows that most people explore fewer than two alternatives before deciding on major life choices. The mere act of identifying three or more options measurably improves outcome quality.</p>

<h3>3. Emotional Neutrality</h3>
<p>The Stoics called emotionally distorted reasoning <em>pathe</em> — passions that cloud judgment. The test is not whether you feel anything (that would be inhuman) but whether the feeling is driving the decision or informing it. Fear of loss, social pressure, sunk-cost attachment, and status anxiety are the most common distorters.</p>

<h3>4. Values Alignment</h3>
<p>Marcus Aurelius repeatedly tested decisions against his hierarchy of values. A decision that advances material comfort but conflicts with core values will produce regret almost certainly, regardless of how well it "works." Before choosing, rank your operative values explicitly and test the decision against each.</p>

<h3>5. Information Adequacy</h3>
<p>How much do you know about the key facts, probabilities, and trade-offs? The Stoic virtue of <em>phronesis</em> — practical wisdom — demands epistemic honesty. Distinguishing what you know from what you assume from what you are ignorant of is one of the most decision-protective habits available.</p>

<h3>6. Reversibility</h3>
<p>Jeff Bezos famously categorised decisions as Type 1 (irreversible, high stakes) or Type 2 (reversible, lower stakes). The Stoics had a version: apply greater deliberation to consequential, irreversible choices and greater flexibility to recoverable ones. Treating every decision with equal gravity is itself an error.</p>

<h3>7. Future Regret Anticipation</h3>
<p>The "10-10-10" heuristic (how will you feel about this in 10 minutes, 10 months, 10 years?) has Stoic roots. Seneca recommended writing a letter from your future self to evaluate current choices. Bezos' version: "When I'm 80, will I regret having tried this?" The temporal expansion almost always clarifies.</p>

<h2>How to Score Your Decision Before You Make It</h2>
<p>Rather than relying on intuition about decision quality, you can score each of the seven dimensions above on a 1–10 scale and compute a composite Decision Quality Index. Research from the field of structured analytic techniques suggests that this process alone — simply making the dimensions explicit and rating them — improves decision quality by 20–30% compared to unstructured deliberation.</p>
<p>Low subscores reveal exactly where additional work is needed before committing. A score below 6 on emotional neutrality, for instance, suggests the decision should be revisited after 48–72 hours of disengagement.</p>

<h2>The Stoic Rule on Urgency</h2>
<p>One of the most reliable sources of decision regret is artificial urgency. "This offer expires Friday." "Everyone else is already committed." "If you don't decide now, the window closes."</p>
<p>Epictetus was characteristically direct: "Never say about anything, I have lost it; but, I have returned it." The Stoic insight is that urgency imposed by external parties is almost always either false or irrelevant to decision quality. Genuine urgency — a medical emergency, an immediate safety threat — is rare. Most "urgent" decisions can and should survive 48 hours of deliberate reflection.</p>
<p>If a decision cannot be made well under time pressure, and the deadline cannot be extended, that is itself a crucial piece of information about the decision.</p>

<h2>Decision Regret vs. Outcome Regret</h2>
<p>The Stoic framework provides a critical distinction that modern decision science has formalized: the difference between regretting a decision and regretting an outcome.</p>
<p>A good decision process can produce a bad outcome — the Stoics called this <em>reserve clause</em> thinking. You act toward your intended goal "fate permitting." If an unforeseeable event derails the outcome, the decision was not wrong. Outcome regret in this case is philosophically unjustified and psychologically destructive.</p>
<p>Conversely, a bad decision process can produce a good outcome through luck. Celebrating this as skill is the foundation of future regret.</p>
<p>The target is process quality, not outcome certainty.</p>

<h2>Building a Personal Decision Audit Habit</h2>
<p>Marcus Aurelius conducted nightly self-examinations, reviewing each day's decisions against his values and principles. Seneca wrote reflective letters that served the same function. Modern research on metacognition — thinking about thinking — confirms this practice structurally improves decision quality over time.</p>
<p>The practical recommendation: after any significant decision, record the seven dimensions above and your scores. When the outcome becomes clear (often weeks or months later), revisit the record. The feedback loop between process quality and outcome quality is the fastest path to becoming a reliably better decision-maker.</p>
    `,
  },

  // ─── Post 3 ──────────────────────────────────────────────────────────────────
  {
    slug: "financial-peace-score-vs-net-worth",
    title: "Financial Peace Score: The Metric That Matters More Than Net Worth",
    metaTitle: "Financial Peace Score vs. Net Worth: What Actually Predicts Financial Wellbeing",
    metaDescription:
      "Net worth tells you what you have. Your Financial Peace Score tells you how you feel about it — and predicts long-term financial wellbeing better than any balance sheet.",
    excerpt:
      "Net worth is a snapshot. Financial peace is a state of being. The difference between the two explains why high earners still lie awake at night.",
    author: "Constavita Editorial",
    authorSlug: "constavita-editorial",
    publishedAt: "2025-05-15",
    readingTime: 9,
    category: "Financial Wellness",
    tags: ["financial peace", "money stress", "financial health", "personal finance"],
    keywords: [
      "financial peace score",
      "financial wellness calculator",
      "money stress test",
      "financial anxiety",
      "financial health score",
      "how to measure financial wellbeing",
      "financial peace index",
    ],
    relatedCalculator: { label: "Calculate Your Financial Peace Score", href: "/calculators/financial-peace" },
    content: `
<h2>Why High Earners Still Feel Financially Anxious</h2>
<p>One of the most consistent findings in financial psychology is that income, beyond a threshold sufficient to meet basic needs and security, correlates surprisingly weakly with financial wellbeing. The American Psychological Association's annual "Stress in America" survey consistently places money as the leading source of stress — not for the unemployed or the indebted, but across all income brackets.</p>
<p>The explanation lies in a measurement problem. The financial metrics our culture emphasises — net worth, annual income, savings balance — are balance-sheet metrics. They tell you what you have. They say nothing about your relationship with money, your capacity to absorb financial shocks, or your sense of security and sufficiency.</p>
<p>Financial peace is not an amount. It is a state of being that exists — or doesn't — independent of the number in your account.</p>

<h2>What Net Worth Cannot Tell You</h2>
<p>Consider two people with identical net worth of $250,000:</p>
<ul>
  <li><strong>Person A</strong>: income $120,000, expenses $115,000, no emergency fund, $180,000 in investments (locked in a pension), $12,000 in credit card debt at 22% APR, financial stress score of 9/10.</li>
  <li><strong>Person B</strong>: income $65,000, expenses $45,000, 6-month emergency fund in cash, no consumer debt, modest investment portfolio, financial stress score of 2/10.</li>
</ul>
<p>Person A earns nearly twice as much but lives on the edge of financial panic. Person B earns far less but sleeps soundly. Their net worth is the same. Their financial peace is worlds apart.</p>
<p>This is the limitation of net worth as a wellbeing metric. It is a static snapshot of a moment that says nothing about resilience, sustainability, or psychological comfort.</p>

<h2>The Six Dimensions of Financial Peace</h2>
<p>A Financial Peace Score synthesises six evidence-based dimensions into a single 0–100 index:</p>

<h3>1. Expense Ratio</h3>
<p>What fraction of your income goes to fixed expenses? Financial peace research consistently shows that the "50/30/20" rule (50% needs, 30% wants, 20% savings) produces better wellbeing outcomes than income maximisation alone. When expenses consume over 90% of income, financial anxiety is nearly universal regardless of absolute income level.</p>

<h3>2. Emergency Fund Adequacy</h3>
<p>The Federal Reserve's annual "Report on the Economic Well-Being of US Households" finds that inability to cover a $400 emergency is one of the strongest predictors of financial stress — more predictive than income itself. Three months of expenses produces a meaningful stress reduction; six months represents genuine psychological security for most people.</p>
<p>The emergency fund is not just a financial buffer. It is a psychological buffer. Its existence changes how you experience risk in all other areas of life.</p>

<h3>3. Debt Health</h3>
<p>A debt-to-income ratio above 36% (consumer debt payments relative to monthly income) is the threshold at which financial stress typically becomes chronic. Consumer debt — particularly revolving high-interest debt — is both a financial drain and a psychological one: it constrains choice, generates shame, and activates the threat response in ways that impair decision-making in all life domains.</p>

<h3>4. Savings Rate</h3>
<p>The savings rate is a more dynamic and behaviorally informative metric than net worth. A person saving 20% of a modest income is building financial peace faster than someone with a higher income and a 3% savings rate. The savings rate tells you about direction and momentum — the trajectory of the situation, not just its current state.</p>

<h3>5. Financial Stress Level</h3>
<p>Subjective financial stress is a legitimate clinical measure. Research in the <em>Journal of Financial Therapy</em> demonstrates that perceived financial stress predicts health outcomes, relationship satisfaction, and cognitive performance more accurately than objective financial metrics. Including it in a composite score acknowledges that financial peace is ultimately a psychological state.</p>

<h3>6. Investment Diversification</h3>
<p>Financial fragility — having all exposure in one asset, one income stream, or one geography — generates anxiety even when the single asset is performing well. Diversification is not just about return optimisation; it is about reducing the <em>variance</em> in your financial situation, and variance reduction is directly calming.</p>

<h2>The Hedonic Treadmill Problem</h2>
<p>One of the most important findings in happiness economics is the hedonic treadmill effect: people adapt rapidly to income and wealth increases and return to baseline satisfaction levels within one to two years. This explains why the persistent pursuit of net worth as the primary financial goal systematically fails to produce lasting peace.</p>
<p>What resists adaptation, according to research by Tim Kasser and Richard Ryan, are autonomy, security, and sufficiency — the psychological qualities that a Financial Peace Score attempts to capture. These dimensions do not erode after a financial improvement; they produce durable change.</p>

<h2>Stoic Finance: Enough as a Target</h2>
<p>The Stoic concept of <em>autarkeia</em> — self-sufficiency — offers a powerful reframe for financial goals. Epictetus, who owned nothing beyond a simple lamp (which was stolen), argued that wealth beyond sufficiency is a source of anxiety rather than security, because it multiplies the things you stand to lose.</p>
<blockquote>
  <p>"Wealth consists not in having great possessions, but in having few wants." — Epictetus</p>
</blockquote>
<p>This is not an argument for poverty. It is an argument for calibrating your financial target to your actual values rather than social comparison. For many people, financial peace is achievable at a modest income level if the expense-to-income ratio, the emergency fund, and the absence of consumer debt are in place. The pursuit of a larger number — beyond the sufficiency threshold — can actively undermine the peace it is supposed to produce.</p>

<h2>How to Improve Your Financial Peace Score</h2>
<p>The highest-leverage interventions, ranked by their typical impact on the composite score:</p>
<ol>
  <li><strong>Build a 3-month emergency fund first</strong> — before investing, before extra debt repayment. The psychological return on this single action typically exceeds any financial return.</li>
  <li><strong>Reduce the expense ratio below 80%</strong> — this requires either increasing income or reducing fixed costs. Neither is painless, but both produce immediate score improvement and psychological relief.</li>
  <li><strong>Eliminate high-interest consumer debt</strong> — debt at rates above 15% APR is consuming future optionality at a rate that compounds against financial peace rapidly.</li>
  <li><strong>Automate savings</strong> — savings that require willpower are savings that are not made. Automated transfers remove the decision from the cognitive load equation.</li>
  <li><strong>Practise financial sufficiency review quarterly</strong> — explicitly asking "what would be enough?" and comparing the answer to your current trajectory prevents the hedonic treadmill from pulling you off course.</li>
</ol>

<h2>Tracking Financial Peace Over Time</h2>
<p>The value of a Financial Peace Score is not in the single measurement — it is in the trend. Month-over-month tracking reveals which changes had real impact. An income increase that does not improve the expense ratio produces no peace benefit. A debt elimination that extends the emergency fund runway does. The score makes these dynamics visible.</p>
<p>Quarterly reassessment is the recommended cadence — frequent enough to observe change, infrequent enough that meaningful shifts can accumulate between measurements.</p>
    `,
  },

  // ─── Post 4 ──────────────────────────────────────────────────────────────────
  {
    slug: "how-to-measure-work-life-balance",
    title: "How to Actually Measure Work-Life Balance (Most People Are Doing It Wrong)",
    metaTitle: "How to Measure Work-Life Balance: The Data-Driven Method That Works",
    metaDescription:
      "Gut feelings about work-life balance are unreliable. Here is the data-driven method — measuring hours, autonomy, purpose, and recovery — that actually predicts wellbeing.",
    excerpt:
      "\"I should work less\" is not a strategy. Measuring exactly where your hours go, and what returns each category produces, is.",
    author: "Constavita Editorial",
    authorSlug: "constavita-editorial",
    publishedAt: "2025-05-22",
    readingTime: 8,
    category: "Time & Productivity",
    tags: ["work-life balance", "time management", "productivity", "wellbeing"],
    keywords: [
      "how to measure work life balance",
      "work life balance calculator",
      "time allocation score",
      "measure work life balance",
      "time value optimizer",
      "work life balance assessment",
      "weekly time budget",
    ],
    relatedCalculator: { label: "Optimise Your Time Allocation Score", href: "/calculators/time-value" },
    content: `
<h2>The Problem With "Better Work-Life Balance" as a Goal</h2>
<p>Ask any overworked professional what they want to change, and "better work-life balance" is almost always near the top of the list. It is one of the most commonly cited goals in employee satisfaction surveys, therapy sessions, and New Year's resolutions. It is also one of the least actioned.</p>
<p>The reason is definitional. "Better work-life balance" is not a goal — it is a category of goals, as vague as "be healthier." Without measurement, it has no traction. You cannot pursue something you cannot define, and you cannot achieve something you cannot measure.</p>
<p>The first act of a genuine work-life balance improvement is to quantify the current state.</p>

<h2>The Time Budget: Your Most Honest Financial Statement</h2>
<p>Seneca's most urgent essay, <em>On the Shortness of Life</em>, opens with an observation that resonates more forcefully today than it did in the first century AD:</p>
<blockquote>
  <p>"It is not that we have so little time, but that we waste so much of it." — Seneca</p>
</blockquote>
<p>Every adult has the same time budget: 168 hours per week. Sleep, work, growth, connection, leisure, and all the unaccounted margins must fit within that number. Making the allocation explicit — writing it out with actual numbers — is the single most clarifying exercise in time management.</p>
<p>A typical professional with an average of 7 hours of sleep has 119 waking hours per week. Most working adults working 50+ hours per week with commuting discover that less than 30% of their waking hours are genuinely self-directed. That number, rendered precisely, tends to produce immediate motivation to act.</p>

<h2>What Work-Life Balance Actually Predicts</h2>
<p>Work-life balance is not primarily a scheduling concept — it is a <em>wellbeing predictor</em>. The research on this is consistent across decades and populations:</p>
<ul>
  <li>A meta-analysis of 85 studies published in the <em>Journal of Vocational Behavior</em> found that work-life conflict was a stronger predictor of burnout, health complaints, and job dissatisfaction than workload alone.</li>
  <li>Stanford research by John Pencavel found that productivity per hour drops sharply after 50 hours of work per week and effectively reaches zero beyond 55 hours — making overwork a self-defeating strategy even by pure output metrics.</li>
  <li>Harvard Business School research found that managers could not distinguish performance between employees working 80 hours per week and those faking it — suggesting the productivity narrative around extreme hours is largely mythological.</li>
</ul>
<p>What this means practically: work-life balance is not a lifestyle preference. It is a performance variable. The question is not whether to pursue it, but how to measure it well enough to act on it.</p>

<h2>The Seven Dimensions of Time Alignment</h2>
<p>A quantitative time alignment score — a more precise frame than "work-life balance" — measures how well your actual time allocation matches an evidence-based wellbeing optimum across seven dimensions:</p>

<h3>1. Sleep Adequacy</h3>
<p>For 97% of adults, optimal cognitive and physical function requires 7–9 hours of sleep per night. Every hour below 7 increases cortisol, impairs prefrontal function (the seat of decision-making and emotional regulation), and reduces the productivity of subsequent work hours. This is the first dimension of time alignment because it is the foundation of all others.</p>

<h3>2. Work-Life Ratio</h3>
<p>There is no universally correct number of work hours. What matters is the ratio of work hours to recovery hours in any given week, and whether the ratio is sustainable across months and years. Research points to 40–50 hours per week as the sustainable high-performance range for most knowledge workers. Beyond 50, error rates increase and cognitive output decreases.</p>

<h3>3. Personal Growth Investment</h3>
<p>Time spent on learning, skill development, and reflection is one of the strongest predictors of long-term career satisfaction and life meaning. The standard of 5 hours of deliberate learning per week — popularised by Michael Simmons as the "5-hour rule" and practiced by virtually every documented high-performer across history — is the benchmark.</p>

<h3>4. Social Connection Quality</h3>
<p>The Harvard Study of Adult Development — the longest running study of adult life ever conducted — found that the quality of social relationships was the single strongest predictor of late-life happiness and health. Not wealth, not fame, not professional achievement. Connection. Time budget analysis frequently reveals that high-achievers systematically underfund this dimension.</p>

<h3>5. Leisure and Recovery</h3>
<p>Not all leisure is equally restorative. Passive leisure — scrolling, watching television — produces minimal recovery benefit. Active leisure — a sport, a creative hobby, time in nature — produces the psychological detachment that allows the nervous system to genuinely recover. The distinction matters enormously when assessing whether your "leisure time" is actually restoring you.</p>

<h3>6. Purposeful Activity Percentage</h3>
<p>What fraction of your waking hours feel intentional rather than reactive? This metric captures the difference between <em>spending</em> time and <em>living</em> it. Reactive days — entirely driven by notifications, meetings, requests, and urgencies — generate a particular type of exhaustion that is qualitatively different from productive busyness. Research on autonomy confirms that perceived control over time is an independent wellbeing variable, separate from how the time is actually used.</p>

<h3>7. Time Autonomy</h3>
<p>The degree of control you have over how you spend your daily hours is a primary determinant of life satisfaction, separate from income. A person earning £40,000 with high time autonomy typically reports greater life satisfaction than a person earning £120,000 with low autonomy — a finding that undermines the conventional career progression narrative.</p>

<h2>The Unaccounted Hours Problem</h2>
<p>One of the most confronting exercises a time audit produces is the quantification of unaccounted hours — time that is neither sleeping, working, growing, connecting, nor truly resting. For most people, this category is substantial: 15–25 hours per week absorbed by commuting, passive media consumption, decision fatigue, and cognitive overhead.</p>
<p>These hours are not "free time." They are a reservoir of latent potential that is currently being consumed without producing either output or recovery. Identifying and deliberately redirecting even 5 of these hours per week typically produces substantial life quality improvement.</p>

<h2>How to Use Your Time Alignment Score</h2>
<p>Once you have measured your current allocation and computed a composite score, the subscores reveal exactly where to act:</p>
<ul>
  <li><strong>If sleep is below 50</strong>: this is the priority. No other optimisation produces meaningful return while sleep is compromised.</li>
  <li><strong>If work ratio is below 45</strong>: the hours are structurally unsustainable. Coping strategies are not the solution; structural renegotiation is.</li>
  <li><strong>If growth is below 40</strong>: you are consuming career capital faster than you are building it. This produces a slow erosion of future options that compounds over years.</li>
  <li><strong>If connection is below 45</strong>: this is the hardest dimension to acknowledge as important in high-performance cultures, and the most consequential to neglect over the long term.</li>
</ul>

<h2>Tracking Change: The Monthly Check-In</h2>
<p>A work-life balance measurement is a point-in-time assessment. Its value multiplies when tracked across months. Life changes — a new role, a relocation, a relationship change — register in time allocation in ways that become visible only through longitudinal measurement.</p>
<p>The recommended cadence is monthly. This is frequent enough to observe the impact of deliberate changes, and infrequent enough that meaningful shifts in allocation can accumulate between check-ins. The goal is not a perfect score but a positive trend — consistent, observable movement toward a life that feels deliberate rather than accidental.</p>
<p>As Marcus Aurelius noted: the quality of life is determined not by what happens to you but by the quality of attention you bring to it. A time alignment score gives your attention something precise to act on.</p>
    `,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
