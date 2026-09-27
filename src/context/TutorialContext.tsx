"use client";

import React, { createContext, useContext, useCallback } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { useSession } from '@/context/SessionContext';
import { tutorialSteps, type TutorialStep } from '@/data/tutorialSteps';
import { createInitialTutorialState, type TutorialState } from '@/lib/session/tutorialState';

// ─── Types ───────────────────────────────────────────────────────────

export type { TutorialState, TutorialStatus } from '@/lib/session/tutorialState';

interface TutorialContextType {
  tutorialState: TutorialState;
  startTutorial: () => void;
  skipTutorial: () => void;
  pauseTutorial: () => void;
  resumeTutorial: () => void;
  restartTutorial: () => void;
  nextStep: () => void;
  onMonthAdvanced: () => void;
  prevStep: () => void;
  completeStep: (stepId: string) => void;
  dismissWelcome: () => void;
  isStepCompleted: (stepId: string) => boolean;
  currentStep: TutorialStep | null;
  totalSteps: number;
  completionPercentage: number;
  isTutorialActive: boolean;
}

// ─── Context ─────────────────────────────────────────────────────────

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

function advanceStep(state: TutorialState): TutorialState {
  const currentStep = tutorialSteps[state.currentStepIndex];
  const completedSteps = currentStep && !state.completedSteps.includes(currentStep.id)
    ? [...state.completedSteps, currentStep.id] : state.completedSteps;
  const nextIndex = state.currentStepIndex + 1;
  if (nextIndex >= tutorialSteps.length) {
    return { ...state, status: 'completed', currentPhase: 'completed', completedSteps };
  }
  return {
    ...state,
    currentStepIndex: nextIndex,
    currentPhase: tutorialSteps[nextIndex].phase,
    completedSteps,
  };
}

// ─── Provider ────────────────────────────────────────────────────────

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const { tutorial: tutorialState, setTutorial: setTutorialState } = useSession();
  const { state: simState } = useSimulation();

  const currentStep =
    tutorialState.status === 'in_progress' && !tutorialState.isPaused
      ? tutorialSteps[tutorialState.currentStepIndex] ?? null
      : null;

  const isTutorialActive = tutorialState.status === 'in_progress' && !tutorialState.isPaused;

  const completionPercentage =
    tutorialSteps.length > 0
      ? Math.round((tutorialState.completedSteps.length / tutorialSteps.length) * 100)
      : 0;

  const startTutorial = useCallback(() => {
    setTutorialState({
      ...createInitialTutorialState(),
      status: 'in_progress',
      showWelcomeModal: false,
      simulationMonthAtStart: simState.month,
      simulationYearAtStart: simState.year,
    });
  }, [simState.month, simState.year, setTutorialState]);

  const skipTutorial = useCallback(() => {
    setTutorialState((prev) => ({
      ...prev,
      status: 'skipped',
      showWelcomeModal: false,
      isPaused: false,
    }));
  }, [setTutorialState]);

  const pauseTutorial = useCallback(() => {
    setTutorialState((prev) => ({
      ...prev,
      isPaused: true,
    }));
  }, [setTutorialState]);

  const resumeTutorial = useCallback(() => {
    setTutorialState((prev) => ({
      ...prev,
      isPaused: false,
      status: 'in_progress',
    }));
  }, [setTutorialState]);

  const restartTutorial = useCallback(() => {
    setTutorialState({
      ...createInitialTutorialState(),
      status: 'in_progress',
      showWelcomeModal: false,
      simulationMonthAtStart: simState.month,
      simulationYearAtStart: simState.year,
    });
  }, [simState.month, simState.year, setTutorialState]);

  const nextStep = useCallback(() => {
    setTutorialState(advanceStep);
  }, [setTutorialState]);

  const onMonthAdvanced = useCallback(() => {
    setTutorialState((prev) => {
      const step = tutorialSteps[prev.currentStepIndex];
      return prev.status === 'in_progress' && !prev.isPaused &&
        step?.requiresAction === 'advance_month' ? advanceStep(prev) : prev;
    });
  }, [setTutorialState]);

  const prevStep = useCallback(() => {
    setTutorialState((prev) => {
      if (prev.currentStepIndex <= 0) return prev;
      const prevIndex = prev.currentStepIndex - 1;
      const prevStepObj = tutorialSteps[prevIndex];
      return {
        ...prev,
        currentStepIndex: prevIndex,
        currentPhase: prevStepObj.phase,
      };
    });
  }, [setTutorialState]);

  const completeStep = useCallback((stepId: string) => {
    setTutorialState((prev) => {
      if (prev.completedSteps.includes(stepId)) return prev;
      return {
        ...prev,
        completedSteps: [...prev.completedSteps, stepId],
      };
    });
  }, [setTutorialState]);

  const dismissWelcome = useCallback(() => {
    setTutorialState((prev) => ({
      ...prev,
      showWelcomeModal: false,
    }));
  }, [setTutorialState]);

  const isStepCompleted = useCallback(
    (stepId: string) => tutorialState.completedSteps.includes(stepId),
    [tutorialState.completedSteps]
  );

  const value: TutorialContextType = {
    tutorialState,
    startTutorial,
    skipTutorial,
    pauseTutorial,
    resumeTutorial,
    restartTutorial,
    nextStep,
    onMonthAdvanced,
    prevStep,
    completeStep,
    dismissWelcome,
    isStepCompleted,
    currentStep,
    totalSteps: tutorialSteps.length,
    completionPercentage,
    isTutorialActive,
  };

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
}

export function useTutorial(): TutorialContextType {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}
