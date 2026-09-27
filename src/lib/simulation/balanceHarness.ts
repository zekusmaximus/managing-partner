import type { InboxMessage, SimulationState } from '@/types/simulation';
import { applyInboxChoice, advanceSimulationMonth } from './engine';
import { createInitialSimulationState } from './initialState';
import { generateInboxMessages } from './scenarios';
import { getClientServiceCapacity } from './clientService';

export type BalancePolicy = 'stewardship' | 'cash-guard' | 'cash-pressure';
export type BalanceRecoveryPlan = 'full' | 'targeted';

export interface BalanceMonth {
  month: number;
  year: number;
  cash: number;
  creditDrawn: number;
  creditDrawnThisMonth: number;
  revenue: number;
  recurringCashPaid: number;
  partnerDraw: number;
  taxPayable: number;
  profit: number;
  clients: number;
  serviceCapacity: number;
  churn: number;
  renewals: number;
  meanBurnout: number;
  meanEfficacy: number;
  reputation: number;
  generatedDiscretionary: number;
  generatedTax: number;
  generatedInformation: number;
  pendingBeforeDecisions: number;
  pendingAfterDecisions: number;
  recoverySpend: number;
  recoveryPlan: BalanceRecoveryPlan | null;
}

export interface BalanceRun {
  seed: number;
  policy: BalancePolicy;
  months: number;
  endingCash: number;
  minimumCash: number;
  endingCreditDrawn: number;
  peakCreditDrawn: number;
  creditDrawnTotal: number;
  cumulativeProfit: number;
  endingClients: number;
  endingServiceCapacity: number;
  clientChurn: number;
  clientRenewals: number;
  endingMeanBurnout: number;
  endingMeanEfficacy: number;
  endingReputation: number;
  generatedDiscretionary: number;
  generatedTax: number;
  generatedInformation: number;
  averagePendingBeforeDecisions: number;
  averagePendingAfterDecisions: number;
  peakPending: number;
  endingPending: number;
  recoverySpend: number;
  fullRecoveryActions: number;
  targetedRecoveryActions: number;
  monthly: BalanceMonth[];
}

export interface BalanceOptions {
  seed: number;
  months: number;
  policy: BalancePolicy;
  // The baseline commit has no staff recovery action. The final report passes
  // the game's pure action here, so both runs share this exact harness.
  fundRecovery?: (state: SimulationState, plan?: BalanceRecoveryPlan) => SimulationState;
  getRecoveryQuote?: (state: SimulationState, plan: BalanceRecoveryPlan) => {
    cost: number;
    canFund: boolean;
  };
}

