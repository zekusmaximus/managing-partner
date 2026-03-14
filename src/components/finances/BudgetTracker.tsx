"use client";

import React, { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { useSimulation } from '@/context/SimulationContext';
import HelpTooltip from '@/components/help/HelpTooltip';

export default function BudgetTracker() {
  const { state, setBudget } = useSimulation();
  const [editOpen, setEditOpen] = useState(false);
  const [editCategory, setEditCategory] = useState('');
  const [editAmount, setEditAmount] = useState(0);

  const currentQuarter = Math.ceil(state.month / 3);
  const quarterBudget = state.budget.filter(b => b.quarter === currentQuarter && b.year === state.year);

  const chartData = quarterBudget.map(b => ({
    category: b.category,
    planned: b.plannedQuarterly,
    actual: b.actualQuarterlySpend,
    variance: b.actualQuarterlySpend - b.plannedQuarterly,
  }));

  const totalPlanned = quarterBudget.reduce((s, b) => s + b.plannedQuarterly, 0);
  const totalActual = quarterBudget.reduce((s, b) => s + b.actualQuarterlySpend, 0);
  const totalVariance = totalActual - totalPlanned;

  const getVarianceColor = (variance: number, planned: number) => {
    if (planned === 0) return 'default';
    const pct = variance / planned;
    if (pct > 0.1) return 'error';
    if (pct > 0) return 'warning';
    return 'success';
  };

  const handleEdit = (category: string, currentPlanned: number) => {
    setEditCategory(category);
    setEditAmount(currentPlanned);
    setEditOpen(true);
  };

  const handleSave = () => {
    setBudget(editCategory, editAmount);
    setEditOpen(false);
  };

  const monthsIntoQuarter = ((state.month - 1) % 3) + 1;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Budget vs Actual — Q{currentQuarter} {state.year} <HelpTooltip helpId="finance-budget-variance" />
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Month {monthsIntoQuarter} of 3 in current quarter
      </Typography>

      {/* Chart */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="category" width={100} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => `$${Math.round(Number(value)).toLocaleString()}`} />
            <Legend />
            <Bar dataKey="planned" name="Planned" fill="#1976d2" />
            <Bar dataKey="actual" name="Actual" fill="#ff9800" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Planned (Quarterly)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actual Spend</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Variance</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>% Used</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quarterBudget.map(b => {
              const variance = b.actualQuarterlySpend - b.plannedQuarterly;
              const pctUsed = b.plannedQuarterly > 0 ? (b.actualQuarterlySpend / b.plannedQuarterly * 100) : 0;
              return (
                <TableRow key={b.category} hover>
                  <TableCell>{b.category}</TableCell>
                  <TableCell align="right">${b.plannedQuarterly.toLocaleString()}</TableCell>
                  <TableCell align="right">${Math.round(b.actualQuarterlySpend).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${variance >= 0 ? '+' : ''}$${Math.round(variance).toLocaleString()}`}
                      size="small"
                      color={getVarianceColor(variance, b.plannedQuarterly) as 'error' | 'warning' | 'success' | 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${pctUsed.toFixed(0)}%`}
                      size="small"
                      color={pctUsed > 100 ? 'error' : pctUsed > 80 ? 'warning' : 'success'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button size="small" onClick={() => handleEdit(b.category, b.plannedQuarterly)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {/* Totals row */}
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>${totalPlanned.toLocaleString()}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>${Math.round(totalActual).toLocaleString()}</TableCell>
              <TableCell align="right">
                <Chip
                  label={`${totalVariance >= 0 ? '+' : ''}$${Math.round(totalVariance).toLocaleString()}`}
                  size="small"
                  color={getVarianceColor(totalVariance, totalPlanned) as 'error' | 'warning' | 'success' | 'default'}
                />
              </TableCell>
              <TableCell align="right">
                <Chip
                  label={`${totalPlanned > 0 ? (totalActual / totalPlanned * 100).toFixed(0) : 0}%`}
                  size="small"
                  color={totalActual > totalPlanned ? 'error' : 'success'}
                />
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Budget: {editCategory}</DialogTitle>
        <DialogContent>
          <TextField
            label="Quarterly Budget Amount"
            type="number"
            fullWidth
            value={editAmount}
            onChange={(e) => setEditAmount(Number(e.target.value))}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
