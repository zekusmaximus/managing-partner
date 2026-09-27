import { describe, expect, test } from 'bun:test';
import { advanceSimulationMonth, collectOverdueReceivables, sumReceivables } from './engine';
import { getClientServiceCapacity, getClientServiceCoverage } from './clientService';
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
  test('the initial four billable staff cover eight clients near the baseline', () => {
    const state = createInitialSimulationState();
    expect(getClientServiceCapacity(state)).toBeCloseTo(8.04, 1);
    expect(getClientServiceCoverage(state)).toBeCloseTo(1, 1);
    const next = advanceWith(state, () => 0.5);
    expect(next.clients.map(client => client.satisfaction)).toEqual(
      state.clients.map(client => client.satisfaction));
  });

  test('service capacity follows efficacy, affinity, burnout, and support effectiveness', () => {
    const state = createInitialSimulationState();
    const baseline = getClientServiceCoverage(state);
    const noSupport = { ...state, employees: state.employees.filter(employee => employee.role !== 'Support') };
    const weakSupport = { ...state, employees: state.employees.map(employee =>
      employee.role === 'Support' ? { ...employee, efficacy: 0, clientAffinity: 0 } : employee) };
    expect(getClientServiceCoverage(noSupport) / baseline).toBeCloseTo(0.85, 2);
    expect(getClientServiceCoverage(weakSupport)).toBe(getClientServiceCoverage(noSupport));
    const lowEfficacy = { ...state, employees: state.employees.map(employee =>
      employee.role === 'Support' ? employee : { ...employee, efficacy: 20 }) };
    const lowAffinity = { ...state, employees: state.employees.map(employee =>
      employee.role === 'Support' ? employee : { ...employee, clientAffinity: 10 }) };
    const burnedOut = { ...state, employees: state.employees.map(employee =>
      employee.role === 'Support' ? employee : { ...employee, burnout: 90 }) };
    expect(getClientServiceCoverage(lowEfficacy)).toBeLessThan(baseline);
    expect(getClientServiceCoverage(lowAffinity)).toBeLessThan(baseline);
    expect(getClientServiceCoverage(burnedOut)).toBeLessThan(baseline);
    expect(getClientServiceCoverage(noSupport)).toBeLessThan(baseline);
    const steadyMonth = advanceWith(state, () => 0.5);
    const burnedOutMonth = advanceWith(burnedOut, () => 0.5);
    const unsupportedMonth = advanceWith(noSupport, () => 0.5);
    expect(burnedOutMonth.clients[0].satisfaction).toBeLessThan(steadyMonth.clients[0].satisfaction);
    expect(unsupportedMonth.clients[0].satisfaction).toBeLessThan(steadyMonth.clients[0].satisfaction);
    expect(unsupportedMonth.alerts.some(alert => alert.message.includes('Client service coverage'))).toBe(true);
    expect(steadyMonth.alerts.some(alert => alert.message.includes('Client service coverage'))).toBe(false);
  });

  test('a support employee can tip a close renewal in the staffed book', () => {
    const state = createInitialSimulationState();
    state.clients[0].contractMonthsRemaining = 1;
    const noSupport = { ...state, employees: state.employees.filter(employee => employee.role !== 'Support') };
    const staffed = advanceWith(state, () => 0.74);
    const unsupported = advanceWith(noSupport, () => 0.74);
    expect(staffed.clients.some(client => client.id === state.clients[0].id)).toBe(true);
    expect(unsupported.clients.some(client => client.id === state.clients[0].id)).toBe(false);
  });

  test('no billable staff lower satisfaction and make renewal impossible', () => {
    const state = oneClient(1, 80);
    state.employees = state.employees.filter(employee => employee.role === 'Support');
    expect(getClientServiceCoverage(state)).toBe(0);
    const next = advanceWith(state, () => 0);
    expect(next.clients).toHaveLength(0);
    expect(next.financials.grossRevenue).toBe(0);
    expect(next.alerts.some(alert => alert.message.includes('Client service coverage is 0%'))).toBe(true);

    const active = { ...state, clients: [{ ...state.clients[0], contractMonthsRemaining: 2 }] };
    const serviceMonth = advanceWith(active, () => 0.5);
    expect(serviceMonth.clients[0].satisfaction).toBe(68);
  });

  test('the same renewal roll fails with one overloaded billable employee', () => {
    const state = createInitialSimulationState();
    state.clients[0].contractMonthsRemaining = 1;
    const staffed = advanceWith(state, () => 0.3);
    const overloaded = advanceWith({ ...state, employees: [state.employees[0]] }, () => 0.3);
    expect(staffed.clients.some(client => client.id === state.clients[0].id)).toBe(true);
    expect(overloaded.clients.some(client => client.id === state.clients[0].id)).toBe(false);
    expect(overloaded.alerts.some(alert => alert.message.includes('Client service coverage'))).toBe(true);
    expect(overloaded.clients[0].satisfaction).toBeLessThan(staffed.clients[1].satisfaction);
  });

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
