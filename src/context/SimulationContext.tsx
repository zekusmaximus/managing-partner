"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type {
  Employee, Client, Financials, FinancialHistoryEntry, Alert, InboxMessage,
  MessageChoice, SimulationState, OperatingCosts, Vendor, PartnerEconomics,
  BudgetItem, ARBuckets, LineOfCredit,
} from '@/types/simulation';
import {
  getEmployeeTotalCost, getOperatingCostsTotal, getARTotal,
  getLOCMonthlyInterest, getLOCAvailable,
  AR_COLLECTION_RATES, HIRING_COST, SEVERANCE_COST,
  BENEFITS_RATE, PAYROLL_TAX_RATE,
} from '@/types/simulation';

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

const initialEmployees: Employee[] = [
  { id: 'emp1', name: 'Alex Johnson', role: 'Lobbyist', efficacy: 85, burnout: 20, salary: 8000, clientAffinity: 75, hireDate: { month: 6, year: 2025 } },
  { id: 'emp2', name: 'Sam Williams', role: 'Lobbyist', efficacy: 78, burnout: 15, salary: 7500, clientAffinity: 80, hireDate: { month: 3, year: 2025 } },
  { id: 'emp3', name: 'Taylor Brown', role: 'Attorney', efficacy: 90, burnout: 10, salary: 9000, clientAffinity: 70, hireDate: { month: 1, year: 2024 } },
  { id: 'emp4', name: 'Jordan Lee', role: 'Attorney', efficacy: 82, burnout: 25, salary: 8500, clientAffinity: 65, hireDate: { month: 9, year: 2024 } },
  { id: 'emp5', name: 'Casey Martinez', role: 'Support', efficacy: 70, burnout: 5, salary: 4000, clientAffinity: 90, hireDate: { month: 1, year: 2025 } },
];

const initialClients: Client[] = [
  { id: 'client1', name: 'TechTrade Association', type: 'Trade Association', feeStructure: 'Retainer', monthlyFee: 15000, satisfaction: 80, contractMonthsRemaining: 12, paymentProfile: 'normal', lastPaymentMonth: 0 },
  { id: 'client2', name: 'GlobalCorp Inc.', type: 'Corporation', feeStructure: 'Retainer', monthlyFee: 20000, satisfaction: 85, contractMonthsRemaining: 10, paymentProfile: 'prompt', lastPaymentMonth: 0 },
  { id: 'client3', name: 'EcoNon-Profit', type: 'Non-Profit', feeStructure: 'Retainer', monthlyFee: 10000, satisfaction: 75, contractMonthsRemaining: 8, paymentProfile: 'slow', lastPaymentMonth: 0 },
  { id: 'client4', name: 'FinanceFed', type: 'Trade Association', feeStructure: 'Retainer', monthlyFee: 12000, satisfaction: 78, contractMonthsRemaining: 15, paymentProfile: 'normal', lastPaymentMonth: 0 },
  { id: 'client5', name: 'HealthCorp', type: 'Corporation', feeStructure: 'Retainer', monthlyFee: 18000, satisfaction: 82, contractMonthsRemaining: 12, paymentProfile: 'prompt', lastPaymentMonth: 0 },
  { id: 'client6', name: 'EduAssoc', type: 'Trade Association', feeStructure: 'Retainer', monthlyFee: 11000, satisfaction: 77, contractMonthsRemaining: 9, paymentProfile: 'normal', lastPaymentMonth: 0 },
  { id: 'client7', name: 'GreenOrg', type: 'Non-Profit', feeStructure: 'Retainer', monthlyFee: 9000, satisfaction: 76, contractMonthsRemaining: 7, paymentProfile: 'slow', lastPaymentMonth: 0 },
  { id: 'client8', name: 'BuildCo', type: 'Corporation', feeStructure: 'Retainer', monthlyFee: 16000, satisfaction: 81, contractMonthsRemaining: 11, paymentProfile: 'prompt', lastPaymentMonth: 0 },
];

const initialOperatingCosts: OperatingCosts = {
  rent: 12000,
  insurance: 3000,
  technology: 2000,
  compliance: 1500,
  misc: 1500,
};

const initialVendors: Vendor[] = [
  { id: 'vendor1', name: 'Becker & Associates', category: 'Accounting', monthlyCost: 2500, contractMonths: 12 },
  { id: 'vendor2', name: 'CapitalIT Solutions', category: 'IT', monthlyCost: 1500, contractMonths: 12 },
  { id: 'vendor3', name: 'CleanSpace Services', category: 'Janitorial', monthlyCost: 800, contractMonths: 6 },
];

