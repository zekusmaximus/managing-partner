"use client";

import { Suspense, useEffect, useState } from 'react';
import { Alert, Box, Button, Typography, Grid, Card, CardContent, CardHeader, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, MenuItem, TextField } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { useSearchParams } from 'next/navigation';
import { useSimulation } from '@/context/SimulationContext';
import HelpTooltip from '@/components/help/HelpTooltip';
import { getClientMeetingQuote } from '@/lib/simulation/engine';
import PartnerInterventionNotice from '@/components/PartnerInterventionNotice';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function Clients() {
  return <Suspense fallback={<Box sx={{ p: 2 }}>Loading clients…</Box>}><ClientsContent /></Suspense>;
}

function ClientsContent() {
  const { state, meetClient } = useSimulation();
  const searchParams = useSearchParams();
  const linkedClientId = searchParams.get('clientId') ?? '';
  const [selectedClientId, setSelectedClientId] = useState('');
  const selectedClient = state.clients.find(client => client.id === (selectedClientId || linkedClientId)) ??
    state.clients.find(client => getClientMeetingQuote(state, client.id).eligibleReasons.length > 0) ??
    state.clients[0] ?? null;
  const meetingQuote = selectedClient ? getClientMeetingQuote(state, selectedClient.id) : null;
  const meetingCompleted = selectedClient && state.lastClientMeeting?.clientId === selectedClient.id &&
    state.lastClientMeeting.month === state.month && state.lastClientMeeting.year === state.year;

  useEffect(() => {
    if (!linkedClientId) return;
    const scrollTimer = window.setTimeout(() => document.getElementById('client-meeting')?.scrollIntoView({ block: 'start' }), 0);
    return () => window.clearTimeout(scrollTimer);
  }, [linkedClientId]);

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
    { months: '7-12', count: state.clients.filter(c => c.contractMonthsRemaining > 6 && c.contractMonthsRemaining <= 12).length },
    { months: '>12', count: state.clients.filter(c => c.contractMonthsRemaining > 12).length },
  ];

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
    <>
        <Box sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Client Relations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review service health and contract terms here. Pursue new business and respond to client requests in the Inbox.
            </Typography>
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

            <Grid size={{ xs: 12 }}>
              <Card id="client-meeting" sx={{ scrollMarginTop: 80 }}>
                <CardHeader
                  title="Lead recovery meeting"
                  subheader="Respond to a complaint, renewal, service, satisfaction, or overdue-payment risk."
                />
                <CardContent>
                  <PartnerInterventionNotice state={state} />
                  {selectedClient && meetingQuote ? (
                    <Box sx={{ display: 'grid', gap: 1.5 }}>
                      <TextField
                        select
                        label="Client"
                        value={selectedClient.id}
                        onChange={(event) => setSelectedClientId(event.target.value)}
                        sx={{ maxWidth: 420 }}
                      >
                        {state.clients.map(client => (
                          <MenuItem key={client.id} value={client.id}>
                            {client.name}{getClientMeetingQuote(state, client.id).eligibleReasons.length > 0 ? ' · needs attention' : ''}
                          </MenuItem>
                        ))}
                      </TextField>
                      {meetingCompleted && (
                        <Alert severity="success">
                          {state.alerts.find(alert => alert.id === `client-meeting-${state.year}-${state.month}-${selectedClient.id}`)?.message ??
                            'Recovery meeting completed this month. Review the dated outcome for its effects.'}
                        </Alert>
                      )}
                      {!meetingCompleted && <>
                      {meetingQuote.eligibleReasons.length > 0 && <>
                      <Typography variant="body2" color="text.secondary">
                        Why meet: {meetingQuote.eligibleReasons.join('; ')}.
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="body2" color="success.main">
                          Benefit: satisfaction +{meetingQuote.satisfactionGain} to {meetingQuote.nextSatisfaction}%; {meetingQuote.collectionEstimate > 0
                            ? `collect $${meetingQuote.collectionEstimate.toLocaleString()} of this client's overdue invoices now`
                            : 'no immediate collection'}.
                        </Typography>
                        <Typography variant="body2" color="error.main">
                          Cost: ${meetingQuote.cost.toLocaleString()} cash and current-month profit, plus this month’s shared partner intervention.
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Estimated net cash change: {meetingQuote.netCashEstimate < 0 ? '-' : '+'}${Math.abs(meetingQuote.netCashEstimate).toLocaleString()}. A meeting helps renewal odds through satisfaction, but cannot guarantee renewal or fix a firmwide staffing shortfall.
                      </Typography>
                      </>}
                      {meetingQuote.disabledReason && (
                        <Typography variant="body2" color="text.secondary">{meetingQuote.disabledReason}</Typography>
                      )}
                      <Box>
                        <Button variant="contained" disabled={!meetingQuote.available} onClick={() => meetClient(selectedClient.id)}>
                          Lead recovery meeting (${meetingQuote.cost.toLocaleString()})
                        </Button>
                      </Box>
                      </>}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">No active clients are available for a meeting.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue by Type Chart */}
            <Grid size={{ xs: 12, md: 4 }} data-tutorial-target="client-type-chart">
              <Card sx={{ height: '100%' }}>
                <CardHeader title="Revenue by Client Type" />
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={revenueByType}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="revenue"
                      >
                        {revenueByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box component="ul" aria-label="Revenue by client type" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 0, m: 0, listStyle: 'none' }}>
                    {revenueByType.map((entry, index) => (
                      <Box component="li" key={entry.type} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                        <Box component="span" sx={{ bgcolor: COLORS[index % COLORS.length], width: 10, height: 10, borderRadius: '50%', flexShrink: 0 }} />
                        <Typography variant="caption">{entry.type}: ${entry.revenue.toLocaleString()}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    These categories describe the book. Concentration depends on fee exposure and shared issues;
                    different organization types do not automatically diversify risk. Shared issue exposure is not simulated here.
                  </Typography>
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
                  subheader="Track service health, fees, and renewal timing"
                />
                <CardContent>
                  <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 760 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Client Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Fee Structure</TableCell>
                          <TableCell>Monthly Fee</TableCell>
                          <TableCell>Satisfaction</TableCell>
                          <TableCell>Contract</TableCell>
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

    </>
  );
}

