"use client";

import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Grid, Card, CardContent, CardHeader, Dialog, DialogTitle, DialogContent, DialogActions, TextField, LinearProgress } from '@mui/material';
import { useSimulation } from '@/context/SimulationContext';
import { getLOCAvailable, getLOCMonthlyInterest, getARTotal } from '@/types/simulation';
import HelpTooltip from '@/components/help/HelpTooltip';

export default function CashFlowView() {
  const { state, drawLineOfCredit, repayLineOfCredit } = useSimulation();
  const [locDialogOpen, setLocDialogOpen] = useState(false);
  const [locAction, setLocAction] = useState<'draw' | 'repay'>('draw');
  const [locAmount, setLocAmount] = useState(0);

  const { financials, lineOfCredit, financialHistory } = state;
  const locAvailable = getLOCAvailable(lineOfCredit);
  const locInterest = getLOCMonthlyInterest(lineOfCredit);

  // Cash waterfall for current month
  const waterfallItems = [
    { label: 'Starting Cash', amount: financialHistory.length >= 2 ? financialHistory[financialHistory.length - 2].cashOnHand : 250000, isRunning: true },
    { label: '+ Collections', amount: financials.collectionsThisMonth, isPositive: true },
    { label: '- Payroll', amount: -financials.totalPayroll, isPositive: false },
    { label: '- Operating Costs', amount: -financials.totalOperatingCosts, isPositive: false },
    { label: '- Vendor Services', amount: -financials.totalVendorCosts, isPositive: false },
    { label: '- Partner Draw', amount: -financials.partnerDrawThisMonth, isPositive: false },
    { label: '- LOC Interest', amount: -financials.locInterestThisMonth, isPositive: false },
    { label: 'Ending Cash', amount: financials.cashOnHand, isRunning: true },
  ];

  // 3-month projection based on current run rate
  const avgCollections = financialHistory.slice(-3).reduce((s, h) => s + h.collections, 0) / Math.max(1, financialHistory.slice(-3).length);
  const avgExpenses = financialHistory.slice(-3).reduce((s, h) => s + h.expenses, 0) / Math.max(1, financialHistory.slice(-3).length);
  const monthlyNetCashFlow = avgCollections - avgExpenses;

  const projections = [1, 2, 3].map(m => ({
    month: `Month +${m}`,
    projected: Math.round(financials.cashOnHand + monthlyNetCashFlow * m),
  }));

  // Months of runway at current burn rate
  const monthlyBurn = financials.operatingExpenses;
  const runway = monthlyBurn > 0 ? Math.round((financials.cashOnHand + locAvailable) / monthlyBurn) : 99;

  const handleLOCAction = () => {
    if (locAction === 'draw') {
      drawLineOfCredit(locAmount);
    } else {
      repayLineOfCredit(locAmount);
    }
    setLocDialogOpen(false);
    setLocAmount(0);
  };

  const openDraw = () => { setLocAction('draw'); setLocAmount(Math.min(10000, locAvailable)); setLocDialogOpen(true); };
  const openRepay = () => { setLocAction('repay'); setLocAmount(Math.min(10000, lineOfCredit.drawn)); setLocDialogOpen(true); };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Cash Flow & Line of Credit <HelpTooltip helpId="finance-loc" />
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Cash on Hand</Typography>
              <Typography variant="h6" color={financials.cashOnHand < 50000 ? 'error.main' : 'success.main'}>
                ${financials.cashOnHand.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">LOC Available</Typography>
              <Typography variant="h6" color="primary.main">
                ${locAvailable.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Total Liquidity</Typography>
              <Typography variant="h6">
                ${(financials.cashOnHand + locAvailable).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Runway</Typography>
              <Typography variant="h6" color={runway < 3 ? 'error.main' : runway < 6 ? 'warning.main' : 'success.main'}>
                {runway} mo
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Cash Waterfall */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Cash Waterfall" subheader={`Month ${state.month}, ${state.year}`} />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {waterfallItems.map((item, i) => (
                      <TableRow key={item.label} sx={item.isRunning ? { bgcolor: 'action.hover' } : {}}>
                        <TableCell sx={{ fontWeight: item.isRunning ? 'bold' : 'normal' }}>
                          {item.label}
                        </TableCell>
                        <TableCell align="right" sx={{
                          fontWeight: item.isRunning ? 'bold' : 'normal',
                          color: item.isRunning ? (item.amount >= 0 ? 'text.primary' : 'error.main') : item.isPositive ? 'success.main' : 'error.main',
                        }}>
                          ${Math.abs(Math.round(item.amount)).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* LOC + Projections */}
        <Grid size={{ xs: 12, md: 6 }}>
          {/* Line of Credit */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Line of Credit" subheader={`${(lineOfCredit.interestRate * 100).toFixed(1)}% APR`} />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Drawn: ${lineOfCredit.drawn.toLocaleString()}</Typography>
                  <Typography variant="body2">Limit: ${lineOfCredit.limit.toLocaleString()}</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={lineOfCredit.limit > 0 ? (lineOfCredit.drawn / lineOfCredit.limit * 100) : 0}
                  sx={{ height: 10, borderRadius: 5 }}
                  color={lineOfCredit.drawn > lineOfCredit.limit * 0.8 ? 'error' : lineOfCredit.drawn > lineOfCredit.limit * 0.5 ? 'warning' : 'success'}
                />
              </Box>
              {lineOfCredit.drawn > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Monthly interest: ${locInterest.toLocaleString()}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={openDraw} disabled={locAvailable === 0}>
                  Draw
                </Button>
                <Button variant="outlined" size="small" color="success" onClick={openRepay} disabled={lineOfCredit.drawn === 0}>
                  Repay
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Cash Projection */}
          <Card>
            <CardHeader title="3-Month Cash Projection" />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Period</TableCell>
                      <TableCell align="right">Projected Cash</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Current</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>${financials.cashOnHand.toLocaleString()}</TableCell>
                    </TableRow>
                    {projections.map(p => (
                      <TableRow key={p.month}>
                        <TableCell>{p.month}</TableCell>
                        <TableCell align="right" sx={{ color: p.projected < 0 ? 'error.main' : p.projected < 50000 ? 'warning.main' : 'success.main' }}>
                          ${p.projected.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Based on trailing 3-month average net cash flow: ${Math.round(monthlyNetCashFlow).toLocaleString()}/mo
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* LOC Dialog */}
      <Dialog open={locDialogOpen} onClose={() => setLocDialogOpen(false)}>
        <DialogTitle>{locAction === 'draw' ? 'Draw from Line of Credit' : 'Repay Line of Credit'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Amount"
            type="number"
            fullWidth
            value={locAmount}
            onChange={(e) => setLocAmount(Number(e.target.value))}
            sx={{ mt: 1 }}
            helperText={locAction === 'draw' ? `Available: $${locAvailable.toLocaleString()}` : `Balance: $${lineOfCredit.drawn.toLocaleString()}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleLOCAction} variant="contained" color={locAction === 'draw' ? 'primary' : 'success'}>
            {locAction === 'draw' ? 'Draw' : 'Repay'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
