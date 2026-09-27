import type { TutorialPhase } from '@/data/learningObjectives';

export type TutorialStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export interface TutorialState {
  status: TutorialStatus;
  currentStepIndex: number;
  currentPhase: TutorialPhase;
  completedSteps: string[];
  showWelcomeModal: boolean;
  isPaused: boolean;
  simulationMonthAtStart: number;
  simulationYearAtStart: number;
}

export function createInitialTutorialState(): TutorialState {
  return {
    status: 'not_started',
    currentStepIndex: 0,
    currentPhase: 'welcome',
    completedSteps: [],
    showWelcomeModal: true,
    isPaused: false,
    simulationMonthAtStart: 1,
    simulationYearAtStart: 2026,
  };
}

export function isTutorialMonthAdvanceAlreadySatisfied(
  stepId: string,
  startMonth: number,
  startYear: number,
  currentMonth: number,
  currentYear: number,
): boolean {
  const monthsBeforeAdvance = stepId === 'm1-advance-month' ? 0
    : stepId === 'm2-advance-month' ? 1 : null;
  if (monthsBeforeAdvance === null) return false;
  const startPeriod = startYear * 12 + startMonth;
  const currentPeriod = currentYear * 12 + currentMonth;
  return currentPeriod > startPeriod + monthsBeforeAdvance;
}
