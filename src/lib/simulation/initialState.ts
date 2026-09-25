import type { Employee, Client, SimulationState, OperatingCosts, Vendor, PartnerEconomics, BudgetItem, ARBuckets, LineOfCredit } from '@/types/simulation';
import { getEmployeeTotalCost, getOperatingCostsTotal } from '@/types/simulation';

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
  { category: 'Payroll', plannedQuarterly: initialTotalPayroll * 3, actualQuarterlySpend: initialTotalPayroll, quarter: 1, year: 2026 },
  { category: 'Rent', plannedQuarterly: initialOperatingCosts.rent * 3, actualQuarterlySpend: initialOperatingCosts.rent, quarter: 1, year: 2026 },
  { category: 'Insurance', plannedQuarterly: initialOperatingCosts.insurance * 3, actualQuarterlySpend: initialOperatingCosts.insurance, quarter: 1, year: 2026 },
  { category: 'Technology', plannedQuarterly: initialOperatingCosts.technology * 3, actualQuarterlySpend: initialOperatingCosts.technology, quarter: 1, year: 2026 },
  { category: 'Compliance', plannedQuarterly: initialOperatingCosts.compliance * 3, actualQuarterlySpend: initialOperatingCosts.compliance, quarter: 1, year: 2026 },
  { category: 'Vendors', plannedQuarterly: initialVendorCosts * 3, actualQuarterlySpend: initialVendorCosts, quarter: 1, year: 2026 },
  { category: 'Partner Draw', plannedQuarterly: initialPartnerEconomics.monthlyDraw * 3, actualQuarterlySpend: initialPartnerEconomics.monthlyDraw, quarter: 1, year: 2026 },
  { category: 'Misc', plannedQuarterly: initialOperatingCosts.misc * 3, actualQuarterlySpend: initialOperatingCosts.misc, quarter: 1, year: 2026 },
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
    operatingCostBreakdown: { ...initialOperatingCosts },
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


export const createInitialSimulationState = (): SimulationState => structuredClone(initialState);
