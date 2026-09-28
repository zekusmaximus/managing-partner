"use client";

import React from 'react';
import { Alert, AlertTitle, Box, Button, Grid, Typography, Card, CardContent, CardHeader, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import Link from 'next/link';
import { useSimulation } from '@/context/SimulationContext';
import { getEmployeeTotalCost, getARTotal, getLOCAvailable } from '@/types/simulation';
import type { Alert as SimulationAlert, SimulationState } from '@/types/simulation';
import HelpTooltip from '@/components/help/HelpTooltip';
import { calculateProfitAndLoss } from '@/lib/simulation/metrics';
import { getClientServiceCoverage } from '@/lib/simulation/clientService';
import { selectCurrentAlerts, selectOutcomeAlerts } from '@/lib/simulation/alerts';

type AlertAction = { label: string; href: string };
type AlertGuidance = { impact?: string; consequence: string; actions: AlertAction[] };

const outcomeGamePeriod = (alert: SimulationAlert): string => {
  const match = alert.id.match(/^(?:contract-renewed|contract-churned|service-shortfall|client-meeting)-(\d{4})-(\d{1,2})(?:-|$)/);
  if (!match) return 'Earlier result';
  const year = Number(match[1]);
  const month = Number(match[2]);
  return month >= 1 && month <= 12
    ? new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    : 'Earlier result';
};

const getAlertGuidance = (alert: SimulationAlert, state: SimulationState): AlertGuidance | null => {
  const message = alert.message;
  const target = alert.actionTarget;
  const client = target?.kind === 'client'
    ? state.clients.find(candidate => candidate.id === target.clientId)
    : state.clients.find(candidate =>
      message.startsWith(`${candidate.name}'s contract expires in `) ||
      message.startsWith(`${candidate.name}'s satisfaction dropped to `) ||
      message.startsWith(`${candidate.name} satisfaction is critically low at `));
  const clientHref = client ? `/clients?clientId=${encodeURIComponent(client.id)}` : '/clients';

  if (message.includes('contract expires in ')) {
    const stillExpiring = client && client.contractMonthsRemaining > 0 && client.contractMonthsRemaining <= 3;
    const contractedRevenue = state.clients.reduce((sum, activeClient) => sum + activeClient.monthlyFee, 0);
    const revenueShare = stillExpiring && contractedRevenue > 0
      ? `${(client.monthlyFee / contractedRevenue * 100).toFixed(1)}% of current contracted monthly revenue`
      : null;
    return {
      impact: stillExpiring
        ? `Monthly fee at risk: $${client.monthlyFee.toLocaleString()}/mo${revenueShare ? ` (${revenueShare})` : ''}.`
        : 'This warning reflects an earlier contract term. Check the current client roster.',
      consequence: stillExpiring
        ? 'If this client leaves, monthly billing falls by this fee. Satisfaction and service coverage affect renewal odds.'
        : 'Review the current contract before deciding whether to act.',
      actions: [{ label: stillExpiring ? 'Discuss renewal' : client ? 'Review client' : 'Review client roster', href: clientHref }],
    };
  }
  if (message.includes('satisfaction dropped to ') || message.includes('satisfaction is critically low at ')) return {
    consequence: 'Low satisfaction makes a future renewal less likely.',
    actions: [{ label: client ? 'Meet with client' : 'Review client roster', href: clientHref }],
  };
  if (target?.kind === 'ar' || (message.includes('in AR is ') && message.includes('days overdue'))) {
    const isNinetyPlus = message.includes('90+ days overdue');
    const overdueClients = state.receivables.filter(account =>
      account.clientId !== null &&
      state.clients.some(active => active.id === account.clientId) &&
      (isNinetyPlus ? account.aging.ninetyPlus : account.aging.sixtyDay) > 0);
    const meetingHref = overdueClients.length === 1 && overdueClients[0].clientId
      ? `/clients?clientId=${encodeURIComponent(overdueClients[0].clientId)}`
      : '/clients';
    return {
      consequence: isNinetyPlus
        ? 'Try to collect overdue invoices before deciding whether to recognize an uncollectible balance as bad debt. A write-off brings in no cash.'
        : 'Unpaid invoices delay cash and can age into the 90+ day bucket.',
      actions: [
        { label: 'Review collections', href: '/finances#accounts-receivable' },
        ...(overdueClients.length > 0 ? [{ label: overdueClients.length === 1 ? 'Meet with client' : 'Review client meetings', href: meetingHref }] : []),
      ],
    };
  }
  if (target?.kind === 'clients' || alert.id.startsWith('service-shortfall-')) return {
    consequence: 'Insufficient service coverage lowers satisfaction and renewal odds each month.',
    actions: [
      { label: 'Review staffing', href: '/hr' },
      { label: 'Meet with a client', href: '/clients' },
    ],
  };
  if (message.includes('burnout is at ') || message.includes('% burnout!')) return {
    consequence: 'Burnout lowers staff effectiveness and the firm\'s capacity to serve clients.',
    actions: [{ label: 'Review staff options', href: '/hr' }],
  };
  if (message === 'Cash on hand is critically low!') return {
    consequence: 'Low cash can trigger a credit draw or leave the firm unable to fund upcoming expenses.',
    actions: [{ label: 'Review cash flow', href: '/finances#cash-flow' }],
  };
  if (message.startsWith('Line of credit balance:')) return {
    consequence: 'An outstanding balance incurs monthly interest and uses available credit.',
    actions: [{ label: 'Review credit controls', href: '/finances#credit-controls' }],
  };
  if (message.includes(' budget exceeded by ')) return {
    consequence: 'Spending above plan reduces cash and profit while it continues.',
    actions: [{ label: 'Review budget', href: '/finances#budget' }],
  };
  if (alert.id.startsWith('contract-churned-')) return {
    consequence: 'That contract stopped billing when the client left. Receivables from that contract may still be collectible.',
    actions: [{ label: 'Review receivables', href: '/finances#accounts-receivable' }],
  };
  return null;
};

export const Dashboard = () => {
  const { state, dismissAlert } = useSimulation();
  const currentAlerts = selectCurrentAlerts(state);
  const outcomeAlerts = selectOutcomeAlerts(state);

  // Format financial history for chart
  const chartData = state.financialHistory.map(entry => ({
    name: `M${entry.month}/${entry.year.toString().slice(-2)}`,
    revenue: entry.revenue,
    expenses: entry.expenses,
    profit: entry.profit,
    collections: entry.collections,
  }));

  // Quick stats
  const avgEmployeeBurnout = state.employees.length > 0
    ? state.employees.reduce((sum, e) => sum + e.burnout, 0) / state.employees.length
    : 0;

  const avgClientSatisfaction = state.clients.length > 0
    ? state.clients.reduce((sum, c) => sum + c.satisfaction, 0) / state.clients.length
    : 0;

  const totalPayroll = state.employees.reduce((sum, e) => sum + getEmployeeTotalCost(e), 0);
  const totalClientRevenue = state.clients.reduce((sum, c) => sum + c.monthlyFee, 0);
  const serviceCoverage = getClientServiceCoverage(state);
  const unreadMessages = state.inbox.filter(message => !message.read).length;
  const nextAction = currentAlerts.length > 0
    ? { label: 'Review alerts', href: '#alerts', description: 'Check current conditions before advancing the month.' }
    : unreadMessages > 0
      ? { label: 'Open inbox', href: '/inbox', description: 'Handle unread messages before advancing the month.' }
      : { label: 'Review clients', href: '/clients', description: 'Check client health before advancing the month.' };

  // Enhanced KPIs
  const totalAR = getARTotal(state.arAging);
  const locAvailable = getLOCAvailable(state.lineOfCredit);
  const creditNearlyExhausted = state.lineOfCredit.limit > 0 && state.lineOfCredit.drawn > 0 &&
    locAvailable <= state.lineOfCredit.limit * 0.2;
  const operatingMargin = calculateProfitAndLoss(state.financialHistory.slice(-1)).operatingMarginPercent;

  // DSO
  const avgMonthlyRevenue = state.financialHistory.length > 0
    ? state.financialHistory.reduce((s, h) => s + h.revenue, 0) / state.financialHistory.length
    : state.financials.grossRevenue;
  const dso = avgMonthlyRevenue > 0 ? Math.round(totalAR / (avgMonthlyRevenue / 30)) : 0;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}>
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {creditNearlyExhausted && (
          <Grid size={{ xs: 12 }}>
            <Alert
              severity={locAvailable === 0 ? 'error' : 'warning'}
              sx={{ alignItems: 'flex-start', '& .MuiAlert-message': { minWidth: 0, width: '100%' } }}
            >
              <AlertTitle>{locAvailable === 0 ? 'Line of credit exhausted' : 'Line of credit nearly exhausted'}</AlertTitle>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ${locAvailable.toLocaleString()} remains available of the ${state.lineOfCredit.limit.toLocaleString()} limit.
                Review cash flow and credit before advancing the month.
              </Typography>
              <Button component={Link} href="/finances#credit-controls" size="small" variant="outlined" color="inherit">
                Review cash flow and credit controls
              </Button>
            </Alert>
          </Grid>
        )}
        <Grid size={{ xs: 12 }} sx={{ display: { xs: 'block', sm: 'none' } }}>
          <Card>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="overline" color="text.secondary">
                Month {state.month}, {state.year} · Decision brief
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary">Cash on hand</Typography>
                  <Typography variant="h5" fontWeight={700} color={state.financials.cashOnHand < 50000 ? 'error.main' : 'primary.main'}>
                    ${state.financials.cashOnHand.toLocaleString()}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={`${currentAlerts.length} current condition${currentAlerts.length === 1 ? '' : 's'}`}
                  color={currentAlerts.length > 0 ? 'warning' : 'success'}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {nextAction.description} {unreadMessages > 0 && `${unreadMessages} unread inbox message${unreadMessages === 1 ? '' : 's'}.`}
              </Typography>
              <Typography variant="caption" color={serviceCoverage < 0.85 ? 'error.main' : serviceCoverage < 1 ? 'warning.main' : 'text.secondary'} sx={{ display: 'block', mb: 1 }}>
                {state.clients.length > 0 ? `Client service coverage: ${Math.round(serviceCoverage * 100)}%` : 'No client service demand yet'}
              </Typography>
              <Button component={Link} href={nextAction.href} size="small" variant="contained">
                {nextAction.label}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        {/* Quick Stats Row */}
        <Grid size={{ xs: 12 }} data-tutorial-target="stats-row" sx={{ order: { xs: 2, sm: 0 } }}>
          <Grid container spacing={{ xs: 1, sm: 3 }}>
            <Grid size={{ xs: 6, sm: 6, md: 2 }} data-tutorial-target="stat-cash">
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: { xs: 'left', sm: 'center' }, p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                  <Typography variant="subtitle2" color="text.secondary">Cash on Hand <HelpTooltip helpId="dashboard-cash" /></Typography>
                  <Typography variant="h5" sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' } }} color={state.financials.cashOnHand < 50000 ? 'error' : 'primary'}>
                    ${state.financials.cashOnHand.toLocaleString()}
                  </Typography>
                  {state.lineOfCredit.drawn > 0 && (
                    <Typography variant="caption" color="text.secondary">LOC: ${locAvailable.toLocaleString()} avail</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 6, sm: 6, md: 2 }} data-tutorial-target="stat-revenue">
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: { xs: 'left', sm: 'center' }, p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                  <Typography variant="subtitle2" color="text.secondary">Collections <HelpTooltip helpId="dashboard-collections" /></Typography>
                  <Typography variant="h5" sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' } }} color="success.main">
                    ${state.financials.collectionsThisMonth.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Billed: ${state.financials.grossRevenue.toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 6, sm: 6, md: 2 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: { xs: 'left', sm: 'center' }, p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Expenses <HelpTooltip helpId="dashboard-expenses" /></Typography>
                  <Typography variant="h5" sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' } }} color="error.main">
                    ${state.financials.operatingExpenses.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 6, sm: 6, md: 2 }} data-tutorial-target="stat-profit">
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: { xs: 'left', sm: 'center' }, p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                  <Typography variant="subtitle2" color="text.secondary">Operating Margin <HelpTooltip helpId="dashboard-operating-margin" /></Typography>
                  <Typography variant="h5" sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' } }} color={operatingMargin >= 20 ? 'success.main' : operatingMargin >= 0 ? 'warning.main' : 'error.main'}>
                    {operatingMargin.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 6, sm: 6, md: 2 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: { xs: 'left', sm: 'center' }, p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                  <Typography variant="subtitle2" color="text.secondary">AR / DSO <HelpTooltip helpId="dashboard-dso" /></Typography>
                  <Typography variant="h5" sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' } }} color={dso > 45 ? 'error.main' : dso > 30 ? 'warning.main' : 'success.main'}>
                    {dso} days
                  </Typography>
                  <Typography variant="caption" color="text.secondary">${Math.round(totalAR).toLocaleString()} outstanding</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 6, sm: 6, md: 2 }} data-tutorial-target="stat-reputation">
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: { xs: 'left', sm: 'center' }, p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                  <Typography variant="subtitle2" color="text.secondary">Firm Reputation <HelpTooltip helpId="dashboard-reputation" /></Typography>
                  <Typography variant="h5" sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' } }} color="primary">
                    {state.reputation}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Financial Health Chart */}
        <Grid size={{ xs: 12, md: 8 }} data-tutorial-target="financial-chart" sx={{ order: { xs: 5, sm: 1 } }}>
          <Card>
            <CardHeader
              title="Financial Performance"
              subheader={`Month ${state.month}, ${state.year} | Revenue vs Expenses vs Collections`}
            />
            <CardContent>
              {chartData.length < 2 ? (
                <Typography variant="body2" color="text.secondary">
                  Your performance trend will appear after another month. Review this month’s revenue, collections, and expenses in the cards above.
                </Typography>
              ) : <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#1976d2" />
                  <Bar dataKey="collections" name="Collections" fill="#4caf50" />
                  <Bar dataKey="expenses" name="Expenses" fill="#dc004e" />
                </BarChart>
              </ResponsiveContainer>}
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts/Action Items */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ order: { xs: 1, sm: 2 } }}>
          <Card id="alerts">
            <CardHeader
              title="Alerts & Notifications"
              subheader={`${currentAlerts.length} current condition${currentAlerts.length === 1 ? '' : 's'} · ${outcomeAlerts.length} recorded outcome${outcomeAlerts.length === 1 ? '' : 's'}`}
              sx={{ pb: { xs: 0, sm: 1 }, '& .MuiCardHeader-title': { fontSize: { xs: '1.25rem', sm: '1.5rem' } } }}
            />
            <CardContent sx={{ pt: { xs: 1, sm: 2 } }}>
              {state.alerts.length > 0 && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current conditions reflect today&apos;s figures. Recorded outcomes describe earlier decisions or month-end results.
              </Typography>}
              {currentAlerts.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No current conditions need attention.
                </Typography>
              ) : (
                currentAlerts.map((alert) => {
                  const guidance = getAlertGuidance(alert, state);
                  return <Box key={alert.id} sx={{ mb: 2, p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Chip
                      label={alert.message}
                      color={alert.type === 'error' ? 'error' : alert.type === 'warning' ? 'warning' : alert.type === 'success' ? 'success' : 'info'}
                      onDelete={() => dismissAlert(alert.id)}
                      sx={{ width: '100%', height: 'auto', justifyContent: 'space-between', '& .MuiChip-label': { whiteSpace: 'normal', py: 0.75 } }}
                    />
                    {guidance && <>
                      {guidance.impact && <Typography variant="body2" fontWeight="medium" sx={{ mt: 1 }}>{guidance.impact}</Typography>}
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{guidance.consequence}</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {guidance.actions.map(action => <Button key={action.href} component={Link} href={action.href} size="small" variant="outlined">{action.label}</Button>)}
                      </Box>
                    </>}
                  </Box>;
                })
              )}
              {outcomeAlerts.length > 0 && <>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Recorded outcomes</Typography>
                {outcomeAlerts.map(alert => {
                  const guidance = getAlertGuidance(alert, state);
                  return <Box key={alert.id} sx={{ mb: 2, p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      {outcomeGamePeriod(alert)} · Recorded outcome
                    </Typography>
                    <Chip
                      label={alert.message}
                      color={alert.type === 'error' ? 'error' : alert.type === 'warning' ? 'warning' : alert.type === 'success' ? 'success' : 'info'}
                      onDelete={() => dismissAlert(alert.id)}
                      sx={{ width: '100%', height: 'auto', justifyContent: 'space-between', '& .MuiChip-label': { whiteSpace: 'normal', py: 0.75 } }}
                    />
                    {guidance && <>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{guidance.consequence}</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {guidance.actions.map(action => <Button key={action.href} component={Link} href={action.href} size="small" variant="outlined">{action.label}</Button>)}
                      </Box>
                    </>}
                  </Box>;
                })}
              </>}
            </CardContent>
          </Card>
        </Grid>

        {/* Employee Roster Summary */}
        <Grid size={{ xs: 12, md: 6 }} data-tutorial-target="employee-summary" sx={{ order: 3 }}>
          <Card>
            <CardHeader
              title="Employee Roster"
              subheader={`${state.employees.length} staff | $${totalPayroll.toLocaleString()}/mo payroll | ${Math.round(serviceCoverage * 100)}% service coverage`}
            />
            <CardContent>
              <TableContainer component={Paper} sx={{ maxHeight: 250 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Efficacy</TableCell>
                      <TableCell>Burnout</TableCell>
                      <TableCell>Total Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {state.employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={employee.role}
                            size="small"
                            color={employee.role === 'Lobbyist' ? 'primary' : employee.role === 'Attorney' ? 'secondary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={employee.efficacy}
                              sx={{ width: 50, height: 6, borderRadius: 3 }}
                              color={employee.efficacy >= 70 ? 'success' : employee.efficacy >= 50 ? 'warning' : 'error'}
                            />
                            <Typography variant="caption">{employee.efficacy}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={employee.burnout}
                              sx={{ width: 50, height: 6, borderRadius: 3 }}
                              color={employee.burnout >= 70 ? 'error' : employee.burnout >= 50 ? 'warning' : 'success'}
                            />
                            <Typography variant="caption">{employee.burnout}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>${getEmployeeTotalCost(employee).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Client Health Roster */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ order: 4 }}>
          <Card>
            <CardHeader
              title="Client Roster"
              subheader={`${state.clients.length} client(s) | MRR: $${totalClientRevenue.toLocaleString()}`}
            />
            <CardContent>
              <TableContainer component={Paper} sx={{ maxHeight: 250 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Client</TableCell>
                      <TableCell>Fee</TableCell>
                      <TableCell>Satisfaction</TableCell>
                      <TableCell>Contract</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {state.clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>{client.name}</TableCell>
                        <TableCell>${client.monthlyFee.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${client.satisfaction}%`}
                            size="small"
                            color={client.satisfaction >= 80 ? 'success' : client.satisfaction >= 60 ? 'warning' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${client.contractMonthsRemaining} mo`}
                            size="small"
                            color={client.contractMonthsRemaining <= 3 ? 'error' : client.contractMonthsRemaining <= 6 ? 'warning' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
