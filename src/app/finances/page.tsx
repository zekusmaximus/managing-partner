"use client";

import React from 'react';
import { TopNav } from '@/components/layout/TopNav';
import { SideNav } from '@/components/layout/SideNav';
import { Box, Typography, Grid, Card, CardContent, CardHeader, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Divider } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useSimulation } from '@/context/SimulationContext';

export default function Finances() {
  const { state, advanceMonth } = useSimulation();

  // Format financial history for charts
  const chartData = state.financialHistory.map(entry => ({
    month: `M${entry.month}/${entry.year.toString().slice(-2)}`,
    revenue: entry.revenue,
    expenses: entry.expenses,
    profit: entry.profit,
  }));

  // Calculate totals from history
  const totalHistoricalRevenue = state.financialHistory.reduce((sum, e) => sum + e.revenue, 0);
  const totalHistoricalExpenses = state.financialHistory.reduce((sum, e) => sum + e.expenses, 0);
  const avgMonthlyProfit = state.financialHistory.length > 0 
    ? state.financialHistory.reduce((sum, e) => sum + e.profit, 0) / state.financialHistory.length 
    : 0;

  // Simulated AR aging data (based on accounts receivable)
  const arAging = [
    { days: '0-30', amount: state.financials.accountsReceivable * 0.6, color: '#4caf50' },
    { days: '31-60', amount: state.financials.accountsReceivable * 0.25, color: '#ff9800' },
    { days: '61-90', amount: state.financials.accountsReceivable * 0.1, color: '#f44336' },
    { days: '90+', amount: state.financials.accountsReceivable * 0.05, color: '#9c27b0' },
  ];

  const currentMonthName = `Month ${state.month}, ${state.year}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopNav />
      <div style={{ display: 'flex', flex: 1 }}>
        <SideNav />
        <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Financial Management
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={advanceMonth}
              size="large"
            >
              Advance Month →
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Summary Cards */}
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Cash on Hand</Typography>
                  <Typography variant="h5" color={state.financials.cashOnHand < 50000 ? 'error' : 'primary.main'}>
                    ${state.financials.cashOnHand.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Available</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Revenue (Current)</Typography>
                  <Typography variant="h5" color="success.main">
                    ${state.financials.grossRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{currentMonthName}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Expenses (Current)</Typography>
                  <Typography variant="h5" color="error.main">
                    ${state.financials.operatingExpenses.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{currentMonthName}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Net Profit</Typography>
                  <Typography variant="h5" color={state.financials.netProfit >= 0 ? 'success.main' : 'error.main'}>
                    ${state.financials.netProfit.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{currentMonthName}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Avg Monthly Profit</Typography>
                  <Typography variant="h5" color={avgMonthlyProfit >= 0 ? 'success.main' : 'error.main'}>
                    ${Math.round(avgMonthlyProfit).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Historical Avg</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Accounts Receivable</Typography>
                  <Typography variant="h5" color="warning.main">
                    ${state.financials.accountsReceivable.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Outstanding</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue vs Expenses Chart */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card>
                <CardHeader 
                  title="Revenue vs Expenses" 
                  subheader="Historical comparison"
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value) => `${Number(value).toLocaleString()}`} />
                      <Area type="monotone" dataKey="revenue" stackId="1" stroke="#1976d2" fill="#1976d2" fillOpacity={0.6} name="Revenue" />
                      <Area type="monotone" dataKey="expenses" stackId="2" stroke="#dc004e" fill="#dc004e" fillOpacity={0.6} name="Expenses" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Profit Trend Chart */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardHeader 
                  title="Profit Trend" 
                  subheader="Monthly net profit"
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value) => `${Number(value).toLocaleString()}`} />
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        stroke={avgMonthlyProfit >= 0 ? "#4caf50" : "#f44336"} 
                        strokeWidth={2}
                        name="Profit"
                        dot={{ fill: '#4caf50' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue Breakdown */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader title="Financial Summary" />
                <CardContent>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Metric</TableCell>
                          <TableCell>Value</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Total Revenue (All Time)</TableCell>
                          <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>
                            ${totalHistoricalRevenue.toLocaleString()}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Total Expenses (All Time)</TableCell>
                          <TableCell sx={{ color: 'error.main', fontWeight: 'bold' }}>
                            ${totalHistoricalExpenses.toLocaleString()}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Net Total</TableCell>
                          <TableCell sx={{ color: totalHistoricalRevenue - totalHistoricalExpenses >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}>
                            ${(totalHistoricalRevenue - totalHistoricalExpenses).toLocaleString()}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Current Cash Position</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            ${state.financials.cashOnHand.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Accounts Receivable Aging */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader 
                  title="Accounts Receivable Aging" 
                  subheader={`Total: $${state.financials.accountsReceivable.toLocaleString()}`}
                />
                <CardContent>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Age</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {arAging.map((item) => (
                          <TableRow key={item.days}>
                            <TableCell>{item.days} days</TableCell>
                            <TableCell>${Math.round(item.amount).toLocaleString()}</TableCell>
                            <TableCell>
                              <Chip 
                                label={item.days === '0-30' ? 'Current' : item.days === '31-60' ? 'Late' : 'Overdue'} 
                                size="small"
                                color={item.days === '0-30' ? 'success' : item.days === '31-60' ? 'warning' : 'error'}
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
      </div>
    </div>
  );
}

