"use client";

import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useSimulation } from '@/context/SimulationContext';
import { getARTotal } from '@/types/simulation';
import HelpTooltip from '@/components/help/HelpTooltip';

export default function ARManager() {
  const { state, writeOffAR, collectAR } = useSimulation();
  const [writeOffOpen, setWriteOffOpen] = useState(false);
  const [writeOffAmount, setWriteOffAmount] = useState(0);

  const { arAging, clients, financialHistory } = state;
  const totalAR = getARTotal(arAging);

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
    { bucket: '0-30 days', amount: arAging.current, color: '#4caf50' },
    { bucket: '31-60 days', amount: arAging.thirtyDay, color: '#ff9800' },
    { bucket: '61-90 days', amount: arAging.sixtyDay, color: '#f44336' },
    { bucket: '90+ days', amount: arAging.ninetyPlus, color: '#9c27b0' },
  ];

  // Client AR estimates (proportional to monthly fee)
  const clientARData = clients.map(c => {
    const proportion = state.financials.grossRevenue > 0 ? c.monthlyFee / state.financials.grossRevenue : 0;
    return {
      name: c.name,
      current: Math.round(arAging.current * proportion),
      thirtyDay: Math.round(arAging.thirtyDay * proportion),
      sixtyDay: Math.round(arAging.sixtyDay * proportion),
      ninetyPlus: Math.round(arAging.ninetyPlus * proportion),
      total: Math.round(totalAR * proportion),
      paymentProfile: c.paymentProfile,
    };
  });

  const handleWriteOff = () => {
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
              <Typography variant="caption" color="text.secondary">Collection Rate (3mo) <HelpTooltip helpId="finance-collections" /></Typography>
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
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button variant="contained" size="small" onClick={collectAR} disabled={arAging.thirtyDay + arAging.sixtyDay + arAging.ninetyPlus === 0}>
          Run Collections
        </Button>
        <Button variant="outlined" size="small" color="error" onClick={() => { setWriteOffAmount(arAging.ninetyPlus); setWriteOffOpen(true); }} disabled={arAging.ninetyPlus === 0}>
          Write Off 90+ ({`$${Math.round(arAging.ninetyPlus).toLocaleString()}`})
        </Button>
      </Box>

      {/* Aging Chart */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={agingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bucket" />
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

      {/* Client-by-Client AR Table */}
      <TableContainer component={Paper}>
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
            </TableRow>
          </TableHead>
          <TableBody>
            {clientARData.map(c => (
              <TableRow key={c.name} hover>
                <TableCell>{c.name}</TableCell>
                <TableCell align="right">${c.current.toLocaleString()}</TableCell>
                <TableCell align="right" sx={{ color: c.thirtyDay > 0 ? 'warning.main' : 'text.primary' }}>${c.thirtyDay.toLocaleString()}</TableCell>
                <TableCell align="right" sx={{ color: c.sixtyDay > 0 ? 'error.main' : 'text.primary' }}>${c.sixtyDay.toLocaleString()}</TableCell>
                <TableCell align="right" sx={{ color: c.ninetyPlus > 0 ? 'error.main' : 'text.primary' }}>${c.ninetyPlus.toLocaleString()}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>${c.total.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    label={c.paymentProfile}
                    size="small"
                    color={c.paymentProfile === 'prompt' ? 'success' : c.paymentProfile === 'normal' ? 'warning' : 'error'}
                  />
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
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Write-off Dialog */}
      <Dialog open={writeOffOpen} onClose={() => setWriteOffOpen(false)}>
        <DialogTitle>Write Off Bad Debt</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Writing off AR removes it from your books as uncollectable. This is recognized as a bad debt expense.
          </Typography>
          <TextField
            label="Write-off Amount"
            type="number"
            fullWidth
            value={writeOffAmount}
            onChange={(e) => setWriteOffAmount(Number(e.target.value))}
            helperText={`Maximum: $${Math.round(arAging.ninetyPlus).toLocaleString()} (90+ day balance)`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWriteOffOpen(false)}>Cancel</Button>
          <Button onClick={handleWriteOff} variant="contained" color="error">Write Off</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
