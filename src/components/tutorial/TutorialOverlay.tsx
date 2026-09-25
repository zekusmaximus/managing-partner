"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Paper, Typography, Button, Chip, IconButton, Stack } from '@mui/material';
import { Close, ArrowBack, ArrowForward, School } from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import { useTutorial } from '@/context/TutorialContext';
import { useSimulation } from '@/context/SimulationContext';
import LearningObjectivesCard from '@/components/tutorial/LearningObjectivesCard';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function TutorialOverlay() {
  const {
    currentStep,
    isTutorialActive,
    nextStep,
    prevStep,
    skipTutorial,
    pauseTutorial,
    onMonthAdvanced,
    totalSteps,
    tutorialState,
  } = useTutorial();

  const pathname = usePathname();
  const router = useRouter();
  const { state: simulation, advanceMonth } = useSimulation();
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isTutorialActive && !isNavigating) dialogRef.current?.focus();
  }, [currentStep?.id, isTutorialActive, isNavigating]);

  // Find and measure target element
  const findTarget = useCallback((scrollToTarget = false) => {
    if (!currentStep || currentStep.targetSelector === 'center') {
      setTargetRect(null);
      return true;
    }

    const el = Array.from(document.querySelectorAll<HTMLElement>(currentStep.targetSelector)).find((candidate) => {
      const rect = candidate.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.left < window.innerWidth;
    });
    if (el) {
      if (scrollToTarget) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
      return true;
    }
    setTargetRect(null);
    return false;
  }, [currentStep]);

  // Poll for target element after navigation
  useEffect(() => {
    if (!isTutorialActive || !currentStep) return;

    // Check if we need to navigate to a different page
    if (currentStep.page !== pathname) {
      setIsNavigating(true);
      router.push(currentStep.page);
      return;
    }

    setIsNavigating(false);

    if (currentStep.targetSelector.includes('sidenav-') && window.matchMedia('(max-width: 899.95px)').matches) {
      window.dispatchEvent(new Event('mp:open-navigation'));
    }

    // Try to find the target immediately
    if (findTarget(true)) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    // Poll for the target element (it may not be mounted yet after navigation)
    let attempts = 0;
    pollRef.current = setInterval(() => {
      attempts++;
      if (findTarget(true) || attempts > 30) {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    }, 100);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [currentStep, pathname, isTutorialActive, findTarget, router]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isTutorialActive || !currentStep || currentStep.targetSelector === 'center') return;

    const handleUpdate = () => findTarget();
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);
    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isTutorialActive, currentStep, findTarget]);

  if (!isTutorialActive || !currentStep || isNavigating) return null;

  const isCenter = currentStep.targetSelector === 'center';
  const stepNumber = tutorialState.currentStepIndex + 1;
  const isFirstStep = tutorialState.currentStepIndex === 0;
  const isActionStep = !!currentStep.requiresAction;
  const showLearningObjectives =
    currentStep.id.includes('intro') || currentStep.id === 'welcome-game-overview';
  const monthlyExpenses = simulation.financials.operatingExpenses;
  const content = currentStep.content.replace(/\{\{(cash|expenses|runway)\}\}/g, (_, key: string) => {
    if (key === 'cash') return `$${Math.round(simulation.financials.cashOnHand).toLocaleString()}`;
    if (key === 'expenses') return `$${Math.round(monthlyExpenses).toLocaleString()}`;
    return monthlyExpenses > 0 ? (simulation.financials.cashOnHand / monthlyExpenses).toFixed(1) : 'unlimited';
  });

  // Handle next/navigation
  const handleNext = () => {
    if (currentStep.requiresAction === 'navigate' && currentStep.actionTarget) {
      router.push(currentStep.actionTarget);
      nextStep();
    } else if (currentStep.requiresAction === 'advance_month') {
      advanceMonth();
      onMonthAdvanced();
    } else if (!isActionStep) {
      nextStep();
    }
  };

  const getActionHintText = (): string => {
    if (currentStep.requiresAction === 'advance_month') {
      return 'Click "Advance Month" to continue';
    }
    if (currentStep.requiresAction === 'navigate') {
      return 'Click the highlighted item to continue';
    }
    return '';
  };

  // ─── Render ────────────────────────────────────────────────────────

  // Center modal mode
  if (isCenter) {
    return (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1350,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.6)',
        }}
      >
        <Paper
          elevation={8}
          ref={dialogRef}
          role="dialog"
          aria-label={currentStep.title}
          tabIndex={-1}
          onKeyDown={(event) => { if (event.key === 'Escape') pauseTutorial(); }}
          sx={{
            maxWidth: 520,
            width: '90%',
            maxHeight: 'calc(100vh - 32px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            p: { xs: 2, sm: 4 },
            borderRadius: 2,
            position: 'relative',
          }}
        >
          <IconButton
            aria-label="Pause tutorial"
            onClick={pauseTutorial}
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <Close fontSize="small" />
          </IconButton>

          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
            <School sx={{ color: 'primary.main', fontSize: 20 }} />
            <Chip
              label={`Step ${stepNumber} of ${totalSteps}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontSize: '0.72rem' }}
            />
          </Stack>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            {currentStep.title}
          </Typography>

          <Box sx={{ overflowY: 'auto', minHeight: 0 }}>
            <Typography
              variant="body2"
              sx={{ lineHeight: 1.8, whiteSpace: 'pre-line', color: 'text.secondary' }}
            >
              {content}
            </Typography>

            {showLearningObjectives && currentStep.phase !== 'welcome' && (
              <LearningObjectivesCard phase={currentStep.phase} />
            )}
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3, flexShrink: 0 }}>
            <Button
              size="small"
              onClick={skipTutorial}
              sx={{ color: 'text.secondary', fontSize: '0.8rem' }}
            >
              Skip Tutorial
            </Button>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ArrowBack />}
                onClick={prevStep}
                disabled={isFirstStep}
              >
                Back
              </Button>
              <Button
                variant="contained"
                size="small"
                endIcon={<ArrowForward />}
                onClick={handleNext}
              >
                {isActionStep ? 'Continue' : 'Next'}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Spotlight mode — highlight a target element
  const padding = 8;
  const spotlight = targetRect
    ? {
        top: targetRect.top - padding,
        left: targetRect.left - padding,
        width: targetRect.width + padding * 2,
        height: targetRect.height + padding * 2,
      }
    : null;
  const hole = spotlight ? {
    top: Math.max(0, spotlight.top),
    left: Math.max(0, spotlight.left),
    right: Math.min(window.innerWidth, spotlight.left + spotlight.width),
    bottom: Math.min(window.innerHeight, spotlight.top + spotlight.height),
  } : null;

  // Calculate popover position
  const getPopoverPosition = (): React.CSSProperties => {
    if (!spotlight) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxHeight: 'calc(100vh - 32px)' };

    const popoverWidth = Math.min(380, window.innerWidth - 32);
    const popoverHeight = Math.min(330, window.innerHeight - 32);
    const gap = 16;
    const clampLeft = (value: number) => Math.max(16, Math.min(value, window.innerWidth - popoverWidth - 16));
    const below = spotlight.top + spotlight.height + gap;
    const above = spotlight.top - popoverHeight - gap;
    let left = clampLeft(spotlight.left);
    let top = below + popoverHeight <= window.innerHeight - 16 ? below : above;

    if (currentStep.position === 'top') top = above >= 16 ? above : below;
    if (currentStep.position === 'right' && spotlight.left + spotlight.width + gap + popoverWidth <= window.innerWidth - 16) {
      left = spotlight.left + spotlight.width + gap;
      top = spotlight.top;
    }
    if (currentStep.position === 'left' && spotlight.left - gap - popoverWidth >= 16) {
      left = spotlight.left - gap - popoverWidth;
      top = spotlight.top;
    }

    top = Math.max(16, Math.min(top, window.innerHeight - popoverHeight - 16));
    return { top, left, maxHeight: Math.min(popoverHeight, window.innerHeight - top - 16) };
  };

  return (
    <>
      {/* Overlay with spotlight cutout using clip-path */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1350,
          pointerEvents: 'none',
        }}
      >
        {/* Dark overlay */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <mask id="tutorial-spotlight-mask">
              <rect width="100%" height="100%" fill="white" />
              {spotlight && (
                <rect
                  x={spotlight.left}
                  y={spotlight.top}
                  width={spotlight.width}
                  height={spotlight.height}
                  rx={8}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.55)"
            mask="url(#tutorial-spotlight-mask)"
          />
          {spotlight && (
            <rect
              x={spotlight.left}
              y={spotlight.top}
              width={spotlight.width}
              height={spotlight.height}
              rx={8}
              fill="none"
              stroke="#1976d2"
              strokeWidth={2}
            />
          )}
        </svg>
      </Box>

      {/* Four blockers leave an actual pointer-accessible opening over the target. */}
      {(hole ? [
        { top: 0, left: 0, width: '100vw', height: hole.top },
        { top: hole.bottom, left: 0, width: '100vw', height: window.innerHeight - hole.bottom },
        { top: hole.top, left: 0, width: hole.left, height: hole.bottom - hole.top },
        { top: hole.top, left: hole.right, width: window.innerWidth - hole.right, height: hole.bottom - hole.top },
      ] : [{ top: 0, left: 0, width: '100vw', height: '100vh' }]).map((rect, index) => (
        <Box
          key={index}
          aria-hidden="true"
          sx={{ position: 'fixed', zIndex: 1351, cursor: 'default', ...rect }}
        />
      ))}

      {/* Popover */}
      <Paper
        elevation={8}
        ref={dialogRef}
        role="dialog"
        aria-label={currentStep.title}
        tabIndex={-1}
        onKeyDown={(event) => { if (event.key === 'Escape') pauseTutorial(); }}
        sx={{
          position: 'fixed',
          ...getPopoverPosition(),
          zIndex: 1360,
          maxWidth: 380,
          width: '90vw',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          p: 2.5,
          borderRadius: 2,
          borderTop: '3px solid',
          borderColor: 'primary.main',
        }}
      >
        <IconButton
          aria-label="Pause tutorial"
          onClick={pauseTutorial}
          size="small"
          sx={{ position: 'absolute', top: 6, right: 6 }}
        >
          <Close sx={{ fontSize: 16 }} />
        </IconButton>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
          <Chip
            label={`${stepNumber} / ${totalSteps}`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: 22 }}
          />
        </Stack>

        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          {currentStep.title}
        </Typography>

        <Box sx={{ overflowY: 'auto', minHeight: 0, mb: 2 }}>
          <Typography
            variant="body2"
            sx={{ lineHeight: 1.7, whiteSpace: 'pre-line', color: 'text.secondary' }}
          >
            {content}
          </Typography>

          {isActionStep && (
            <Chip
              label={getActionHintText()}
              size="small"
              color="warning"
              sx={{ mt: 1.5, fontSize: '0.75rem' }}
            />
          )}
        </Box>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flexShrink: 0 }}>
          <Button
            size="small"
            onClick={skipTutorial}
            sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
          >
            Skip
          </Button>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              aria-label="Previous tutorial step"
              onClick={prevStep}
              disabled={isFirstStep}
              sx={{ minWidth: 32, px: 1 }}
            >
              <ArrowBack sx={{ fontSize: 16 }} />
            </Button>
            {currentStep.requiresAction === 'navigate' ? (
              <Button size="small" variant="contained" onClick={handleNext}>
                Go There
              </Button>
            ) : currentStep.requiresAction === 'advance_month' ? (
              <Button size="small" variant="contained" onClick={handleNext}>
                Advance Month
              </Button>
            ) : isActionStep ? null : (
              <Button
                size="small"
                variant="contained"
                endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                onClick={handleNext}
              >
                Next
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
    </>
  );
}
