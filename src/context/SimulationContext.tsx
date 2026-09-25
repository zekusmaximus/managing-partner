"use client";

import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import type {
  Employee, Client, Financials, FinancialHistoryEntry, Alert, InboxMessage,
  MessageChoice, SimulationState, OperatingCosts, Vendor, PartnerEconomics,
  BudgetItem, ARBuckets, LineOfCredit,
} from '@/types/simulation';
import {
  getARTotal,
  getLOCMonthlyInterest, getLOCAvailable,
  HIRING_COST, SEVERANCE_COST, BENEFITS_RATE,
} from '@/types/simulation';
import { useSession } from '@/context/SessionContext';
import { advanceSimulationMonth, applyInboxChoice, isValidAmount, recordCurrentCash, writeOffReceivables } from '@/lib/simulation/engine';

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
  addClient: (name: string, type: Client['type'], monthlyFee: number) => void;
  removeClient: (clientId: string) => void;
  updateClientSatisfaction: (clientId: string, delta: number) => void;
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
        alerts.push({ id: generateId(), type: 'error', message: `${client.name} satisfaction is critically low at ${client.satisfaction}%!`, timestamp: new Date() });
      } else if (client.satisfaction < 70) {
        alerts.push({ id: generateId(), type: 'warning', message: `${client.name}'s satisfaction dropped to ${client.satisfaction}%.`, timestamp: new Date() });
      }
    });

    currentState.clients.forEach(client => {
      if (client.contractMonthsRemaining <= 2 && client.contractMonthsRemaining > 0) {
        alerts.push({ id: generateId(), type: 'warning', message: `${client.name}'s contract expires in ${client.contractMonthsRemaining} month(s)!`, timestamp: new Date() });
      }
    });

    if (currentState.financials.cashOnHand < 50000) {
      alerts.push({ id: generateId(), type: 'error', message: 'Cash on hand is critically low!', timestamp: new Date() });
    }

    // AR aging alerts
    if (currentState.arAging.sixtyDay > 0) {
      alerts.push({ id: generateId(), type: 'warning', message: `$${Math.round(currentState.arAging.sixtyDay).toLocaleString()} in AR is 61-90 days overdue.`, timestamp: new Date() });
    }
    if (currentState.arAging.ninetyPlus > 0) {
      alerts.push({ id: generateId(), type: 'error', message: `$${Math.round(currentState.arAging.ninetyPlus).toLocaleString()} in AR is 90+ days overdue — consider write-off.`, timestamp: new Date() });
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

  // Generate inbox messages
  const generateInboxMessages = useCallback((currentState: SimulationState): InboxMessage[] => {
    const messages: InboxMessage[] = [];

    // Employee raise request
    if (Math.random() > 0.5 && currentState.employees.length > 0) {
      const emp = currentState.employees[Math.floor(Math.random() * currentState.employees.length)];
      messages.push({
        id: generateId(), type: 'request', title: 'Raise Request',
        description: `${emp.name} is requesting a salary increase. They cite market conditions and their contributions to recent client wins. Current salary: $${emp.salary.toLocaleString()}/mo.`,
        urgency: 'medium', requiresAction: true, read: false,
        choices: [
          { id: 'approve', label: 'Approve (+15%)', effect: 'Increases salary by 15% and employee morale' },
          { id: 'deny', label: 'Deny Request', effect: 'May decrease employee satisfaction' },
          { id: 'counter', label: 'Counter Offer (+8%)', effect: 'Compromise with 8% increase' },
        ],
        scenario: { kind: 'raise-request', employeeId: emp.id },
        timestamp: new Date(),
      });
    }

    // Client complaint
    const lowSatisfactionClients = currentState.clients.filter(c => c.satisfaction < 75);
    if (lowSatisfactionClients.length > 0 && Math.random() > 0.5) {
      const client = lowSatisfactionClients[Math.floor(Math.random() * lowSatisfactionClients.length)];
      messages.push({
        id: generateId(), type: 'alert', title: 'Client Feedback',
        description: `${client.name} has submitted negative feedback about our services. They mention slow response times and lack of visibility on legislative updates.`,
        urgency: 'high', requiresAction: true, read: false,
        choices: [
          { id: 'address', label: 'Schedule Meeting', effect: 'Improves client satisfaction' },
          { id: 'assign', label: 'Assign Dedicated Lobbyist', effect: 'Moderately improves satisfaction' },
          { id: 'ignore', label: 'Defer for Now', effect: 'May further decrease satisfaction' },
        ],
        scenario: { kind: 'client-feedback', clientId: client.id },
        timestamp: new Date(),
      });
    }

    // New business opportunity
    if (Math.random() > 0.7) {
      const companyNames = ['InnovateTech', 'EnergyCorp', 'PharmaLife', 'AutoDrive', 'FinServe'];
      const types: Client['type'][] = ['Corporation', 'Trade Association', 'Non-Profit'];
      const name = companyNames[Math.floor(Math.random() * companyNames.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      messages.push({
        id: generateId(), type: 'opportunity', title: 'New Client Interest',
        description: `${name} (${type}) has expressed interest in our government relations services. They have a monthly budget of $12,000-$18,000.`,
        urgency: 'medium', requiresAction: true, read: false,
        choices: [
          { id: 'pursue', label: 'Pursue Aggressively', effect: 'High chance of landing client, uses resources' },
          { id: 'initial-contact', label: 'Initial Contact', effect: 'Moderate chance of landing client' },
          { id: 'pass', label: 'Pass on Opportunity', effect: 'No effect' },
        ],
        scenario: { kind: 'new-client', name, clientType: type, monthlyFee: 15000 },
        timestamp: new Date(),
      });
    }

    // ---- BACK-OFFICE SCENARIOS ----

    // Rent renewal (every 12 months or so)
    if (currentState.month % 12 === 0 && Math.random() > 0.3) {
      const currentRent = currentState.operatingCosts.rent;
      const increase = Math.round(currentRent * 0.08);
      messages.push({
        id: generateId(), type: 'request', title: 'Lease Renewal Notice',
        description: `Your office lease is up for renewal. The landlord is proposing an 8% increase from $${currentRent.toLocaleString()} to $${(currentRent + increase).toLocaleString()}/month. Current market rates for comparable K Street office space range from $${Math.round(currentRent * 0.85).toLocaleString()} to $${Math.round(currentRent * 1.12).toLocaleString()}.`,
        urgency: 'high', requiresAction: true, read: false,
        choices: [
          { id: 'accept-rent', label: 'Accept Increase', effect: `Rent increases to $${(currentRent + increase).toLocaleString()}/mo` },
          { id: 'negotiate-rent', label: 'Negotiate (50% chance of 4%)', effect: 'May reduce increase to 4%' },
          { id: 'downgrade-rent', label: 'Move to Cheaper Space', effect: 'Save $3,000/mo but lose 5 reputation' },
        ],
        scenario: { kind: 'lease-renewal', currentRent },
        timestamp: new Date(),
      });
    }

    // IT vendor pitch
    if (Math.random() > 0.85) {
      const itVendor = currentState.vendors.find(v => v.category === 'IT');
      if (itVendor) {
        const savings = Math.round(itVendor.monthlyCost * 0.2);
        messages.push({
          id: generateId(), type: 'opportunity', title: 'IT Vendor Pitch',
          description: `A new IT services provider, TechForward Solutions, is offering managed IT services at $${(itVendor.monthlyCost - savings).toLocaleString()}/mo — 20% less than your current vendor (${itVendor.name}, $${itVendor.monthlyCost.toLocaleString()}/mo). They promise faster response times but are a newer company.`,
          urgency: 'low', requiresAction: true, read: false,
          choices: [
            { id: 'switch-vendor', label: 'Switch to New Vendor', effect: `Save $${savings.toLocaleString()}/mo but risk transition issues` },
            { id: 'keep-vendor', label: 'Stay with Current', effect: 'No change, continued reliability' },
            { id: 'negotiate-vendor', label: 'Negotiate with Current', effect: '50% chance of 10% discount' },
          ],
          scenario: { kind: 'it-vendor', vendorId: itVendor.id },
          timestamp: new Date(),
        });
      }
    }

    // Benefits cost increase (annual)
    if (currentState.month === 1 && Math.random() > 0.4) {
      const totalBenefitsCost = currentState.employees.reduce((sum, e) => sum + Math.round(e.salary * BENEFITS_RATE), 0);
      const increase = Math.round(totalBenefitsCost * 0.12);
      messages.push({
        id: generateId(), type: 'alert', title: 'Health Insurance Premium Increase',
        description: `Your health insurance broker notified you that premiums are increasing 12% at renewal. This adds approximately $${increase.toLocaleString()}/mo to your benefits costs across all ${currentState.employees.length} employees.`,
        urgency: 'high', requiresAction: true, read: false,
        choices: [
          { id: 'absorb-benefits', label: 'Absorb the Cost', effect: `Operating costs increase by ~$${increase.toLocaleString()}/mo` },
          { id: 'pass-benefits', label: 'Pass to Employees', effect: 'No cost increase but burnout +10 across all staff' },
          { id: 'cheaper-plan', label: 'Switch to Cheaper Plan', effect: 'Costs stay flat but employee morale drops slightly' },
        ],
        scenario: { kind: 'benefits-increase', monthlyIncrease: increase },
        timestamp: new Date(),
      });
    }

    // Partner distribution (quarterly)
    if (currentState.month % 3 === 0 && currentState.partnerEconomics.distributionPool > 10000) {
      const pool = currentState.partnerEconomics.distributionPool;
      messages.push({
        id: generateId(), type: 'request', title: 'Quarterly Partner Distribution',
        description: `The distribution pool has accumulated $${Math.round(pool).toLocaleString()}. As managing partner, you need to decide on the quarterly distribution. Your current cash position is $${currentState.financials.cashOnHand.toLocaleString()}.`,
        urgency: 'medium', requiresAction: true, read: false,
        choices: [
          { id: 'full-distribution', label: `Distribute Full ($${Math.round(pool).toLocaleString()})`, effect: 'Reduces cash reserves but rewards partnership' },
          { id: 'partial-distribution', label: `Distribute Half ($${Math.round(pool / 2).toLocaleString()})`, effect: 'Balance between reward and reserves' },
          { id: 'defer-distribution', label: 'Defer to Next Quarter', effect: 'Builds cash reserves, pool carries forward' },
        ],
        scenario: { kind: 'partner-distribution', availablePool: pool },
        timestamp: new Date(),
      });
    }

    // Collections problem
    if (currentState.arAging.sixtyDay > 5000 && Math.random() > 0.5) {
      const overdueAmount = Math.round(currentState.arAging.sixtyDay);
      const slowClients = currentState.clients.filter(c => c.paymentProfile === 'slow');
      const clientName = slowClients.length > 0 ? slowClients[0].name : 'a client';
      messages.push({
        id: generateId(), type: 'alert', title: 'Collections Problem',
        description: `${clientName} has $${overdueAmount.toLocaleString()} in invoices that are 60+ days past due. Your collections rate on aging receivables is declining. Total overdue AR: $${Math.round(currentState.arAging.sixtyDay + currentState.arAging.ninetyPlus).toLocaleString()}.`,
        urgency: 'high', requiresAction: true, read: false,
        choices: [
          { id: 'demand-letter', label: 'Send Formal Demand', effect: 'Improves collection rate but may strain relationship' },
          { id: 'personal-call', label: 'Personal Call from Partner', effect: 'Moderately improves collections, maintains relationship' },
          { id: 'write-off-ar', label: 'Write Off Balance', effect: 'Removes from AR, recognized as bad debt expense' },
        ],
        scenario: { kind: 'collections-problem', clientId: slowClients[0]?.id, overdueAmount },
        timestamp: new Date(),
      });
    }

    // Budget overrun
    const quarter = getCurrentQuarter(currentState.month);
    const overBudgetItems = currentState.budget.filter(b =>
      b.quarter === quarter && b.year === currentState.year && b.actualQuarterlySpend > b.plannedQuarterly * 1.15
    );
    if (overBudgetItems.length > 0 && Math.random() > 0.5) {
      const item = overBudgetItems[0];
      const overrun = Math.round(item.actualQuarterlySpend - item.plannedQuarterly);
      messages.push({
        id: generateId(), type: 'alert', title: 'Budget Overrun Alert',
        description: `${item.category} spending has exceeded the quarterly budget by $${overrun.toLocaleString()} (${item.plannedQuarterly > 0 ? `${Math.round(overrun / item.plannedQuarterly * 100)}% over` : 'unbudgeted spend'}). Planned: $${item.plannedQuarterly.toLocaleString()}, Actual: $${Math.round(item.actualQuarterlySpend).toLocaleString()}.`,
        urgency: 'medium', requiresAction: true, read: false,
        choices: [
          { id: 'cut-elsewhere', label: 'Cut Other Categories', effect: 'Reduces misc spending by 20% for remainder of quarter' },
          { id: 'accept-overrun', label: 'Accept Overrun', effect: 'No action, budget stays exceeded' },
          { id: 'reallocate', label: 'Reallocate Budget', effect: 'Moves funds from underspent categories' },
        ],
        scenario: { kind: 'budget-overrun', category: item.category },
        timestamp: new Date(),
      });
    }

    // Office equipment failure
    if (Math.random() > 0.9) {
      const equipment = ['network server', 'multifunction copier', 'phone system', 'HVAC unit'][Math.floor(Math.random() * 4)];
      messages.push({
        id: generateId(), type: 'alert', title: 'Office Equipment Failure',
        description: `The office ${equipment} has failed and needs replacement. This is affecting daily operations. You have three options with different cost and reliability trade-offs.`,
        urgency: 'high', requiresAction: true, read: false,
        choices: [
          { id: 'buy-equipment', label: 'Buy New ($8,000)', effect: 'One-time cost, fully resolved' },
          { id: 'lease-equipment', label: 'Lease ($300/mo)', effect: 'Adds monthly vendor cost, includes maintenance' },
          { id: 'temp-fix', label: 'Temporary Fix ($1,000)', effect: 'Cheap but may fail again in 3-6 months' },
        ],
        scenario: { kind: 'equipment-failure' },
        timestamp: new Date(),
      });
    }

    // Tax planning (quarterly)
    if (currentState.month % 3 === 0 && Math.random() > 0.5) {
      const estimatedTax = Math.round(Math.max(0, currentState.financials.netProfit * 3 * 0.25));
      if (estimatedTax > 0) {
        messages.push({
          id: generateId(), type: 'request', title: 'Quarterly Tax Planning',
          description: `Your accountant recommends making a quarterly estimated tax payment of $${estimatedTax.toLocaleString()} based on this quarter's projected income. Failure to make timely payments may result in penalties.`,
          urgency: 'medium', requiresAction: true, read: false,
          choices: [
            { id: 'pay-taxes', label: `Pay Now ($${estimatedTax.toLocaleString()})`, effect: 'Reduces cash but avoids penalties' },
            { id: 'defer-taxes', label: 'Defer Payment', effect: 'Preserves cash but risks 5% penalty' },
            { id: 'accelerate-expenses', label: 'Accelerate Deductions', effect: 'Reduce taxable income by prepaying some expenses' },
          ],
          scenario: { kind: 'tax-planning', estimatedTax },
          timestamp: new Date(),
        });
      }
    }

    // Ensure at least one message
    if (messages.length < 1) {
      const updates = [
        'Congress is considering new regulations that may affect your clients in the tech sector.',
        'A key committee hearing on healthcare policy is scheduled for next month.',
        'Budget negotiations may impact government contracting opportunities.',
        'New lobbying disclosure requirements are being discussed.',
      ];
      messages.push({
        id: generateId(), type: 'alert', title: 'Industry Update',
        description: updates[Math.floor(Math.random() * updates.length)],
        urgency: 'low', requiresAction: false, read: false, choices: [], scenario: { kind: 'industry-update' }, timestamp: new Date(),
      });
    }

    return messages;
  }, []);

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
      return recordCurrentCash({
        ...prevState,
        employees: [...prevState.employees, newEmployee],
      }, prevState.financials.cashOnHand - HIRING_COST);
    });
  }, [setState]);

  const fireEmployee = useCallback((employeeId: string) => {
    setState(prevState => prevState.employees.some(emp => emp.id === employeeId) ? recordCurrentCash({
      ...prevState,
      employees: prevState.employees.filter(emp => emp.id !== employeeId),
    }, prevState.financials.cashOnHand - SEVERANCE_COST) : prevState);
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

  // ============= CLIENT ACTIONS =============

  const addClient = useCallback((name: string, type: Client['type'], monthlyFee: number) => {
    if (!name.trim() || !isValidAmount(monthlyFee)) return;
    setState(prevState => {
      const profiles: Client['paymentProfile'][] = ['prompt', 'normal', 'slow'];
      const newClient: Client = {
        id: generateId(), name: name.trim(), type, feeStructure: 'Retainer', monthlyFee,
        satisfaction: 70 + Math.floor(Math.random() * 20),
        contractMonthsRemaining: 12,
        paymentProfile: profiles[Math.floor(Math.random() * profiles.length)],
        lastPaymentMonth: prevState.month,
      };
      return { ...prevState, clients: [...prevState.clients, newClient] };
    });
  }, [setState]);

  const removeClient = useCallback((clientId: string) => {
    setState(prevState => ({
      ...prevState,
      clients: prevState.clients.filter(client => client.id !== clientId),
    }));
  }, [setState]);

  const updateClientSatisfaction = useCallback((clientId: string, delta: number) => {
    if (!Number.isFinite(delta)) return;
    setState(prevState => ({
      ...prevState,
      clients: prevState.clients.map(client =>
        client.id === clientId
          ? { ...client, satisfaction: Math.max(0, Math.min(100, client.satisfaction + delta)) }
          : client
      ),
    }));
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
        ...recordCurrentCash(prevState, prevState.financials.cashOnHand + drawAmount),
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
        ...recordCurrentCash(prevState, prevState.financials.cashOnHand - repayAmount),
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
    setState(prevState => {
      // Manual collection effort — collect 30% of overdue (30+) AR
      const collectFrom30 = Math.round(prevState.arAging.thirtyDay * 0.3);
      const collectFrom60 = Math.round(prevState.arAging.sixtyDay * 0.3);
      const collectFrom90 = Math.round(prevState.arAging.ninetyPlus * 0.15);
      const totalCollected = collectFrom30 + collectFrom60 + collectFrom90;
      return recordCurrentCash({
        ...prevState,
        arAging: {
          ...prevState.arAging,
          thirtyDay: prevState.arAging.thirtyDay - collectFrom30,
          sixtyDay: prevState.arAging.sixtyDay - collectFrom60,
          ninetyPlus: prevState.arAging.ninetyPlus - collectFrom90,
        },
      }, prevState.financials.cashOnHand + totalCollected, totalCollected);
    });
  }, [setState]);

  return (
    <SimulationContext.Provider value={{
      state, advanceMonth,
      hireEmployee, fireEmployee, adjustSalary,
      addClient, removeClient, updateClientSatisfaction,
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
