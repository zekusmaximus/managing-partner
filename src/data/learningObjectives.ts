export type TutorialPhase = 'welcome' | 'month1' | 'month2' | 'month3' | 'completed';

export interface LearningObjective {
  id: string;
  phase: TutorialPhase;
  title: string;
  description: string;
}

export const learningObjectives: LearningObjective[] = [
  // Month 1 — "Getting Your Bearings"
  {
    id: 'lo-m1-gr-role',
    phase: 'month1',
    title: 'Understand Government Relations',
    description: 'Learn what a government relations firm does and its role in the political ecosystem.',
  },
  {
    id: 'lo-m1-financials',
    phase: 'month1',
    title: 'Read Firm Financials',
    description: 'Identify the key financial metrics that determine firm health: revenue, expenses, profit, and cash reserves.',
  },
  {
    id: 'lo-m1-team-roles',
    phase: 'month1',
    title: 'Know Your Team',
    description: 'Learn the three types of GR professionals — lobbyists, attorneys, and support staff — and their roles.',
  },
  {
    id: 'lo-m1-cash-mgmt',
    phase: 'month1',
    title: 'Cash Management',
    description: 'Understand accounts receivable and cash management in a professional services firm.',
  },

  // Month 2 — "Client Management & Decision-Making"
  {
    id: 'lo-m2-client-types',
    phase: 'month2',
    title: 'Client Diversification',
    description: 'Distinguish between client types (corporations, trade associations, non-profits) and understand revenue diversification.',
  },
  {
    id: 'lo-m2-satisfaction',
    phase: 'month2',
    title: 'Client Satisfaction',
    description: 'Learn how client satisfaction drives contract renewals and firm reputation.',
  },
  {
    id: 'lo-m2-decisions',
    phase: 'month2',
    title: 'Decision-Making Under Pressure',
    description: 'Practice decision-making with real-world GR scenarios where there are no perfect answers.',
  },
  {
    id: 'lo-m2-tradeoffs',
    phase: 'month2',
    title: 'Managing Trade-Offs',
    description: 'Understand the trade-offs inherent in managing partner decisions — short-term costs vs. long-term relationships.',
  },

  // Month 3 — "Strategic Thinking & Resource Allocation"
  {
    id: 'lo-m3-trends',
    phase: 'month3',
    title: 'Trend Analysis',
    description: 'Analyze financial trends to identify emerging problems or opportunities before they become crises.',
  },
  {
    id: 'lo-m3-staffing',
    phase: 'month3',
    title: 'Resource Allocation',
    description: 'Assess team capacity and determine optimal staffing levels for your client load.',
  },
  {
    id: 'lo-m3-reputation',
    phase: 'month3',
    title: 'Reputation Management',
    description: 'Understand how reputation is built and maintained in the government relations industry.',
  },
  {
    id: 'lo-m3-strategy',
    phase: 'month3',
    title: 'Strategic Thinking',
    description: 'Develop a strategic mindset for long-term firm management — thinking quarters and years ahead.',
  },
];

export const getObjectivesForPhase = (phase: TutorialPhase): LearningObjective[] =>
  learningObjectives.filter((obj) => obj.phase === phase);
