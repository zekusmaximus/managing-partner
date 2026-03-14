"use client";

import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, CardContent, CardHeader, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider } from '@mui/material';
import { useSimulation } from '@/context/SimulationContext';
import HelpTooltip from '@/components/help/HelpTooltip';

export default function PartnerEconomicsView() {
  const { state, setPartnerDraw } = useSimulation();
  const [drawDialogOpen, setDrawDialogOpen] = useState(false);
  const [newDrawAmount, setNewDrawAmount] = useState(state.partnerEconomics.monthlyDraw);

  const { partnerEconomics, financialHistory, financials } = state;

  // Trailing 12-month profit
  const trailing12 = financialHistory.slice(-12);
  const trailing12Profit = trailing12.reduce((s, h) => s + h.profit, 0);
  const avgMonthlyProfit = trailing12.length > 0 ? trailing12Profit / trailing12.length : 0;

  // Simplified equity value: 1.5x trailing 12-month profit
  const equityValue = Math.max(0, Math.round(trailing12Profit * 1.5));

  // Total compensation (draw + distributions) this year
  const ytdHistory = financialHistory.filter(h => h.year === state.year);
  const ytdDraws = ytdHistory.reduce((s, h) => s + h.partnerDraw, 0);
  const totalCompThisYear = ytdDraws + partnerEconomics.totalDistributed;

  // Draw as % of revenue
  const drawPctRevenue = financials.grossRevenue > 0
    ? (partnerEconomics.monthlyDraw / financials.grossRevenue * 100)
    : 0;

  const handleSaveDraw = () => {
    setPartnerDraw(newDrawAmount);
    setDrawDialogOpen(false);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Partner Economics <HelpTooltip helpId="finance-partner-draw" />
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Monthly Draw <HelpTooltip helpId="finance-partner-draw" /></Typography>
              <Typography variant="h6" color="primary.main">
                ${partnerEconomics.monthlyDraw.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {drawPctRevenue.toFixed(1)}% of revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Distribution Pool</Typography>
              <Typography variant="h6" color={partnerEconomics.distributionPool > 0 ? 'success.main' : 'text.secondary'}>
                ${Math.round(partnerEconomics.distributionPool).toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Available for distribution
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Total Distributed</Typography>
              <Typography variant="h6">
                ${partnerEconomics.totalDistributed.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                All time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Equity Value <HelpTooltip helpId="finance-partner-equity" /></Typography>
              <Typography variant="h6" color="primary.main">
                ${equityValue.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                1.5x T12 profit
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Partner Compensation Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Compensation Summary" subheader={`Year ${state.year}`} />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Monthly Draw</TableCell>
                      <TableCell align="right">${partnerEconomics.monthlyDraw.toLocaleString()}/mo</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Annual Draw (projected)</TableCell>
                      <TableCell align="right">${(partnerEconomics.monthlyDraw * 12).toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>YTD Draws Taken</TableCell>
                      <TableCell align="right">${Math.round(ytdDraws).toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>YTD Distributions</TableCell>
                      <TableCell align="right">${partnerEconomics.totalDistributed.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Total Compensation (YTD)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>${Math.round(totalCompThisYear).toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => { setNewDrawAmount(partnerEconomics.monthlyDraw); setDrawDialogOpen(true); }}>
                Adjust Monthly Draw
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Firm Valuation */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Firm Economics" />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>Trailing 12-Month Revenue</TableCell>
                      <TableCell align="right">${trailing12.reduce((s, h) => s + h.revenue, 0).toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Trailing 12-Month Profit</TableCell>
                      <TableCell align="right" sx={{ color: trailing12Profit >= 0 ? 'success.main' : 'error.main' }}>
                        ${Math.round(trailing12Profit).toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Avg Monthly Profit</TableCell>
                      <TableCell align="right" sx={{ color: avgMonthlyProfit >= 0 ? 'success.main' : 'error.main' }}>
                        ${Math.round(avgMonthlyProfit).toLocaleString()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Profit Margin</TableCell>
                      <TableCell align="right">
                        {trailing12.reduce((s, h) => s + h.revenue, 0) > 0
                          ? `${(trailing12Profit / trailing12.reduce((s, h) => s + h.revenue, 0) * 100).toFixed(1)}%`
                          : '—'}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Estimated Firm Value</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        ${equityValue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Simplified valuation: 1.5x trailing 12-month net profit. Real valuations consider client retention, staff quality, brand value, and more.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Adjust Draw Dialog */}
      <Dialog open={drawDialogOpen} onClose={() => setDrawDialogOpen(false)}>
        <DialogTitle>Adjust Monthly Partner Draw</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your draw is a guaranteed monthly payment before profit distributions. A higher draw provides steady income but reduces the distribution pool and cash reserves.
          </Typography>
          <TextField
            label="Monthly Draw Amount"
            type="number"
            fullWidth
            value={newDrawAmount}
            onChange={(e) => setNewDrawAmount(Number(e.target.value))}
            helperText={`Current: $${partnerEconomics.monthlyDraw.toLocaleString()}/mo`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDrawDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveDraw} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
