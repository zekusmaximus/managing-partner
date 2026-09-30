"use client";

import { useEffect, useState } from 'react';
import { Box, Typography, Tabs, Tab, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import PLStatement from '@/components/finances/PLStatement';
import BudgetTracker from '@/components/finances/BudgetTracker';
import ARManager from '@/components/finances/ARManager';
import CashFlowView from '@/components/finances/CashFlowView';
import PartnerEconomicsView from '@/components/finances/PartnerEconomicsView';

export default function Finances() {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const selectLinkedTab = () => {
      const hash = window.location.hash;
      if (hash === '#accounts-receivable') setActiveTab(2);
      if (hash === '#budget') setActiveTab(1);
      if (hash === '#cash-flow' || hash === '#credit-controls') setActiveTab(3);
    };
    selectLinkedTab();
    window.addEventListener('hashchange', selectLinkedTab);
    return () => window.removeEventListener('hashchange', selectLinkedTab);
  }, []);

  const selectTab = (nextTab: number) => {
    setActiveTab(nextTab);
    const path = `${window.location.pathname}${window.location.search}`;
    const hash = nextTab === 1 ? '#budget' : nextTab === 2 ? '#accounts-receivable' : nextTab === 3 ? '#cash-flow' : '';
    window.history.replaceState(null, '', `${path}${hash}`);
  };

  const reportNames = ['P&L Statement', 'Budget', 'Accounts Receivable', 'Cash Flow', 'Partner Economics'];

  return (
        <Box sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
              Financial Management
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }} data-tutorial-target="finance-tabs">
            <FormControl fullWidth sx={{ display: { xs: 'flex', md: 'none' } }}>
              <InputLabel id="financial-report-label">Financial report</InputLabel>
              <Select
                labelId="financial-report-label"
                value={activeTab}
                label="Financial report"
                fullWidth
                onChange={(event) => selectTab(Number(event.target.value))}
              >
                {reportNames.map((name, index) => <MenuItem key={name} value={index}>{name}</MenuItem>)}
              </Select>
            </FormControl>
            <Tabs
              value={activeTab}
              onChange={(_, nextTab: number) => selectTab(nextTab)}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Financial reports"
              sx={{ display: { xs: 'none', md: 'flex' }, borderBottom: 1, borderColor: 'divider' }}
            >
              {reportNames.map(name => <Tab key={name} label={name} />)}
            </Tabs>
          </Box>

          {activeTab === 0 && <PLStatement />}
          {activeTab === 1 && <BudgetTracker />}
          {activeTab === 2 && <ARManager />}
          {activeTab === 3 && <CashFlowView />}
          {activeTab === 4 && <PartnerEconomicsView />}
        </Box>
  );
}
