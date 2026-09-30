"use client";

import { useState } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Typography,
} from '@mui/material';
import { useSession } from '@/context/SessionContext';

export default function WelcomeModal() {
  const { tutorial, setTutorial, newGame } = useSession();
  const [caseConfirmOpen, setCaseConfirmOpen] = useState(false);

  if (!tutorial.showWelcomeModal) return null;

  const exploreFreely = () => {
    setTutorial(previous => ({
      ...previous,
      status: 'skipped',
      showWelcomeModal: false,
      isPaused: false,
    }));
  };

  return (
    <>
      <Dialog open={!caseConfirmOpen} maxWidth="sm" fullWidth aria-labelledby="welcome-title">
        <DialogTitle id="welcome-title">Managing Partner</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Lead a fictional government relations firm. You choose how to manage cash,
            client commitments, service capacity, and your limited senior attention.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The guided case follows one client from January through an uncertain April
            renewal. Each round asks for one prediction, a decision, and a short reflection.
            You can also explore the firm freely, and help remains available on every route.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={exploreFreely}>Explore freely</Button>
          <Button variant="contained" onClick={() => setCaseConfirmOpen(true)}>
            Start guided case — about 25 minutes
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={caseConfirmOpen} onClose={() => setCaseConfirmOpen(false)} aria-labelledby="start-case-title">
        <DialogTitle id="start-case-title">Start the guided case?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This uses New Game to replace the current firm on this device with the case opening.
            The case runs from January through the April renewal outcome.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Button onClick={() => setCaseConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { newGame('case'); setCaseConfirmOpen(false); }}>
            Start new case
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
