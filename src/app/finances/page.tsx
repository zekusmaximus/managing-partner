"use client";

import React, { useState } from 'react';
import { TopNav } from '@/components/layout/TopNav';
import { SideNav } from '@/components/layout/SideNav';
import { Box, Typography, Button, Tabs, Tab } from '@mui/material';
import { useSimulation } from '@/context/SimulationContext';
import PLStatement from '@/components/finances/PLStatement';
import BudgetTracker from '@/components/finances/BudgetTracker';
import ARManager from '@/components/finances/ARManager';
import CashFlowView from '@/components/finances/CashFlowView';
import PartnerEconomicsView from '@/components/finances/PartnerEconomicsView';

export default function Finances() {
  const { advanceMonth } = useSimulation();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopNav />
      <div style={{ display: 'flex', flex: 1 }}>
        <SideNav />
        <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1">
              Financial Management
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={advanceMonth}
              size="large"
            >
              Advance Month →
            </Button>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }} data-tutorial-target="finance-tabs">
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
              <Tab label="P&L Statement" />
              <Tab label="Budget" />
              <Tab label="Accounts Receivable" />
              <Tab label="Cash Flow" />
              <Tab label="Partner Economics" />
            </Tabs>
          </Box>

          {activeTab === 0 && <PLStatement />}
          {activeTab === 1 && <BudgetTracker />}
          {activeTab === 2 && <ARManager />}
          {activeTab === 3 && <CashFlowView />}
          {activeTab === 4 && <PartnerEconomicsView />}
        </Box>
      </div>
    </div>
  );
}
