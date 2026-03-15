"use client";

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { School, Gavel, AccountBalance } from '@mui/icons-material';
import { useTutorial } from '@/context/TutorialContext';

export default function WelcomeModal() {
  const { tutorialState, startTutorial, skipTutorial } = useTutorial();

  if (!tutorialState.showWelcomeModal) return null;

  return (
    <Dialog
      open={tutorialState.showWelcomeModal}
      maxWidth="sm"
      fullWidth
      sx={{ zIndex: 1400 }}
      slotProps={{
        backdrop: {
          sx: { bgcolor: 'rgba(0, 0, 0, 0.7)' },
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          textAlign: 'center',
          pt: 4,
          pb: 1,
        }}
      >
        <AccountBalance sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography component="h2" variant="h4" sx={{ fontWeight: 700 }}>
          Managing Partner
        </Typography>
        <Typography component="p" variant="subtitle1" color="text.secondary" sx={{ mt: 0.5 }}>
          Government Relations Firm Simulator
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ px: 4 }}>
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 3, lineHeight: 1.7 }}>
          Step into the role of a managing partner at a Washington, D.C. government relations firm.
          Learn to manage finances, lead a team of lobbyists and attorneys, and navigate the complex
          world of government affairs.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <School sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Learn GR Fundamentals
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Real-world government relations concepts and terminology
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Gavel sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Make Real Decisions
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Practice managing partner trade-offs and judgment calls
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <AccountBalance sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Build Your Firm
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Grow reputation, clients, and profitability over time
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3, justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={startTutorial}
          sx={{ px: 4, fontWeight: 600 }}
        >
          Start Tutorial
        </Button>
        <Button
          variant="text"
          size="large"
          onClick={skipTutorial}
          sx={{ color: 'text.secondary' }}
        >
          Skip — I know GR
        </Button>
      </DialogActions>
    </Dialog>
  );
}
