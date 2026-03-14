// ============= CORE TYPES =============

export interface Employee {
  id: string;
  name: string;
  role: 'Lobbyist' | 'Attorney' | 'Support';
  efficacy: number; // 0-100
  burnout: number; // 0-100
  salary: number; // monthly base salary
  clientAffinity: number; // 0-100
  hireDate: { month: number; year: number };
}

// Computed employee cost helpers
export const BENEFITS_RATE = 0.25; // 25% of salary
export const PAYROLL_TAX_RATE = 0.0765; // 7.65% FICA
export const HIRING_COST = 5000;
export const SEVERANCE_COST = 2000;

export const getEmployeeTotalCost = (emp: Employee): number => {
  return Math.round(emp.salary * (1 + BENEFITS_RATE + PAYROLL_TAX_RATE));
};

export const getEmployeeBenefits = (emp: Employee): number => {
  return Math.round(emp.salary * BENEFITS_RATE);
};

export const getEmployeePayrollTax = (emp: Employee): number => {
  return Math.round(emp.salary * PAYROLL_TAX_RATE);
};

export interface Client {
  id: string;
  name: string;
  type: 'Trade Association' | 'Corporation' | 'Non-Profit';
  feeStructure: 'Retainer' | 'Hourly';
  monthlyFee: number;
  satisfaction: number; // 0-100
  contractMonthsRemaining: number;
  paymentProfile: 'prompt' | 'normal' | 'slow';
  lastPaymentMonth: number;
}

// ============= FINANCIAL TYPES =============

export interface OperatingCosts {
  rent: number;
  insurance: number;
  technology: number;
  compliance: number;
  misc: number;
}

export const getOperatingCostsTotal = (costs: OperatingCosts): number => {
  return costs.rent + costs.insurance + costs.technology + costs.compliance + costs.misc;
};

export interface Vendor {
  id: string;
  name: string;
  category: 'Accounting' | 'IT' | 'Janitorial' | 'Legal Counsel' | 'Other';
  monthlyCost: number;
  contractMonths: number;
}

export interface ARBuckets {
  current: number;     // 0-30 days
  thirtyDay: number;   // 31-60 days
  sixtyDay: number;    // 61-90 days
  ninetyPlus: number;  // 90+ days
}

export const getARTotal = (ar: ARBuckets): number => {
  return ar.current + ar.thirtyDay + ar.sixtyDay + ar.ninetyPlus;
};

export interface LineOfCredit {
  limit: number;
  drawn: number;
  interestRate: number; // annual rate, e.g., 0.08 for 8%
}

export const getLOCAvailable = (loc: LineOfCredit): number => {
  return loc.limit - loc.drawn;
};

export const getLOCMonthlyInterest = (loc: LineOfCredit): number => {
  return Math.round((loc.drawn * loc.interestRate) / 12);
};

export interface PartnerEconomics {
  monthlyDraw: number;
  distributionPool: number;
  lastDistributionMonth: number;
  lastDistributionYear: number;
  totalDistributed: number;
}

export interface BudgetItem {
  category: string;
  plannedQuarterly: number;
  actualQuarterlySpend: number;
  quarter: number; // 1-4
  year: number;
}

// ============= FINANCIALS =============

export interface Financials {
  cashOnHand: number;
  grossRevenue: number;       // total invoiced this month
  operatingExpenses: number;  // total expenses this month (payroll + opCosts + vendors + draw)
  netProfit: number;          // revenue - expenses
  collectionsThisMonth: number; // cash actually collected from AR
  totalPayroll: number;       // salary + benefits + payroll tax
  totalOperatingCosts: number; // rent + insurance + tech + compliance + misc
  totalVendorCosts: number;
  partnerDrawThisMonth: number;
  locInterestThisMonth: number;
}

export interface FinancialHistoryEntry {
  month: number;
  year: number;
  revenue: number;
  expenses: number;
  profit: number;
  collections: number;
  operatingCosts: number;
  vendorCosts: number;
  partnerDraw: number;
  payroll: number;
  arWriteOff: number;
  locInterest: number;
  cashOnHand: number;
}

// ============= ALERTS & INBOX =============

export interface Alert {
  id: string;
  type: 'warning' | 'info' | 'error' | 'success';
  message: string;
  timestamp: Date;
}

export interface MessageChoice {
  id: string;
  label: string;
  effect: string;
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

// ============= STATE =============

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
  operatingCosts: OperatingCosts;
  vendors: Vendor[];
  partnerEconomics: PartnerEconomics;
  budget: BudgetItem[];
  arAging: ARBuckets;
  lineOfCredit: LineOfCredit;
}

// AR collection rates by payment profile
export const AR_COLLECTION_RATES: Record<Client['paymentProfile'], { current: number; thirtyDay: number; sixtyDay: number; ninetyPlus: number }> = {
  prompt: { current: 0.95, thirtyDay: 0.90, sixtyDay: 0.80, ninetyPlus: 0.50 },
  normal: { current: 0.80, thirtyDay: 0.70, sixtyDay: 0.50, ninetyPlus: 0.30 },
  slow:   { current: 0.60, thirtyDay: 0.50, sixtyDay: 0.30, ninetyPlus: 0.10 },
};
