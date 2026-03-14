"use client";

import React, { useState } from 'react';
import { TopNav } from '@/components/layout/TopNav';
import { SideNav } from '@/components/layout/SideNav';
import { Box, Typography, Grid, Card, CardContent, CardHeader, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Tooltip } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { useSimulation } from '@/context/SimulationContext';
import type { Client } from '@/context/SimulationContext';
import HelpTooltip from '@/components/help/HelpTooltip';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Clients() {
  const { state, addClient, removeClient, updateClientSatisfaction, advanceMonth } = useSimulation();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientType, setNewClientType] = useState<Client['type']>('Corporation');
  const [newClientFee, setNewClientFee] = useState(15000);

  // Calculate stats
  const totalMonthlyRevenue = state.clients.reduce((sum, c) => sum + c.monthlyFee, 0);
  const avgSatisfaction = state.clients.length > 0
    ? state.clients.reduce((sum, c) => sum + c.satisfaction, 0) / state.clients.length
    : 0;
  const expiringContracts = state.clients.filter(c => c.contractMonthsRemaining <= 3).length;
  const atRiskClients = state.clients.filter(c => c.satisfaction < 60).length;

  // Revenue by client type
  const revenueByType = [
    { type: 'Corporation', revenue: state.clients.filter(c => c.type === 'Corporation').reduce((s, c) => s + c.monthlyFee, 0) },
    { type: 'Trade Association', revenue: state.clients.filter(c => c.type === 'Trade Association').reduce((s, c) => s + c.monthlyFee, 0) },
    { type: 'Non-Profit', revenue: state.clients.filter(c => c.type === 'Non-Profit').reduce((s, c) => s + c.monthlyFee, 0) },
  ].filter(r => r.revenue > 0);

  // Client count by type
  const clientsByType = [
    { name: 'Corporation', value: state.clients.filter(c => c.type === 'Corporation').length },
    { name: 'Trade Association', value: state.clients.filter(c => c.type === 'Trade Association').length },
    { name: 'Non-Profit', value: state.clients.filter(c => c.type === 'Non-Profit').length },
  ].filter(c => c.value > 0);

  // Contract expiry timeline
  const contractTimeline = [
    { months: '0-3', count: state.clients.filter(c => c.contractMonthsRemaining <= 3 && c.contractMonthsRemaining > 0).length },
    { months: '4-6', count: state.clients.filter(c => c.contractMonthsRemaining <= 6 && c.contractMonthsRemaining > 3).length },
    { months: '7-12', count: state.clients.filter(c => c.contractMonthsRemaining > 6).length },
    { months: '>12', count: state.clients.filter(c => c.contractMonthsRemaining > 12).length },
  ];

  const handleAddClient = () => {
    if (newClientName.trim()) {
      addClient(newClientName, newClientType, newClientFee);
      setOpenAddDialog(false);
      setNewClientName('');
      setNewClientType('Corporation');
      setNewClientFee(15000);
    }
  };

  const handleRemoveClient = (client: Client) => {
    if (confirm(`Are you sure you want to remove ${client.name}?`)) {
      removeClient(client.id);
    }
  };

  const handleSatisfactionChange = (client: Client, delta: number) => {
    updateClientSatisfaction(client.id, delta);
  };

  const getSatisfactionColor = (satisfaction: number) => {
    if (satisfaction >= 80) return 'success';
    if (satisfaction >= 60) return 'warning';
    return 'error';
  };

  const getContractColor = (months: number) => {
    if (months <= 3) return 'error';
    if (months <= 6) return 'warning';
    return 'default';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopNav />
      <div style={{ display: 'flex', flex: 1 }}>
        <SideNav />
        <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Client Relations
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setOpenAddDialog(true)}
              >
                + Add Client
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={advanceMonth}
              >
                Advance Month →
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {/* Summary Cards */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Clients</Typography>
                  <Typography variant="h4" color="primary">
                    {state.clients.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Monthly Revenue <HelpTooltip helpId="clients-fee" /></Typography>
                  <Typography variant="h5" color="success.main">
                    ${totalMonthlyRevenue.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Avg Satisfaction <HelpTooltip helpId="clients-satisfaction" /></Typography>
                  <Typography variant="h5" color={avgSatisfaction >= 70 ? 'success.main' : avgSatisfaction >= 50 ? 'warning.main' : 'error.main'}>
                    {avgSatisfaction.toFixed(0)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Expiring Contracts <HelpTooltip helpId="clients-contract" /></Typography>
                  <Typography variant="h5" color={expiringContracts > 0 ? 'error.main' : 'success.main'}>
                    {expiringContracts}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue by Type Chart */}
            <Grid size={{ xs: 12, md: 4 }} data-tutorial-target="client-type-chart">
              <Card sx={{ height: '100%' }}>
                <CardHeader title="Revenue by Client Type" />
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={revenueByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="revenue"
                        label={(entry: any) => `${entry.type}: $${(entry.revenue/1000).toFixed(0)}k`}
                      >
                        {revenueByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Contract Timeline */}
            <Grid size={{ xs: 12, md: 4 }} data-tutorial-target="contract-chart">
              <Card sx={{ height: '100%' }}>
                <CardHeader title="Contract Expiry Timeline" />
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={contractTimeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="months" />
                      <YAxis allowDecimals={false} />
                      <RechartsTooltip />
                      <Bar dataKey="count" name="Clients" fill="#8884d8">
                        {contractTimeline.map((entry, index) => (
                          <Cell key={index} fill={entry.count > 2 ? '#f44336' : entry.count > 0 ? '#ff9800' : '#4caf50'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Satisfaction Distribution */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title="Client Satisfaction Health" />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Satisfaction Distribution</Typography>
                    <Box sx={{ display: 'flex', mt: 1, gap: 1 }}>
                      <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography variant="h5" color="success.main">
                          {state.clients.filter(c => c.satisfaction >= 70).length}
                        </Typography>
                        <Typography variant="caption">Healthy</Typography>
                      </Box>
                      <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography variant="h5" color="warning.main">
                          {state.clients.filter(c => c.satisfaction >= 50 && c.satisfaction < 70).length}
                        </Typography>
                        <Typography variant="caption">At Risk</Typography>
                      </Box>
                      <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography variant="h5" color="error.main">
                          {state.clients.filter(c => c.satisfaction < 50).length}
                        </Typography>
                        <Typography variant="caption">Critical</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    At-risk clients: {atRiskClients}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Client Table */}
            <Grid size={{ xs: 12 }} data-tutorial-target="client-table">
              <Card>
                <CardHeader
                  title="Client Roster"
                  subheader="Manage your clients and track satisfaction"
                />
                <CardContent>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Client Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Fee Structure</TableCell>
                          <TableCell>Monthly Fee</TableCell>
                          <TableCell>Satisfaction</TableCell>
                          <TableCell>Contract</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {state.clients.map((client) => (
                          <TableRow key={client.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {client.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={client.type} 
                                size="small"
                                color={client.type === 'Corporation' ? 'primary' : client.type === 'Trade Association' ? 'secondary' : 'default'}
                              />
                            </TableCell>
                            <TableCell>{client.feeStructure}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                ${client.monthlyFee.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={client.satisfaction} 
                                  sx={{ width: 80, height: 8, borderRadius: 4 }}
                                  color={getSatisfactionColor(client.satisfaction) as any}
                                />
                                <Chip 
                                  label={`${client.satisfaction}%`} 
                                  size="small"
                                  color={getSatisfactionColor(client.satisfaction) as any}
                                />
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={`${client.contractMonthsRemaining} mo`} 
                                size="small"
                                color={getContractColor(client.contractMonthsRemaining) as any}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Improve Satisfaction">
                                <Button 
                                  size="small" 
                                  color="success"
                                  onClick={() => handleSatisfactionChange(client, 5)}
                                >
                                  +5%
                                </Button>
                              </Tooltip>
                              <Tooltip title="Decrease Satisfaction">
                                <Button 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleSatisfactionChange(client, -5)}
                                >
                                  -5%
                                </Button>
                              </Tooltip>
                              <Tooltip title="Remove Client">
                                <Button 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleRemoveClient(client)}
                                >
                                  Remove
                                </Button>
                              </Tooltip>
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

      {/* Add Client Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Client</DialogTitle>
        <DialogContent>
          <TextField
            label="Client Name"
            fullWidth
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            select
            label="Client Type"
            fullWidth
            value={newClientType}
            onChange={(e) => setNewClientType(e.target.value as Client['type'])}
            sx={{ mt: 2 }}
          >
            <MenuItem value="Corporation">Corporation</MenuItem>
            <MenuItem value="Trade Association">Trade Association</MenuItem>
            <MenuItem value="Non-Profit">Non-Profit</MenuItem>
          </TextField>
          <TextField
            label="Monthly Fee"
            type="number"
            fullWidth
            value={newClientFee}
            onChange={(e) => setNewClientFee(Number(e.target.value))}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddClient} variant="contained" color="primary">
            Add Client
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

