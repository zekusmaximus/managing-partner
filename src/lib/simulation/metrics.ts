import type { FinancialHistoryEntry, OperatingCosts } from '@/types/simulation';

export interface ProfitAndLoss {
  revenue: number;
  payroll: number;
  grossMargin: number;
  operatingCosts: OperatingCosts;
  vendorCosts: number;
  oneTimeOperatingExpenses: number;
  arWriteOff: number;
  totalOperatingExpenses: number;
  operatingIncome: number;
  operatingMarginPercent: number;
  partnerDraw: number;
  locInterest: number;
  taxExpense: number;
  taxPenalty: number;
  netIncome: number;
}

const zeroCosts = (): OperatingCosts => ({ rent: 0, insurance: 0, technology: 0, compliance: 0, misc: 0 });

export const calculateProfitAndLoss = (entries: FinancialHistoryEntry[]): ProfitAndLoss => {
  const operatingCosts = entries.reduce((costs, entry) => ({
    rent: costs.rent + entry.operatingCostBreakdown.rent,
    insurance: costs.insurance + entry.operatingCostBreakdown.insurance,
    technology: costs.technology + entry.operatingCostBreakdown.technology,
    compliance: costs.compliance + entry.operatingCostBreakdown.compliance,
    misc: costs.misc + entry.operatingCostBreakdown.misc,
  }), zeroCosts());
  const revenue = entries.reduce((sum, entry) => sum + entry.revenue, 0);
  const payroll = entries.reduce((sum, entry) => sum + entry.payroll, 0);
  const vendorCosts = entries.reduce((sum, entry) => sum + entry.vendorCosts, 0);
  const oneTimeOperatingExpenses = entries.reduce((sum, entry) => sum + entry.oneTimeOperatingExpenses, 0);
  const arWriteOff = entries.reduce((sum, entry) => sum + entry.arWriteOff, 0);
  const partnerDraw = entries.reduce((sum, entry) => sum + entry.partnerDraw, 0);
  const locInterest = entries.reduce((sum, entry) => sum + entry.locInterest, 0);
  const taxExpense = entries.reduce((sum, entry) => sum + entry.taxExpense, 0);
  const taxPenalty = entries.reduce((sum, entry) => sum + entry.taxPenalty, 0);
  const grossMargin = revenue - payroll;
  const totalOperatingExpenses = Object.values(operatingCosts).reduce((sum, amount) => sum + amount, 0) + vendorCosts + oneTimeOperatingExpenses + arWriteOff;
  const operatingIncome = grossMargin - totalOperatingExpenses;
  const netIncome = operatingIncome - partnerDraw - locInterest - taxExpense - taxPenalty;
  return {
    revenue, payroll, grossMargin, operatingCosts, vendorCosts, oneTimeOperatingExpenses, arWriteOff,
    totalOperatingExpenses, operatingIncome,
    operatingMarginPercent: revenue > 0 ? operatingIncome / revenue * 100 : 0,
    partnerDraw, locInterest, taxExpense, taxPenalty, netIncome,
  };
};
