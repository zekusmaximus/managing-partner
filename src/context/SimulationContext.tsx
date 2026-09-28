"use client";

import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import type {
  Employee, Client, Financials, FinancialHistoryEntry, Alert, InboxMessage,
  MessageChoice, SimulationState, OperatingCosts, Vendor, PartnerEconomics,
  BudgetItem, ARBuckets, LineOfCredit,
} from '@/types/simulation';
import {
  getLOCMonthlyInterest, getLOCAvailable,
  HIRING_COST, SEVERANCE_COST,
} from '@/types/simulation';
import { useSession } from '@/context/SessionContext';
import { generateInboxMessages as createInboxMessages } from '@/lib/simulation/scenarios';
import { advanceSimulationMonth, applyInboxChoice, collectOverdueReceivables, isValidAmount, recordCashMovement, recordOneTimeOperatingExpense, scheduleClientMeeting, writeOffReceivables } from '@/lib/simulation/engine';
import { fundStaffRecovery, type StaffRecoveryPlan } from '@/lib/simulation/burnout';

// Re-export types for consumers
export type { Employee, Client, Financials, FinancialHistoryEntry, Alert, InboxMessage, MessageChoice, SimulationState, OperatingCosts, Vendor, PartnerEconomics, BudgetItem, ARBuckets, LineOfCredit };

// ============= HELPER FUNCTIONS =============

const generateId = () => Math.random().toString(36).substring(2, 11);

