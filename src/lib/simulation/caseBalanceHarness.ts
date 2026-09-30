import type { SimulationState } from '@/types/simulation';
import { CASE_EVENT_IDS, CASE_PROSPECT, createAuthoredCaseSimulationState,
  getCaseAdvanceBlocker, recordCasePrediction, recordCaseReflection } from './authoredCase';
import { createSeededRandom } from './balanceHarness';
import { getClientServiceCapacity, getClientServiceCoverage } from './clientService';
import { advanceSimulationMonth, applyInboxChoice, getInboxChoiceQuote, sumReceivables } from './engine';
import { generateInboxMessages } from './scenarios';

export const CASE_BALANCE_BRANCHES = {
  'decline-and-serve': {
    collection: 'demand-letter', prospect: 'decline', policy: 'delegate', complaint: 'address',
  },
  'pursue-and-prioritize': {
    collection: 'personal-call', prospect: 'pursue', policy: 'personal', complaint: 'assign',
  },
  'hold-and-defer': {
    collection: 'hold-collection', prospect: 'hold', policy: 'defer', complaint: 'ignore',
  },
} as const;

export type CaseBalanceBranch = keyof typeof CASE_BALANCE_BRANCHES;

export interface CaseBalanceMonth {
  month: number;
  cash: number;
  creditDrawn: number;
  creditDraw: number;
  profit: number;
  clients: number;
  serviceCoverage: number;
  meanBurnout: number;
  meanEfficacy: number;
  pendingDecisions: number;
}

export interface CaseBalanceRun {
  seed: number;
  branch: CaseBalanceBranch;
  caseStatus: 'completed';
  prospectSigned: boolean;
  pursuitExpense: number;
  partnerInterventionsUsed: number;
  renewalOutcome: 'renewed' | 'departed';
  renewalChance: number;
  endingCash: number;
  peakCreditDrawn: number;
  creditDrawTotal: number;
  profitFebruaryThroughApril: number;
  endingServiceCapacity: number;
  endingMeanBurnout: number;
  endingMeanEfficacy: number;
  pendingCaseDecisions: number;
  pendingOtherDecisions: number;
  months: CaseBalanceMonth[];
}

const mean = (values: number[]): number =>
  values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

// Fail loudly if a scripted choice goes stale or if the case loses accounting
// consistency. A silent no-op would make the branch report misleading.
const checkState = (state: SimulationState): void => {
  const entry = state.financialHistory.at(-1)!;
  if (entry.openingCash === null || entry.recurringCashExpensesPaid === null) {
    throw new Error('The new case fixture must have a complete cash record.');
  }
  const aging = sumReceivables(state.receivables);
  if (Object.keys(aging).some(key =>
    aging[key as keyof typeof aging] !== state.arAging[key as keyof typeof aging])) {
    throw new Error('Case branch receivables do not reconcile.');
  }
  const cash = entry.openingCash + entry.collections - entry.recurringCashExpensesPaid +
    entry.cashMovements.reduce((sum, movement) => sum + movement.amount, 0);
  if (Math.abs(cash - state.financials.cashOnHand) > 0.01 ||
    Math.abs(entry.revenue - entry.expenses - state.financials.netProfit) > 0.01) {
    throw new Error('Case branch cash or profit does not reconcile.');
  }
};

