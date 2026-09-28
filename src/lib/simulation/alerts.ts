import type { Alert, SimulationState } from '@/types/simulation';
import { getLOCMonthlyInterest } from '@/types/simulation';
import { getClientServiceCapacity, getClientServiceCoverage } from '@/lib/simulation/clientService';

type CurrentAlert = { key: string; alert: Alert | null };

// Saved alerts contain snapshots from earlier turns. Project condition alerts
// against today's state before showing them as work the player can still do.
const currentCondition = (alert: Alert, state: SimulationState): CurrentAlert | null => {
  const message = alert.message;
  const target = alert.actionTarget;
  const client = target?.kind === 'client'
    ? state.clients.find(item => item.id === target.clientId)
    : state.clients.find(item =>
      message.startsWith(`${item.name}'s contract expires in `) ||
      message.startsWith(`${item.name}'s satisfaction dropped to `) ||
      message.startsWith(`${item.name} satisfaction is critically low at `));

  if (message.includes('contract expires in ')) {
    const key = `expiry:${client?.id ?? message}`;
    return { key, alert: client && client.contractMonthsRemaining > 0 && client.contractMonthsRemaining <= 3
      ? { ...alert, message: `${client.name}'s contract expires in ${client.contractMonthsRemaining} month(s)!` }
      : null };
  }
  if (message.includes('satisfaction dropped to ') || message.includes('satisfaction is critically low at ')) {
    const key = `satisfaction:${client?.id ?? message}`;
    if (!client || client.satisfaction >= 70) return { key, alert: null };
    return { key, alert: client.satisfaction < 50
      ? { ...alert, type: 'error', message: `${client.name} satisfaction is critically low at ${client.satisfaction}%!` }
      : { ...alert, type: 'warning', message: `${client.name}'s satisfaction dropped to ${client.satisfaction}%.` } };
  }
  if (message.includes('in AR is ') && message.includes('days overdue')) {
    const ninetyPlus = message.includes('90+ days overdue');
    const amount = ninetyPlus ? state.arAging.ninetyPlus : state.arAging.sixtyDay;
    return { key: ninetyPlus ? 'ar:90+' : 'ar:61-90', alert: amount > 0
      ? { ...alert, message: ninetyPlus
        ? `$${Math.round(amount).toLocaleString()} in AR is 90+ days overdue. Review collection options before writing off debt.`
        : `$${Math.round(amount).toLocaleString()} in AR is 61-90 days overdue.` }
      : null };
  }
  if (message === 'Cash on hand is critically low!') {
    return { key: 'cash', alert: state.financials.cashOnHand < 50000 ? alert : null };
  }
  if (message.startsWith('Line of credit balance:')) {
    const drawn = state.lineOfCredit.drawn;
    return { key: 'credit', alert: drawn > 0 ? {
      ...alert,
      message: `Line of credit balance: $${drawn.toLocaleString()} (${Math.round(getLOCMonthlyInterest(state.lineOfCredit)).toLocaleString()}/mo interest).`,
    } : null };
  }
  if (message.includes(' budget exceeded by ')) {
    const category = message.split(' budget exceeded by ')[0];
    const quarter = Math.ceil(state.month / 3);
    const budget = state.budget.find(item => item.category === category && item.quarter === quarter && item.year === state.year);
    const variance = budget ? budget.actualQuarterlySpend - budget.plannedQuarterly : 0;
    const overrun = budget && variance > budget.plannedQuarterly * 0.1 && state.month % 3 === 0;
    const label = budget && budget.plannedQuarterly > 0
      ? `${Math.round(variance / budget.plannedQuarterly * 100)}% over` : 'unbudgeted spend';
    return { key: `budget:${category}`, alert: overrun
      ? { ...alert, message: `${category} budget exceeded by $${Math.round(variance).toLocaleString()} (${label}).` }
      : null };
  }
  if (message.includes('burnout is at ') || message.includes('% burnout!')) {
    const employee = state.employees.find(item =>
      message.startsWith(`${item.name}'s burnout is at `) || message.startsWith(`${item.name} is at `));
    const key = `burnout:${employee?.id ?? message}`;
    if (!employee || employee.burnout < 60) return { key, alert: null };
    return { key, alert: employee.burnout >= 80
      ? { ...alert, type: 'error', message: `${employee.name} is at ${employee.burnout}% burnout! Consider addressing this.` }
      : { ...alert, type: 'warning', message: `${employee.name}'s burnout is at ${employee.burnout}%.` } };
  }
  if (alert.id.startsWith('service-shortfall-')) {
    const coverage = getClientServiceCoverage(state);
    return { key: 'service', alert: state.clients.length > 0 && coverage < 0.9
      ? {
        ...alert,
        message: `Client service coverage is ${Math.round(coverage * 100)}% (${getClientServiceCapacity(state).toFixed(1)} effective slots for ${state.clients.length} clients). Low coverage reduces satisfaction and renewal odds. Add billable or support staff, or restore team effectiveness.`,
      }
      : null };
  }
  return null;
};

export const getAlertConditionKey = (alert: Alert, state: SimulationState): string | null =>
  currentCondition(alert, state)?.key ?? null;

export const selectCurrentAlerts = (state: SimulationState): Alert[] => {
  const seen = new Set<string>();
  return state.alerts.flatMap(alert => {
    const condition = currentCondition(alert, state);
    if (!condition || !condition.alert || seen.has(condition.key)) return [];
    seen.add(condition.key);
    return [condition.alert];
  });
};

// Contract and meeting results describe what happened when a month or action
// resolved. Keep them visible separately from live conditions.
export const selectOutcomeAlerts = (state: SimulationState): Alert[] =>
  state.alerts.filter(alert => currentCondition(alert, state) === null);
