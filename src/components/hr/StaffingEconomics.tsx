"use client";

import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardHeader } from '@mui/material';
import { useSimulation } from '@/context/SimulationContext';
import { getEmployeeTotalCost, HIRING_COST, SEVERANCE_COST } from '@/types/simulation';
import HelpTooltip from '@/components/help/HelpTooltip';

export default function StaffingEconomics() {
  const { state } = useSimulation();

  const { employees, clients, financials } = state;
  const headcount = employees.length;
  const lobbyistCount = employees.filter(e => e.role === 'Lobbyist').length;
  const attorneyCount = employees.filter(e => e.role === 'Attorney').length;
  const billingStaff = lobbyistCount + attorneyCount;

  const totalCost = employees.reduce((s, e) => s + getEmployeeTotalCost(e), 0);
  const revenuePerEmployee = headcount > 0 ? Math.round(financials.grossRevenue / headcount) : 0;
  const costPerEmployee = headcount > 0 ? Math.round(totalCost / headcount) : 0;
  const profitPerEmployee = revenuePerEmployee - costPerEmployee;
  const clientsPerBillingStaff = billingStaff > 0 ? (clients.length / billingStaff).toFixed(1) : '—';

  return (
    <Card>
      <CardHeader title="Staffing Economics" subheader="Per-employee financial metrics" />
      <CardContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Revenue / Employee <HelpTooltip helpId="hr-revenue-per-employee" /></Typography>
              <Typography variant="h6" color="success.main">${revenuePerEmployee.toLocaleString()}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Total Cost / Employee <HelpTooltip helpId="hr-total-cost" /></Typography>
              <Typography variant="h6" color="error.main">${costPerEmployee.toLocaleString()}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Profit / Employee</Typography>
              <Typography variant="h6" color={profitPerEmployee >= 0 ? 'success.main' : 'error.main'}>
                ${profitPerEmployee.toLocaleString()}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Clients per Billing Staff <HelpTooltip helpId="hr-utilization" /></Typography>
              <Typography variant="h6">{clientsPerBillingStaff}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Hiring Cost</Typography>
              <Typography variant="h6">${HIRING_COST.toLocaleString()}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Severance Cost</Typography>
              <Typography variant="h6">${SEVERANCE_COST.toLocaleString()}</Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