const initialPartnerEconomics: PartnerEconomics = {
  monthlyDraw: 15000,
  distributionPool: 0,
  lastDistributionMonth: 0,
  lastDistributionYear: 2025,
  totalDistributed: 0,
};

const initialLineOfCredit: LineOfCredit = {
  limit: 100000,
  drawn: 0,
  interestRate: 0.08,
};

const initialARBuckets: ARBuckets = {
  current: 15000,
  thirtyDay: 0,
  sixtyDay: 0,
  ninetyPlus: 0,
};

// Calculate initial financials
const initialTotalPayroll = initialEmployees.reduce((sum, emp) => sum + getEmployeeTotalCost(emp), 0);
const initialOpCosts = getOperatingCostsTotal(initialOperatingCosts);
const initialVendorCosts = initialVendors.reduce((sum, v) => sum + v.monthlyCost, 0);
const initialRevenue = initialClients.reduce((sum, c) => sum + c.monthlyFee, 0);
const initialTotalExpenses = initialTotalPayroll + initialOpCosts + initialVendorCosts + initialPartnerEconomics.monthlyDraw;

const initialBudget: BudgetItem[] = [
  { category: 'Payroll', plannedQuarterly: initialTotalPayroll * 3, actualQuarterlySpend: 0, quarter: 1, year: 2026 },
  { category: 'Rent', plannedQuarterly: initialOperatingCosts.rent * 3, actualQuarterlySpend: 0, quarter: 1, year: 2026 },
  { category: 'Insurance', plannedQuarterly: initialOperatingCosts.insurance * 3, actualQuarterlySpend: 0, quarter: 1, year: 2026 },
  { category: 'Technology', plannedQuarterly: initialOperatingCosts.technology * 3, actualQuarterlySpend: 0, quarter: 1, year: 2026 },
  { category: 'Compliance', plannedQuarterly: initialOperatingCosts.compliance * 3, actualQuarterlySpend: 0, quarter: 1, year: 2026 },
  { category: 'Vendors', plannedQuarterly: initialVendorCosts * 3, actualQuarterlySpend: 0, quarter: 1, year: 2026 },
  { category: 'Partner Draw', plannedQuarterly: initialPartnerEconomics.monthlyDraw * 3, actualQuarterlySpend: 0, quarter: 1, year: 2026 },
  { category: 'Misc', plannedQuarterly: initialOperatingCosts.misc * 3, actualQuarterlySpend: 0, quarter: 1, year: 2026 },
];