// A small seeded generator is enough for reproducible simulation comparisons.
// Keep it local to each run; no global Math.random, wall clock, or UUID use.
export const createSeededRandom = (seed: number): (() => number) => {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

const average = (numbers: number[]): number =>
  numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : 0;

const countPending = (state: SimulationState): number =>
  state.inbox.filter(message => message.requiresAction).length;

const choiceFor = (message: InboxMessage, policy: BalancePolicy): string | null => {
  const kind = message.scenario.kind;
  if (kind === 'tax-planning') return 'pay-taxes';
  if (policy === 'stewardship') {
    switch (kind) {
      case 'raise-request': return 'counter';
      case 'client-feedback': return 'address';
      case 'new-client': return 'pursue';
      case 'lease-renewal': return 'negotiate-rent';
      case 'it-vendor': return 'switch-vendor';
      case 'benefits-increase': return 'absorb-benefits';
      case 'partner-distribution': return 'defer-distribution';
      case 'collections-problem': return 'personal-call';
      case 'budget-overrun': return 'reallocate';
      case 'equipment-failure': return 'temp-fix';
      case 'industry-update': return null;
    }
  }
  switch (kind) {
    case 'raise-request': return 'deny';
    case 'client-feedback': return 'ignore';
    case 'new-client': return 'pass';
    case 'lease-renewal': return 'downgrade-rent';
    case 'it-vendor': return null;
    case 'benefits-increase': return 'pass-benefits';
    case 'partner-distribution': return null;
    case 'collections-problem': return 'demand-letter';
    case 'budget-overrun': return null;
    case 'equipment-failure': return 'temp-fix';
    case 'industry-update': return null;
  }
};

export const runBalanceSimulation = ({
  seed, months, policy, fundRecovery, getRecoveryQuote,
}: BalanceOptions): BalanceRun => {
  if (!Number.isInteger(seed) || !Number.isInteger(months) || months < 12 || months > 24) {
    throw new Error('Use an integer seed and a 12–24 month horizon.');
  }
  if (policy === 'cash-pressure' && (!fundRecovery || !getRecoveryQuote)) {
    throw new Error('Cash-pressure policy requires recovery action and quote functions.');
  }
  const random = createSeededRandom(seed);
  let id = 0;
  const generateId = () => `balance-${++id}`;
  let state = createInitialSimulationState();
  const monthly: BalanceMonth[] = [];
  let peakCreditDrawn = state.lineOfCredit.drawn;
  let minimumCash = state.financials.cashOnHand;
  const observeFinancialBounds = () => {
    minimumCash = Math.min(minimumCash, state.financials.cashOnHand);
    peakCreditDrawn = Math.max(peakCreditDrawn, state.lineOfCredit.drawn);
  };

  for (let step = 0; step < months; step++) {
    const priorClients = new Map(state.clients.map(client => [client.id, client.contractMonthsRemaining]));
    let generated: InboxMessage[] = [];
    state = advanceSimulationMonth(state, {
      random,
      generateAlerts: () => [],
      generateInboxMessages: nextState => {
        generated = generateInboxMessages(nextState, {
          random,
          generateId,
          now: () => new Date(Date.UTC(nextState.year, nextState.month - 1, 1)),
        });
        return generated;
      },
    });
    observeFinancialBounds();
    const churn = [...priorClients.keys()].filter(clientId =>
      !state.clients.some(client => client.id === clientId)).length;
    const renewals = [...priorClients].filter(([clientId, remaining]) =>
      remaining <= 1 && state.clients.some(client =>
        client.id === clientId && client.contractMonthsRemaining > remaining)).length;
    const pendingBeforeDecisions = countPending(state);

    // Work through only the decisions available at the start of this step.
    // Cash-guard and cash-pressure intentionally leave vendor, partner, and budget decisions
    // open to exercise the product's pending-message retention rules.
    for (const message of state.inbox.filter(item => item.requiresAction)) {
      const choice = choiceFor(message, policy);
      if (choice) {
        state = applyInboxChoice(state, message.id, choice, { random, generateId });
        observeFinancialBounds();
      }
    }

    let recoverySpend = 0;
    let recoveryPlan: BalanceRecoveryPlan | null = null;
    if (policy === 'stewardship' && fundRecovery &&
      average(state.employees.map(employee => employee.burnout)) >= 35) {
      const before = state.financials.cashOnHand;
      state = fundRecovery(state);
      recoverySpend = Math.max(0, before - state.financials.cashOnHand);
      if (recoverySpend > 0) recoveryPlan = 'full';
      observeFinancialBounds();
    }
    if (policy === 'cash-pressure' && fundRecovery && getRecoveryQuote &&
      average(state.employees.map(employee => employee.burnout)) >= 35) {
      const full = getRecoveryQuote(state, 'full');
      const targeted = getRecoveryQuote(state, 'targeted');
      const monthlyOutflow = state.financialHistory.at(-1)?.recurringCashExpensesPaid ?? 0;
      // The latest recurring outflow is a short reserve signal, not a forecast.
      // Stop discretionary recovery once the credit line has been drawn.
      const plan: BalanceRecoveryPlan | null = state.lineOfCredit.drawn > 0
        ? null
        : full.canFund && state.financials.cashOnHand - full.cost >= 3 * monthlyOutflow
          ? 'full'
          : targeted.canFund && state.financials.cashOnHand - targeted.cost >= monthlyOutflow
            ? 'targeted'
            : null;
      if (plan) {
        const before = state.financials.cashOnHand;
        state = fundRecovery(state, plan);
        recoverySpend = Math.max(0, before - state.financials.cashOnHand);
        if (recoverySpend > 0) recoveryPlan = plan;
        observeFinancialBounds();
      }
    }

    const creditDrawnThisMonth = state.financialHistory.at(-1)?.cashMovements
      .filter(movement => movement.kind === 'loc-draw')
      .reduce((sum, movement) => sum + movement.amount, 0) ?? 0;
    monthly.push({
      month: state.month,
      year: state.year,
      cash: state.financials.cashOnHand,
      creditDrawn: state.lineOfCredit.drawn,
      creditDrawnThisMonth,
      revenue: state.financials.grossRevenue,
      recurringCashPaid: state.financialHistory.at(-1)?.recurringCashExpensesPaid ?? 0,
      partnerDraw: state.financials.partnerDrawThisMonth,
      taxPayable: state.taxPosition.principalDue + state.taxPosition.penaltiesDue,
      profit: state.financials.netProfit,
      clients: state.clients.length,
      serviceCapacity: getClientServiceCapacity(state),
      churn,
      renewals,
      meanBurnout: average(state.employees.map(employee => employee.burnout)),
      meanEfficacy: average(state.employees.map(employee => employee.efficacy)),
      reputation: state.reputation,
      generatedDiscretionary: generated.filter(message =>
        message.scenario.kind !== 'tax-planning' && message.scenario.kind !== 'industry-update').length,
      generatedTax: generated.filter(message => message.scenario.kind === 'tax-planning').length,
      generatedInformation: generated.filter(message => message.scenario.kind === 'industry-update').length,
      pendingBeforeDecisions,
      pendingAfterDecisions: countPending(state),
      recoverySpend,
      recoveryPlan,
    });
  }

  const sum = (key: keyof BalanceMonth): number =>
    monthly.reduce((total, item) => total + Number(item[key]), 0);
  const last = monthly.at(-1)!;
  return {
    seed, policy, months,
    endingCash: last.cash,
    minimumCash,
    endingCreditDrawn: last.creditDrawn,
    peakCreditDrawn,
    creditDrawnTotal: sum('creditDrawnThisMonth'),
    cumulativeProfit: sum('profit'),
    endingClients: last.clients,
    endingServiceCapacity: last.serviceCapacity,
    clientChurn: sum('churn'),
    clientRenewals: sum('renewals'),
    endingMeanBurnout: last.meanBurnout,
    endingMeanEfficacy: last.meanEfficacy,
    endingReputation: last.reputation,
    generatedDiscretionary: sum('generatedDiscretionary'),
    generatedTax: sum('generatedTax'),
    generatedInformation: sum('generatedInformation'),
    averagePendingBeforeDecisions: sum('pendingBeforeDecisions') / months,
    averagePendingAfterDecisions: sum('pendingAfterDecisions') / months,
    peakPending: Math.max(...monthly.map(item => item.pendingBeforeDecisions)),
    endingPending: last.pendingAfterDecisions,
    recoverySpend: sum('recoverySpend'),
    fullRecoveryActions: monthly.filter(item => item.recoveryPlan === 'full').length,
    targetedRecoveryActions: monthly.filter(item => item.recoveryPlan === 'targeted').length,
    monthly,
  };
};
