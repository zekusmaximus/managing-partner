"use client";

import React, { useState } from 'react';
import { TopNav } from '@/components/layout/TopNav';
import { SideNav } from '@/components/layout/SideNav';
import { Box, Typography, Grid, Card, CardContent, CardHeader, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, IconButton, Tooltip } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { useSimulation } from '@/context/SimulationContext';
import type { Employee } from '@/context/SimulationContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function HR() {
  const { state, hireEmployee, fireEmployee, adjustSalary, advanceMonth } = useSimulation();
  const [openHireDialog, setOpenHireDialog] = useState(false);
  const [openSalaryDialog, setOpenSalaryDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newRole, setNewRole] = useState<'Lobbyist' | 'Attorney' | 'Support'>('Lobbyist');
  const [newSalary, setNewSalary] = useState<number>(0);

  // Calculate stats
  const totalPayroll = state.employees.reduce((sum, e) => sum + e.salary, 0);
  const avgEfficacy = state.employees.length > 0
    ? state.employees.reduce((sum, e) => sum + e.efficacy, 0) / state.employees.length
    : 0;
  const avgBurnout = state.employees.length > 0
    ? state.employees.reduce((sum, e) => sum + e.burnout, 0) / state.employees.length
    : 0;
  const highBurnoutCount = state.employees.filter(e => e.burnout >= 60).length;

  // Role distribution data
  const roleDistribution = [
    { name: 'Lobbyist', value: state.employees.filter(e => e.role === 'Lobbyist').length },
    { name: 'Attorney', value: state.employees.filter(e => e.role === 'Attorney').length },
    { name: 'Support', value: state.employees.filter(e => e.role === 'Support').length },
  ];

  // Burnout by role
  const burnoutByRole = [
    { role: 'Lobbyist', avg: state.employees.filter(e => e.role === 'Lobbyist').reduce((s, e) => s + e.burnout, 0) / Math.max(1, state.employees.filter(e => e.role === 'Lobbyist').length) },
    { role: 'Attorney', avg: state.employees.filter(e => e.role === 'Attorney').reduce((s, e) => s + e.burnout, 0) / Math.max(1, state.employees.filter(e => e.role === 'Attorney').length) },
    { role: 'Support', avg: state.employees.filter(e => e.role === 'Support').reduce((s, e) => s + e.burnout, 0) / Math.max(1, state.employees.filter(e => e.role === 'Support').length) },
  ];

  const handleHire = () => {
    hireEmployee(newRole);
    setOpenHireDialog(false);
  };

  const handleFire = (employee: Employee) => {
    if (confirm(`Are you sure you want to fire ${employee.name}?`)) {
      fireEmployee(employee.id);
    }
  };

  const handleSalaryClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setNewSalary(employee.salary);
    setOpenSalaryDialog(true);
  };

  const handleSalarySave = () => {
    if (selectedEmployee) {
      adjustSalary(selectedEmployee.id, newSalary);
      setOpenSalaryDialog(false);
      setSelectedEmployee(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Lobbyist': return 'primary';
      case 'Attorney': return 'secondary';
      case 'Support': return 'default';
      default: return 'default';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopNav />
      <div style={{ display: 'flex', flex: 1 }}>
        <SideNav />
        <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Human Resources
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setOpenHireDialog(true)}
              >
                + Hire Employee
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
                  <Typography variant="subtitle2" color="text.secondary">Total Employees</Typography>
                  <Typography variant="h4" color="primary">
                    {state.employees.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Payroll</Typography>
                  <Typography variant="h5" color="error.main">
                    ${totalPayroll.toLocaleString()}/mo
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Avg Efficacy</Typography>
                  <Typography variant="h5" color={avgEfficacy >= 70 ? 'success.main' : avgEfficacy >= 50 ? 'warning.main' : 'error.main'}>
                    {avgEfficacy.toFixed(0)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">High Burnout Risk</Typography>
                  <Typography variant="h5" color={highBurnoutCount > 0 ? 'error.main' : 'success.main'}>
                    {highBurnoutCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Role Distribution Chart */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title="Role Distribution" />
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={roleDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {roleDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Burnout by Role Chart */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title="Avg Burnout by Role" />
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={burnoutByRole}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="role" />
                      <YAxis domain={[0, 100]} />
                      <RechartsTooltip />
                      <Bar dataKey="avg" name="Avg Burnout %" fill="#ff8042">
                        {burnoutByRole.map((entry, index) => (
                          <Cell key={index} fill={entry.avg >= 60 ? '#f44336' : entry.avg >= 40 ? '#ff9800' : '#4caf50'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Average Metrics */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title="Team Health Metrics" />
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Average Efficacy</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={avgEfficacy} 
                      sx={{ height: 10, borderRadius: 5, mt: 1 }}
                      color={avgEfficacy >= 70 ? 'success' : avgEfficacy >= 50 ? 'warning' : 'error'}
                    />
                    <Typography variant="caption">{avgEfficacy.toFixed(0)}%</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Average Burnout</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={avgBurnout} 
                      sx={{ height: 10, borderRadius: 5, mt: 1 }}
                      color={avgBurnout >= 60 ? 'error' : avgBurnout >= 40 ? 'warning' : 'success'}
                    />
                    <Typography variant="caption">{avgBurnout.toFixed(0)}%</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Employee Table */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader 
                  title="Employee Roster" 
                  subheader="Manage your team members"
                />
                <CardContent>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Efficacy</TableCell>
                          <TableCell>Burnout</TableCell>
                          <TableCell>Client Affinity</TableCell>
                          <TableCell>Salary</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {state.employees.map((employee) => (
                          <TableRow key={employee.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {employee.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={employee.role} 
                                size="small" 
                                color={getRoleColor(employee.role) as any}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', width: 120 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={employee.efficacy} 
                                  sx={{ flex: 1, mr: 1, height: 8, borderRadius: 4 }}
                                  color={employee.efficacy >= 70 ? 'success' : employee.efficacy >= 50 ? 'warning' : 'error'}
                                />
                                <Typography variant="caption" sx={{ minWidth: 35 }}>
                                  {employee.efficacy}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', width: 120 }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={employee.burnout} 
                                  sx={{ flex: 1, mr: 1, height: 8, borderRadius: 4 }}
                                  color={employee.burnout >= 60 ? 'error' : employee.burnout >= 40 ? 'warning' : 'success'}
                                />
                                <Typography variant="caption" sx={{ minWidth: 35 }}>
                                  {employee.burnout}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={`${employee.clientAffinity}%`} 
                                size="small"
                                color={employee.clientAffinity >= 70 ? 'success' : employee.clientAffinity >= 50 ? 'warning' : 'error'}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                ${employee.salary.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Adjust Salary">
                                <Button 
                                  size="small" 
                                  onClick={() => handleSalaryClick(employee)}
                                >
                                  Salary
                                </Button>
                              </Tooltip>
                              <Tooltip title="Fire Employee">
                                <Button 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleFire(employee)}
                                >
                                  Fire
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

      {/* Hire Employee Dialog */}
      <Dialog open={openHireDialog} onClose={() => setOpenHireDialog(false)}>
        <DialogTitle>Hire New Employee</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Role"
            fullWidth
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as any)}
            sx={{ mt: 1 }}
          >
            <MenuItem value="Lobbyist">Lobbyist ($7,000-$9,000)</MenuItem>
            <MenuItem value="Attorney">Attorney ($8,000-$10,000)</MenuItem>
            <MenuItem value="Support">Support ($3,500-$5,000)</MenuItem>
          </TextField>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            A new employee will be hired with random stats in the selected role.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHireDialog(false)}>Cancel</Button>
          <Button onClick={handleHire} variant="contained" color="primary">
            Hire
          </Button>
        </DialogActions>
      </Dialog>

      {/* Adjust Salary Dialog */}
      <Dialog open={openSalaryDialog} onClose={() => setOpenSalaryDialog(false)}>
        <DialogTitle>Adjust Salary for {selectedEmployee?.name}</DialogTitle>
        <DialogContent>
          <TextField
            label="New Monthly Salary"
            type="number"
            fullWidth
            value={newSalary}
            onChange={(e) => setNewSalary(Number(e.target.value))}
            sx={{ mt: 1 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Current salary: ${selectedEmployee?.salary.toLocaleString()}/month
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSalaryDialog(false)}>Cancel</Button>
          <Button onClick={handleSalarySave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

