"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useSimulation } from '@/context/SimulationContext';
import { getARTotal } from '@/types/simulation';
import HelpTooltip from '@/components/help/HelpTooltip';
import { isValidAmount } from '@/lib/simulation/engine';

export default function ARManager() {
  const { state, writeOffAR, collectAR } = useSimulation();
  const [writeOffOpen, setWriteOffOpen] = useState(false);
  const [writeOffAmount, setWriteOffAmount] = useState(0);

  const { arAging, clients, financialHistory, receivables } = state;
  const totalAR = getARTotal(arAging);
  const hasOverdueAR = arAging.thirtyDay + arAging.sixtyDay + arAging.ninetyPlus > 0;
  const collectionsRunThisMonth = state.lastManualCollection?.month === state.month &&
    state.lastManualCollection.year === state.year;
  const validWriteOff = isValidAmount(writeOffAmount) && writeOffAmount <= arAging.ninetyPlus;
  const collectionPreview = receivables.reduce((total, account) => {
    const collectFrom = (balance: number, rate: number) => Math.min(balance, Math.round(balance * rate));
    return total + collectFrom(account.aging.thirtyDay, 0.3) +
      collectFrom(account.aging.sixtyDay, 0.3) + collectFrom(account.aging.ninetyPlus, 0.15);
  }, 0);
  const money = (amount: number) => `$${Math.round(amount).toLocaleString()}`;

  // DSO calculation: (total AR / avg daily revenue)
  const avgMonthlyRevenue = financialHistory.length > 0
    ? financialHistory.reduce((s, h) => s + h.revenue, 0) / financialHistory.length
    : state.financials.grossRevenue;
  const avgDailyRevenue = avgMonthlyRevenue / 30;
  const dso = avgDailyRevenue > 0 ? Math.round(totalAR / avgDailyRevenue) : 0;

  // Collection rate: collections / revenue over trailing period
  const trailingCollections = financialHistory.slice(-3).reduce((s, h) => s + h.collections, 0);
  const trailingRevenue = financialHistory.slice(-3).reduce((s, h) => s + h.revenue, 0);
  const collectionRate = trailingRevenue > 0 ? (trailingCollections / trailingRevenue * 100) : 0;

  const agingData = [
    { bucket: '0–30', amount: arAging.current, color: '#4caf50' },
    { bucket: '31–60', amount: arAging.thirtyDay, color: '#ff9800' },
    { bucket: '61–90', amount: arAging.sixtyDay, color: '#f44336' },
    { bucket: '90+', amount: arAging.ninetyPlus, color: '#9c27b0' },
  ];

  // Rows are backed by actual per-client aging balances, including former clients.
  const clientARData = receivables.filter(account =>
    getARTotal(account.aging) > 0 || (account.clientId !== null && clients.some(client => client.id === account.clientId))
  ).map(account => {
    const active = account.clientId !== null && clients.some(client => client.id === account.clientId);
    return {
      id: account.clientId ?? 'unassigned',
      name: active || account.clientId === null ? account.clientName : `${account.clientName} (former client)`,
      current: account.aging.current,
      thirtyDay: account.aging.thirtyDay,
      sixtyDay: account.aging.sixtyDay,
      ninetyPlus: account.aging.ninetyPlus,
      total: getARTotal(account.aging),
      paymentProfile: account.paymentProfile,
      unassigned: account.clientId === null,
      active,
    };
  });

  const handleWriteOff = () => {
    if (!validWriteOff) return;
    writeOffAR(writeOffAmount);
    setWriteOffOpen(false);
    setWriteOffAmount(0);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Accounts Receivable <HelpTooltip helpId="finance-dso" />
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Total AR</Typography>
              <Typography variant="h6" color={totalAR > avgMonthlyRevenue * 2 ? 'error.main' : 'primary.main'}>
                ${Math.round(totalAR).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Days Sales Outstanding <HelpTooltip helpId="finance-dso" /></Typography>
              <Typography variant="h6" color={dso > 45 ? 'error.main' : dso > 30 ? 'warning.main' : 'success.main'}>
                {dso} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Collections / Billings (3mo) <HelpTooltip helpId="finance-collections" /></Typography>
              <Typography variant="h6" color={collectionRate < 80 ? 'error.main' : collectionRate < 90 ? 'warning.main' : 'success.main'}>
                {collectionRate.toFixed(0)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Overdue (60+)</Typography>
              <Typography variant="h6" color={arAging.sixtyDay + arAging.ninetyPlus > 0 ? 'error.main' : 'success.main'}>
                ${Math.round(arAging.sixtyDay + arAging.ninetyPlus).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Button variant="contained" size="small" onClick={collectAR} disabled={!hasOverdueAR || collectionsRunThisMonth}>
          {collectionsRunThisMonth ? 'Collections Run This Month' : 'Run Collections'}
        </Button>
        <Button variant="outlined" size="small" color="error" onClick={() => { setWriteOffAmount(arAging.ninetyPlus); setWriteOffOpen(true); }} disabled={arAging.ninetyPlus === 0}>
          Write off and close collection efforts
        </Button>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5, mb: 3 }}>
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Typography variant="subtitle2">Run Collections</Typography>
          <Typography variant="body2" color="success.main">
            {collectionsRunThisMonth ? 'This month’s collection attempt has already been used.'
              : hasOverdueAR ? `+${money(collectionPreview)} cash now from overdue invoices; the same amount leaves AR.`
                : 'No overdue invoices are available to collect.'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Uses this month&apos;s one manual collection attempt, separate from partner interventions. It does not directly change client satisfaction or add an expense.
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Typography variant="subtitle2">Write off and close collection efforts</Typography>
          <Typography variant="body2" color="success.main">
            + Clears the amount you choose from the {money(arAging.ninetyPlus)} 90+ day balance.
          </Typography>
          <Typography variant="body2" color="error.main">
            − The same amount becomes bad debt expense and reduces this month&apos;s profit. No cash comes in, and that balance can no longer be collected.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This game combines two decisions. An accounting write-off alone does not necessarily cancel a debt.
          </Typography>
        </Paper>
      </Box>

      {/* Aging Chart */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={agingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bucket" interval={0} tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value) => `$${Math.round(Number(value)).toLocaleString()}`} />
            <Bar dataKey="amount" name="AR Balance">
              {agingData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Recorded balances by client. Opening balances without a known client appear as unassigned; former clients remain until their balance is resolved.
      </Typography>

      {/* Actual client receivables, with opening unassigned balances shown separately. */}
      <TableContainer component={Paper} data-tutorial-target="ar-aging-table">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>0-30</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>31-60</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>61-90</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>90+</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Profile</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientARData.map(c => (
              <TableRow key={c.id} hover>
                <TableCell>{c.name}</TableCell>
                <TableCell align="right">${c.current.toLocaleString()}</TableCell>
                <TableCell align="right" sx={{ color: c.thirtyDay > 0 ? 'warning.main' : 'text.primary' }}>${c.thirtyDay.toLocaleString()}</TableCell>
                <TableCell align="right" sx={{ color: c.sixtyDay > 0 ? 'error.main' : 'text.primary' }}>${c.sixtyDay.toLocaleString()}</TableCell>
                <TableCell align="right" sx={{ color: c.ninetyPlus > 0 ? 'error.main' : 'text.primary' }}>${c.ninetyPlus.toLocaleString()}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>${c.total.toLocaleString()}</TableCell>
                <TableCell>
                  {!c.unassigned && <Chip
                    label={c.paymentProfile}
                    size="small"
                    color={c.paymentProfile === 'prompt' ? 'success' : c.paymentProfile === 'normal' ? 'warning' : 'error'}
                  />}
                </TableCell>
                <TableCell>
                  {c.active && c.thirtyDay + c.sixtyDay + c.ninetyPlus > 0 && (
                    <Button component={Link} href={`/clients?clientId=${encodeURIComponent(c.id)}`} size="small" aria-label={`Meet with ${c.name}`}>
                      Meet client
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>${Math.round(arAging.current).toLocaleString()}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>${Math.round(arAging.thirtyDay).toLocaleString()}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>${Math.round(arAging.sixtyDay).toLocaleString()}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>${Math.round(arAging.ninetyPlus).toLocaleString()}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>${Math.round(totalAR).toLocaleString()}</TableCell>
              <TableCell />
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Write-off Dialog */}
      <Dialog open={writeOffOpen} onClose={() => setWriteOffOpen(false)}>
        <DialogTitle>Write off and close collection efforts</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose how much of the 90+ day balance to remove from AR and stop collecting in this game.
            An accounting write-off alone does not necessarily cancel a debt.
          </Typography>
          <TextField
            label="Write-off Amount"
            type="number"
            fullWidth
            value={writeOffAmount}
            onChange={(e) => setWriteOffAmount(Number(e.target.value))}
            error={!validWriteOff}
            helperText={`Maximum: $${Math.round(arAging.ninetyPlus).toLocaleString()} (90+ day balance)`}
            slotProps={{ htmlInput: { min: 0, max: arAging.ninetyPlus, step: 1 } }}
          />
          {validWriteOff && <Paper variant="outlined" sx={{ p: 1.5, mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Effect of writing off and closing collection of {money(writeOffAmount)}</Typography>
            <Typography variant="body2" color="success.main">
              + 90+ day AR falls by {money(writeOffAmount)} to {money(arAging.ninetyPlus - writeOffAmount)}.
            </Typography>
            <Typography variant="body2" color="error.main">
              − Bad debt expense rises and this month&apos;s profit falls by {money(writeOffAmount)}.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cash stays at {money(state.financials.cashOnHand)}. The written-off amount cannot be collected later.
            </Typography>
          </Paper>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWriteOffOpen(false)}>Cancel</Button>
          <Button onClick={handleWriteOff} variant="contained" color="error" disabled={!validWriteOff}>Write off and close collection efforts</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
