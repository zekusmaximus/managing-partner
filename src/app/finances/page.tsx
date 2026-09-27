"use client";

import { useEffect, useState } from 'react';
import { Box, Typography, Tabs, Tab, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTutorial } from '@/context/TutorialContext';
import PLStatement from '@/components/finances/PLStatement';
import BudgetTracker from '@/components/finances/BudgetTracker';
import ARManager from '@/components/finances/ARManager';
import CashFlowView from '@/components/finances/CashFlowView';
import PartnerEconomicsView from '@/components/finances/PartnerEconomicsView';

export default function Finances() {
  const { currentStep } = useTutorial();
  const [activeTab, setActiveTab] = useState(0);
  const displayedTab = currentStep?.id === 'm1-accounts-receivable' ? 2 : activeTab;

  useEffect(() => {
    const selectLinkedTab = () => {
      if (window.location.hash === '#cash-flow' || window.location.hash === '#credit-controls') setActiveTab(3);
    };
    selectLinkedTab();
    window.addEventListener('hashchange', selectLinkedTab);
    return () => window.removeEventListener('hashchange', selectLinkedTab);
  }, []);

  const selectTab = (nextTab: number) => {
    setActiveTab(nextTab);
    const path = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, '', nextTab === 3 ? `${path}#cash-flow` : path);
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
                value={displayedTab}
                label="Financial report"
                fullWidth
                onChange={(event) => selectTab(Number(event.target.value))}
              >
                {reportNames.map((name, index) => <MenuItem key={name} value={index}>{name}</MenuItem>)}
              </Select>
            </FormControl>
            <Tabs
              value={displayedTab}
              onChange={(_, nextTab: number) => selectTab(nextTab)}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="Financial reports"
              sx={{ display: { xs: 'none', md: 'flex' }, borderBottom: 1, borderColor: 'divider' }}
            >
              {reportNames.map(name => <Tab key={name} label={name} />)}
            </Tabs>
          </Box>

          {displayedTab === 0 && <PLStatement />}
          {displayedTab === 1 && <BudgetTracker />}
          {displayedTab === 2 && <ARManager />}
          {displayedTab === 3 && <CashFlowView />}
          {displayedTab === 4 && <PartnerEconomicsView />}
        </Box>
  );
}
