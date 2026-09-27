import { tutorialSteps } from '@/data/tutorialSteps';
import { createInitialSimulationState } from '@/lib/simulation/initialState';
import { sumReceivables } from '@/lib/simulation/engine';
import { createInitialTutorialState, type TutorialState } from './tutorialState';
import type { SimulationState } from '@/types/simulation';

export const SESSION_STORAGE_KEY = 'managing-partner-session-v4';
export const PREVIOUS_SESSION_STORAGE_KEY = 'managing-partner-session-v3';
export const SECOND_SESSION_STORAGE_KEY = 'managing-partner-session-v2';
export const FIRST_SESSION_STORAGE_KEY = 'managing-partner-session-v1';
export const LEGACY_TUTORIAL_STORAGE_KEY = 'managing-partner-tutorial';
export const SESSION_VERSION = 4;

export interface SessionSnapshot {
  simulation: SimulationState;
  tutorial: TutorialState;
}

export type SessionStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type LoadResult =
  | { status: 'loaded'; snapshot: SessionSnapshot }
  | { status: 'empty' | 'invalid' | 'unavailable' };

type Check = (value: unknown) => boolean;
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const text: Check = (value) => typeof value === 'string';
const finite: Check = (value) => typeof value === 'number' && Number.isFinite(value);
const nonnegative: Check = (value) => finite(value) && (value as number) >= 0;
const integer: Check = (value) => Number.isInteger(value);
const bool: Check = (value) => typeof value === 'boolean';
const oneOf = (...options: string[]): Check => (value) =>
  typeof value === 'string' && options.includes(value);
const arrayOf = (check: Check): Check => (value) =>
  Array.isArray(value) && value.every(check);
const fields = (value: unknown, checks: Record<string, Check>): boolean =>
  record(value) && Object.entries(checks).every(([key, check]) => check(value[key]));
const month: Check = (value) => integer(value) && (value as number) >= 1 && (value as number) <= 12;
const year: Check = (value) => integer(value) && (value as number) >= 2020;
const percentage: Check = (value) => finite(value) && (value as number) >= 0 && (value as number) <= 100;
const timestamp: Check = (value) =>
  typeof value === 'string' && !Number.isNaN(new Date(value).getTime());

const operatingCosts: Check = (value) => fields(value, {
  rent: nonnegative, insurance: nonnegative, technology: nonnegative,
  compliance: nonnegative, misc: nonnegative,
});

const employee: Check = (value) => fields(value, {
  id: text, name: text, role: oneOf('Lobbyist', 'Attorney', 'Support'),
  efficacy: percentage, burnout: percentage, salary: nonnegative,
  clientAffinity: percentage,
  hireDate: (date) => fields(date, { month, year }),
});

const client: Check = (value) => fields(value, {
  id: text, name: text,
  type: oneOf('Trade Association', 'Corporation', 'Non-Profit'),
  feeStructure: oneOf('Retainer', 'Hourly'), monthlyFee: nonnegative,
  satisfaction: percentage, contractMonthsRemaining: nonnegative,
  paymentProfile: oneOf('prompt', 'normal', 'slow'), lastPaymentMonth: nonnegative,
});

const financialHistoryEntry: Check = (value) => fields(value, {
  month, year, revenue: nonnegative, expenses: nonnegative, profit: finite,
  collections: nonnegative, operatingCosts: nonnegative, operatingCostBreakdown: operatingCosts,
  vendorCosts: nonnegative, partnerDraw: nonnegative, payroll: nonnegative,
  arWriteOff: nonnegative, locInterest: nonnegative, cashOnHand: finite,
});

const cashMovement: Check = (value) => {
  if (!fields(value, {
    kind: oneOf('loc-draw', 'loc-repayment', 'partner-distribution', 'tax-payment',
      'equipment-purchase', 'hiring', 'severance', 'staff-recovery', 'repair', 'unclassified'),
    amount: finite,
  })) return false;
  const movement = value as { kind: string; amount: number };
  return movement.kind === 'loc-draw' ? movement.amount > 0
    : movement.kind === 'unclassified' ? movement.amount !== 0
      : movement.amount < 0;
};

