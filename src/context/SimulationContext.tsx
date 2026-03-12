"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

// ============= TYPE DEFINITIONS =============

export interface Employee {
  id: string;
  name: string;
  role: 'Lobbyist' | 'Attorney' | 'Support';
  efficacy: number; // 0-100
  burnout: number; // 0-100
  salary: number; // monthly
  clientAffinity: number; // 0-100
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

export interface FinancialHistoryEntry {
  month: number;
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'info' | 'error' | 'success';
  message: string;
  timestamp: Date;
}

export interface InboxMessage {
  id: string;
  type: 'request' | 'alert' | 'opportunity';
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  requiresAction: boolean;
  read: boolean;
  choices: MessageChoice[];
  timestamp: Date;
}

export interface MessageChoice {
  id: string;
  label: string;
  effect: string;
}

export interface SimulationState {
  month: number;
  year: number;
  financials: Financials;
  financialHistory: FinancialHistoryEntry[];
  employees: Employee[];
  clients: Client[];
  reputation: number;
  alerts: Alert[];
  inbox: InboxMessage[];
}

// ============= HELPER FUNCTIONS =============

const generateId = () => Math.random().toString(36).substring(2, 11);

const getRandomName = (role: string): string => {
  const firstNames = ['Alex', 'Sam', 'Taylor', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Quinn', 'Avery', 'Cameron'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Wilson'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

// ============= INITIAL STATE =============

const calculateInitialExpenses = (employees: Employee[]): number => {
  return employees.reduce((sum, emp) => sum + emp.salary, 0);
};

const initialEmployees: Employee[] = [
  { id: 'emp1', name: 'Alex Johnson', role: 'Lobbyist', efficacy: 85, burnout: 20, salary: 8000, clientAffinity: 75 },
  { id: 'emp2', name: 'Sam Williams', role: 'Lobbyist', efficacy: 78, burnout: 15, salary: 7500, clientAffinity: 80 },
  { id: 'emp3', name: 'Taylor Brown', role: 'Attorney', efficacy: 90, burnout: 10, salary: 9000, clientAffinity: 70 },
  { id: 'emp4', name: 'Jordan Lee', role: 'Attorney', efficacy: 82, burnout: 25, salary: 8500, clientAffinity: 65 },
  { id: 'emp5', name: 'Casey Martinez', role: 'Support', efficacy: 70, burnout: 5, salary: 4000, clientAffinity: 90 },
];

const initialClients: Client[] = [
  { id: 'client1', name: 'TechTrade Association', type: 'Trade Association', feeStructure: 'Retainer', monthlyFee: 15000, satisfaction: 80, contractMonthsRemaining: 12 },
  { id: 'client2', name: 'GlobalCorp Inc.', type: 'Corporation', feeStructure: 'Retainer', monthlyFee: 20000, satisfaction: 85, contractMonthsRemaining: 10 },
  { id: 'client3', name: 'EcoNon-Profit', type: 'Non-Profit', feeStructure: 'Retainer', monthlyFee: 10000, satisfaction: 75, contractMonthsRemaining: 8 },
  { id: 'client4', name: 'FinanceFed', type: 'Trade Association', feeStructure: 'Retainer', monthlyFee: 12000, satisfaction: 78, contractMonthsRemaining: 15 },
  { id: 'client5', name: 'HealthCorp', type: 'Corporation', feeStructure: 'Retainer', monthlyFee: 18000, satisfaction: 82, contractMonthsRemaining: 12 },
  { id: 'client6', name: 'EduAssoc', type: 'Trade Association', feeStructure: 'Retainer', monthlyFee: 11000, satisfaction: 77, contractMonthsRemaining: 9 },
  { id: 'client7', name: 'GreenOrg', type: 'Non-Profit', feeStructure: 'Retainer', monthlyFee: 9000, satisfaction: 76, contractMonthsRemaining: 7 },
  { id: 'client8', name: 'BuildCo', type: 'Corporation', feeStructure: 'Retainer', monthlyFee: 16000, satisfaction: 81, contractMonthsRemaining: 11 },
];

const initialExpenses = calculateInitialExpenses(initialEmployees);
const initialRevenue = initialClients.reduce((sum, c) => sum + c.monthlyFee, 0);

const initialState: SimulationState = {
  month: 1,
  year: 2026,
  financials: {
    cashOnHand: 250000,
    grossRevenue: initialRevenue,
    operatingExpenses: initialExpenses,
    netProfit: initialRevenue - initialExpenses,
    accountsReceivable: 15000,
  },
  financialHistory: [
    { month: 1, year: 2026, revenue: initialRevenue, expenses: initialExpenses, profit: initialRevenue - initialExpenses },
  ],
  employees: initialEmployees,
  clients: initialClients,
  reputation: 75,
  alerts: [],
  inbox: [],
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
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

// ============= PROVIDER =============

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SimulationState>(initialState);

  // Generate alerts based on current state
  const generateAlerts = useCallback((currentState: SimulationState): Alert[] => {
    const alerts: Alert[] = [];

    // Check for employees with high burnout
    currentState.employees.forEach(emp => {
      if (emp.burnout >= 80) {
        alerts.push({
          id: generateId(),
          type: 'error',
          message: `${emp.name} is at ${emp.burnout}% burnout! Consider addressing this.`,
          timestamp: new Date(),
        });
      } else if (emp.burnout >= 60) {
        alerts.push({
          id: generateId(),
          type: 'warning',
          message: `${emp.name}'s burnout is at ${emp.burnout}%.`,
          timestamp: new Date(),
        });
      }
    });

    // Check for clients with low satisfaction
    currentState.clients.forEach(client => {
      if (client.satisfaction < 50) {
        alerts.push({
          id: generateId(),
          type: 'error',
          message: `${client.name} satisfaction is critically low at ${client.satisfaction}%!`,
          timestamp: new Date(),
        });
      } else if (client.satisfaction < 70) {
        alerts.push({
          id: generateId(),
          type: 'warning',
          message: `${client.name}'s satisfaction dropped to ${client.satisfaction}%.`,
          timestamp: new Date(),
        });
      }
    });

    // Check for expiring contracts
    currentState.clients.forEach(client => {
      if (client.contractMonthsRemaining <= 2 && client.contractMonthsRemaining > 0) {
        alerts.push({
          id: generateId(),
          type: 'warning',
          message: `${client.name}'s contract expires in ${client.contractMonthsRemaining} month(s)!`,
          timestamp: new Date(),
        });
      }
    });

    // Check for low cash
    if (currentState.financials.cashOnHand < 50000) {
      alerts.push({
        id: generateId(),
        type: 'error',
        message: 'Cash on hand is critically low!',
        timestamp: new Date(),
      });
    }

    return alerts;
  }, []);

  // Generate inbox messages
  const generateInboxMessages = useCallback((currentState: SimulationState): InboxMessage[] => {
    const messages: InboxMessage[] = [];

    // Employee raise request (if any employee has been employed for a while)
    if (Math.random() > 0.5) {
      const emp = currentState.employees[Math.floor(Math.random() * currentState.employees.length)];
      messages.push({
        id: generateId(),
        type: 'request',
        title: 'Raise Request',
        description: `${emp.name} is requesting a salary increase. They cite market conditions and their contributions to recent client wins.`,
        urgency: 'medium',
        requiresAction: true,
        read: false,
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
        id: generateId(),
        type: 'alert',
        title: 'Client Feedback',
        description: `${client.name} has submitted negative feedback about our services. They mention slow response times and lack of visibility on legislative updates.`,
        urgency: 'high',
        requiresAction: true,
        read: false,
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
        id: generateId(),
        type: 'opportunity',
        title: 'New Client Interest',
        description: `${name} (${type}) has expressed interest in our government relations services. They have a monthly budget of $12,000-$18,000.`,
        urgency: 'medium',
        requiresAction: true,
        read: false,
        choices: [
          { id: 'pursue', label: 'Pursue Aggressively', effect: 'High chance of landing client, uses resources' },
          { id: '初步接触', label: 'Initial Contact', effect: 'Moderate chance of landing client' },
          { id: 'pass', label: 'Pass on Opportunity', effect: 'No effect' },
        ],
        timestamp: new Date(),
      });
    }

    // Random industry update
    if (messages.length < 2) {
      const updates = [
        'Congress is considering new regulations that may affect your clients in the tech sector.',
        'A key committee hearing on healthcare policy is scheduled for next month.',
        'Budget negotiations may impact government contracting opportunities.',
        'New lobbying disclosure requirements are being discussed.',
      ];
      messages.push({
        id: generateId(),
        type: 'alert',
        title: 'Industry Update',
        description: updates[Math.floor(Math.random() * updates.length)],
        urgency: 'low',
        requiresAction: false,
        read: false,
        choices: [],
        timestamp: new Date(),
      });
    }

    return messages;
  }, []);

  // Advance month function
  const advanceMonth = useCallback(() => {
    setState(prevState => {
      // Calculate new month/year
      const newMonth = prevState.month === 12 ? 1 : prevState.month + 1;
      const newYear = prevState.month === 12 ? prevState.year + 1 : prevState.year;

      // Update employees (burnout increases, efficacy decreases slightly)
      const updatedEmployees = prevState.employees.map(emp => {
        let newBurnout = Math.min(100, emp.burnout + Math.floor(Math.random() * 5) + 2);
        let newEfficacy = Math.max(0, emp.efficacy - Math.floor(newBurnout / 20));
        
        // Recovery if burnout is low
        if (newBurnout < 30) {
          newEfficacy = Math.min(100, newEfficacy + 2);
        }

        return {
          ...emp,
          burnout: newBurnout,
          efficacy: newEfficacy,
        };
      });

      // Update clients (satisfaction fluctuates, contracts expire)
      let updatedClients = prevState.clients.map(client => ({
        ...client,
        satisfaction: Math.max(0, Math.min(100, client.satisfaction + (Math.floor(Math.random() * 11) - 5))),
        contractMonthsRemaining: Math.max(0, client.contractMonthsRemaining - 1),
      }));

      // Remove clients with expired contracts (30% chance per expired contract)
      updatedClients = updatedClients.filter(client => {
        if (client.contractMonthsRemaining === 0) {
          return Math.random() > 0.3; // 70% chance to lose client
        }
        return true;
      });

      // Calculate financials
      const totalExpenses = updatedEmployees.reduce((sum, emp) => sum + emp.salary, 0);
      const totalRevenue = updatedClients.reduce((sum, client) => sum + client.monthlyFee, 0);
      const newProfit = totalRevenue - totalExpenses;
      const newCash = Math.max(0, prevState.financials.cashOnHand + newProfit);
      const newAR = Math.max(0, prevState.financials.accountsReceivable + (Math.random() > 0.8 ? totalRevenue * 0.2 : 0));

      // Update reputation based on metrics
      const avgClientSatisfaction = updatedClients.length > 0 
        ? updatedClients.reduce((sum, c) => sum + c.satisfaction, 0) / updatedClients.length 
        : 50;
      const avgEmployeeEfficacy = updatedEmployees.length > 0
        ? updatedEmployees.reduce((sum, e) => sum + e.efficacy, 0) / updatedEmployees.length
        : 50;
      
      let newReputation = Math.round((avgClientSatisfaction * 0.6) + (avgEmployeeEfficacy * 0.4));
      newReputation = Math.max(0, Math.min(100, newReputation + (Math.random() > 0.5 ? 1 : -1)));

      // Update financial history
      const newHistoryEntry: FinancialHistoryEntry = {
        month: newMonth,
        year: newYear,
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: newProfit,
      };
      const newHistory = [...prevState.financialHistory, newHistoryEntry].slice(-12); // Keep last 12 months

      // Generate new alerts and inbox messages
      const newAlerts = generateAlerts({
        ...prevState,
        month: newMonth,
        year: newYear,
        financials: { ...prevState.financials, cashOnHand: newCash },
        employees: updatedEmployees,
        clients: updatedClients,
        reputation: newReputation,
      });

      const newInboxMessages = generateInboxMessages({
        ...prevState,
        month: newMonth,
        year: newYear,
        employees: updatedEmployees,
        clients: updatedClients,
      });

      return {
        ...prevState,
        month: newMonth,
        year: newYear,
        financials: {
          cashOnHand: newCash,
          grossRevenue: totalRevenue,
          operatingExpenses: totalExpenses,
          netProfit: newProfit,
          accountsReceivable: newAR,
        },
        financialHistory: newHistory,
        employees: updatedEmployees,
        clients: updatedClients,
        reputation: newReputation,
        alerts: [...newAlerts, ...prevState.alerts].slice(0, 10), // Keep last 10 alerts
        inbox: [...newInboxMessages, ...prevState.inbox].slice(0, 20), // Keep last 20 messages
      };
    });
  }, [generateAlerts, generateInboxMessages]);

  // Hire new employee
  const hireEmployee = useCallback((role: 'Lobbyist' | 'Attorney' | 'Support') => {
    setState(prevState => {
      const salaryRanges = { Lobbyist: [7000, 9000], Attorney: [8000, 10000], Support: [3500, 5000] };
      const [min, max] = salaryRanges[role];
      const newEmployee: Employee = {
        id: generateId(),
        name: getRandomName(role),
        role,
        efficacy: 60 + Math.floor(Math.random() * 20),
        burnout: Math.floor(Math.random() * 20),
        salary: min + Math.floor(Math.random() * (max - min)),
        clientAffinity: 50 + Math.floor(Math.random() * 30),
      };

      return {
        ...prevState,
        employees: [...prevState.employees, newEmployee],
      };
    });
  }, []);

  // Fire employee
  const fireEmployee = useCallback((employeeId: string) => {
    setState(prevState => ({
      ...prevState,
      employees: prevState.employees.filter(emp => emp.id !== employeeId),
    }));
  }, []);

  // Adjust employee salary
  const adjustSalary = useCallback((employeeId: string, newSalary: number) => {
    setState(prevState => ({
      ...prevState,
      employees: prevState.employees.map(emp => 
        emp.id === employeeId ? { ...emp, salary: newSalary } : emp
      ),
    }));
  }, []);

  // Add new client
  const addClient = useCallback((name: string, type: Client['type'], monthlyFee: number) => {
    setState(prevState => {
      const newClient: Client = {
        id: generateId(),
        name,
        type,
        feeStructure: 'Retainer',
        monthlyFee,
        satisfaction: 70 + Math.floor(Math.random() * 20),
        contractMonthsRemaining: 12,
      };

      return {
        ...prevState,
        clients: [...prevState.clients, newClient],
      };
    });
  }, []);

  // Remove client
  const removeClient = useCallback((clientId: string) => {
    setState(prevState => ({
      ...prevState,
      clients: prevState.clients.filter(client => client.id !== clientId),
    }));
  }, []);

  // Update client satisfaction
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

  // Mark inbox message as read
  const markInboxMessageRead = useCallback((messageId: string) => {
    setState(prevState => ({
      ...prevState,
      inbox: prevState.inbox.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      ),
    }));
  }, []);

  // Handle inbox choice selection
  const handleInboxChoice = useCallback((messageId: string, choiceId: string) => {
    setState(prevState => {
      const message = prevState.inbox.find(m => m.id === messageId);
      if (!message) return prevState;

      const choice = message.choices.find(c => c.id === choiceId);
      if (!choice) return prevState;

      // Apply effects based on choice
      let newState = { ...prevState };

      // Handle different message types
      if (message.title === 'Raise Request') {
        const emp = newState.employees[Math.floor(Math.random() * newState.employees.length)];
        if (choice.id === 'approve') {
          newState.employees = newState.employees.map(e =>
            e.id === emp.id ? { ...e, salary: Math.round(e.salary * 1.15), efficacy: Math.min(100, e.efficacy + 5) } : e
          );
        } else if (choice.id === 'counter') {
          newState.employees = newState.employees.map(e =>
            e.id === emp.id ? { ...e, salary: Math.round(e.salary * 1.08), efficacy: Math.min(100, e.efficacy + 2) } : e
          );
        } else if (choice.id === 'deny') {
          newState.employees = newState.employees.map(e =>
            e.id === emp.id ? { ...e, efficacy: Math.max(0, e.efficacy - 10), burnout: Math.min(100, e.burnout + 15) } : e
          );
        }
      }

      if (message.title === 'Client Feedback') {
        const client = newState.clients[Math.floor(Math.random() * newState.clients.length)];
        if (choice.id === 'address') {
          newState.clients = newState.clients.map(c =>
            c.id === client.id ? { ...c, satisfaction: Math.min(100, c.satisfaction + 15) } : c
          );
        } else if (choice.id === 'assign') {
          newState.clients = newState.clients.map(c =>
            c.id === client.id ? { ...c, satisfaction: Math.min(100, c.satisfaction + 8) } : c
          );
        } else if (choice.id === 'ignore') {
          newState.clients = newState.clients.map(c =>
            c.id === client.id ? { ...c, satisfaction: Math.max(0, c.satisfaction - 10) } : c
          );
        }
      }

      if (message.title === 'New Client Interest') {
        if (choice.id === 'pursue' && Math.random() > 0.3) {
          const newClient: Client = {
            id: generateId(),
            name: message.description.split(' ')[0] + ' ' + message.description.split(' ')[1].replace(',', ''),
            type: 'Corporation',
            feeStructure: 'Retainer',
            monthlyFee: 15000,
            satisfaction: 80,
            contractMonthsRemaining: 12,
          };
          newState.clients = [...newState.clients, newClient];
        } else if (choice.id === '初步接触' && Math.random() > 0.5) {
          const newClient: Client = {
            id: generateId(),
            name: message.description.split(' ')[0] + ' ' + message.description.split(' ')[1].replace(',', ''),
            type: 'Corporation',
            feeStructure: 'Retainer',
            monthlyFee: 15000,
            satisfaction: 80,
            contractMonthsRemaining: 12,
          };
          newState.clients = [...newState.clients, newClient];
        }
      }

      // Mark message as read after handling
      newState.inbox = newState.inbox.map(msg =>
        msg.id === messageId ? { ...msg, read: true, requiresAction: false } : msg
      );

      return newState;
    });
  }, []);

  // Dismiss an alert
  const dismissAlert = useCallback((alertId: string) => {
    setState(prevState => ({
      ...prevState,
      alerts: prevState.alerts.filter(alert => alert.id !== alertId),
    }));
  }, []);

  return (
    <SimulationContext.Provider value={{
      state,
      advanceMonth,
      hireEmployee,
      fireEmployee,
      adjustSalary,
      addClient,
      removeClient,
      updateClientSatisfaction,
      markInboxMessageRead,
      handleInboxChoice,
      dismissAlert,
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

