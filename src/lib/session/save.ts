import { tutorialSteps } from '@/data/tutorialSteps';
import { createInitialSimulationState } from '@/lib/simulation/initialState';
import { createInitialTutorialState, type TutorialState } from './tutorialState';
import type { SimulationState } from '@/types/simulation';

export const SESSION_STORAGE_KEY = 'managing-partner-session-v1';
export const LEGACY_TUTORIAL_STORAGE_KEY = 'managing-partner-tutorial';
export const SESSION_VERSION = 1;

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
    case 'it-vendor': return text(value.vendorId);
    case 'benefits-increase': return nonnegative(value.monthlyIncrease);
    case 'partner-distribution': return nonnegative(value.availablePool);
    case 'collections-problem': return nonnegative(value.overdueAmount) &&
      (value.clientId === undefined || text(value.clientId));
    case 'budget-overrun': return text(value.category);
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
});

const simulationState: Check = (value) => fields(value, {
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

const validStepIds = new Set(tutorialSteps.map((step) => step.id));
const tutorialState: Check = (value) => fields(value, {
  status: oneOf('not_started', 'in_progress', 'completed', 'skipped'),
  currentStepIndex: (index) => integer(index) && (index as number) >= 0 &&
    (index as number) < tutorialSteps.length,
  currentPhase: oneOf('welcome', 'month1', 'month2', 'month3', 'completed'),
  completedSteps: arrayOf((id) => text(id) && validStepIds.has(id as string)),
  showWelcomeModal: bool, isPaused: bool, simulationMonthAtStart: month,
});

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
    if (!record(parsed) || parsed.version !== SESSION_VERSION ||
      !simulationState(parsed.simulation) || !tutorialState(parsed.tutorial)) return null;

    const simulation = parsed.simulation as unknown as SimulationState;
    return {
      simulation: {
        ...simulation,
        alerts: simulation.alerts.map((alert) => ({
          ...alert, timestamp: new Date(alert.timestamp),
        })),
        inbox: simulation.inbox.map((message) => ({
          ...message, timestamp: new Date(message.timestamp),
        })),
      },
      tutorial: parsed.tutorial as TutorialState,
    };
  } catch {
    return null;
  }
}

export function loadSession(storage: SessionStorage): LoadResult {
  let raw: string | null;
  try {
    raw = storage.getItem(SESSION_STORAGE_KEY);
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
