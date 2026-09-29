"use client";

import React from 'react';
import { Box, Typography, LinearProgress, Button } from '@mui/material';
import { PlayArrow, Replay } from '@mui/icons-material';
import { useTutorial } from '@/context/TutorialContext';

const phaseLabels: Record<string, string> = {
  welcome: 'Welcome',
  month1: 'Part 1',
  month2: 'Part 2',
  month3: 'Part 3',
  completed: 'Complete',
};

export default function TutorialProgressBar() {
  const { tutorialState, completionPercentage, resumeTutorial, restartTutorial } = useTutorial();

  // Don't show if never started
  if (tutorialState.status === 'not_started') return null;

  const isCompleted = tutorialState.status === 'completed';
  const isSkipped = tutorialState.status === 'skipped';
  const isPaused = tutorialState.isPaused;

  return (
    <Box sx={{ px: 2, py: 1.5 }}>
      <Typography
        variant="caption"
        sx={{ fontWeight: 600, display: 'block', mb: 0.5, color: 'text.secondary' }}
      >
        {isCompleted
          ? 'Tutorial Complete'
          : isSkipped
            ? 'Tutorial Skipped'
            : isPaused
              ? 'Tutorial Paused'
              : `Tutorial: ${phaseLabels[tutorialState.currentPhase] || ''}`}
      </Typography>

      <LinearProgress
        variant="determinate"
        value={isCompleted ? 100 : completionPercentage}
        sx={{
          height: 6,
          borderRadius: 3,
          mb: 1,
          bgcolor: 'grey.200',
          '& .MuiLinearProgress-bar': {
            borderRadius: 3,
            bgcolor: isCompleted ? 'success.main' : 'primary.main',
          },
        }}
      />

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {isCompleted ? '100' : completionPercentage}% of tour visited
      </Typography>

      {(isPaused || isSkipped) && (
        <Button
          size="small"
          startIcon={<PlayArrow />}
          onClick={resumeTutorial}
          sx={{ fontSize: '0.72rem', py: 0.25 }}
        >
          Resume Tutorial
        </Button>
      )}

      {isCompleted && (
        <Button
          size="small"
          startIcon={<Replay />}
          onClick={restartTutorial}
          sx={{ fontSize: '0.72rem', py: 0.25 }}
        >
          Replay Tutorial
        </Button>
      )}
    </Box>
  );
}
