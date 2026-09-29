"use client";

import { useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Paper, Typography,
} from '@mui/material';
import Link from 'next/link';
import { useSimulation } from '@/context/SimulationContext';
import { CASE_EVENT_IDS, getCaseAdvanceBlocker } from '@/lib/simulation/authoredCase';

const roundTitles: Record<number, string> = {
  1: 'January: collect an overdue account',
  2: 'February: review a new mandate',
  3: 'March: respond to a policy delay',
};

const caseEventIds = new Set<string>(Object.values(CASE_EVENT_IDS));

export default function CaseStatusPanel() {
  const { state, leaveCase } = useSimulation();
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const authoredCase = state.authoredCase;
  if (!authoredCase) return null;

  const active = authoredCase.status === 'active';
  const pending = state.inbox.filter(message => message.requiresAction && caseEventIds.has(message.id));
  const blocker = active ? getCaseAdvanceBlocker(state) : null;
  const heading = active ? roundTitles[state.month] ?? 'Authored case'
    : authoredCase.status === 'completed' ? 'Case completed' : 'Authored case left';
  const renewal = authoredCase.renewalOutcome === 'renewed'
    ? 'TechTrade Association renewed for another term.'
    : authoredCase.renewalOutcome === 'departed'
      ? 'TechTrade Association departed at renewal.' : null;

  return (
    <Paper
      component="section"
      square
      elevation={0}
      aria-label="Authored case progress"
      sx={{ px: { xs: 2, md: 3 }, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'rgba(25, 118, 210, 0.06)', flexShrink: 0, minWidth: 0 }}
    >
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between',
        gap: 1.5, minWidth: 0 }}>
        <Box sx={{ minWidth: 0, flex: { xs: 'none', sm: 1 } }}>
          <Typography variant="subtitle1" component="h2" fontWeight={700}>{heading}</Typography>
          {active ? (
            <Typography id="case-advance-reason" variant="body2" color={blocker ? 'text.primary' : 'text.secondary'}>
              {blocker ?? 'Required case decisions are recorded. Advance Month when ready.'}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {renewal ?? 'The current firm continues in free play.'}
            </Typography>
          )}
        </Box>
        {active && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Button component={Link} href="/inbox" variant="contained" size="small">
              {pending.length > 0 ? `Open Inbox (${pending.length} pending)` : 'Review Inbox'}
            </Button>
            <Button variant="text" size="small" onClick={() => setLeaveConfirmOpen(true)}>
              Leave case
            </Button>
          </Box>
        )}
      </Box>
      {active && pending.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          Required: {pending.map(message => message.title).join('; ')}
        </Typography>
      )}
      {authoredCase.status === 'completed' && authoredCase.renewal && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          At renewal: {Math.round(authoredCase.renewal.serviceCoverage * 100)}% service coverage,
          {' '}{Math.round(authoredCase.renewal.satisfaction)}% client satisfaction.
        </Typography>
      )}
      <Dialog open={leaveConfirmOpen} onClose={() => setLeaveConfirmOpen(false)} aria-labelledby="leave-case-title">
        <DialogTitle id="leave-case-title">Leave the authored case?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Keep this firm and continue freely. Unanswered case decisions will be recorded as held,
            and future case events will stop. This will not mark the case complete.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Button onClick={() => setLeaveConfirmOpen(false)}>Stay in case</Button>
          <Button variant="contained" onClick={() => { leaveCase(); setLeaveConfirmOpen(false); }}>
            Leave case and continue freely
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
