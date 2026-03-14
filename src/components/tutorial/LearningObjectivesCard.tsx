"use client";

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import { getObjectivesForPhase } from '@/data/learningObjectives';
import type { TutorialPhase } from '@/data/learningObjectives';
import { useTutorial } from '@/context/TutorialContext';

const phaseLabels: Record<TutorialPhase, string> = {
  welcome: 'Welcome',
  month1: 'Month 1: Getting Your Bearings',
  month2: 'Month 2: Client Management & Decision-Making',
  month3: 'Month 3: Strategic Thinking & Resource Allocation',
  completed: 'Tutorial Complete',
};

interface LearningObjectivesCardProps {
  phase: TutorialPhase;
}

export default function LearningObjectivesCard({ phase }: LearningObjectivesCardProps) {
  const { isStepCompleted } = useTutorial();
  const objectives = getObjectivesForPhase(phase);

  if (objectives.length === 0) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 1,
          color: 'primary.main',
          mb: 1,
          display: 'block',
        }}
      >
        Learning Objectives — {phaseLabels[phase]}
      </Typography>
      <Stack spacing={0.75}>
        {objectives.map((obj) => {
          const completed = isStepCompleted(obj.id);
          return (
            <Box key={obj.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              {completed ? (
                <CheckCircle sx={{ fontSize: 18, color: 'success.main', mt: 0.15 }} />
              ) : (
                <RadioButtonUnchecked sx={{ fontSize: 18, color: 'text.disabled', mt: 0.15 }} />
              )}
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                  {obj.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {obj.description}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