const financialHistoryEntryV3: Check = (value) => {
  if (!financialHistoryEntry(value) || !fields(value, {
    openingCash: (amount) => amount === null || finite(amount),
    recurringCashExpensesPaid: (amount) => amount === null || nonnegative(amount),
    cashMovements: arrayOf(cashMovement),
    oneTimeOperatingExpenses: nonnegative,
    isOpeningSnapshot: bool,
  })) return false;
  const entry = value as Record<string, unknown>;
  if ((entry.openingCash === null) !== (entry.recurringCashExpensesPaid === null)) return false;
  if (entry.openingCash === null) return entry.isOpeningSnapshot === true;
  const movements = entry.cashMovements as SimulationState['financialHistory'][number]['cashMovements'];
  const closingCash = (entry.openingCash as number) + (entry.collections as number) -
    (entry.recurringCashExpensesPaid as number) + movements.reduce((total, movement) => total + movement.amount, 0);
  return Math.abs(closingCash - (entry.cashOnHand as number)) < 0.01;
};

const scenario: Check = (value) => {
  if (!record(value) || typeof value.kind !== 'string') return false;
  switch (value.kind) {
    case 'raise-request': return text(value.employeeId);
    case 'client-feedback': return text(value.clientId);
    case 'new-client': return fields(value, {
      name: text, clientType: oneOf('Trade Association', 'Corporation', 'Non-Profit'),
      monthlyFee: nonnegative,
    });
    case 'lease-renewal': return nonnegative(value.currentRent);
    case 'it-vendor': return text(value.vendorId) &&
      (value.quotedMonthlyCost === undefined || nonnegative(value.quotedMonthlyCost));
    case 'benefits-increase': return nonnegative(value.monthlyIncrease);
    case 'partner-distribution': return nonnegative(value.availablePool);
    case 'collections-problem': return nonnegative(value.overdueAmount) &&
      (value.clientId === undefined || text(value.clientId));
    case 'budget-overrun': return text(value.category) &&
      (value.quarter === undefined || (integer(value.quarter) && (value.quarter as number) >= 1 && (value.quarter as number) <= 4)) &&
      (value.year === undefined || year(value.year));
    case 'equipment-failure':
    case 'industry-update': return true;
    case 'tax-planning': return nonnegative(value.estimatedTax);
    default: return false;
  }
};

const inboxMessage: Check = (value) => fields(value, {
  id: text, type: oneOf('request', 'alert', 'opportunity'), title: text,
  description: text, urgency: oneOf('low', 'medium', 'high'),
  requiresAction: bool, read: bool,
  choices: arrayOf((choice) => fields(choice, { id: text, label: text, effect: text })),
  timestamp, scenario,
}) && record(value) && (value.resolution === undefined || fields(value.resolution, {
  choiceId: text, summary: text,
}));

const simulationStateBase: Check = (value) => fields(value, {
  month, year,
  financials: (financials) => fields(financials, {
    cashOnHand: finite, grossRevenue: nonnegative, operatingExpenses: nonnegative,
    netProfit: finite, collectionsThisMonth: nonnegative, totalPayroll: nonnegative,
    totalOperatingCosts: nonnegative, totalVendorCosts: nonnegative,
    partnerDrawThisMonth: nonnegative, locInterestThisMonth: nonnegative,
  }),
  financialHistory: (history) => Array.isArray(history) &&
    history.length > 0 && history.every(financialHistoryEntry),
  employees: arrayOf(employee), clients: arrayOf(client), reputation: percentage,
  alerts: arrayOf((alert) => fields(alert, {
    id: text, type: oneOf('warning', 'info', 'error', 'success'),
    message: text, timestamp,
  })),
  inbox: arrayOf(inboxMessage), operatingCosts,
  vendors: arrayOf((vendor) => fields(vendor, {
    id: text, name: text,
    category: oneOf('Accounting', 'IT', 'Janitorial', 'Legal Counsel', 'Other'),
    monthlyCost: nonnegative, contractMonths: nonnegative,
  })),
  partnerEconomics: (partner) => fields(partner, {
    monthlyDraw: nonnegative, distributionPool: nonnegative,
    lastDistributionMonth: (value) => integer(value) && (value as number) >= 0 && (value as number) <= 12,
    lastDistributionYear: year, totalDistributed: nonnegative,
  }),
  budget: arrayOf((item) => fields(item, {
    category: text, plannedQuarterly: nonnegative, actualQuarterlySpend: nonnegative,
    quarter: (value) => integer(value) && (value as number) >= 1 && (value as number) <= 4,
    year,
  })),
  arAging: (ar) => fields(ar, {
    current: nonnegative, thirtyDay: nonnegative, sixtyDay: nonnegative,
    ninetyPlus: nonnegative,
  }),
  lineOfCredit: (loc) => fields(loc, {
    limit: nonnegative, drawn: nonnegative, interestRate: nonnegative,
  }) && record(loc) && (loc.drawn as number) <= (loc.limit as number),
});

