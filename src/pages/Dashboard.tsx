import React from 'react';
import { Box, Grid, Typography, Card, CardContent, CardHeader, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useSimulation } from '@/context/SimulationContext';

export const Dashboard = () => {
  const { state, dismissAlert } = useSimulation();

  // Format financial history for chart
  const chartData = state.financialHistory.map(entry => ({
    name: `M${entry.month}/${entry.year.toString().slice(-2)}`,
    revenue: entry.revenue,
    expenses: entry.expenses,
    profit: entry.profit,
  }));

  // Calculate quick stats
  const avgEmployeeBurnout = state.employees.length > 0
    ? state.employees.reduce((sum, e) => sum + e.burnout, 0) / state.employees.length
    : 0;
  
  const avgClientSatisfaction = state.clients.length > 0
    ? state.clients.reduce((sum, c) => sum + c.satisfaction, 0) / state.clients.length
    : 0;

  const totalPayroll = state.employees.reduce((sum, e) => sum + e.salary, 0);
  const totalClientRevenue = state.clients.reduce((sum, c) => sum + c.monthlyFee, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Quick Stats Row */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">Cash on Hand</Typography>
              <Typography variant="h5" color={state.financials.cashOnHand < 50000 ? 'error' : 'primary'}>
                ${state.financials.cashOnHand.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">Monthly Revenue</Typography>
              <Typography variant="h5" color="success.main">
                ${state.financials.grossRevenue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">Monthly Expenses</Typography>
              <Typography variant="h5" color="error.main">
                ${state.financials.operatingExpenses.toLocaleString()}
              </Typography>
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
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">Avg Client Satisfaction</Typography>
              <Typography variant="h5" color={avgClientSatisfaction >= 70 ? 'success.main' : avgClientSatisfaction >= 50 ? 'warning' : 'error.main'}>
                {avgClientSatisfaction.toFixed(0)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">Firm Reputation</Typography>
              <Typography variant="h5" color="primary">
                {state.reputation}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Health Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardHeader 
              title="Financial Performance" 
              subheader={`Month ${state.month}, ${state.year} | Revenue vs Expenses`} 
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
        <Grid size={{ xs: 12, md: 6 }}>
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
                      <TableCell>Salary</TableCell>
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
                        <TableCell>${employee.salary.toLocaleString()}</TableCell>
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

