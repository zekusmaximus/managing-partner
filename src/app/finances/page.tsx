"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
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

  const handleTabChange = (_: React.SyntheticEvent, nextTab: number) => {
    setActiveTab(nextTab);
    const path = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, '', nextTab === 3 ? `${path}#cash-flow` : path);
  };

  return (
        <Box sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" component="h1">
              Financial Management
            </Typography>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }} data-tutorial-target="finance-tabs">
            <Tabs value={displayedTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" aria-label="Financial reports">
              <Tab label="P&L Statement" />
              <Tab label="Budget" />
              <Tab label="Accounts Receivable" />
              <Tab label="Cash Flow" />
              <Tab label="Partner Economics" />
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
