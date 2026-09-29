import { describe, expect, test } from 'bun:test';
import { advanceSimulationMonth } from './engine';
import { getClientServiceCoverage, getWorkloadBurnoutChange, getWorkloadBurnoutTrend } from './clientService';
import { createInitialSimulationState } from './initialState';
import { fundStaffRecovery } from './burnout';

const deps = { random: () => 0.5, generateAlerts: () => [], generateInboxMessages: () => [] };

describe('workload drives monthly burnout', () => {
  test('fictional coverage bands include their exact lower boundaries', () => {
    for (const [coverage, change] of [[0, 6], [0.89999, 6], [0.9, 3], [0.99999, 3], [1, 0], [1.14999, 0], [1.15, -3], [2, -3]]) {
      expect(getWorkloadBurnoutChange(coverage, 8)).toBe(change);
    }
    expect(getWorkloadBurnoutChange(1, 0)).toBe(-3);
  });

  test('the same roster faces greater pressure when its book grows; adding capacity cannot worsen pressure', () => {
    const state = createInitialSimulationState();
    const overloaded = { ...state, clients: [...state.clients, ...state.clients.map(client => ({ ...client, id: `${client.id}-extra` }))] };
    const adequate = advanceSimulationMonth(state, deps);
    const busy = advanceSimulationMonth(overloaded, deps);
    expect(getWorkloadBurnoutTrend(state).burnoutChange).toBe(0);
    expect(getWorkloadBurnoutTrend(overloaded).burnoutChange).toBe(6);
    expect(busy.employees.map(employee => employee.burnout)).toEqual(state.employees.map(employee => employee.burnout + 6));
    expect(adequate.employees).toEqual(state.employees);
    const hired = { ...overloaded, employees: [...state.employees, { ...state.employees[0], id: 'hire' }] };
    expect(getWorkloadBurnoutTrend(hired).burnoutChange).toBeLessThanOrEqual(getWorkloadBurnoutTrend(overloaded).burnoutChange);
    expect(busy.employees.map(employee => employee.efficacy)).toEqual(state.employees.map(employee => employee.efficacy));
  });

  test('one pre-update snapshot supplies every employee; service uses the resulting roster', () => {
    const initial = createInitialSimulationState();
    const state = { ...initial, employees: initial.employees.map(employee => ({ ...employee, burnout: 64 })) };
    const snapshot = getWorkloadBurnoutTrend(state);
    expect(snapshot.coverage).toBeGreaterThanOrEqual(0.9);
    expect(snapshot.coverage).toBeLessThan(1);
    expect(snapshot.burnoutChange).toBe(3);
    const next = advanceSimulationMonth(state, deps);
    expect(next.employees.every(employee => employee.burnout === 67)).toBe(true);
    const resultingCoverage = getClientServiceCoverage({ ...state, employees: next.employees });
    expect(resultingCoverage).toBeLessThan(0.9);
    const adjustment = Math.round((Math.min(1.25, resultingCoverage) - 1) * 12);
    expect(next.clients[0].satisfaction).toBe(state.clients[0].satisfaction + adjustment);
  });

  test('burnout clamps and zero clients, employees, or service capacity remain finite', () => {
    const state = createInitialSimulationState();
    const idle = { ...state, clients: [], employees: state.employees.map(employee => ({ ...employee, burnout: 2 })) };
    expect(getWorkloadBurnoutTrend(idle)).toMatchObject({ coverage: 1, burnoutChange: -3 });
    expect(advanceSimulationMonth(idle, deps).employees.every(employee => employee.burnout === 0)).toBe(true);
    for (const employees of [[], state.employees.map(employee => ({ ...employee, efficacy: 0, clientAffinity: 0, burnout: 99 }))]) {
      const emptyCapacity = { ...state, employees };
      expect(getWorkloadBurnoutTrend(emptyCapacity)).toMatchObject({ coverage: 0, burnoutChange: 6 });
      const next = advanceSimulationMonth(emptyCapacity, deps);
      expect(Number.isFinite(next.financials.netProfit)).toBe(true);
      expect(next.employees.every(employee => employee.burnout === 100)).toBe(true);
    }
    expect(getWorkloadBurnoutTrend({ ...state, employees: [], clients: [] })).toMatchObject({ coverage: 1, burnoutChange: -3 });
  });

  test('24 months never erodes or increases efficacy without an explicit staff scenario', () => {
    const initial = createInitialSimulationState();
    let state = initial;
    for (let month = 0; month < 24; month++) {
      state = advanceSimulationMonth(state, deps);
      expect(state.employees.map(employee => employee.efficacy)).toEqual(initial.employees.map(employee => employee.efficacy));
    }
  });

  test('recovery improves fatigue and effective service but continuing overload returns pressure', () => {
    const initial = createInitialSimulationState();
    const state = { ...initial, employees: [{ ...initial.employees[0], burnout: 90 }] };
    const recovered = fundStaffRecovery(state);
    expect(getClientServiceCoverage(recovered)).toBeGreaterThan(getClientServiceCoverage(state));
    expect(recovered.employees[0].efficacy).toBe(state.employees[0].efficacy);
    expect(getWorkloadBurnoutTrend(recovered).burnoutChange).toBe(6);
    const next = advanceSimulationMonth(recovered, deps);
    expect(next.employees[0].burnout).toBe(recovered.employees[0].burnout + 6);
    expect(next.employees[0].efficacy).toBe(state.employees[0].efficacy);
  });

  test('staff update draws no random burnout roll', () => {
    const initial = createInitialSimulationState();
    let calls = 0;
    advanceSimulationMonth({ ...initial, clients: [] }, { ...deps, random: () => { calls++; return 0.5; } });
    let withoutStaffCalls = 0;
    advanceSimulationMonth({ ...initial, employees: [], clients: [] }, { ...deps, random: () => { withoutStaffCalls++; return 0.5; } });
    expect(calls).toBe(withoutStaffCalls);
  });
});
