"use client";

import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Grid, Card, CardContent, CardHeader, Dialog, DialogTitle, DialogContent, DialogActions, TextField, LinearProgress } from '@mui/material';
import { useSimulation } from '@/context/SimulationContext';
import { getLOCAvailable, getLOCMonthlyInterest } from '@/types/simulation';
import type { CashMovement } from '@/types/simulation';
import HelpTooltip from '@/components/help/HelpTooltip';
import { isValidAmount } from '@/lib/simulation/engine';

const movementLabels: Record<CashMovement['kind'], string> = {
  'partner-distribution': 'Partner distribution',
  'tax-payment': 'Estimated tax payment',
  'equipment-purchase': 'Equipment purchase',
  repair: 'Equipment repair',
  hiring: 'Hiring cost',
  severance: 'Severance',
  'staff-recovery': 'Staff recovery program',
  'loc-draw': 'Line of credit draw',
  'loc-repayment': 'Line of credit repayment',
  unclassified: 'Unclassified prior activity',
};

const movementOrder: CashMovement['kind'][] = [
  'partner-distribution', 'tax-payment', 'equipment-purchase', 'repair',
  'hiring', 'severance', 'staff-recovery', 'loc-draw', 'loc-repayment', 'unclassified',
];

interface WaterfallItem {
  label: string;
  amount: number;
  isBalance?: boolean;
}

const formatCash = (amount: number, isBalance = false): string =>
  `${amount < 0 ? '-' : isBalance ? '' : '+'}$${Math.abs(Math.round(amount)).toLocaleString()}`;

