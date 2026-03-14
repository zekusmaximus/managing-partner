"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Paper, Typography, Button, Chip, IconButton, Stack } from '@mui/material';
import { Close, ArrowBack, ArrowForward, School } from '@mui/icons-material';
import { usePathname, useRouter } from 'next/navigation';
import { useTutorial } from '@/context/TutorialContext';
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
    totalSteps,
    tutorialState,
  } = useTutorial();

  const pathname = usePathname();
  const router = useRouter();
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Find and measure target element
  const findTarget = useCallback(() => {
    if (!currentStep || currentStep.targetSelector === 'center') {
      setTargetRect(null);
      return true;
    }

    const el = document.querySelector(currentStep.targetSelector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return true;
    }
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

    // Try to find the target immediately
    if (findTarget()) {
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
      if (findTarget() || attempts > 30) {
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

  // Handle next/navigation
  const handleNext = () => {
    if (currentStep.requiresAction === 'navigate' && currentStep.actionTarget) {
      router.push(currentStep.actionTarget);
      // The useEffect watching pathname will advance to next step
      nextStep();
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
          sx={{
            maxWidth: 520,
            width: '90%',
            p: 4,
            borderRadius: 2,
            position: 'relative',
          }}
        >
          <IconButton
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

          <Typography
            variant="body2"
            sx={{ lineHeight: 1.8, whiteSpace: 'pre-line', color: 'text.secondary' }}
          >
            {currentStep.content}
          </Typography>

          {showLearningObjectives && currentStep.phase !== 'welcome' && (
            <LearningObjectivesCard phase={currentStep.phase} />
          )}

          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
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

  // Calculate popover position
  const getPopoverPosition = (): React.CSSProperties => {
    if (!spotlight) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const popoverWidth = 380;
    const popoverHeight = 300;
    const gap = 16;

    switch (currentStep.position) {
      case 'bottom':
        return {
          top: spotlight.top + spotlight.height + gap,
          left: Math.max(16, Math.min(spotlight.left, window.innerWidth - popoverWidth - 16)),
        };
      case 'top':
        return {
          top: Math.max(16, spotlight.top - popoverHeight - gap),
          left: Math.max(16, Math.min(spotlight.left, window.innerWidth - popoverWidth - 16)),
        };
      case 'right':
        return {
          top: Math.max(16, spotlight.top),
          left: Math.min(spotlight.left + spotlight.width + gap, window.innerWidth - popoverWidth - 16),
        };
      case 'left':
        return {
          top: Math.max(16, spotlight.top),
          left: Math.max(16, spotlight.left - popoverWidth - gap),
        };
      default:
        return { top: spotlight.top + spotlight.height + gap, left: spotlight.left };
    }
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

      {/* Click blocker (allows clicks on highlighted area only) */}
      <Box
        onClick={(e) => {
          // Only block clicks outside the spotlight
          if (spotlight) {
            const x = e.clientX;
            const y = e.clientY;
            const inSpotlight =
              x >= spotlight.left &&
              x <= spotlight.left + spotlight.width &&
              y >= spotlight.top &&
              y <= spotlight.top + spotlight.height;
            if (!inSpotlight) {
              e.stopPropagation();
              e.preventDefault();
            }
          }
        }}
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1351,
          cursor: 'default',
        }}
      />

      {/* Popover */}
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          ...getPopoverPosition(),
          zIndex: 1360,
          maxWidth: 380,
          width: '90vw',
          p: 2.5,
          borderRadius: 2,
          borderTop: '3px solid',
          borderColor: 'primary.main',
        }}
      >
        <IconButton
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

        <Typography
          variant="body2"
          sx={{ lineHeight: 1.7, whiteSpace: 'pre-line', color: 'text.secondary', mb: 2 }}
        >
          {currentStep.content}
        </Typography>

        {isActionStep && (
          <Chip
            label={getActionHintText()}
            size="small"
            color="warning"
            sx={{ mb: 1.5, fontSize: '0.75rem' }}
          />
        )}

        <Stack direction="row" justifyContent="space-between" alignItems="center">
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
