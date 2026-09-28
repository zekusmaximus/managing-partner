import { describe, expect, test } from 'bun:test';
import { createInitialSimulationState } from './initialState';
import { scheduleClientMeeting, sumReceivables, writeOffReceivables } from './engine';
import { getAlertConditionKey, selectCurrentAlerts, selectOutcomeAlerts } from './alerts';

const alert = (id, message, actionTarget) => ({
  id, message, actionTarget, type: 'warning', timestamp: new Date(),
});

describe('visible alerts', () => {
  test('refreshes an expiry warning from the current term and hides it after renewal or churn', () => {
    const state = createInitialSimulationState();
    const client = state.clients[0];
    state.clients[0] = { ...client, contractMonthsRemaining: 2 };
    state.alerts = [alert('expiry', `${client.name}'s contract expires in 3 month(s)!`, { kind: 'client', clientId: client.id })];
    expect(selectCurrentAlerts(state)[0].message).toContain('expires in 2 month(s)');

    const renewed = { ...state, clients: [{ ...state.clients[0], contractMonthsRemaining: 12 }, ...state.clients.slice(1)] };
    expect(selectCurrentAlerts(renewed)).toHaveLength(0);
    expect(selectCurrentAlerts({ ...state, clients: state.clients.slice(1) })).toHaveLength(0);
    const legacy = { ...state, alerts: [alert('legacy-expiry', `${client.name}'s contract expires in 3 month(s)!`)] };
    expect(selectCurrentAlerts(legacy)[0].message).toContain('expires in 2 month(s)');
  });

  test('updates an overdue warning after collection and removes it after write-off', () => {
    const state = createInitialSimulationState();
    state.receivables[0].aging.ninetyPlus = 100;
    state.arAging = sumReceivables(state.receivables);
    state.alerts = [alert('ar', '$100 in AR is 90+ days overdue — consider write-off.', { kind: 'ar' })];
    const partiallyCollected = { ...state, receivables: state.receivables.map((account, index) => index === 0
      ? { ...account, aging: { ...account.aging, ninetyPlus: 85 } } : account) };
    partiallyCollected.arAging = sumReceivables(partiallyCollected.receivables);
    expect(selectCurrentAlerts(partiallyCollected)[0].message).toContain('$85');
    expect(selectCurrentAlerts(partiallyCollected)[0].message).toContain('Review collection options');

    const writtenOff = writeOffReceivables(state, 100);
    expect(selectCurrentAlerts(writtenOff)).toHaveLength(0);
  });

  test('removes a satisfaction warning after a meeting and keeps the result', () => {
    const state = createInitialSimulationState();
    const client = state.clients[0];
    state.clients[0] = { ...client, satisfaction: 65 };
    state.alerts = [alert('satisfaction', `${client.name}'s satisfaction dropped to 65%.`, { kind: 'client', clientId: client.id })];
    const met = scheduleClientMeeting(state, client.id);
    expect(met.clients[0].satisfaction).toBe(71);
    expect(selectCurrentAlerts(met)).toHaveLength(0);
    expect(selectOutcomeAlerts(met).some(item => item.message.startsWith(`Met with ${client.name}`))).toBe(true);
  });

  test('deduplicates current warnings and keeps recorded contract outcomes separate', () => {
    const state = createInitialSimulationState();
    state.arAging.ninetyPlus = 20;
    state.alerts = [
      alert('new-ar', '$20 in AR is 90+ days overdue.', { kind: 'ar' }),
      alert('old-ar', '$100 in AR is 90+ days overdue — consider write-off.', { kind: 'ar' }),
      alert('renewed', 'A client renewed for a new 12-month term.'),
    ];
    expect(selectCurrentAlerts(state)).toHaveLength(1);
    expect(getAlertConditionKey(state.alerts[0], state)).toBe(getAlertConditionKey(state.alerts[1], state));
    expect(selectOutcomeAlerts(state).map(item => item.id)).toEqual(['renewed']);
  });

  test('projects a service warning from current capacity and clears it after staffing recovers', () => {
    const state = createInitialSimulationState();
    state.employees = [];
    state.alerts = [alert('service-shortfall-2026-2', 'Client service coverage is 50% (4.0 effective slots for 8 clients).', { kind: 'clients' })];
    expect(selectCurrentAlerts(state)[0].message).toContain('coverage is 0%');
    expect(selectCurrentAlerts(state)[0].message).toContain('0.0 effective slots');

    const recovered = { ...state, employees: createInitialSimulationState().employees, clients: [state.clients[0]] };
    expect(selectCurrentAlerts(recovered)).toHaveLength(0);
    expect(selectOutcomeAlerts(recovered)).toHaveLength(0);
  });
});