const receivableAccount: Check = (value) => fields(value, {
  clientId: (id) => id === null || text(id),
  clientName: text,
  paymentProfile: oneOf('prompt', 'normal', 'slow'),
  aging: (aging) => fields(aging, {
    current: nonnegative, thirtyDay: nonnegative, sixtyDay: nonnegative,
    ninetyPlus: nonnegative,
  }),
});

const simulationStateV2: Check = (value) => {
  if (!simulationStateBase(value) || !record(value) || !arrayOf(receivableAccount)(value.receivables)) return false;
  const accounts = value.receivables as SimulationState['receivables'];
  const identifiers = accounts.map(account => account.clientId);
  if (new Set(identifiers).size !== identifiers.length) return false;
  const total = sumReceivables(accounts);
  const arAging = value.arAging as SimulationState['arAging'];
  return (Object.keys(total) as Array<keyof typeof total>).every(bucket => total[bucket] === arAging[bucket]);
};

const simulationStateV3: Check = (value) => simulationStateV2(value) && record(value) &&
  Array.isArray(value.financialHistory) && value.financialHistory.every(financialHistoryEntryV3);

const simulationStateV4: Check = (value) => simulationStateV3(value) && record(value) &&
  fields(value.taxPosition, { principalDue: nonnegative, penaltiesDue: nonnegative }) &&
  (value.lastManualCollection === undefined || value.lastManualCollection === null ||
    fields(value.lastManualCollection, { month, year })) &&
  Array.isArray(value.financialHistory) && value.financialHistory.every((entry) =>
    fields(entry, { taxExpense: nonnegative, taxPenalty: nonnegative }));

// Older saves only record each closing balance. Their unexplained difference
// stays unclassified; it cannot safely be called a tax payment or LOC draw.
function migrateLegacyCashHistory(history: SimulationState['financialHistory']): SimulationState['financialHistory'] {
  return history.map((entry, index) => {
    if (index === 0) return {
      ...entry,
      openingCash: null,
      recurringCashExpensesPaid: null,
      cashMovements: [],
      oneTimeOperatingExpenses: 0,
      isOpeningSnapshot: true,
    };
    const openingCash = history[index - 1].cashOnHand;
    const recurringCashExpensesPaid = Math.max(0, entry.expenses - entry.arWriteOff);
    const residual = entry.cashOnHand - (openingCash + entry.collections - recurringCashExpensesPaid);
    return {
      ...entry,
      openingCash,
      recurringCashExpensesPaid,
      cashMovements: residual === 0 ? [] : [{ kind: 'unclassified' as const, amount: residual }],
      oneTimeOperatingExpenses: 0,
      isOpeningSnapshot: false,
    };
  });
}

const validStepIds = new Set(tutorialSteps.map((step) => step.id));
const tutorialStateLegacy: Check = (value) => fields(value, {
  status: oneOf('not_started', 'in_progress', 'completed', 'skipped'),
  currentStepIndex: (index) => integer(index) && (index as number) >= 0 &&
    (index as number) < tutorialSteps.length,
  currentPhase: oneOf('welcome', 'month1', 'month2', 'month3', 'completed'),
  completedSteps: arrayOf((id) => text(id) && validStepIds.has(id as string)),
  showWelcomeModal: bool, isPaused: bool, simulationMonthAtStart: month,
});
const tutorialStateV4: Check = (value) => tutorialStateLegacy(value) && record(value) && year(value.simulationYearAtStart);

