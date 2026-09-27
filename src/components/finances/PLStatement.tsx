"use client";

import { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useSimulation } from '@/context/SimulationContext';
import { calculateProfitAndLoss } from '@/lib/simulation/metrics';
import HelpTooltip from '@/components/help/HelpTooltip';

export default function PLStatement() {
  const { state } = useSimulation();
  const [mobilePeriod, setMobilePeriod] = useState<'month' | 'ytd'>('month');

  const currentEntry = state.financialHistory.at(-1);
  const current = calculateProfitAndLoss(currentEntry ? [currentEntry] : []);
  const ytd = calculateProfitAndLoss(state.financialHistory.filter(entry => entry.year === state.year));
  const revenue = current.revenue;
  const ytdRevenue = ytd.revenue;

  const fmt = (val: number) => `$${Math.round(val).toLocaleString()}`;
  const pct = (val: number, total: number) => total > 0 ? `${(val / total * 100).toFixed(1)}%` : '—';

  const rows: { label: string; current: number; ytd: number; isBold?: boolean; isSubtotal?: boolean; showPct?: boolean; helpId?: string }[] = [
    { label: 'Revenue', current: current.revenue, ytd: ytd.revenue, isBold: true },
    { label: 'Cost of Revenue (Payroll)', current: current.payroll, ytd: ytd.payroll },
    { label: 'Gross Margin', current: current.grossMargin, ytd: ytd.grossMargin, isBold: true, isSubtotal: true, showPct: true, helpId: 'finance-gross-margin' },
    { label: 'Rent', current: current.operatingCosts.rent, ytd: ytd.operatingCosts.rent },
    { label: 'Insurance', current: current.operatingCosts.insurance, ytd: ytd.operatingCosts.insurance },
    { label: 'Technology', current: current.operatingCosts.technology, ytd: ytd.operatingCosts.technology },
    { label: 'Compliance', current: current.operatingCosts.compliance, ytd: ytd.operatingCosts.compliance },
    { label: 'Misc Overhead', current: current.operatingCosts.misc, ytd: ytd.operatingCosts.misc },
    { label: 'Vendor Services', current: current.vendorCosts, ytd: ytd.vendorCosts },
    { label: 'Staff Recovery Program', current: current.staffRecoveryExpenses, ytd: ytd.staffRecoveryExpenses, helpId: 'finance-staff-recovery' },
    { label: 'Other One-Time Operating Costs', current: current.oneTimeOperatingExpenses - current.staffRecoveryExpenses, ytd: ytd.oneTimeOperatingExpenses - ytd.staffRecoveryExpenses, helpId: 'finance-one-time-costs' },
    { label: 'Bad Debt Write-Off', current: current.arWriteOff, ytd: ytd.arWriteOff },
    { label: 'Total Operating Expenses', current: current.totalOperatingExpenses, ytd: ytd.totalOperatingExpenses, isBold: true, isSubtotal: true },
    { label: 'Operating Income', current: current.operatingIncome, ytd: ytd.operatingIncome, isBold: true, isSubtotal: true, showPct: true, helpId: 'finance-operating-margin' },
    { label: 'Partner Draw', current: current.partnerDraw, ytd: ytd.partnerDraw },
    { label: 'LOC Interest', current: current.locInterest, ytd: ytd.locInterest },
    { label: 'Estimated Tax Expense', current: current.taxExpense, ytd: ytd.taxExpense, helpId: 'finance-tax-expense' },
    { label: 'Late Tax Penalty', current: current.taxPenalty, ytd: ytd.taxPenalty },
    { label: 'Net Income', current: current.netIncome, ytd: ytd.netIncome, isBold: true, isSubtotal: true, showPct: true, helpId: 'finance-pl' },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Profit & Loss Statement <HelpTooltip helpId="finance-pl" />
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Month {state.month}, {state.year}
      </Typography>

      <Box data-tutorial-target="finance-stats-row">
        <ToggleButtonGroup
          value={mobilePeriod}
          exclusive
          onChange={(_, period: 'month' | 'ytd' | null) => { if (period) setMobilePeriod(period); }}
          size="small"
          aria-label="Statement period"
          fullWidth
          sx={{ display: { xs: 'flex', sm: 'none' }, mb: 1.5 }}
        >
          <ToggleButton value="month">This month</ToggleButton>
          <ToggleButton value="ytd">Year to date</ToggleButton>
        </ToggleButtonGroup>
        <TableContainer component={Paper} sx={{ maxWidth: '100%' }}>
        <Table size="small" aria-label="Profit and loss statement" sx={{ tableLayout: { xs: 'fixed', sm: 'auto' } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: { xs: '52%', sm: 'auto' }, px: { xs: 1, sm: 2 } }}>Line Item</TableCell>
              <TableCell align="right" sx={{ display: { xs: 'table-cell', sm: 'none' }, fontWeight: 'bold', width: '30%', px: 1 }}>Amount</TableCell>
              <TableCell align="right" sx={{ display: { xs: 'table-cell', sm: 'none' }, fontWeight: 'bold', width: '18%', px: 1 }}>%</TableCell>
              <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' }, fontWeight: 'bold' }}>Current Month</TableCell>
              <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' }, fontWeight: 'bold' }}>% of Revenue</TableCell>
              <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' }, fontWeight: 'bold' }}>Year-to-Date</TableCell>
              <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' }, fontWeight: 'bold' }}>YTD %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.label}
                sx={{
                  ...(row.isSubtotal ? { borderTop: '2px solid', borderColor: 'divider' } : {}),
                  bgcolor: row.isSubtotal ? 'action.hover' : 'transparent',
                }}
              >
                <TableCell sx={{ fontWeight: row.isBold ? 'bold' : 'normal', pl: { xs: row.isSubtotal ? 1 : 2, sm: row.isSubtotal ? 2 : 4 }, pr: { xs: 0.5, sm: 2 }, overflowWrap: 'anywhere' }}>
                  {row.label}
                  {row.helpId && <> <HelpTooltip helpId={row.helpId} /></>}
                </TableCell>
                <TableCell align="right" sx={{ display: { xs: 'table-cell', sm: 'none' }, px: 1, fontSize: '0.78rem', fontWeight: row.isBold ? 'bold' : 'normal', color: (mobilePeriod === 'month' ? row.current : row.ytd) < 0 ? 'error.main' : row.isSubtotal && (mobilePeriod === 'month' ? row.current : row.ytd) > 0 ? 'success.main' : 'text.primary' }}>
                  {fmt(mobilePeriod === 'month' ? row.current : row.ytd)}
                </TableCell>
                <TableCell align="right" sx={{ display: { xs: 'table-cell', sm: 'none' }, px: 1, fontSize: '0.78rem', color: 'text.secondary' }}>
                  {row.showPct ? pct(mobilePeriod === 'month' ? row.current : row.ytd, mobilePeriod === 'month' ? revenue : ytdRevenue) : ''}
                </TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' }, fontWeight: row.isBold ? 'bold' : 'normal', color: row.current < 0 ? 'error.main' : row.isSubtotal && row.current > 0 ? 'success.main' : 'text.primary' }}>
                  {fmt(row.current)}
                </TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' }, color: 'text.secondary' }}>
                  {row.showPct ? pct(row.current, revenue) : ''}
                </TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' }, fontWeight: row.isBold ? 'bold' : 'normal', color: row.ytd < 0 ? 'error.main' : row.isSubtotal && row.ytd > 0 ? 'success.main' : 'text.primary' }}>
                  {fmt(row.ytd)}
                </TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' }, color: 'text.secondary' }}>
                  {row.showPct ? pct(row.ytd, ytdRevenue) : ''}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