export default function CashFlowView() {
  const { state, drawLineOfCredit, repayLineOfCredit } = useSimulation();
  const [locDialogOpen, setLocDialogOpen] = useState(false);
  const [locAction, setLocAction] = useState<'draw' | 'repay'>('draw');
  const [locAmount, setLocAmount] = useState(0);

  const { financials, lineOfCredit, financialHistory } = state;
  const taxBalance = state.taxPosition.principalDue + state.taxPosition.penaltiesDue;
  const locAvailable = getLOCAvailable(lineOfCredit);
  const locInterest = getLOCMonthlyInterest(lineOfCredit);
  const repayMaximum = Math.min(lineOfCredit.drawn, Math.max(0, financials.cashOnHand));
  const locMaximum = locAction === 'draw' ? locAvailable : repayMaximum;
  const validLOCAmount = isValidAmount(locAmount) && locAmount <= locMaximum;

  const currentEntry = financialHistory.at(-1);
  const openingCash = currentEntry?.openingCash ?? null;
  const movementTotals = currentEntry?.cashMovements.reduce<Partial<Record<CashMovement['kind'], number>>>(
    (totals, movement) => ({ ...totals, [movement.kind]: (totals[movement.kind] ?? 0) + movement.amount }),
    {},
  ) ?? {};
  const movementItems: WaterfallItem[] = movementOrder
    .filter(kind => movementTotals[kind] !== undefined && movementTotals[kind] !== 0)
    .map(kind => ({ label: movementLabels[kind], amount: movementTotals[kind] ?? 0 }));

  // The initial January record is a P&L run-rate snapshot. Its recurring
  // expenses have not been paid in cash; only later months book those payments.
  const recurringItems: WaterfallItem[] = currentEntry && !currentEntry.isOpeningSnapshot
    ? [
      { label: 'Payroll paid', amount: -currentEntry.payroll },
      { label: 'Operating costs paid', amount: -currentEntry.operatingCosts },
      { label: 'Vendor services paid', amount: -currentEntry.vendorCosts },
      { label: 'Partner draw paid', amount: -currentEntry.partnerDraw },
      { label: 'Line of credit interest paid', amount: -currentEntry.locInterest },
    ].filter(item => item.amount !== 0)
    : [];
  const waterfallItems: WaterfallItem[] = [
    ...(openingCash !== null ? [{ label: 'Opening cash', amount: openingCash, isBalance: true }] : []),
    ...(currentEntry?.collections ? [{ label: 'Client collections', amount: currentEntry.collections }] : []),
    ...recurringItems,
    ...movementItems,
    { label: 'Ending cash', amount: currentEntry?.cashOnHand ?? financials.cashOnHand, isBalance: true },
  ];
  const cashReconciliationDifference = openingCash === null || !currentEntry ? 0 :
    currentEntry.cashOnHand - (openingCash + currentEntry.collections +
      recurringItems.reduce((sum, item) => sum + item.amount, 0) +
      currentEntry.cashMovements.reduce((sum, movement) => sum + movement.amount, 0));

  // Completed cash months are the evidence for the projection. Opening
  // snapshots and one-time decisions are excluded from its recurring run rate.
  const completedCashMonths = financialHistory
    .filter(entry => !entry.isOpeningSnapshot && entry.recurringCashExpensesPaid !== null)
    .slice(-3);
  const avgCollections = completedCashMonths.reduce((sum, entry) => sum + entry.collections, 0) / Math.max(1, completedCashMonths.length);
  const avgExpenses = completedCashMonths.reduce((sum, entry) => sum + (entry.recurringCashExpensesPaid ?? 0), 0) / Math.max(1, completedCashMonths.length);
  const monthlyNetCashFlow = avgCollections - avgExpenses;

  const projections = [1, 2, 3].map(m => ({
    month: `Month +${m}`,
    projected: Math.round(financials.cashOnHand + monthlyNetCashFlow * m),
  }));

  // Months of runway at current burn rate
  const monthlyBurn = financials.totalPayroll + financials.totalOperatingCosts +
    financials.totalVendorCosts + financials.partnerDrawThisMonth + locInterest;
  const runway = monthlyBurn > 0 ? Math.round((financials.cashOnHand + locAvailable) / monthlyBurn) : null;

  const handleLOCAction = () => {
    if (!validLOCAmount) return;
    if (locAction === 'draw') {
      drawLineOfCredit(locAmount);
    } else {
      repayLineOfCredit(locAmount);
    }
    setLocDialogOpen(false);
    setLocAmount(0);
  };

  const openDraw = () => { setLocAction('draw'); setLocAmount(Math.min(10000, locAvailable)); setLocDialogOpen(true); };
  const openRepay = () => { setLocAction('repay'); setLocAmount(Math.min(10000, repayMaximum)); setLocDialogOpen(true); };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Cash Flow & Line of Credit <HelpTooltip helpId="finance-cash-flow" />
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
              <Typography variant="h6" color={runway !== null && runway < 3 ? 'error.main' : runway !== null && runway < 6 ? 'warning.main' : 'success.main'}>
                {runway === null ? '—' : `${runway} mo`}
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
              {currentEntry?.isOpeningSnapshot && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {openingCash === null
                    ? 'This older saved month has no recorded opening cash balance. Its ending balance is preserved, but a full reconciliation is unavailable.'
                    : 'Opening snapshot: the January P&L shows the firm’s starting run rate; recurring cash expenses have not been paid yet.'}
                </Typography>
              )}
              <TableContainer>
                <Table size="small" aria-label="Current-month cash activity">
                  <TableHead>
                    <TableRow>
                      <TableCell>Cash activity</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {waterfallItems.map(item => (
                      <TableRow key={item.label} sx={item.isBalance ? { bgcolor: 'action.hover' } : {}}>
                        <TableCell component="th" scope="row" sx={{ fontWeight: item.isBalance ? 'bold' : 'normal' }}>
                          {item.label}
                        </TableCell>
                        <TableCell align="right" sx={{
                          fontWeight: item.isBalance ? 'bold' : 'normal',
                          color: item.isBalance ? (item.amount >= 0 ? 'text.primary' : 'error.main') : item.amount >= 0 ? 'success.main' : 'error.main',
                          whiteSpace: 'nowrap',
                        }}>
                          {formatCash(item.amount, item.isBalance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {movementTotals.unclassified !== undefined && movementTotals.unclassified !== 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Unclassified prior activity comes from a save made before cash categories were recorded.
                </Typography>
              )}
              {Math.abs(cashReconciliationDifference) > 0.01 && (
                <Typography variant="body2" color="error.main" role="status" sx={{ mt: 1 }}>
                  Cash activity differs from the ending balance by ${Math.abs(Math.round(cashReconciliationDifference)).toLocaleString()}.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* LOC + Projections */}
        <Grid size={{ xs: 12, md: 6 }}>
          {/* Line of Credit */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title={<>Line of Credit <HelpTooltip helpId="finance-loc" /></>} subheader={`${(lineOfCredit.interestRate * 100).toFixed(1)}% APR`} />
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
                <Button variant="outlined" size="small" color="success" onClick={openRepay} disabled={repayMaximum === 0}>
                  Repay
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardHeader title={<>Tax Position <HelpTooltip helpId="finance-tax-payable" /></>} subheader="Estimated unpaid balance" />
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Typography variant="body2">Estimated tax due</Typography>
                <Typography variant="body2">${state.taxPosition.principalDue.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 1 }}>
                <Typography variant="body2">Late charges due</Typography>
                <Typography variant="body2">${state.taxPosition.penaltiesDue.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight="bold">Total payable</Typography>
                <Typography variant="body2" fontWeight="bold">${taxBalance.toLocaleString()}</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                Tax expense is recorded when estimated; cash changes only when a tax payment is made through the inbox.
              </Typography>
            </CardContent>
          </Card>

          {/* Cash Projection */}
          <Card>
            <CardHeader title="3-Month Cash Projection" />
            <CardContent>
              {completedCashMonths.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Advance one month to see a projection based on actual collections and recurring cash payments.
                </Typography>
              ) : <TableContainer>
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
              </TableContainer>}
              {completedCashMonths.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Based on the last {completedCashMonths.length} completed cash {completedCashMonths.length === 1 ? 'month' : 'months'}: average collections minus recurring payments ({formatCash(monthlyNetCashFlow)}/mo). One-time decisions are excluded.
                </Typography>
              )}
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
            error={!validLOCAmount}
            slotProps={{ htmlInput: { min: 0, max: locMaximum, step: 1 } }}
            sx={{ mt: 1 }}
            helperText={locAction === 'draw'
              ? `Available to draw: $${locAvailable.toLocaleString()}`
              : `Maximum repayable now: $${repayMaximum.toLocaleString()} (balance: $${lineOfCredit.drawn.toLocaleString()})`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleLOCAction} variant="contained" color={locAction === 'draw' ? 'primary' : 'success'} disabled={!validLOCAmount}>
            {locAction === 'draw' ? 'Draw' : 'Repay'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
