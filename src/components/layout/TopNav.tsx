"use client";

import { AppBar, Toolbar, Typography, Button, Box, Badge, IconButton, Tooltip } from '@mui/material';
import { Email, Menu, Notifications } from '@mui/icons-material';
import Link from 'next/link';
import { useSimulation } from '@/context/SimulationContext';
import { useTutorial } from '@/context/TutorialContext';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function TopNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { state, advanceMonth } = useSimulation();
  const { onMonthAdvanced } = useTutorial();
  const unreadCount = state.inbox.filter(message => !message.read).length;
  const alertCount = state.alerts.length;

  const handleAdvanceMonth = () => {
    advanceMonth();
    onMonthAdvanced();
  };

  return (
    <AppBar position="static" sx={{ bgcolor: 'primary.main', flexShrink: 0 }}>
      <Toolbar sx={{ gap: { xs: 0.5, sm: 1 }, flexWrap: { xs: 'wrap', md: 'nowrap' }, py: { xs: 0.75, md: 0 } }}>
        <IconButton
          color="inherit"
          edge="start"
          aria-label="Open navigation menu"
          onClick={onOpenMenu}
          sx={{ display: { md: 'none' }, mr: 0.5 }}
        >
          <Menu />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' }, whiteSpace: 'nowrap' }}>
          Managing Partner
        </Typography>
        <Typography variant="body2" sx={{ display: { xs: 'none', md: 'block' }, opacity: 0.9, whiteSpace: 'nowrap' }}>
          {monthNames[state.month - 1]} {state.year}
        </Typography>
        <Tooltip title={`${alertCount} alert${alertCount === 1 ? '' : 's'}`}>
          <IconButton component={Link} href="/#alerts" color="inherit" aria-label={`Go to dashboard alerts, ${alertCount} active`} size="small">
            <Badge badgeContent={alertCount} color="error"><Notifications /></Badge>
          </IconButton>
        </Tooltip>
        <Tooltip title={`${unreadCount} unread message${unreadCount === 1 ? '' : 's'}`}>
          <IconButton component={Link} href="/inbox" color="inherit" aria-label={`Open inbox, ${unreadCount} unread`} size="small">
            <Badge badgeContent={unreadCount} color="error"><Email /></Badge>
          </IconButton>
        </Tooltip>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'space-between', md: 'flex-end' }, gap: { xs: 1, md: 2 }, width: { xs: '100%', md: 'auto' }, minWidth: 0 }}>
          <Typography variant="body2" sx={{ display: { md: 'none' }, opacity: 0.95, whiteSpace: 'nowrap' }}>
            {monthNames[state.month - 1]} {state.year}
          </Typography>
          <Typography variant="body2" sx={{ display: { xs: 'none', lg: 'block' }, whiteSpace: 'nowrap' }}>
            Cash: ${state.financials.cashOnHand.toLocaleString()}
          </Typography>
          <Box data-tutorial-target="reputation-display" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}>
            <Typography variant="body2">Rep:</Typography>
            <Typography variant="body2" fontWeight={700}>{state.reputation}</Typography>
          </Box>
          <Typography variant="body2" sx={{ display: { xs: 'none', lg: 'block' }, whiteSpace: 'nowrap' }}>
            Profit: ${state.financials.netProfit.toLocaleString()}
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={handleAdvanceMonth}
            data-tutorial-target="advance-month"
            sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: { xs: 1, sm: 2 }, fontSize: { xs: '0.72rem', sm: '0.875rem' } }}
          >
            Advance Month
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
