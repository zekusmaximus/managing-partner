import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Stack, Badge, IconButton, Tooltip } from '@mui/material';
import { Email, Notifications } from '@mui/icons-material';
import Link from 'next/link';
import { useSimulation } from '@/context/SimulationContext';

export const TopNav = () => {
  const { state, advanceMonth } = useSimulation();

  const unreadCount = state.inbox.filter(m => !m.read).length;
  const alertCount = state.alerts.length;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6" color="inherit" sx={{ fontWeight: 600 }}>
              Managing Partner
            </Typography>
            <Typography variant="body2" color="inherit" sx={{ opacity: 0.9 }}>
              {monthNames[state.month - 1]} {state.year}
            </Typography>
          </Stack>
        </Box>
        
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Alerts */}
          <Tooltip title={`${alertCount} alert(s)`}>
            <IconButton color="inherit" sx={{ mr: 1 }}>
              <Badge badgeContent={alertCount} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Inbox */}
          <Link href="/inbox" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Tooltip title={`${unreadCount} unread message(s)`}>
              <IconButton color="inherit" sx={{ mr: 2 }}>
                <Badge badgeContent={unreadCount} color="primary">
                  <Email />
                </Badge>
              </IconButton>
            </Tooltip>
          </Link>

          {/* Stats */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, mr: 2 }}>
            <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
              Cash:
            </Typography>
            <Typography variant="body1" color="inherit" sx={{ fontWeight: 600 }}>
              ${state.financials.cashOnHand.toLocaleString()}
            </Typography>
          </Box>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, mr: 2 }}>
            <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
              Rep:
            </Typography>
            <Typography variant="body1" color="inherit" sx={{ fontWeight: 600 }}>
              {state.reputation}
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, mr: 2 }}>
            <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
              Profit:
            </Typography>
            <Typography 
              variant="body1" 
              color="inherit" 
              sx={{ 
                fontWeight: 600,
                color: state.financials.netProfit >= 0 ? '#4caf50' : '#f44336'
              }}
            >
              ${state.financials.netProfit.toLocaleString()}
            </Typography>
          </Box>

          <Button 
            variant="contained" 
            color="secondary" 
            size="medium" 
            onClick={advanceMonth}
            sx={{ fontWeight: 600 }}
          >
            Advance Month →
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

