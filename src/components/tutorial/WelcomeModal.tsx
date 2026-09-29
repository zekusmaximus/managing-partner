"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  DialogContentText,
} from '@mui/material';
import { School, Gavel, AccountBalance } from '@mui/icons-material';
import { useTutorial } from '@/context/TutorialContext';
import { useSession } from '@/context/SessionContext';

export default function WelcomeModal() {
  const { tutorialState, startTutorial, skipTutorial } = useTutorial();
  const { newGame } = useSession();
  const [caseConfirmOpen, setCaseConfirmOpen] = useState(false);

  if (!tutorialState.showWelcomeModal) return null;

  return (
    <>
    <Dialog
      open={!caseConfirmOpen}
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
          Explore cash, client commitments, staffing, and limited partner attention in a simplified
          fictional model. Start the authored three-round case or explore the usual free-play firm.
          The existing tutorial is still available for a longer tour of the controls.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <School sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Explore GR Concepts
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Government relations terminology and the model’s limits
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Gavel sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Compare Decisions
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
              Balance growth with service capacity and recurring commitments
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3, justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => setCaseConfirmOpen(true)}
          sx={{ fontWeight: 600 }}
        >
          Start Authored Case
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={startTutorial}
        >
          Start Tutorial
        </Button>
        <Button
          variant="text"
          size="large"
          onClick={skipTutorial}
          sx={{ color: 'text.secondary' }}
        >
          Explore Freely
        </Button>
      </DialogActions>
    </Dialog>
    <Dialog open={caseConfirmOpen} onClose={() => setCaseConfirmOpen(false)} aria-labelledby="start-case-title">
      <DialogTitle id="start-case-title">Start the authored case?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This uses New Game to replace the current firm on this device with the case opening.
          The case runs from January through the April renewal outcome.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => setCaseConfirmOpen(false)}>Cancel</Button>
        <Button variant="contained" onClick={() => { newGame('case'); setCaseConfirmOpen(false); }}>
          Start New Case
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}
