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
  };
}