export function createFreshSession(): SessionSnapshot {
  return {
    simulation: createInitialSimulationState(),
    tutorial: createInitialTutorialState(),
  };
}

export function serializeSession(snapshot: SessionSnapshot): string {
  return JSON.stringify({ version: SESSION_VERSION, ...snapshot });
}

export function parseSession(raw: string): SessionSnapshot | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!record(parsed) || (parsed.version !== SESSION_VERSION && parsed.version !== 3 && parsed.version !== 2 && parsed.version !== 1) ||
      !(parsed.version === 1 ? simulationStateBase(parsed.simulation)
        : parsed.version === 2 ? simulationStateV2(parsed.simulation)
          : parsed.version === 3 ? simulationStateV3(parsed.simulation)
            : simulationStateV4(parsed.simulation)) ||
      !(parsed.version === SESSION_VERSION ? tutorialStateV4(parsed.tutorial) : tutorialStateLegacy(parsed.tutorial))) return null;

    const simulation = parsed.simulation as unknown as SimulationState;
    const receivables = parsed.version === 1
      ? [{ clientId: null, clientName: 'Prior balance (unassigned)', paymentProfile: 'normal' as const, aging: { ...simulation.arAging } }]
      : simulation.receivables;
    return {
      simulation: {
        ...simulation,
        lastManualCollection: parsed.version === SESSION_VERSION
          ? simulation.lastManualCollection ?? null : null,
        receivables,
        financialHistory: (parsed.version >= 3
          ? simulation.financialHistory : migrateLegacyCashHistory(simulation.financialHistory))
          .map(entry => parsed.version === SESSION_VERSION ? entry : { ...entry, taxExpense: 0, taxPenalty: 0 }),
        taxPosition: parsed.version === SESSION_VERSION
          ? simulation.taxPosition : { principalDue: 0, penaltiesDue: 0 },
        alerts: simulation.alerts.map((alert) => ({
          ...alert, timestamp: new Date(alert.timestamp),
        })),
        inbox: simulation.inbox.map((message) => ({
          ...message, timestamp: new Date(message.timestamp),
          ...(parsed.version !== SESSION_VERSION && message.requiresAction && message.scenario.kind === 'tax-planning'
            ? { read: true, requiresAction: false,
                resolution: { choiceId: 'expired', summary: 'This prior tax estimate expired during save migration because no payable balance was recorded. Future quarters use the new tax balance.' } }
            : {}),
        })),
      },
      tutorial: parsed.version === SESSION_VERSION
        ? parsed.tutorial as TutorialState
        : {
          ...(parsed.tutorial as TutorialState),
          simulationYearAtStart: Math.max(2020, simulation.year -
            (simulation.month < (parsed.tutorial as TutorialState).simulationMonthAtStart ? 1 : 0)),
        },
    };
  } catch {
    return null;
  }
}

export function loadSession(storage: SessionStorage): LoadResult {
  let raw: string | null;
  try {
    raw = storage.getItem(SESSION_STORAGE_KEY);
    if (raw === null) raw = storage.getItem(PREVIOUS_SESSION_STORAGE_KEY);
    if (raw === null) raw = storage.getItem(SECOND_SESSION_STORAGE_KEY);
    if (raw === null) raw = storage.getItem(FIRST_SESSION_STORAGE_KEY);
  } catch {
    return { status: 'unavailable' };
  }
  if (raw === null) return { status: 'empty' };
  const snapshot = parseSession(raw);
  return snapshot ? { status: 'loaded', snapshot } : { status: 'invalid' };
}

export function saveSession(storage: SessionStorage, snapshot: SessionSnapshot): boolean {
  try {
    storage.setItem(SESSION_STORAGE_KEY, serializeSession(snapshot));
    return true;
  } catch {
    return false;
  }
}