export const runCaseBalanceBranch = (seed: number, branch: CaseBalanceBranch): CaseBalanceRun => {
  if (!Number.isInteger(seed) || !CASE_BALANCE_BRANCHES[branch]) {
    throw new Error('Use an integer seed and a named case branch.');
  }
  const choices = CASE_BALANCE_BRANCHES[branch];
  const random = createSeededRandom(seed);
  let id = 0;
  let state = createAuthoredCaseSimulationState();
  const months: CaseBalanceMonth[] = [];
  checkState(state);

  const decide = (messageId: string, choiceId: string): void => {
    const quote = getInboxChoiceQuote(state, messageId, choiceId);
    if (!quote.available) throw new Error(`${branch}: ${messageId}/${choiceId}: ${quote.disabledReason}`);
    const next = applyInboxChoice(state, messageId, choiceId, {
      random, generateId: () => `case-balance-${seed}-${++id}`,
    });
    if (next === state) throw new Error(`${branch}: ${messageId}/${choiceId} did not resolve.`);
    state = next;
    checkState(state);
  };
  const advance = (): void => {
    state = recordCaseReflection(state, 'not-sure');
    const blocker = getCaseAdvanceBlocker(state);
    if (blocker) throw new Error(`${branch}: ${blocker}`);
    const oldMonth = state.month;
    state = advanceSimulationMonth(state, {
      random,
      generateAlerts: () => [],
      generateInboxMessages: next => generateInboxMessages(next, {
        random,
        generateId: () => `case-balance-${seed}-${++id}`,
        now: () => new Date(Date.UTC(next.year, next.month - 1, 1, 12)),
      }),
    });
    if (state.month !== oldMonth + 1) throw new Error(`${branch}: month did not advance.`);
    checkState(state);
    const entry = state.financialHistory.at(-1)!;
    months.push({
      month: state.month,
      cash: state.financials.cashOnHand,
      creditDrawn: state.lineOfCredit.drawn,
      creditDraw: entry.cashMovements.filter(item => item.kind === 'loc-draw')
        .reduce((sum, item) => sum + item.amount, 0),
      profit: state.financials.netProfit,
      clients: state.clients.length,
      serviceCoverage: getClientServiceCoverage(state),
      meanBurnout: mean(state.employees.map(employee => employee.burnout)),
      meanEfficacy: mean(state.employees.map(employee => employee.efficacy)),
      pendingDecisions: state.inbox.filter(item => item.requiresAction).length,
    });
  };

  state = recordCasePrediction(state, 'not-sure');
  decide(CASE_EVENT_IDS.collection, choices.collection);
  advance();

  state = recordCasePrediction(state, 'not-sure');
  decide(CASE_EVENT_IDS.intakeReview, 'review');
  decide(CASE_EVENT_IDS.prospect, choices.prospect);
  advance();

  state = recordCasePrediction(state, 'not-sure');
  decide(CASE_EVENT_IDS.policy, choices.policy);
  decide(CASE_EVENT_IDS.complaint, choices.complaint);
  advance();

  if (state.authoredCase?.status !== 'completed' || !state.authoredCase.renewal ||
    !state.authoredCase.renewalOutcome) throw new Error(`${branch}: case did not finish.`);
  const caseIds = new Set<string>(Object.values(CASE_EVENT_IDS));
  const decisions = state.authoredCase.guidance.decisions;
  const prospectDecision = decisions.find(item => item.messageId === CASE_EVENT_IDS.prospect);
  return {
    seed, branch, caseStatus: 'completed',
    prospectSigned: state.clients.some(client => client.name === CASE_PROSPECT.name),
    pursuitExpense: Math.max(0, -(prospectDecision?.profitDelta ?? 0)),
    partnerInterventionsUsed: decisions.filter(item => item.usedPartnerIntervention).length,
    renewalOutcome: state.authoredCase.renewalOutcome,
    renewalChance: state.authoredCase.renewal.chance,
    endingCash: state.financials.cashOnHand,
    peakCreditDrawn: Math.max(0, ...months.map(item => item.creditDrawn)),
    creditDrawTotal: months.reduce((sum, item) => sum + item.creditDraw, 0),
    profitFebruaryThroughApril: months.reduce((sum, item) => sum + item.profit, 0),
    endingServiceCapacity: getClientServiceCapacity(state),
    endingMeanBurnout: mean(state.employees.map(employee => employee.burnout)),
    endingMeanEfficacy: mean(state.employees.map(employee => employee.efficacy)),
    pendingCaseDecisions: state.inbox.filter(item => item.requiresAction && caseIds.has(item.id)).length,
    pendingOtherDecisions: state.inbox.filter(item => item.requiresAction && !caseIds.has(item.id)).length,
    months,
  };
};
