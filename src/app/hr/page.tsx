"use client";

import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardHeader, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Tooltip } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { useSimulation } from '@/context/SimulationContext';
import type { Employee } from '@/context/SimulationContext';
import { getEmployeeTotalCost, getEmployeeBenefits, getEmployeePayrollTax } from '@/types/simulation';
import HelpTooltip from '@/components/help/HelpTooltip';
import StaffingEconomics from '@/components/hr/StaffingEconomics';
import { getStaffRecoveryQuote } from '@/lib/simulation/burnout';
import { getWorkloadBurnoutTrend } from '@/lib/simulation/clientService';
import { getSalaryIncreaseQuote } from '@/lib/simulation/salary';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function HR() {
  const { state, hireEmployee, fireEmployee, adjustSalary, fundStaffRecovery } = useSimulation();
  const [openHireDialog, setOpenHireDialog] = useState(false);
  const [openSalaryDialog, setOpenSalaryDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newRole, setNewRole] = useState<'Lobbyist' | 'Attorney' | 'Support'>('Lobbyist');
  const [newSalary, setNewSalary] = useState<number>(0);
  const salaryQuote = getSalaryIncreaseQuote(state, selectedEmployee?.id ?? '', newSalary);
  const validSalary = salaryQuote.valid;
  const workload = getWorkloadBurnoutTrend(state);

  // Calculate stats
  const totalPayroll = state.employees.reduce((sum, e) => sum + getEmployeeTotalCost(e), 0);
  const avgEfficacy = state.employees.length > 0
    ? state.employees.reduce((sum, e) => sum + e.efficacy, 0) / state.employees.length
    : 0;
  const avgBurnout = state.employees.length > 0
    ? state.employees.reduce((sum, e) => sum + e.burnout, 0) / state.employees.length
    : 0;
  const highBurnoutCount = state.employees.filter(e => e.burnout >= 60).length;
  const recoveryQuote = getStaffRecoveryQuote(state);
  const targetedRecoveryQuote = getStaffRecoveryQuote(state, 'targeted');
  const availableCash = Math.max(0, state.financials.cashOnHand);

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
    if (confirm(`Are you sure you want to fire ${employee.name}? Severance cost: $2,000`)) {
      fireEmployee(employee.id);
    }
  };

  const handleSalaryClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setNewSalary(employee.salary);
    setOpenSalaryDialog(true);
  };

  const handleSalarySave = () => {
    if (selectedEmployee && validSalary) {
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
    <>
        <Box sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
            <Typography variant="h4" component="h1">
              Human Resources
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenHireDialog(true)}
              data-tutorial-target="hire-employee-btn"
            >
              + Hire Employee
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Summary Cards */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Employees <HelpTooltip helpId="hr-total-employees" /></Typography>
                  <Typography variant="h4" color="primary">
                    {state.employees.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Payroll <HelpTooltip helpId="hr-payroll" /></Typography>
                  <Typography variant="h5" color="error.main">
                    ${totalPayroll.toLocaleString()}/mo
                  </Typography>
                  <Typography variant="caption" color="text.secondary">Incl. benefits & taxes</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">Avg Efficacy <HelpTooltip helpId="hr-efficacy" /></Typography>
                  <Typography variant="h5" color={avgEfficacy >= 70 ? 'success.main' : avgEfficacy >= 50 ? 'warning.main' : 'error.main'}>
                    {avgEfficacy.toFixed(0)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">High Burnout Risk <HelpTooltip helpId="hr-burnout" /></Typography>
                  <Typography variant="h5" color={highBurnoutCount > 0 ? 'error.main' : 'success.main'}>
                    {highBurnoutCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Staffing Economics */}
            <Grid size={{ xs: 12 }} data-tutorial-target="staffing-economics">
              <StaffingEconomics />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader title={<>Staff Recovery <HelpTooltip helpId="hr-recovery" /></>} />
                <CardContent>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {workload.explanation}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    These workload bands are simulation assumptions, applied to the whole team.
                    Recovery reduces fatigue without increasing permanent efficacy. Adequate service capacity
                    addresses continuing overload; recovery alone does not fix understaffing.
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Choose one paid recovery option per month for staff at 20% burnout or higher.
                    Payment comes from cash on hand, reduces current-month profit, and counts toward the Payroll budget.
                    Available cash: ${availableCash.toLocaleString()}.
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2, height: '100%' }}>
                        <Typography variant="h6" component="h3" gutterBottom>Full team program</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Up to 12 highest-burnout staff. $1,500 each; each loses up to 25 burnout points.
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {recoveryQuote.participantIds.length === 0 ? 'No eligible staff.' : <>
                            {recoveryQuote.participantIds.length} staff · ${recoveryQuote.cost.toLocaleString()} now ·
                            {' '}{recoveryQuote.totalBurnoutReduction} total burnout points reduced
                          </>}
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={() => fundStaffRecovery('full')}
                          disabled={!recoveryQuote.canFund}
                          sx={{ maxWidth: '100%' }}
                        >
                          Fund full program{recoveryQuote.cost > 0 && ` · $${recoveryQuote.cost.toLocaleString()}`}
                        </Button>
                        {!recoveryQuote.canFund && !recoveryQuote.alreadyFunded && recoveryQuote.participantIds.length > 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Needs ${recoveryQuote.cost.toLocaleString()} cash. The targeted option may be affordable.
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ border: 1, borderColor: !recoveryQuote.canFund && targetedRecoveryQuote.canFund ? 'warning.main' : 'divider', borderRadius: 1, p: 2, height: '100%' }}>
                        <Typography variant="h6" component="h3" gutterBottom>Targeted recovery</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Up to 2 highest-burnout staff. $500 each; each loses up to 15 burnout points.
                          If cash covers only one, fund one for $500.
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {targetedRecoveryQuote.participantIds.length === 0 ? 'No eligible staff.' : <>
                            {targetedRecoveryQuote.participantIds.length} staff · ${targetedRecoveryQuote.cost.toLocaleString()} now ·
                            {' '}{targetedRecoveryQuote.totalBurnoutReduction} total burnout points reduced
                          </>}
                        </Typography>
                        <Button
                          variant="outlined"
                          onClick={() => fundStaffRecovery('targeted')}
                          disabled={!targetedRecoveryQuote.canFund}
                          sx={{ maxWidth: '100%' }}
                        >
                          Fund targeted recovery{targetedRecoveryQuote.cost > 0 && ` · $${targetedRecoveryQuote.cost.toLocaleString()}`}
                        </Button>
                        {!targetedRecoveryQuote.canFund && !targetedRecoveryQuote.alreadyFunded && targetedRecoveryQuote.participantIds.length > 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Needs ${targetedRecoveryQuote.cost.toLocaleString()} cash.
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                  {recoveryQuote.alreadyFunded && (
                    <Typography variant="body2" role="status" sx={{ mt: 2 }}>
                      Staff recovery already funded this month. Both options reopen next month.
                    </Typography>
                  )}
                  {recoveryQuote.participantIds.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      No staff currently meets the 20% burnout threshold.
                    </Typography>
                  )}
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
            <Grid size={{ xs: 12, md: 4 }} data-tutorial-target="burnout-chart">
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
            <Grid size={{ xs: 12 }} data-tutorial-target="employee-table">
              <Card>
                <CardHeader
                  title="Employee Roster"
                  subheader="Manage your team members"
                />
                <CardContent>
                  <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 840 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Efficacy</TableCell>
                          <TableCell>Burnout</TableCell>
                          <TableCell>Client Affinity</TableCell>
                          <TableCell>Salary</TableCell>
                          <TableCell>Total Cost <HelpTooltip helpId="hr-total-cost" /></TableCell>
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
                              <Typography variant="body2">
                                ${employee.salary.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Tooltip title={`Salary: $${employee.salary.toLocaleString()} + Benefits: $${getEmployeeBenefits(employee).toLocaleString()} + Payroll Tax: $${getEmployeePayrollTax(employee).toLocaleString()}`}>
                                <Typography variant="body2" fontWeight="bold">
                                  ${getEmployeeTotalCost(employee).toLocaleString()}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Increase salary">
                                <Button
                                  size="small"
                                  aria-label={`Increase salary for ${employee.name}`}
                                  onClick={() => handleSalaryClick(employee)}
                                >
                                  Increase salary
                                </Button>
                              </Tooltip>
                              <Tooltip title="Fire Employee">
                                <Button
                                  size="small"
                                  color="error"
                                  aria-label={`Fire ${employee.name}`}
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

      {/* Hire Employee Dialog */}
      <Dialog open={openHireDialog} onClose={() => setOpenHireDialog(false)}>
        <DialogTitle>Hire New Employee</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Role"
            fullWidth
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as Employee['role'])}
            sx={{ mt: 1 }}
          >
            <MenuItem value="Lobbyist">Lobbyist ($7,000-$9,000)</MenuItem>
            <MenuItem value="Attorney">Attorney ($8,000-$10,000)</MenuItem>
            <MenuItem value="Support">Support ($3,500-$5,000)</MenuItem>
          </TextField>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            A new employee will be hired with random stats. Hiring cost: $5,000 (recruiting/onboarding).
            Total cost includes 25% benefits + 7.65% payroll tax on top of base salary.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHireDialog(false)}>Cancel</Button>
          <Button onClick={handleHire} variant="contained" color="primary">
            Hire
          </Button>
        </DialogActions>
      </Dialog>

      {/* Salary increase is a recurring commitment beginning next month. */}
      <Dialog open={openSalaryDialog} onClose={() => setOpenSalaryDialog(false)}>
        <DialogTitle>Increase salary for {salaryQuote.employee?.name ?? selectedEmployee?.name}</DialogTitle>
        <DialogContent>
          <TextField
            label="New Monthly Salary"
            type="number"
            fullWidth
            value={newSalary}
            onChange={(e) => setNewSalary(Number(e.target.value))}
            error={!validSalary}
            helperText={salaryQuote.disabledReason ?? (salaryQuote.isNoOp ? 'Unchanged amount: no salary or payroll change.' : undefined)}
            slotProps={{ htmlInput: { min: salaryQuote.employee?.salary ?? 0, step: 1 } }}
            sx={{ mt: 1 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Current salary: ${salaryQuote.employee?.salary.toLocaleString()}/month
            {salaryQuote.employee && ` (Loaded cost: $${getEmployeeTotalCost(salaryQuote.employee).toLocaleString()}/month)`}
          </Typography>
          {validSalary && <Typography variant="body2" sx={{ mt: 2 }} role="status">
            Proposed loaded employee cost: ${salaryQuote.employeeLoadedCost.toLocaleString()}/month.
            Total recurring payroll: ${salaryQuote.loadedPayroll.toLocaleString()}/month
            {' '}(+${salaryQuote.addedMonthlyPayroll.toLocaleString()}). Includes this simulation&apos;s benefits
            and payroll tax assumptions. {salaryQuote.isNoOp ? 'No change takes effect.' :
              `The roster updates now; cash and profit reflect the new payroll when you advance to ${salaryQuote.effectiveMonth}/${salaryQuote.effectiveYear}.`}
          </Typography>}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Salaries are commitments in this introductory model. Salary reductions and renegotiations
            are not simulated; existing inbox raise requests remain separate decisions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSalaryDialog(false)}>Cancel</Button>
          <Button onClick={handleSalarySave} variant="contained" color="primary" disabled={!validSalary}>
            {salaryQuote.isNoOp ? 'Keep current salary' : 'Increase salary'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
