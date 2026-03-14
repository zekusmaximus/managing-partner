"use client";

import React from 'react';
import { Box, Grid, Typography, Card, CardContent, CardHeader, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useSimulation } from '@/context/SimulationContext';
import { getEmployeeTotalCost, getARTotal, getLOCAvailable } from '@/types/simulation';
import HelpTooltip from '@/components/help/HelpTooltip';

export const Dashboard = () => {
  const { state, dismissAlert } = useSimulation();

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

  // Enhanced KPIs
  const totalAR = getARTotal(state.arAging);
  const locAvailable = getLOCAvailable(state.lineOfCredit);
  const operatingMargin = state.financials.grossRevenue > 0
    ? ((state.financials.grossRevenue - state.financials.operatingExpenses) / state.financials.grossRevenue * 100)
    : 0;

  // DSO
  const avgMonthlyRevenue = state.financialHistory.length > 0
    ? state.financialHistory.reduce((s, h) => s + h.revenue, 0) / state.financialHistory.length
    : state.financials.grossRevenue;
  const dso = avgMonthlyRevenue > 0 ? Math.round(totalAR / (avgMonthlyRevenue / 30)) : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Quick Stats Row */}
        <Grid size={{ xs: 12 }} data-tutorial-target="stats-row">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 2 }} data-tutorial-target="stat-cash">
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Cash + LOC <HelpTooltip helpId="dashboard-cash" /></Typography>
                  <Typography variant="h5" color={state.financials.cashOnHand < 50000 ? 'error' : 'primary'}>
                    ${state.financials.cashOnHand.toLocaleString()}
                  </Typography>
                  {state.lineOfCredit.drawn > 0 && (
                    <Typography variant="caption" color="text.secondary">LOC: ${locAvailable.toLocaleString()} avail</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }} data-tutorial-target="stat-revenue">
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Collections <HelpTooltip helpId="dashboard-collections" /></Typography>
                  <Typography variant="h5" color="success.main">
                    ${state.financials.collectionsThisMonth.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Billed: ${state.financials.grossRevenue.toLocaleString()}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Expenses <HelpTooltip helpId="dashboard-expenses" /></Typography>
                  <Typography variant="h5" color="error.main">
                    ${state.financials.operatingExpenses.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }} data-tutorial-target="stat-profit">
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Operating Margin <HelpTooltip helpId="dashboard-operating-margin" /></Typography>
                  <Typography variant="h5" color={operatingMargin >= 20 ? 'success.main' : operatingMargin >= 0 ? 'warning.main' : 'error.main'}>
                    {operatingMargin.toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">AR / DSO <HelpTooltip helpId="dashboard-dso" /></Typography>
                  <Typography variant="h5" color={dso > 45 ? 'error.main' : dso > 30 ? 'warning.main' : 'success.main'}>
                    {dso} days
                  </Typography>
                  <Typography variant="caption" color="text.secondary">${Math.round(totalAR).toLocaleString()} outstanding</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }} data-tutorial-target="stat-reputation">
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Firm Reputation <HelpTooltip helpId="dashboard-reputation" /></Typography>
                  <Typography variant="h5" color="primary">
                    {state.reputation}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Financial Health Chart */}
        <Grid size={{ xs: 12, md: 8 }} data-tutorial-target="financial-chart">
          <Card>
            <CardHeader
              title="Financial Performance"
              subheader={`Month ${state.month}, ${state.year} | Revenue vs Expenses vs Collections`}
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
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
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts/Action Items */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardHeader
              title="Alerts & Notifications"
              subheader={`${state.alerts.length} active alert(s)`}
            />
            <CardContent>
              {state.alerts.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No alerts at this time.
                </Typography>
              ) : (
                state.alerts.slice(0, 5).map((alert) => (
                  <Box key={alert.id} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={alert.message}
                      color={alert.type === 'error' ? 'error' : alert.type === 'warning' ? 'warning' : alert.type === 'success' ? 'success' : 'info'}
                      onDelete={() => dismissAlert(alert.id)}
                      sx={{ flex: 1, justifyContent: 'left' }}
                    />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Employee Roster Summary */}
        <Grid size={{ xs: 12, md: 6 }} data-tutorial-target="employee-summary">
          <Card>
            <CardHeader
              title="Employee Roster"
              subheader={`${state.employees.length} team member(s) | Total Payroll: $${totalPayroll.toLocaleString()}/mo`}
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
        <Grid size={{ xs: 12, md: 6 }}>
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
