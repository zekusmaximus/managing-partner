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
export const STAFF_RECOVERY_COST_PER_EMPLOYEE = 1500;
export const STAFF_RECOVERY_MAX_PARTICIPANTS = 12;
export const STAFF_RECOVERY_MIN_BURNOUT = 20;
export const STAFF_RECOVERY_BURNOUT_REDUCTION = 25;
export const TARGETED_RECOVERY_COST_PER_EMPLOYEE = 500;
export const TARGETED_RECOVERY_MAX_PARTICIPANTS = 2;
export const TARGETED_RECOVERY_BURNOUT_REDUCTION = 15;
export const CLIENT_MEETING_COST = 1000;
export const AGGRESSIVE_CLIENT_PURSUIT_COST = 3000;
export const CLIENT_MEETING_SATISFACTION_GAIN = 6;
export const CLIENT_MEETING_COLLECTION_RATE = 0.15;
export const CLIENT_MEETING_COLLECTION_CAP = 3000;
export const ESTIMATED_TAX_RATE = 0.25;
export const QUARTERLY_TAX_LATE_RATE = 0.02;

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

export interface ReceivableAccount {
  clientId: string | null; // null is an unassigned opening or migrated balance
  clientName: string;
  paymentProfile: Client['paymentProfile'];
  aging: ARBuckets;
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
  operatingExpenses: number;  // Total P&L expenses, including draw, interest, tax provision, and late charges
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
  // The first saved legacy month may have an unknown opening balance. New
  // sessions begin with a known cash snapshot, even though their January P&L
  // run rate has not been paid in cash.
  openingCash: number | null;
  isOpeningSnapshot: boolean;
  recurringCashExpensesPaid: number | null;
  cashMovements: CashMovement[];
  oneTimeOperatingExpenses: number;
  revenue: number;
  expenses: number;
  profit: number;
  collections: number;
  operatingCosts: number;
  operatingCostBreakdown: OperatingCosts;
  vendorCosts: number;
  partnerDraw: number;
  payroll: number;
  arWriteOff: number;
  locInterest: number;
  taxExpense: number; // 25% estimate on the positive pretax month snapshot
  taxPenalty: number; // quarterly late charge on unpaid tax principal
  cashOnHand: number;
}

// Signed cash impact: inflows are positive, outflows are negative. The
// unclassified kind is reserved for historical activity that cannot be
// identified when older browser saves are migrated.
export type CashMovementKind =
  | 'loc-draw'
  | 'loc-repayment'
  | 'partner-distribution'
  | 'tax-payment'
  | 'equipment-purchase'
  | 'hiring'
  | 'severance'
  | 'staff-recovery'
  | 'client-meeting'
  | 'client-pursuit'
  | 'repair'
  | 'unclassified';

export interface CashMovement {
  kind: CashMovementKind;
  amount: number;
}

export interface TaxPosition {
  principalDue: number;
  penaltiesDue: number;
}

// ============= ALERTS & INBOX =============

export interface Alert {
  id: string;
  type: 'warning' | 'info' | 'error' | 'success';
  message: string;
  timestamp: Date;
  actionTarget?: { kind: 'client'; clientId: string } | { kind: 'clients' } | { kind: 'ar' };
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
  scenario: InboxScenario;
  resolution?: { choiceId: string; summary: string; month?: number; year?: number };
}

// Scenario data is captured when a message is created. Decisions must never infer
// their target or quoted amount from presentation text or a later random draw.
export type InboxScenario =
  | { kind: 'raise-request'; employeeId: string }
  | { kind: 'client-feedback'; clientId: string }
  | { kind: 'new-client'; name: string; clientType: Client['type']; monthlyFee: number }
  | { kind: 'lease-renewal'; currentRent: number }
  | { kind: 'it-vendor'; vendorId: string; quotedMonthlyCost?: number }
  | { kind: 'benefits-increase'; monthlyIncrease: number }
  | { kind: 'partner-distribution'; availablePool: number }
  | { kind: 'collections-problem'; clientId?: string; overdueAmount: number }
  | { kind: 'budget-overrun'; category: string; quarter?: number; year?: number }
  | { kind: 'equipment-failure' }
  | { kind: 'tax-planning'; estimatedTax: number }
  | { kind: 'industry-update' }
  | { kind: 'case-intake-review' }
  | { kind: 'case-prospect'; name: string; clientType: Client['type']; monthlyFee: number }
  | { kind: 'case-policy-delay'; clientId: string };

// ============= STATE =============

export interface PartnerIntervention {
  month: number;
  year: number;
  action: 'client-meeting' | 'complaint-recovery' | 'personal-collection';
  clientId?: string;
  clientName?: string;
}

// The authored case keeps only lifecycle and the actual renewal input/outcome.
// Required decisions and their summaries live in stable-ID inbox messages.
export interface AuthoredCaseState {
  status: 'active' | 'completed' | 'left';
  renewalOutcome: 'renewed' | 'departed' | null;
  renewal?: {
    serviceCoverage: number;
    satisfaction: number;
    chance: number;
  };
}

export interface SimulationState {
  month: number;
  year: number;
  // A manual AR collection push is allowed once per game month. Null also
  // represents pre-feature saves that have not used the action yet.
  lastManualCollection: { month: number; year: number } | null;
  // One major partner escalation per game month, shared by meetings and calls.
  lastPartnerIntervention: PartnerIntervention | null;
  // Retained for older saves; normalized into lastPartnerIntervention on load.
  lastClientMeeting: { month: number; year: number; clientId: string } | null;
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
  receivables: ReceivableAccount[];
  lineOfCredit: LineOfCredit;
  taxPosition: TaxPosition;
  authoredCase: AuthoredCaseState | null;
}

// AR collection rates by payment profile
export const AR_COLLECTION_RATES: Record<Client['paymentProfile'], { current: number; thirtyDay: number; sixtyDay: number; ninetyPlus: number }> = {
  prompt: { current: 0.95, thirtyDay: 0.90, sixtyDay: 0.80, ninetyPlus: 0.50 },
  normal: { current: 0.80, thirtyDay: 0.70, sixtyDay: 0.50, ninetyPlus: 0.30 },
  slow:   { current: 0.60, thirtyDay: 0.50, sixtyDay: 0.30, ninetyPlus: 0.10 },
};
