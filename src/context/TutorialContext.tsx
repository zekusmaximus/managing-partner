"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { tutorialSteps, type TutorialStep } from '@/data/tutorialSteps';
import type { TutorialPhase } from '@/data/learningObjectives';

// ─── Types ───────────────────────────────────────────────────────────

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

interface TutorialContextType {
  tutorialState: TutorialState;
  startTutorial: () => void;
  skipTutorial: () => void;
  pauseTutorial: () => void;
  resumeTutorial: () => void;
  restartTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  completeStep: (stepId: string) => void;
  dismissWelcome: () => void;
  isStepCompleted: (stepId: string) => boolean;
  currentStep: TutorialStep | null;
  totalSteps: number;
  completionPercentage: number;
  isTutorialActive: boolean;
}

// ─── Persistence ─────────────────────────────────────────────────────

const STORAGE_KEY = 'managing-partner-tutorial';

const defaultState: TutorialState = {
  status: 'not_started',
  currentStepIndex: 0,
  currentPhase: 'welcome',
  completedSteps: [],
  showWelcomeModal: true,
  isPaused: false,
  simulationMonthAtStart: 1,
};

function loadState(): TutorialState | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveState(state: TutorialState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be full or disabled
  }
}

// ─── Context ─────────────────────────────────────────────────────────

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

// ─── Phase Ordering ──────────────────────────────────────────────────

const phaseOrder: TutorialPhase[] = ['welcome', 'month1', 'month2', 'month3', 'completed'];

function getNextPhase(current: TutorialPhase): TutorialPhase {
  const idx = phaseOrder.indexOf(current);
  return idx < phaseOrder.length - 1 ? phaseOrder[idx + 1] : 'completed';
}

// ─── Provider ────────────────────────────────────────────────────────

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [tutorialState, setTutorialState] = useState<TutorialState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const { state: simState } = useSimulation();
  const prevMonthRef = useRef(simState.month);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setTutorialState(saved);
    }
    setHydrated(true);
  }, []);

  // Persist on changes (after hydration)
  useEffect(() => {
    if (hydrated) {
      saveState(tutorialState);
    }
  }, [tutorialState, hydrated]);

  // Watch for simulation month changes to auto-advance tutorial phases
  useEffect(() => {
    if (!hydrated) return;
    if (tutorialState.status !== 'in_progress' || tutorialState.isPaused) return;

    const currentStep = tutorialSteps[tutorialState.currentStepIndex];
    if (!currentStep) return;

    if (simState.month !== prevMonthRef.current && currentStep.requiresAction === 'advance_month') {
      // Month was advanced — move to the next step
      setTutorialState((prev) => {
        const nextIndex = prev.currentStepIndex + 1;
        if (nextIndex >= tutorialSteps.length) {
          return {
            ...prev,
            status: 'completed',
            currentPhase: 'completed',
            completedSteps: [...prev.completedSteps, currentStep.id],
          };
        }
        const nextStep = tutorialSteps[nextIndex];
        return {
          ...prev,
          currentStepIndex: nextIndex,
          currentPhase: nextStep.phase,
          completedSteps: [...prev.completedSteps, currentStep.id],
        };
      });
    }

    prevMonthRef.current = simState.month;
  }, [simState.month, hydrated, tutorialState.status, tutorialState.isPaused, tutorialState.currentStepIndex]);

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
      ...defaultState,
      status: 'in_progress',
      showWelcomeModal: false,
      simulationMonthAtStart: simState.month,
    });
  }, [simState.month]);

  const skipTutorial = useCallback(() => {
    setTutorialState((prev) => ({
      ...prev,
      status: 'skipped',
      showWelcomeModal: false,
      isPaused: false,
    }));
  }, []);

  const pauseTutorial = useCallback(() => {
    setTutorialState((prev) => ({
      ...prev,
      isPaused: true,
    }));
  }, []);

  const resumeTutorial = useCallback(() => {
    setTutorialState((prev) => ({
      ...prev,
      isPaused: false,
      status: 'in_progress',
    }));
  }, []);

  const restartTutorial = useCallback(() => {
    setTutorialState({
      ...defaultState,
      status: 'in_progress',
      showWelcomeModal: false,
      simulationMonthAtStart: simState.month,
    });
  }, [simState.month]);

  const nextStep = useCallback(() => {
    setTutorialState((prev) => {
      const currentStepObj = tutorialSteps[prev.currentStepIndex];
      const nextIndex = prev.currentStepIndex + 1;

      if (nextIndex >= tutorialSteps.length) {
        return {
          ...prev,
          status: 'completed',
          currentPhase: 'completed',
          completedSteps: currentStepObj
            ? [...prev.completedSteps, currentStepObj.id]
            : prev.completedSteps,
        };
      }

      const nextStepObj = tutorialSteps[nextIndex];
      return {
        ...prev,
        currentStepIndex: nextIndex,
        currentPhase: nextStepObj.phase,
        completedSteps: currentStepObj
          ? [...prev.completedSteps, currentStepObj.id]
          : prev.completedSteps,
      };
    });
  }, []);

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
  }, []);

  const completeStep = useCallback((stepId: string) => {
    setTutorialState((prev) => {
      if (prev.completedSteps.includes(stepId)) return prev;
      return {
        ...prev,
        completedSteps: [...prev.completedSteps, stepId],
      };
    });
  }, []);

  const dismissWelcome = useCallback(() => {
    setTutorialState((prev) => ({
      ...prev,
      showWelcomeModal: false,
    }));
  }, []);

  const isStepCompleted = useCallback(
    (stepId: string) => tutorialState.completedSteps.includes(stepId),
    [tutorialState.completedSteps]
  );

  // Don't render children-dependent tutorial UI until hydrated
  const value: TutorialContextType = {
    tutorialState: hydrated ? tutorialState : { ...defaultState, showWelcomeModal: false },
    startTutorial,
    skipTutorial,
    pauseTutorial,
    resumeTutorial,
    restartTutorial,
    nextStep,
    prevStep,
    completeStep,
    dismissWelcome,
    isStepCompleted,
    currentStep: hydrated ? currentStep : null,
    totalSteps: tutorialSteps.length,
    completionPercentage,
    isTutorialActive: hydrated ? isTutorialActive : false,
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
