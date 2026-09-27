import { describe, expect, test } from 'bun:test';
import { advanceSimulationMonth, collectOverdueReceivables, sumReceivables } from './engine';
import { createInitialSimulationState } from './initialState';

const advanceWith = (state, random, generateAlerts = () => []) => advanceSimulationMonth(state, {
  random,
  generateAlerts,
  generateInboxMessages: () => [],
});

const oneClient = (months, satisfaction = 80) => {
  const state = createInitialSimulationState();
  const client = { ...state.clients[0], contractMonthsRemaining: months, satisfaction };
  const receivables = [{
    clientId: client.id,
    clientName: client.name,
    paymentProfile: client.paymentProfile,
    aging: { current: 1000, thirtyDay: 0, sixtyDay: 0, ninetyPlus: 0 },
  }];
  return { ...state, clients: [client], receivables, arAging: sumReceivables(receivables) };
};

describe('client contract expiry', () => {
  test('an active term counts down without an early renewal', () => {
    const state = oneClient(2);
    const next = advanceWith(state, () => 0);
    expect(next.clients[0].contractMonthsRemaining).toBe(1);
    expect(next.alerts.some(alert => alert.message.includes('renew'))).toBe(false);
    expect(next.financials.grossRevenue).toBe(state.clients[0].monthlyFee);
  });

  test('renewal gives a positive new term, invoices, and a visible outcome', () => {
    const state = oneClient(1);
    const next = advanceWith(state, () => 0);
    expect(next.clients).toHaveLength(1);
    expect(next.clients[0].contractMonthsRemaining).toBe(12);
    expect(next.financials.grossRevenue).toBe(state.clients[0].monthlyFee);
    expect(next.receivables[0].aging.current).toBe(state.clients[0].monthlyFee);
    expect(next.alerts[0].message).toContain(`${state.clients[0].name} renewed for a new 12-month term`);
    expect(next.alerts[0].timestamp.toISOString()).toBe('2026-02-01T00:00:00.000Z');
  });

  test('churn stops new invoices but old receivables remain collectible', () => {
    const state = oneClient(1);
    const next = advanceWith(state, () => 0.99);
    expect(next.clients).toHaveLength(0);
    expect(next.financials.grossRevenue).toBe(0);
    expect(next.financials.collectionsThisMonth).toBe(800);
    expect(next.receivables[0].aging).toEqual({ current: 0, thirtyDay: 200, sixtyDay: 0, ninetyPlus: 0 });
    expect(next.alerts[0].message).toContain(`${state.clients[0].name} did not renew`);
    expect(next.alerts[0].message).toContain('receivables remain collectible');
    const collected = collectOverdueReceivables(next);
    expect(collected.receivables[0].aging.thirtyDay).toBe(140);
    expect(collected.financials.cashOnHand).toBe(next.financials.cashOnHand + 60);
  });

  test('renewal chance tracks satisfaction and resolves legacy zero-month terms', () => {
    const low = advanceWith(oneClient(0, 20), () => 0.6);
    const high = advanceWith(oneClient(0, 90), () => 0.6);
    expect(low.clients).toHaveLength(0);
    expect(high.clients[0].contractMonthsRemaining).toBe(12);
  });

  test('contract outcomes stay ahead of routine alerts and active terms stay positive', () => {
    let state = oneClient(1);
    const routineAlerts = () => Array.from({ length: 15 }, (_, index) => ({
      id: `routine-${index}`, type: 'warning', message: 'Routine alert', timestamp: new Date(),
    }));
    state = advanceWith(state, () => 0, routineAlerts);
    expect(state.alerts).toHaveLength(10);
    expect(state.alerts[0].message).toContain('renewed for a new 12-month term');
    for (let month = 0; month < 36; month += 1) {
      state = advanceWith(state, () => 0);
      expect(state.clients.every(client => client.contractMonthsRemaining > 0 && client.contractMonthsRemaining <= 12)).toBe(true);
    }
  });
});
