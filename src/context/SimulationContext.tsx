"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the types for our simulation state
export interface Employee {
  id: string;
  name: string;
  role: 'Lobbyist' | 'Attorney' | 'Support';
  efficacy: number; // 0-100
  burnout: number; // 0-100
  salary: number; // monthly
  clientAffinity: number; // 0-100, represents how well they get along with clients
}

export interface Client {
  id: string;
  name: string;
  type: 'Trade Association' | 'Corporation' | 'Non-Profit';
  feeStructure: 'Retainer' | 'Hourly';
  monthlyFee: number;
  satisfaction: number; // 0-100
  contractMonthsRemaining: number;
}

export interface Financials {
  cashOnHand: number;
  grossRevenue: number;
  operatingExpenses: number;
  netProfit: number;
  accountsReceivable: number;
}

export interface SimulationState {
  month: number;
  year: number;
  financials: Financials;
  employees: Employee[];
  clients: Client[];
  reputation: number; // 0-100
}

// Initial state for Month 1
const initialState: SimulationState = {
  month: 1,
  year: 2026,
  financials: {
    cashOnHand: 250000,
    grossRevenue: 0,
    operatingExpenses: 0,
    netProfit: 0,
    accountsReceivable: 0,
  },
  employees: [
    {
      id: 'emp1',
      name: 'Alex Johnson',
      role: 'Lobbyist',
      efficacy: 85,
      burnout: 20,
      salary: 8000,
      clientAffinity: 75,
    },
    {
      id: 'emp2',
      name: 'Sam Williams',
      role: 'Lobbyist',
      efficacy: 78,
      burnout: 15,
      salary: 7500,
      clientAffinity: 80,
    },
    {
      id: 'emp3',
      name: 'Taylor Brown',
      role: 'Attorney',
      efficacy: 90,
      burnout: 10,
      salary: 9000,
      clientAffinity: 70,
    },
    {
      id: 'emp4',
      name: 'Jordan Lee',
      role: 'Attorney',
      efficacy: 82,
      burnout: 25,
      salary: 8500,
      clientAffinity: 65,
    },
    {
      id: 'emp5',
      name: 'Casey Martinez',
      role: 'Support',
      efficacy: 70,
      burnout: 5,
      salary: 4000,
      clientAffinity: 90,
    },
  ],
  clients: [
    {
      id: 'client1',
      name: 'TechTrade Association',
      type: 'Trade Association',
      feeStructure: 'Retainer',
      monthlyFee: 15000,
      satisfaction: 80,
      contractMonthsRemaining: 12,
    },
    {
      id: 'client2',
      name: 'GlobalCorp Inc.',
      type: 'Corporation',
      feeStructure: 'Retainer',
      monthlyFee: 20000,
      satisfaction: 85,
      contractMonthsRemaining: 10,
    },
    {
      id: 'client3',
      name: 'EcoNon-Profit',
      type: 'Non-Profit',
      feeStructure: 'Retainer',
      monthlyFee: 10000,
      satisfaction: 75,
      contractMonthsRemaining: 8,
    },
    {
      id: 'client4',
      name: 'FinanceFed',
      type: 'Trade Association',
      feeStructure: 'Retainer',
      monthlyFee: 12000,
      satisfaction: 78,
      contractMonthsRemaining: 15,
    },
    {
      id: 'client5',
      name: 'HealthCorp',
      type: 'Corporation',
      feeStructure: 'Retainer',
      monthlyFee: 18000,
      satisfaction: 82,
      contractMonthsRemaining: 12,
    },
    {
      id: 'client6',
      name: 'EduAssoc',
      type: 'Trade Association',
      feeStructure: 'Retainer',
      monthlyFee: 11000,
      satisfaction: 77,
      contractMonthsRemaining: 9,
    },
    {
      id: 'client7',
      name: 'GreenOrg',
      type: 'Non-Profit',
      feeStructure: 'Retainer',
      monthlyFee: 9000,
      satisfaction: 76,
      contractMonthsRemaining: 7,
    },
    {
      id: 'client8',
      name: 'BuildCo',
      type: 'Corporation',
      feeStructure: 'Retainer',
      monthlyFee: 16000,
      satisfaction: 81,
      contractMonthsRemaining: 11,
    },
  ],
  reputation: 75,
};

// Create the context
type SimulationContextType = {
  state: SimulationState;
  setState: React.Dispatch<React.SetStateAction<SimulationState>>;
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

// Provider component
export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SimulationState>(initialState);

  return (
    <SimulationContext.Provider value={{ state, setState }}>
      {children}
    </SimulationContext.Provider>
  );
};

// Hook to use the simulation state
export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};