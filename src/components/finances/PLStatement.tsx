"use client";

import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider } from '@mui/material';
import { useSimulation } from '@/context/SimulationContext';
import { getOperatingCostsTotal } from '@/types/simulation';
import HelpTooltip from '@/components/help/HelpTooltip';

export default function PLStatement() {
  const { state } = useSimulation();

  const { financials, financialHistory } = state;

  // Current month values
  const revenue = financials.grossRevenue;
  const payroll = financials.totalPayroll;
  const grossMargin = revenue - payroll;
  const grossMarginPct = revenue > 0 ? (grossMargin / revenue * 100) : 0;

  const opCosts = financials.totalOperatingCosts;
  const vendorCosts = financials.totalVendorCosts;
  const totalOpEx = opCosts + vendorCosts;
  const operatingIncome = grossMargin - totalOpEx;
  const operatingMarginPct = revenue > 0 ? (operatingIncome / revenue * 100) : 0;

  const partnerDraw = financials.partnerDrawThisMonth;
  const locInterest = financials.locInterestThisMonth;
  const netIncome = operatingIncome - partnerDraw - locInterest;
  const netMarginPct = revenue > 0 ? (netIncome / revenue * 100) : 0;

  // YTD values
  const ytdHistory = financialHistory.filter(h => h.year === state.year);
  const ytdRevenue = ytdHistory.reduce((s, h) => s + h.revenue, 0);
  const ytdPayroll = ytdHistory.reduce((s, h) => s + h.payroll, 0);
  const ytdGrossMargin = ytdRevenue - ytdPayroll;
  const ytdOpCosts = ytdHistory.reduce((s, h) => s + h.operatingCosts, 0);
  const ytdVendorCosts = ytdHistory.reduce((s, h) => s + h.vendorCosts, 0);
  const ytdTotalOpEx = ytdOpCosts + ytdVendorCosts;
  const ytdOperatingIncome = ytdGrossMargin - ytdTotalOpEx;
  const ytdPartnerDraw = ytdHistory.reduce((s, h) => s + h.partnerDraw, 0);
  const ytdLOCInterest = ytdHistory.reduce((s, h) => s + h.locInterest, 0);
  const ytdNetIncome = ytdOperatingIncome - ytdPartnerDraw - ytdLOCInterest;

  const fmt = (val: number) => `$${Math.round(val).toLocaleString()}`;
  const pct = (val: number, total: number) => total > 0 ? `${(val / total * 100).toFixed(1)}%` : '—';

  const rows: { label: string; current: number; ytd: number; isBold?: boolean; isSubtotal?: boolean; showPct?: boolean; helpId?: string }[] = [
    { label: 'Revenue', current: revenue, ytd: ytdRevenue, isBold: true },
    { label: 'Cost of Revenue (Payroll)', current: payroll, ytd: ytdPayroll },
    { label: 'Gross Margin', current: grossMargin, ytd: ytdGrossMargin, isBold: true, isSubtotal: true, showPct: true, helpId: 'finance-gross-margin' },
    { label: 'Rent', current: state.operatingCosts.rent, ytd: state.operatingCosts.rent * ytdHistory.length },
    { label: 'Insurance', current: state.operatingCosts.insurance, ytd: state.operatingCosts.insurance * ytdHistory.length },
    { label: 'Technology', current: state.operatingCosts.technology, ytd: state.operatingCosts.technology * ytdHistory.length },
    { label: 'Compliance', current: state.operatingCosts.compliance, ytd: state.operatingCosts.compliance * ytdHistory.length },
    { label: 'Misc Overhead', current: state.operatingCosts.misc, ytd: state.operatingCosts.misc * ytdHistory.length },
    { label: 'Vendor Services', current: vendorCosts, ytd: ytdVendorCosts },
    { label: 'Total Operating Expenses', current: totalOpEx, ytd: ytdTotalOpEx, isBold: true, isSubtotal: true },
    { label: 'Operating Income', current: operatingIncome, ytd: ytdOperatingIncome, isBold: true, isSubtotal: true, showPct: true, helpId: 'finance-operating-margin' },
    { label: 'Partner Draw', current: partnerDraw, ytd: ytdPartnerDraw },
    { label: 'LOC Interest', current: locInterest, ytd: ytdLOCInterest },
    { label: 'Net Income', current: netIncome, ytd: ytdNetIncome, isBold: true, isSubtotal: true, showPct: true, helpId: 'finance-pl' },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Profit & Loss Statement <HelpTooltip helpId="finance-pl" />
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Month {state.month}, {state.year}
      </Typography>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Line Item</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Current Month</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>% of Revenue</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Year-to-Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>YTD %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={row.label}
                sx={{
                  ...(row.isSubtotal ? { borderTop: '2px solid', borderColor: 'divider' } : {}),
                  bgcolor: row.isSubtotal ? 'action.hover' : 'transparent',
                }}
              >
                <TableCell sx={{ fontWeight: row.isBold ? 'bold' : 'normal', pl: row.isSubtotal ? 2 : 4 }}>
                  {row.label}
                  {row.helpId && <> <HelpTooltip helpId={row.helpId} /></>}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: row.isBold ? 'bold' : 'normal', color: row.current < 0 ? 'error.main' : row.isSubtotal && row.current > 0 ? 'success.main' : 'text.primary' }}>
                  {fmt(row.current)}
                </TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary' }}>
                  {row.showPct ? pct(row.current, revenue) : ''}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: row.isBold ? 'bold' : 'normal', color: row.ytd < 0 ? 'error.main' : row.isSubtotal && row.ytd > 0 ? 'success.main' : 'text.primary' }}>
                  {fmt(row.ytd)}
                </TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary' }}>
                  {row.showPct ? pct(row.ytd, ytdRevenue) : ''}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
