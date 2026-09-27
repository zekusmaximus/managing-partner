import type { Employee, SimulationState } from '@/types/simulation';
import {
  STAFF_RECOVERY_BURNOUT_REDUCTION,
  STAFF_RECOVERY_COST_PER_EMPLOYEE,
  STAFF_RECOVERY_MAX_PARTICIPANTS,
  STAFF_RECOVERY_MIN_BURNOUT,
} from '@/types/simulation';
import { recordCashMovement } from './engine';

export interface StaffRecoveryQuote {
  cost: number;
  participantIds: string[];
  totalBurnoutReduction: number;
  totalEfficacyGain: number;
  alreadyFunded: boolean;
  canFund: boolean;
}

const getParticipants = (state: SimulationState): Employee[] =>
  state.employees
    .filter(employee => employee.burnout >= STAFF_RECOVERY_MIN_BURNOUT)
    .sort((first, second) => second.burnout - first.burnout || first.id.localeCompare(second.id))
    .slice(0, STAFF_RECOVERY_MAX_PARTICIPANTS);

// One paid coverage and recovery program can be funded each month. The cash
// movement is also the durable cooldown marker in the version 4 save.
export const getStaffRecoveryQuote = (state: SimulationState): StaffRecoveryQuote => {
  const participants = getParticipants(state);
  const currentEntry = state.financialHistory.at(-1);
  const hasCurrentEntry = currentEntry?.month === state.month && currentEntry.year === state.year;
  const alreadyFunded = hasCurrentEntry && currentEntry.cashMovements.some(movement => movement.kind === 'staff-recovery');
  const cost = participants.length * STAFF_RECOVERY_COST_PER_EMPLOYEE;
  const totalBurnoutReduction = participants.reduce((sum, employee) =>
    sum + Math.min(employee.burnout, STAFF_RECOVERY_BURNOUT_REDUCTION), 0);
  const totalEfficacyGain = participants.reduce((sum, employee) =>
    sum + Math.min(100 - employee.efficacy,
      Math.floor(Math.min(employee.burnout, STAFF_RECOVERY_BURNOUT_REDUCTION) / 5)), 0);

  return {
    cost,
    participantIds: participants.map(employee => employee.id),
    totalBurnoutReduction,
    totalEfficacyGain,
    alreadyFunded: Boolean(alreadyFunded),
    canFund: Boolean(hasCurrentEntry && !alreadyFunded && cost > 0 &&
      Number.isFinite(state.financials.cashOnHand) && state.financials.cashOnHand >= cost),
  };
};

export const fundStaffRecovery = (state: SimulationState): SimulationState => {
  const quote = getStaffRecoveryQuote(state);
  if (!quote.canFund) return state;
  const participants = new Set(getParticipants(state));
  const withPayment = recordCashMovement(state, { kind: 'staff-recovery', amount: -quote.cost });
  const quarter = Math.ceil(state.month / 3);
  return {
    ...withPayment,
    employees: state.employees.map(employee => {
      if (!participants.has(employee)) return employee;
      const recovered = Math.min(employee.burnout, STAFF_RECOVERY_BURNOUT_REDUCTION);
      return {
        ...employee,
        burnout: Math.max(0, employee.burnout - recovered),
        efficacy: Math.min(100, employee.efficacy + Math.floor(recovered / 5)),
      };
    }),
    financials: {
      ...withPayment.financials,
      operatingExpenses: withPayment.financials.operatingExpenses + quote.cost,
      netProfit: withPayment.financials.netProfit - quote.cost,
    },
    financialHistory: withPayment.financialHistory.map((entry, index, history) =>
      index === history.length - 1 && entry.month === state.month && entry.year === state.year
        ? {
            ...entry,
            expenses: entry.expenses + quote.cost,
            profit: entry.profit - quote.cost,
            oneTimeOperatingExpenses: entry.oneTimeOperatingExpenses + quote.cost,
          }
        : entry),
    budget: withPayment.budget.map(item =>
      item.category === 'Payroll' && item.quarter === quarter && item.year === state.year
        ? { ...item, actualQuarterlySpend: item.actualQuarterlySpend + quote.cost }
        : item),
  };
};