const initialState: SimulationState = {
  month: 1,
  year: 2026,
  financials: {
    cashOnHand: 250000,
    grossRevenue: initialRevenue,
    operatingExpenses: initialTotalExpenses,
    netProfit: initialRevenue - initialTotalExpenses,
    collectionsThisMonth: 0,
    totalPayroll: initialTotalPayroll,
    totalOperatingCosts: initialOpCosts,
    totalVendorCosts: initialVendorCosts,
    partnerDrawThisMonth: initialPartnerEconomics.monthlyDraw,
    locInterestThisMonth: 0,
  },
  financialHistory: [{
    month: 1, year: 2026,
    revenue: initialRevenue,
    expenses: initialTotalExpenses,
    profit: initialRevenue - initialTotalExpenses,
    collections: 0,
    operatingCosts: initialOpCosts,
    vendorCosts: initialVendorCosts,
    partnerDraw: initialPartnerEconomics.monthlyDraw,
    payroll: initialTotalPayroll,
    arWriteOff: 0,
    locInterest: 0,
    cashOnHand: 250000,
  }],
  employees: initialEmployees,
  clients: initialClients,
  reputation: 75,
  alerts: [],
  inbox: [],
  operatingCosts: initialOperatingCosts,
  vendors: initialVendors,
  partnerEconomics: initialPartnerEconomics,
  budget: initialBudget,
  arAging: initialARBuckets,
  lineOfCredit: initialLineOfCredit,
};

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
  const [state, setState] = useState<SimulationState>(initialState);

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
            alerts.push({ id: generateId(), type: 'warning', message: `${b.category} budget exceeded by $${Math.round(variance).toLocaleString()} (${Math.round(variance / b.plannedQuarterly * 100)}% over).`, timestamp: new Date() });
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
        description: `${item.category} spending has exceeded the quarterly budget by $${overrun.toLocaleString()} (${Math.round(overrun / item.plannedQuarterly * 100)}% over). Planned: $${item.plannedQuarterly.toLocaleString()}, Actual: $${Math.round(item.actualQuarterlySpend).toLocaleString()}.`,
        urgency: 'medium', requiresAction: true, read: false,
        choices: [
          { id: 'cut-elsewhere', label: 'Cut Other Categories', effect: 'Reduces misc spending by 20% for remainder of quarter' },
          { id: 'accept-overrun', label: 'Accept Overrun', effect: 'No action, budget stays exceeded' },
          { id: 'reallocate', label: 'Reallocate Budget', effect: 'Moves funds from underspent categories' },
        ],
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
        urgency: 'low', requiresAction: false, read: false, choices: [], timestamp: new Date(),
      });
    }

    return messages;
  }, []);

  // ============= ADVANCE MONTH =============
  const advanceMonth = useCallback(() => {
    setState(prevState => {
      const newMonth = prevState.month === 12 ? 1 : prevState.month + 1;
      const newYear = prevState.month === 12 ? prevState.year + 1 : prevState.year;
      const quarter = getCurrentQuarter(newMonth);

      // 1. Update employees (burnout/efficacy)
      const updatedEmployees = prevState.employees.map(emp => {
        let newBurnout = Math.min(100, emp.burnout + Math.floor(Math.random() * 5) + 2);
        let newEfficacy = Math.max(0, emp.efficacy - Math.floor(newBurnout / 20));
        if (newBurnout < 30) {
          newEfficacy = Math.min(100, newEfficacy + 2);
        }
        return { ...emp, burnout: newBurnout, efficacy: newEfficacy };
      });

      // 2. Update clients (satisfaction/contracts)
      let updatedClients = prevState.clients.map(client => ({
        ...client,
        satisfaction: Math.max(0, Math.min(100, client.satisfaction + (Math.floor(Math.random() * 11) - 5))),
        contractMonthsRemaining: Math.max(0, client.contractMonthsRemaining - 1),
      }));
      updatedClients = updatedClients.filter(client => {
        if (client.contractMonthsRemaining === 0) return Math.random() > 0.3;
        return true;
      });

      // 3. Revenue recognition — new invoices go to AR current bucket
      const monthlyRevenue = updatedClients.reduce((sum, c) => sum + c.monthlyFee, 0);

      // 4. AR aging — shift buckets forward, then add new invoices
      // Calculate collections from each bucket based on client payment profiles
      const avgCollectionRate = updatedClients.length > 0
        ? updatedClients.reduce((sum, c) => {
            const rate = AR_COLLECTION_RATES[c.paymentProfile];
            return sum + rate.current;
          }, 0) / updatedClients.length
        : 0.8;

      // Collections from each aging bucket
      const collectFromCurrent = Math.round(prevState.arAging.current * avgCollectionRate);
      const collectFrom30 = Math.round(prevState.arAging.thirtyDay * avgCollectionRate * 0.85);
      const collectFrom60 = Math.round(prevState.arAging.sixtyDay * avgCollectionRate * 0.6);
      const collectFrom90 = Math.round(prevState.arAging.ninetyPlus * avgCollectionRate * 0.3);
      const totalCollections = collectFromCurrent + collectFrom30 + collectFrom60 + collectFrom90;

      // Auto write-off: 20% of 90+ that wasn't collected
      const autoWriteOff = Math.round((prevState.arAging.ninetyPlus - collectFrom90) * 0.2);

      // New AR buckets after aging
      const newAR: ARBuckets = {
        current: monthlyRevenue, // new invoices
        thirtyDay: prevState.arAging.current - collectFromCurrent, // uncollected current ages to 30
        sixtyDay: prevState.arAging.thirtyDay - collectFrom30, // uncollected 30 ages to 60
        ninetyPlus: Math.max(0, (prevState.arAging.sixtyDay - collectFrom60) + (prevState.arAging.ninetyPlus - collectFrom90 - autoWriteOff)), // 60 ages to 90+
      };

      // 5. Calculate all expenses
      const totalPayroll = updatedEmployees.reduce((sum, emp) => sum + getEmployeeTotalCost(emp), 0);
      const opCosts = getOperatingCostsTotal(prevState.operatingCosts);
      const vendorCosts = prevState.vendors.reduce((sum, v) => sum + v.monthlyCost, 0);
      const partnerDraw = prevState.partnerEconomics.monthlyDraw;
      const locInterest = getLOCMonthlyInterest(prevState.lineOfCredit);
      const totalExpenses = totalPayroll + opCosts + vendorCosts + partnerDraw + locInterest;

      // 6. Cash flow: cash += collections - expenses
      let newCash = prevState.financials.cashOnHand + totalCollections - totalExpenses;

      // 7. Line of credit mechanics
      let newLOC = { ...prevState.lineOfCredit };
      if (newCash < 20000 && newLOC.drawn < newLOC.limit) {
        // Auto-draw to bring cash to $50K
        const drawAmount = Math.min(50000 - newCash, newLOC.limit - newLOC.drawn);
        if (drawAmount > 0) {
          newCash += drawAmount;
          newLOC = { ...newLOC, drawn: newLOC.drawn + drawAmount };
        }
      } else if (newCash > 80000 && newLOC.drawn > 0) {
        // Auto-repay
        const repayAmount = Math.min(newCash - 60000, newLOC.drawn);
        if (repayAmount > 0) {
          newCash -= repayAmount;
          newLOC = { ...newLOC, drawn: newLOC.drawn - repayAmount };
        }
      }

      // 8. Partner economics — accumulate to distribution pool
      const netProfit = monthlyRevenue - totalExpenses;
      let newPartnerEconomics = { ...prevState.partnerEconomics };
      if (netProfit > 0) {
        newPartnerEconomics.distributionPool += Math.round(netProfit * 0.4); // 40% of profit to distribution pool
      }

      // 9. Budget tracking — update actual spend for current quarter
      const newBudget = prevState.budget.map(b => {
        if (b.quarter === quarter && b.year === newYear) {
          let monthlyActual = 0;
          switch (b.category) {
            case 'Payroll': monthlyActual = totalPayroll; break;
            case 'Rent': monthlyActual = prevState.operatingCosts.rent; break;
            case 'Insurance': monthlyActual = prevState.operatingCosts.insurance; break;
            case 'Technology': monthlyActual = prevState.operatingCosts.technology; break;
            case 'Compliance': monthlyActual = prevState.operatingCosts.compliance; break;
            case 'Vendors': monthlyActual = vendorCosts; break;
            case 'Partner Draw': monthlyActual = partnerDraw; break;
            case 'Misc': monthlyActual = prevState.operatingCosts.misc; break;
          }
          return { ...b, actualQuarterlySpend: b.actualQuarterlySpend + monthlyActual };
        }
        return b;
      });

      // If new quarter starts, create new budget items (carry forward planned amounts)
      const monthInQuarter = ((newMonth - 1) % 3) + 1;
      if (monthInQuarter === 1) {
        const existingForQuarter = newBudget.some(b => b.quarter === quarter && b.year === newYear);
        if (!existingForQuarter) {
          // Create new quarter budget from last quarter's planned amounts
          const lastQuarter = quarter === 1 ? 4 : quarter - 1;
          const lastYear = quarter === 1 ? newYear - 1 : newYear;
          const lastBudgets = newBudget.filter(b => b.quarter === lastQuarter && b.year === lastYear);
          lastBudgets.forEach(lb => {
            newBudget.push({
              category: lb.category,
              plannedQuarterly: lb.plannedQuarterly,
              actualQuarterlySpend: 0,
              quarter,
              year: newYear,
            });
          });
        }
      }

      // Update vendor contract durations
      const updatedVendors = prevState.vendors.map(v => ({
        ...v,
        contractMonths: Math.max(0, v.contractMonths - 1),
      }));

      // Update reputation
      const avgClientSatisfaction = updatedClients.length > 0
        ? updatedClients.reduce((sum, c) => sum + c.satisfaction, 0) / updatedClients.length
        : 50;
      const avgEmployeeEfficacy = updatedEmployees.length > 0
        ? updatedEmployees.reduce((sum, e) => sum + e.efficacy, 0) / updatedEmployees.length
        : 50;
      let newReputation = Math.round((avgClientSatisfaction * 0.6) + (avgEmployeeEfficacy * 0.4));
      newReputation = Math.max(0, Math.min(100, newReputation + (Math.random() > 0.5 ? 1 : -1)));

      // Financial history
      const newHistoryEntry: FinancialHistoryEntry = {
        month: newMonth, year: newYear,
        revenue: monthlyRevenue, expenses: totalExpenses, profit: netProfit,
        collections: totalCollections, operatingCosts: opCosts, vendorCosts,
        partnerDraw, payroll: totalPayroll, arWriteOff: autoWriteOff,
        locInterest, cashOnHand: newCash,
      };
      const newHistory = [...prevState.financialHistory, newHistoryEntry].slice(-12);

      // Build new state for alert/inbox generation
      const newFinancials: Financials = {
        cashOnHand: newCash,
        grossRevenue: monthlyRevenue,
        operatingExpenses: totalExpenses,
        netProfit,
        collectionsThisMonth: totalCollections,
        totalPayroll,
        totalOperatingCosts: opCosts,
        totalVendorCosts: vendorCosts,
        partnerDrawThisMonth: partnerDraw,
        locInterestThisMonth: locInterest,
      };

      const nextState: SimulationState = {
        ...prevState,
        month: newMonth, year: newYear,
        financials: newFinancials,
        financialHistory: newHistory,
        employees: updatedEmployees,
        clients: updatedClients,
        reputation: newReputation,
        arAging: newAR,
        lineOfCredit: newLOC,
        vendors: updatedVendors,
        partnerEconomics: newPartnerEconomics,
        budget: newBudget,
      };

      const newAlerts = generateAlerts(nextState);
      const newInboxMessages = generateInboxMessages(nextState);

      return {
        ...nextState,
        alerts: [...newAlerts, ...prevState.alerts].slice(0, 10),
        inbox: [...newInboxMessages, ...prevState.inbox].slice(0, 20),
      };
    });
  }, [generateAlerts, generateInboxMessages]);

  // ============= EMPLOYEE ACTIONS =============

  const hireEmployee = useCallback((role: 'Lobbyist' | 'Attorney' | 'Support') => {
    setState(prevState => {
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
      return {
        ...prevState,
        employees: [...prevState.employees, newEmployee],
        financials: {
          ...prevState.financials,
          cashOnHand: prevState.financials.cashOnHand - HIRING_COST,
        },
      };
    });
  }, []);

  const fireEmployee = useCallback((employeeId: string) => {
    setState(prevState => ({
      ...prevState,
      employees: prevState.employees.filter(emp => emp.id !== employeeId),
      financials: {
        ...prevState.financials,
        cashOnHand: prevState.financials.cashOnHand - SEVERANCE_COST,
      },
    }));
  }, []);

  const adjustSalary = useCallback((employeeId: string, newSalary: number) => {
    setState(prevState => ({
      ...prevState,
      employees: prevState.employees.map(emp =>
        emp.id === employeeId ? { ...emp, salary: newSalary } : emp
      ),
    }));
  }, []);

  // ============= CLIENT ACTIONS =============

  const addClient = useCallback((name: string, type: Client['type'], monthlyFee: number) => {
    setState(prevState => {
      const profiles: Client['paymentProfile'][] = ['prompt', 'normal', 'slow'];
      const newClient: Client = {
        id: generateId(), name, type, feeStructure: 'Retainer', monthlyFee,
        satisfaction: 70 + Math.floor(Math.random() * 20),
        contractMonthsRemaining: 12,
        paymentProfile: profiles[Math.floor(Math.random() * profiles.length)],
        lastPaymentMonth: prevState.month,
      };
      return { ...prevState, clients: [...prevState.clients, newClient] };
    });
  }, []);

  const removeClient = useCallback((clientId: string) => {
    setState(prevState => ({
      ...prevState,
      clients: prevState.clients.filter(client => client.id !== clientId),
    }));
  }, []);

  const updateClientSatisfaction = useCallback((clientId: string, delta: number) => {
    setState(prevState => ({
      ...prevState,
      clients: prevState.clients.map(client =>
        client.id === clientId
          ? { ...client, satisfaction: Math.max(0, Math.min(100, client.satisfaction + delta)) }
          : client
      ),
    }));
  }, []);

  // ============= INBOX ACTIONS =============

  const markInboxMessageRead = useCallback((messageId: string) => {
    setState(prevState => ({
      ...prevState,
      inbox: prevState.inbox.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      ),
    }));
  }, []);

  const handleInboxChoice = useCallback((messageId: string, choiceId: string) => {
    setState(prevState => {
      const message = prevState.inbox.find(m => m.id === messageId);
      if (!message) return prevState;
      const choice = message.choices.find(c => c.id === choiceId);
      if (!choice) return prevState;

      let newState = { ...prevState };

      // === Original scenarios ===
      if (message.title === 'Raise Request') {
        const emp = newState.employees[Math.floor(Math.random() * newState.employees.length)];
        if (choiceId === 'approve') {
          newState.employees = newState.employees.map(e =>
            e.id === emp.id ? { ...e, salary: Math.round(e.salary * 1.15), efficacy: Math.min(100, e.efficacy + 5) } : e
          );
        } else if (choiceId === 'counter') {
          newState.employees = newState.employees.map(e =>
            e.id === emp.id ? { ...e, salary: Math.round(e.salary * 1.08), efficacy: Math.min(100, e.efficacy + 2) } : e
          );
        } else if (choiceId === 'deny') {
          newState.employees = newState.employees.map(e =>
            e.id === emp.id ? { ...e, efficacy: Math.max(0, e.efficacy - 10), burnout: Math.min(100, e.burnout + 15) } : e
          );
        }
      }

      if (message.title === 'Client Feedback') {
        const client = newState.clients[Math.floor(Math.random() * newState.clients.length)];
        if (choiceId === 'address') {
          newState.clients = newState.clients.map(c =>
            c.id === client.id ? { ...c, satisfaction: Math.min(100, c.satisfaction + 15) } : c
          );
        } else if (choiceId === 'assign') {
          newState.clients = newState.clients.map(c =>
            c.id === client.id ? { ...c, satisfaction: Math.min(100, c.satisfaction + 8) } : c
          );
        } else if (choiceId === 'ignore') {
          newState.clients = newState.clients.map(c =>
            c.id === client.id ? { ...c, satisfaction: Math.max(0, c.satisfaction - 10) } : c
          );
        }
      }

      if (message.title === 'New Client Interest') {
        if (choiceId === 'pursue' && Math.random() > 0.3) {
          const profiles: Client['paymentProfile'][] = ['prompt', 'normal', 'slow'];
          const newClient: Client = {
            id: generateId(),
            name: message.description.split('(')[0].trim(),
            type: 'Corporation', feeStructure: 'Retainer', monthlyFee: 15000,
            satisfaction: 80, contractMonthsRemaining: 12,
            paymentProfile: profiles[Math.floor(Math.random() * profiles.length)],
            lastPaymentMonth: prevState.month,
          };
          newState.clients = [...newState.clients, newClient];
        } else if (choiceId === 'initial-contact' && Math.random() > 0.5) {
          const profiles: Client['paymentProfile'][] = ['prompt', 'normal', 'slow'];
          const newClient: Client = {
            id: generateId(),
            name: message.description.split('(')[0].trim(),
            type: 'Corporation', feeStructure: 'Retainer', monthlyFee: 15000,
            satisfaction: 80, contractMonthsRemaining: 12,
            paymentProfile: profiles[Math.floor(Math.random() * profiles.length)],
            lastPaymentMonth: prevState.month,
          };
          newState.clients = [...newState.clients, newClient];
        }
      }

      // === Back-office scenarios ===
      if (message.title === 'Lease Renewal Notice') {
        if (choiceId === 'accept-rent') {
          newState.operatingCosts = { ...newState.operatingCosts, rent: Math.round(newState.operatingCosts.rent * 1.08) };
        } else if (choiceId === 'negotiate-rent') {
          const success = Math.random() > 0.5;
          newState.operatingCosts = { ...newState.operatingCosts, rent: Math.round(newState.operatingCosts.rent * (success ? 1.04 : 1.08)) };
        } else if (choiceId === 'downgrade-rent') {
          newState.operatingCosts = { ...newState.operatingCosts, rent: newState.operatingCosts.rent - 3000 };
          newState.reputation = Math.max(0, newState.reputation - 5);
        }
      }

      if (message.title === 'IT Vendor Pitch') {
        if (choiceId === 'switch-vendor') {
          newState.vendors = newState.vendors.map(v =>
            v.category === 'IT' ? { ...v, name: 'TechForward Solutions', monthlyCost: Math.round(v.monthlyCost * 0.8), contractMonths: 12 } : v
          );
        } else if (choiceId === 'negotiate-vendor') {
          if (Math.random() > 0.5) {
            newState.vendors = newState.vendors.map(v =>
              v.category === 'IT' ? { ...v, monthlyCost: Math.round(v.monthlyCost * 0.9) } : v
            );
          }
        }
      }

      if (message.title === 'Health Insurance Premium Increase') {
        if (choiceId === 'absorb-benefits') {
          // Cost increase handled via benefits rate — simulate by increasing misc
          newState.operatingCosts = { ...newState.operatingCosts, misc: newState.operatingCosts.misc + Math.round(newState.employees.reduce((s, e) => s + e.salary * BENEFITS_RATE * 0.12, 0)) };
        } else if (choiceId === 'pass-benefits') {
          newState.employees = newState.employees.map(e => ({ ...e, burnout: Math.min(100, e.burnout + 10) }));
        } else if (choiceId === 'cheaper-plan') {
          newState.employees = newState.employees.map(e => ({ ...e, efficacy: Math.max(0, e.efficacy - 3) }));
        }
      }

      if (message.title === 'Quarterly Partner Distribution') {
        const pool = newState.partnerEconomics.distributionPool;
        if (choiceId === 'full-distribution') {
          newState.financials = { ...newState.financials, cashOnHand: newState.financials.cashOnHand - pool };
          newState.partnerEconomics = { ...newState.partnerEconomics, distributionPool: 0, totalDistributed: newState.partnerEconomics.totalDistributed + pool, lastDistributionMonth: newState.month, lastDistributionYear: newState.year };
        } else if (choiceId === 'partial-distribution') {
          const half = Math.round(pool / 2);
          newState.financials = { ...newState.financials, cashOnHand: newState.financials.cashOnHand - half };
          newState.partnerEconomics = { ...newState.partnerEconomics, distributionPool: pool - half, totalDistributed: newState.partnerEconomics.totalDistributed + half, lastDistributionMonth: newState.month, lastDistributionYear: newState.year };
        }
        // defer: no action needed, pool carries forward
      }

      if (message.title === 'Collections Problem') {
        if (choiceId === 'demand-letter') {
          // Collect 60% of overdue, but reduce satisfaction of slow-paying clients
          const collected = Math.round(newState.arAging.sixtyDay * 0.6);
          newState.arAging = { ...newState.arAging, sixtyDay: newState.arAging.sixtyDay - collected };
          newState.financials = { ...newState.financials, cashOnHand: newState.financials.cashOnHand + collected };
          newState.clients = newState.clients.map(c => c.paymentProfile === 'slow' ? { ...c, satisfaction: Math.max(0, c.satisfaction - 5) } : c);
        } else if (choiceId === 'personal-call') {
          const collected = Math.round(newState.arAging.sixtyDay * 0.4);
          newState.arAging = { ...newState.arAging, sixtyDay: newState.arAging.sixtyDay - collected };
          newState.financials = { ...newState.financials, cashOnHand: newState.financials.cashOnHand + collected };
        } else if (choiceId === 'write-off-ar') {
          newState.arAging = { ...newState.arAging, sixtyDay: 0, ninetyPlus: 0 };
        }
      }

      if (message.title === 'Budget Overrun Alert') {
        if (choiceId === 'cut-elsewhere') {
          newState.operatingCosts = { ...newState.operatingCosts, misc: Math.round(newState.operatingCosts.misc * 0.8) };
        } else if (choiceId === 'reallocate') {
          // Find underspent category and move budget
          const quarter = getCurrentQuarter(newState.month);
          newState.budget = newState.budget.map(b => {
            if (b.quarter === quarter && b.year === newState.year && b.actualQuarterlySpend < b.plannedQuarterly * 0.8) {
              return { ...b, plannedQuarterly: Math.round(b.plannedQuarterly * 0.85) };
            }
            return b;
          });
        }
      }

      if (message.title === 'Office Equipment Failure') {
        if (choiceId === 'buy-equipment') {
          newState.financials = { ...newState.financials, cashOnHand: newState.financials.cashOnHand - 8000 };
        } else if (choiceId === 'lease-equipment') {
          newState.vendors = [...newState.vendors, { id: generateId(), name: 'Equipment Lease', category: 'Other', monthlyCost: 300, contractMonths: 36 }];
        } else if (choiceId === 'temp-fix') {
          newState.financials = { ...newState.financials, cashOnHand: newState.financials.cashOnHand - 1000 };
        }
      }

      if (message.title === 'Quarterly Tax Planning') {
        if (choiceId === 'pay-taxes') {
          const tax = Math.round(Math.max(0, newState.financials.netProfit * 3 * 0.25));
          newState.financials = { ...newState.financials, cashOnHand: newState.financials.cashOnHand - tax };
        } else if (choiceId === 'accelerate-expenses') {
          // Prepay some expenses — reduces cash but not as much as full tax
          const prepay = Math.round(Math.max(0, newState.financials.netProfit * 3 * 0.15));
          newState.financials = { ...newState.financials, cashOnHand: newState.financials.cashOnHand - prepay };
        }
      }

      // Mark message as handled
      newState.inbox = newState.inbox.map(msg =>
        msg.id === messageId ? { ...msg, read: true, requiresAction: false } : msg
      );

      return newState;
    });
  }, []);

  // ============= ALERT ACTIONS =============

  const dismissAlert = useCallback((alertId: string) => {
    setState(prevState => ({
      ...prevState,
      alerts: prevState.alerts.filter(alert => alert.id !== alertId),
    }));
  }, []);

  // ============= VENDOR ACTIONS =============

  const addVendor = useCallback((name: string, category: Vendor['category'], monthlyCost: number) => {
    setState(prevState => ({
      ...prevState,
      vendors: [...prevState.vendors, { id: generateId(), name, category, monthlyCost, contractMonths: 12 }],
    }));
  }, []);

  const removeVendor = useCallback((vendorId: string) => {
    setState(prevState => ({
      ...prevState,
      vendors: prevState.vendors.filter(v => v.id !== vendorId),
    }));
  }, []);

  // ============= OPERATING COST ACTIONS =============

  const adjustOperatingCost = useCallback((category: keyof OperatingCosts, newAmount: number) => {
    setState(prevState => ({
      ...prevState,
      operatingCosts: { ...prevState.operatingCosts, [category]: newAmount },
    }));
  }, []);

  // ============= LINE OF CREDIT ACTIONS =============

  const drawLineOfCredit = useCallback((amount: number) => {
    setState(prevState => {
      const available = getLOCAvailable(prevState.lineOfCredit);
      const drawAmount = Math.min(amount, available);
      return {
        ...prevState,
        financials: { ...prevState.financials, cashOnHand: prevState.financials.cashOnHand + drawAmount },
        lineOfCredit: { ...prevState.lineOfCredit, drawn: prevState.lineOfCredit.drawn + drawAmount },
      };
    });
  }, []);

  const repayLineOfCredit = useCallback((amount: number) => {
    setState(prevState => {
      const repayAmount = Math.min(amount, prevState.lineOfCredit.drawn, prevState.financials.cashOnHand);
      return {
        ...prevState,
        financials: { ...prevState.financials, cashOnHand: prevState.financials.cashOnHand - repayAmount },
        lineOfCredit: { ...prevState.lineOfCredit, drawn: prevState.lineOfCredit.drawn - repayAmount },
      };
    });
  }, []);

  // ============= PARTNER ACTIONS =============

  const setPartnerDraw = useCallback((amount: number) => {
    setState(prevState => ({
      ...prevState,
      partnerEconomics: { ...prevState.partnerEconomics, monthlyDraw: amount },
    }));
  }, []);

  // ============= BUDGET ACTIONS =============

  const setBudget = useCallback((category: string, quarterlyAmount: number) => {
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
  }, []);

  // ============= AR ACTIONS =============

  const writeOffAR = useCallback((amount: number) => {
    setState(prevState => {
      const writeOff = Math.min(amount, prevState.arAging.ninetyPlus);
      return {
        ...prevState,
        arAging: { ...prevState.arAging, ninetyPlus: prevState.arAging.ninetyPlus - writeOff },
      };
    });
  }, []);

  const collectAR = useCallback(() => {
    setState(prevState => {
      // Manual collection effort — collect 30% of overdue (30+) AR
      const collectFrom30 = Math.round(prevState.arAging.thirtyDay * 0.3);
      const collectFrom60 = Math.round(prevState.arAging.sixtyDay * 0.3);
      const collectFrom90 = Math.round(prevState.arAging.ninetyPlus * 0.15);
      const totalCollected = collectFrom30 + collectFrom60 + collectFrom90;
      return {
        ...prevState,
        financials: { ...prevState.financials, cashOnHand: prevState.financials.cashOnHand + totalCollected },
        arAging: {
          ...prevState.arAging,
          thirtyDay: prevState.arAging.thirtyDay - collectFrom30,
          sixtyDay: prevState.arAging.sixtyDay - collectFrom60,
          ninetyPlus: prevState.arAging.ninetyPlus - collectFrom90,
        },
      };
    });
  }, []);

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
