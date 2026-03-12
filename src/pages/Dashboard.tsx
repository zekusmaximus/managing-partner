import React from 'react';
import { Box, Grid, Typography, Card, CardContent, CardHeader, Divider, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSimulation } from '@/context/SimulationContext';

const data = [
  { month: 'Month 1', revenue: 120000, expenses: 80000 },
  { month: 'Month 2', revenue: 135000, expenses: 85000 },
  { month: 'Month 3', revenue: 150000, expenses: 90000 },
  { month: 'Month 4', revenue: 165000, expenses: 95000 },
  { month: 'Month 5', revenue: 180000, expenses: 100000 },
  { month: 'Month 6', revenue: 195000, expenses: 105000 },
];

export const Dashboard = () => {
  const { state } = useSimulation();

  const alerts = [
    { id: 1, message: '3 invoices are 60+ days past due', severity: 'warning' as const },
    { id: 2, message: 'Lobbyist A is requesting a raise', severity: 'info' as const },
    { id: 3, message: 'Client X satisfaction dropped 5%', severity: 'error' as const },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Financial Health Widget */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Financial Health" subheader="Revenue vs Expenses (Last 6 Months)" />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#1976d2" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#dc004e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts/Action Items */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Alerts & Action Items" />
            <CardContent>
              {alerts.map((alert) => (
                <Box key={alert.id} sx={{ mb: 2 }}>
                  <Chip
                    label={alert.message}
                    color={alert.severity === 'error' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info'}
                    sx={{ width: '100%', justifyContent: 'left' }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Client Health Roster */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Client Health Roster" />
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Client Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Monthly Fee</TableCell>
                      <TableCell>Satisfaction</TableCell>
                      <TableCell>Contract</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {state.clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>{client.name}</TableCell>
                        <TableCell>{client.type}</TableCell>
                        <TableCell>${client.monthlyFee.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${client.satisfaction}%`}
                            color={client.satisfaction >= 80 ? 'success' : client.satisfaction >= 60 ? 'warning' : 'error'}
                          />
                        </TableCell>
                        <TableCell>{client.contractMonthsRemaining} months</TableCell>
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