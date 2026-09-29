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
    title: 'Government Relations and the Partner Role',
    description: 'Introduction to firm management, client commitments, and the limits of this simulation.',
  },
  {
    id: 'lo-m1-financials',
    phase: 'month1',
    title: 'Firm Financials',
    description: 'Tour of billed revenue, expenses, profit, and available cash.',
  },
  {
    id: 'lo-m1-team-roles',
    phase: 'month1',
    title: 'Team Capacity and Commitments',
    description: 'Introduction to pooled Lobbyist and Attorney capacity, support staff, fatigue, and recurring payroll.',
  },
  {
    id: 'lo-m1-cash-mgmt',
    phase: 'month1',
    title: 'Cash Management',
    description: 'Introduction to receivables, collections, and the difference between profit and cash.',
  },

  // Month 2 — "Client Management & Decision-Making"
  {
    id: 'lo-m2-client-types',
    phase: 'month2',
    title: 'Client Types and Fee Exposure',
    description: 'Compare client fees and shared issue exposure; organization type alone does not diversify risk.',
  },
  {
    id: 'lo-m2-satisfaction',
    phase: 'month2',
    title: 'Client Satisfaction',
    description: 'Review how coverage and satisfaction affect modeled renewal odds and the reputation summary.',
  },
  {
    id: 'lo-m2-decisions',
    phase: 'month2',
    title: 'Decision-Making Under Pressure',
    description: 'Tour of fictional inbox choices, current effect previews, and recorded outcomes.',
  },
  {
    id: 'lo-m2-tradeoffs',
    phase: 'month2',
    title: 'Managing Trade-Offs',
    description: 'Compare personal intervention, delegation, cash costs, and continuing workload.',
  },

  // Month 3 — "Strategic Thinking & Resource Allocation"
  {
    id: 'lo-m3-trends',
    phase: 'month3',
    title: 'Trend Analysis',
    description: 'Review changing financial measures alongside current warnings and historical outcomes.',
  },
  {
    id: 'lo-m3-staffing',
    phase: 'month3',
    title: 'Resource Allocation',
    description: 'Review effective coverage and loaded payroll when considering growth or hiring.',
  },
  {
    id: 'lo-m3-reputation',
    phase: 'month3',
    title: 'Reputation Summary',
    description: 'Read the satisfaction and efficacy summary; it does not change acquisition or recruitment.',
  },
  {
    id: 'lo-m3-strategy',
    phase: 'month3',
    title: 'Strategic Thinking',
    description: 'Introduction to recurring commitments and their consequences over several months.',
  },
];

export const getObjectivesForPhase = (phase: TutorialPhase): LearningObjective[] =>
  learningObjectives.filter((obj) => obj.phase === phase);
