import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Stack } from '@mui/material';
import { useSimulation } from '@/context/SimulationContext';

export const TopNav = () => {
  const { state, setState } = useSimulation();

  const handleAdvanceMonth = () => {
    setState((prev) => {
      const newMonth = prev.month + 1;
      if (newMonth > 12) {
        return { ...prev, month: 1, year: prev.year + 1 };
      }
      return { ...prev, month: newMonth };
    });
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6" color="inherit" sx={{ fontWeight: 600 }}>
              Managing Partner
            </Typography>
            <Typography variant="body2" color="inherit">
              {new Date(state.year, state.month - 1).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
              })}
            </Typography>
          </Stack>
        </Box>
        <Stack direction="row" spacing={3} alignItems="center">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="inherit">
              Cash on Hand:
            </Typography>
            <Typography variant="h6" color="inherit" sx={{ fontWeight: 600 }}>
              ${state.financials.cashOnHand.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="inherit">
              Reputation:
            </Typography>
            <Typography variant="h6" color="inherit" sx={{ fontWeight: 600 }}>
              {state.reputation}
            </Typography>
          </Box>
          <Button variant="contained" color="secondary" size="large" onClick={handleAdvanceMonth}>
            Advance Month
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};