const getRandomName = (): string => {
  const firstNames = ['Alex', 'Sam', 'Taylor', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Quinn', 'Avery', 'Cameron'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Wilson'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const getCurrentQuarter = (month: number): number => Math.ceil(month / 3);

// ============= INITIAL STATE =============

// ============= CONTEXT =============

type SimulationContextType = {
  state: SimulationState;
  advanceMonth: () => void;
  hireEmployee: (role: 'Lobbyist' | 'Attorney' | 'Support') => void;
  fireEmployee: (employeeId: string) => void;
  adjustSalary: (employeeId: string, newSalary: number) => void;
  fundStaffRecovery: (plan?: StaffRecoveryPlan) => void;
  meetClient: (clientId: string) => void;
  markInboxMessageRead: (messageId: string) => void;
  handleInboxChoice: (messageId: string, choiceId: string) => void;
  dismissAlert: (alertId: string) => void;
  addVendor: (name: string, category: Vendor['category'], monthlyCost: number) => void;
  removeVendor: (vendorId: string) => void;
  adjustOperatingCost: (category: keyof OperatingCosts, newAmount: number) => void;
  drawLineOfCredit: (amount: number) => void;
  repayLineOfCredit: (amount: number) => void;
  setPartnerDraw: (amount: number) => void;
  setBudget: (category: string, quarterlyAmount: number) => void;
  writeOffAR: (amount: number) => void;
  collectAR: () => void;
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

// ============= PROVIDER =============

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  const { simulation: state, setSimulation: setState } = useSession();

  // Generate alerts based on current state
  const generateAlerts = useCallback((currentState: SimulationState): Alert[] => {
    const alerts: Alert[] = [];

    currentState.employees.forEach(emp => {
      if (emp.burnout >= 80) {
        alerts.push({ id: generateId(), type: 'error', message: `${emp.name} is at ${emp.burnout}% burnout! Consider addressing this.`, timestamp: new Date() });
      } else if (emp.burnout >= 60) {
        alerts.push({ id: generateId(), type: 'warning', message: `${emp.name}'s burnout is at ${emp.burnout}%.`, timestamp: new Date() });
      }
    });

    currentState.clients.forEach(client => {
      if (client.satisfaction < 50) {
        alerts.push({ id: generateId(), type: 'error', message: `${client.name} satisfaction is critically low at ${client.satisfaction}%!`, timestamp: new Date(), actionTarget: { kind: 'client', clientId: client.id } });
      } else if (client.satisfaction < 70) {
        alerts.push({ id: generateId(), type: 'warning', message: `${client.name}'s satisfaction dropped to ${client.satisfaction}%.`, timestamp: new Date(), actionTarget: { kind: 'client', clientId: client.id } });
      }
    });

    currentState.clients.forEach(client => {
      if (client.contractMonthsRemaining <= 3 && client.contractMonthsRemaining > 0) {
        alerts.push({ id: generateId(), type: 'warning', message: `${client.name}'s contract expires in ${client.contractMonthsRemaining} month(s)!`, timestamp: new Date(), actionTarget: { kind: 'client', clientId: client.id } });
      }
    });

    if (currentState.financials.cashOnHand < 50000) {
      alerts.push({ id: generateId(), type: 'error', message: 'Cash on hand is critically low!', timestamp: new Date() });
    }

    // AR aging alerts
    if (currentState.arAging.sixtyDay > 0) {
      alerts.push({ id: generateId(), type: 'warning', message: `$${Math.round(currentState.arAging.sixtyDay).toLocaleString()} in AR is 61-90 days overdue.`, timestamp: new Date(), actionTarget: { kind: 'ar' } });
    }
    if (currentState.arAging.ninetyPlus > 0) {
      alerts.push({ id: generateId(), type: 'error', message: `$${Math.round(currentState.arAging.ninetyPlus).toLocaleString()} in AR is 90+ days overdue — consider write-off.`, timestamp: new Date(), actionTarget: { kind: 'ar' } });
    }

    // LOC alert
    if (currentState.lineOfCredit.drawn > 0) {
      alerts.push({ id: generateId(), type: 'info', message: `Line of credit balance: $${currentState.lineOfCredit.drawn.toLocaleString()} (${Math.round(getLOCMonthlyInterest(currentState.lineOfCredit)).toLocaleString()}/mo interest).`, timestamp: new Date() });
    }

    // Budget variance alerts
    const quarter = getCurrentQuarter(currentState.month);
    const monthInQuarter = ((currentState.month - 1) % 3) + 1;
    if (monthInQuarter === 3) {
      currentState.budget
        .filter(b => b.quarter === quarter && b.year === currentState.year)
        .forEach(b => {
          const variance = b.actualQuarterlySpend - b.plannedQuarterly;
          if (variance > b.plannedQuarterly * 0.1) {
            const overrunLabel = b.plannedQuarterly > 0
              ? `${Math.round(variance / b.plannedQuarterly * 100)}% over`
              : 'unbudgeted spend';
            alerts.push({ id: generateId(), type: 'warning', message: `${b.category} budget exceeded by $${Math.round(variance).toLocaleString()} (${overrunLabel}).`, timestamp: new Date() });
          }
        });
    }

    return alerts;
  }, []);

  const generateInboxMessages = useCallback((currentState: SimulationState): InboxMessage[] =>
    createInboxMessages(currentState, { random: Math.random, generateId, now: () => new Date() }), []);

  // ============= ADVANCE MONTH =============
  const advanceMonth = useCallback(() => {
    setState(prevState => advanceSimulationMonth(prevState, { random: Math.random, generateAlerts, generateInboxMessages }));
  }, [setState, generateAlerts, generateInboxMessages]);

  // ============= EMPLOYEE ACTIONS =============

  const hireEmployee = useCallback((role: 'Lobbyist' | 'Attorney' | 'Support') => {
    setState(prevState => {
      if (!['Lobbyist', 'Attorney', 'Support'].includes(role)) return prevState;
      const salaryRanges = { Lobbyist: [7000, 9000], Attorney: [8000, 10000], Support: [3500, 5000] };
      const [min, max] = salaryRanges[role];
      const newEmployee: Employee = {
        id: generateId(), name: getRandomName(), role,
        efficacy: 60 + Math.floor(Math.random() * 20),
        burnout: Math.floor(Math.random() * 20),
        salary: min + Math.floor(Math.random() * (max - min)),
        clientAffinity: 50 + Math.floor(Math.random() * 30),
        hireDate: { month: prevState.month, year: prevState.year },
      };
      return recordOneTimeOperatingExpense({
        ...prevState,
        employees: [...prevState.employees, newEmployee],
      }, 'hiring', HIRING_COST);
    });
  }, [setState]);

  const fireEmployee = useCallback((employeeId: string) => {
    setState(prevState => prevState.employees.some(emp => emp.id === employeeId) ? recordOneTimeOperatingExpense({
      ...prevState,
      employees: prevState.employees.filter(emp => emp.id !== employeeId),
    }, 'severance', SEVERANCE_COST) : prevState);
  }, [setState]);

  const adjustSalary = useCallback((employeeId: string, newSalary: number) => {
    if (!isValidAmount(newSalary)) return;
    setState(prevState => ({
      ...prevState,
      employees: prevState.employees.map(emp =>
        emp.id === employeeId ? { ...emp, salary: newSalary } : emp
      ),
    }));
  }, [setState]);

  const fundStaffRecoveryAction = useCallback((plan: StaffRecoveryPlan = 'full') => {
    setState(prevState => fundStaffRecovery(prevState, plan));
  }, [setState]);

  const meetClient = useCallback((clientId: string) => {
    setState(prevState => scheduleClientMeeting(prevState, clientId));
  }, [setState]);

  // ============= INBOX ACTIONS =============

  const markInboxMessageRead = useCallback((messageId: string) => {
    setState(prevState => ({
      ...prevState,
      inbox: prevState.inbox.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      ),
    }));
  }, [setState]);

  const handleInboxChoice = useCallback((messageId: string, choiceId: string) => {
    setState(prevState => applyInboxChoice(prevState, messageId, choiceId, { random: Math.random, generateId }));
  }, [setState]);

  // ============= ALERT ACTIONS =============

  const dismissAlert = useCallback((alertId: string) => {
    setState(prevState => ({
      ...prevState,
      alerts: prevState.alerts.filter(alert => alert.id !== alertId),
    }));
  }, [setState]);

  // ============= VENDOR ACTIONS =============

  const addVendor = useCallback((name: string, category: Vendor['category'], monthlyCost: number) => {
    if (!name.trim() || !isValidAmount(monthlyCost)) return;
    setState(prevState => ({
      ...prevState,
      vendors: [...prevState.vendors, { id: generateId(), name: name.trim(), category, monthlyCost, contractMonths: 12 }],
    }));
  }, [setState]);

  const removeVendor = useCallback((vendorId: string) => {
    setState(prevState => ({
      ...prevState,
      vendors: prevState.vendors.filter(v => v.id !== vendorId),
    }));
  }, [setState]);

  // ============= OPERATING COST ACTIONS =============

  const adjustOperatingCost = useCallback((category: keyof OperatingCosts, newAmount: number) => {
    if (!isValidAmount(newAmount, true)) return;
    setState(prevState => ({
      ...prevState,
      operatingCosts: { ...prevState.operatingCosts, [category]: newAmount },
    }));
  }, [setState]);

  // ============= LINE OF CREDIT ACTIONS =============

  const drawLineOfCredit = useCallback((amount: number) => {
    if (!isValidAmount(amount)) return;
    setState(prevState => {
      const available = getLOCAvailable(prevState.lineOfCredit);
      const drawAmount = Math.min(amount, available);
      if (drawAmount <= 0) return prevState;
      return {
        ...recordCashMovement(prevState, { kind: 'loc-draw', amount: drawAmount }),
        lineOfCredit: { ...prevState.lineOfCredit, drawn: prevState.lineOfCredit.drawn + drawAmount },
      };
    });
  }, [setState]);

  const repayLineOfCredit = useCallback((amount: number) => {
    if (!isValidAmount(amount)) return;
    setState(prevState => {
      const repayAmount = Math.min(amount, prevState.lineOfCredit.drawn, Math.max(0, prevState.financials.cashOnHand));
      if (repayAmount <= 0) return prevState;
      return {
        ...recordCashMovement(prevState, { kind: 'loc-repayment', amount: -repayAmount }),
        lineOfCredit: { ...prevState.lineOfCredit, drawn: prevState.lineOfCredit.drawn - repayAmount },
      };
    });
  }, [setState]);

  // ============= PARTNER ACTIONS =============

  const setPartnerDraw = useCallback((amount: number) => {
    if (!isValidAmount(amount, true)) return;
    setState(prevState => ({
      ...prevState,
      partnerEconomics: { ...prevState.partnerEconomics, monthlyDraw: amount },
    }));
  }, [setState]);

  // ============= BUDGET ACTIONS =============

  const setBudget = useCallback((category: string, quarterlyAmount: number) => {
    if (!isValidAmount(quarterlyAmount, true)) return;
    setState(prevState => {
      const quarter = getCurrentQuarter(prevState.month);
      return {
        ...prevState,
        budget: prevState.budget.map(b =>
          b.category === category && b.quarter === quarter && b.year === prevState.year
            ? { ...b, plannedQuarterly: quarterlyAmount }
            : b
        ),
      };
    });
  }, [setState]);

  // ============= AR ACTIONS =============

  const writeOffAR = useCallback((amount: number) => {
    setState(prevState => writeOffReceivables(prevState, amount));
  }, [setState]);

  const collectAR = useCallback(() => {
    setState(prevState => collectOverdueReceivables(prevState));
  }, [setState]);

  return (
    <SimulationContext.Provider value={{
      state, advanceMonth,
      hireEmployee, fireEmployee, adjustSalary, fundStaffRecovery: fundStaffRecoveryAction, meetClient,
      markInboxMessageRead, handleInboxChoice, dismissAlert,
      addVendor, removeVendor, adjustOperatingCost,
      drawLineOfCredit, repayLineOfCredit,
      setPartnerDraw, setBudget, writeOffAR, collectAR,
    }}>
      {children}
    </SimulationContext.Provider>
  );
};

// ============= HOOK =============

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
