import { Box, Typography } from '@mui/material';
import type { SimulationState } from '@/types/simulation';
import { getPartnerInterventionStatus } from '@/lib/simulation/engine';

export default function PartnerInterventionNotice({ state }: { state: SimulationState }) {
  const status = getPartnerInterventionStatus(state);
  return (
    <Box role="status" aria-live="polite" sx={{ mb: 2 }}>
      <Typography variant="body2" fontWeight="bold">
        Partner intervention: {status.available ? 'available this month' : `used${status.usedBy ? ` — ${status.usedBy}` : ''}`}.
      </Typography>
      {!status.available && <Typography variant="body2">Available again: {status.availableAgain}.</Typography>}
      <Typography variant="caption" color="text.secondary">
        One major escalation per compressed game month, shared by client meetings and personal collection calls.
        This is a simulation allowance, not a real-world meeting schedule. Delegation, manual collections,
        staff recovery, reports, and routine administration do not use it.
      </Typography>
    </Box>
  );
}
