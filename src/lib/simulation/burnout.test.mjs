import { describe, expect, test } from 'bun:test';
import { createInitialSimulationState } from './initialState';
import { fundStaffRecovery, getStaffRecoveryQuote } from './burnout';
import { calculateProfitAndLoss } from './metrics';
import { advanceSimulationMonth } from './engine';
import { createFreshSession, parseSession, serializeSession } from '../session/save';

const deps = { random: () => 0.5, generateAlerts: () => [], generateInboxMessages: () => [] };

describe('staff recovery investment', () => {
  test('quotes eligible staff and books the exact cash, P&L, and budget cost', () => {
    const initial = createInitialSimulationState();
    const quote = getStaffRecoveryQuote(initial);
    expect(quote).toMatchObject({
      participantIds: ['emp4', 'emp1'], cost: 3000,
      totalBurnoutReduction: 45, totalEfficacyGain: 9,
      alreadyFunded: false, canFund: true,
    });

    const funded = fundStaffRecovery(initial);
    const entry = funded.financialHistory.at(-1);
    expect(funded.employees.find(employee => employee.id === 'emp4')).toMatchObject({ burnout: 0, efficacy: 87 });
    expect(funded.employees.find(employee => employee.id === 'emp1')).toMatchObject({ burnout: 0, efficacy: 89 });
    expect(funded.employees.find(employee => employee.id === 'emp2')).toEqual(initial.employees.find(employee => employee.id === 'emp2'));
    expect(funded.financials.cashOnHand).toBe(initial.financials.cashOnHand - 3000);
    expect(funded.financials.operatingExpenses).toBe(initial.financials.operatingExpenses + 3000);
    expect(funded.financials.netProfit).toBe(initial.financials.netProfit - 3000);
    expect(entry.cashMovements).toEqual([{ kind: 'staff-recovery', amount: -3000 }]);
    expect(entry.oneTimeOperatingExpenses).toBe(3000);
    expect(entry.expenses).toBe(initial.financialHistory[0].expenses + 3000);
    expect(entry.profit).toBe(initial.financialHistory[0].profit - 3000);
    expect(entry.openingCash + entry.collections - entry.recurringCashExpensesPaid +
      entry.cashMovements.reduce((sum, movement) => sum + movement.amount, 0)).toBe(entry.cashOnHand);
    expect(funded.budget.find(item => item.category === 'Payroll').actualQuarterlySpend)
      .toBe(initial.budget.find(item => item.category === 'Payroll').actualQuarterlySpend + 3000);
    expect(calculateProfitAndLoss([entry])).toMatchObject({
      staffRecoveryExpenses: 3000, oneTimeOperatingExpenses: 3000, netIncome: entry.profit,
    });
    expect(getStaffRecoveryQuote(funded).alreadyFunded).toBe(true);
    expect(fundStaffRecovery(funded)).toBe(funded);
  });

  test('requires material burnout and cash; never spends for a no-op', () => {
    const initial = createInitialSimulationState();
    const rested = { ...initial, employees: initial.employees.map(employee => ({ ...employee, burnout: 19 })) };
    expect(getStaffRecoveryQuote(rested)).toMatchObject({ cost: 0, canFund: false });
    expect(fundStaffRecovery(rested)).toBe(rested);

    const shortCash = { ...initial, financials: { ...initial.financials, cashOnHand: 2999 } };
    expect(getStaffRecoveryQuote(shortCash).canFund).toBe(false);
    expect(fundStaffRecovery(shortCash)).toBe(shortCash);
  });

  test('offers one targeted place with $500 cash when the full program is unaffordable', () => {
    const initial = createInitialSimulationState();
    const state = { ...initial, financials: { ...initial.financials, cashOnHand: 750 },
      financialHistory: [{ ...initial.financialHistory[0], openingCash: 750, cashOnHand: 750 }] };
    expect(getStaffRecoveryQuote(state).canFund).toBe(false);
    expect(getStaffRecoveryQuote(state, 'targeted')).toMatchObject({
      participantIds: ['emp4'], cost: 500, totalBurnoutReduction: 15,
      totalEfficacyGain: 3, canFund: true,
    });

    const funded = fundStaffRecovery(state, 'targeted');
    const entry = funded.financialHistory.at(-1);
    expect(funded.employees.find(employee => employee.id === 'emp4')).toMatchObject({ burnout: 10, efficacy: 85 });
    expect(funded.employees.find(employee => employee.id === 'emp1')).toEqual(state.employees.find(employee => employee.id === 'emp1'));
    expect(funded.financials.cashOnHand).toBe(250);
    expect(funded.financials.operatingExpenses).toBe(state.financials.operatingExpenses + 500);
    expect(funded.financials.netProfit).toBe(state.financials.netProfit - 500);
    expect(entry.cashMovements).toEqual([{ kind: 'staff-recovery', amount: -500 }]);
    expect(entry.oneTimeOperatingExpenses).toBe(500);
    expect(entry.expenses).toBe(state.financialHistory[0].expenses + 500);
    expect(entry.profit).toBe(state.financialHistory[0].profit - 500);
    expect(entry.openingCash + entry.collections - entry.recurringCashExpensesPaid +
      entry.cashMovements.reduce((sum, movement) => sum + movement.amount, 0)).toBe(entry.cashOnHand);
    expect(funded.budget.find(item => item.category === 'Payroll').actualQuarterlySpend)
      .toBe(state.budget.find(item => item.category === 'Payroll').actualQuarterlySpend + 500);
    expect(calculateProfitAndLoss([entry])).toMatchObject({
      staffRecoveryExpenses: 500, oneTimeOperatingExpenses: 500, netIncome: entry.profit,
    });
    expect(getStaffRecoveryQuote(funded, 'targeted').alreadyFunded).toBe(true);
    expect(fundStaffRecovery(funded)).toBe(funded);
  });

  test('scales targeted coverage from one to two people and respects the cash floor', () => {
    const initial = createInitialSimulationState();
    const withCash = cash => ({ ...initial, financials: { ...initial.financials, cashOnHand: cash } });
    const belowMinimum = withCash(499);
    expect(getStaffRecoveryQuote(belowMinimum, 'targeted')).toMatchObject({
      participantIds: ['emp4'], cost: 500, canFund: false,
    });
    expect(fundStaffRecovery(belowMinimum, 'targeted')).toBe(belowMinimum);
    expect(getStaffRecoveryQuote(withCash(999), 'targeted')).toMatchObject({
      participantIds: ['emp4'], cost: 500, canFund: true,
    });
    expect(getStaffRecoveryQuote(withCash(1000), 'targeted')).toMatchObject({
      participantIds: ['emp4', 'emp1'], cost: 1000,
      totalBurnoutReduction: 30, totalEfficacyGain: 6, canFund: true,
    });
    const funded = fundStaffRecovery(initial, 'targeted');
    expect(funded.employees.find(employee => employee.id === 'emp4')).toMatchObject({ burnout: 10, efficacy: 85 });
    expect(funded.employees.find(employee => employee.id === 'emp1')).toMatchObject({ burnout: 5, efficacy: 88 });
    expect(funded.financials.cashOnHand).toBe(initial.financials.cashOnHand - 1000);
    expect(fundStaffRecovery(funded, 'targeted')).toBe(funded);
  });

  test('caps participant count, cost, burnout, and efficacy', () => {
    const initial = createInitialSimulationState();
    const employees = Array.from({ length: 20 }, (_, index) => ({
      ...initial.employees[0], id: `staff-${index}`, burnout: 100, efficacy: 99,
    }));
    const state = { ...initial, employees };
    expect(getStaffRecoveryQuote(state)).toMatchObject({
      cost: 18000, totalBurnoutReduction: 300, totalEfficacyGain: 12,
    });
    const funded = fundStaffRecovery(state);
    expect(funded.employees.filter(employee => employee.burnout === 75 && employee.efficacy === 100)).toHaveLength(12);
    expect(funded.employees.filter(employee => employee.burnout === 100 && employee.efficacy === 99)).toHaveLength(8);
    expect(funded.financials.cashOnHand).toBe(initial.financials.cashOnHand - 18000);
    expect(fundStaffRecovery(funded)).toBe(funded);

    expect(getStaffRecoveryQuote(state, 'targeted')).toMatchObject({
      participantIds: ['staff-0', 'staff-1'], cost: 1000,
      totalBurnoutReduction: 30, totalEfficacyGain: 2,
    });
    const targeted = fundStaffRecovery(state, 'targeted');
    expect(targeted.employees.filter(employee => employee.burnout === 85 && employee.efficacy === 100)).toHaveLength(2);
    expect(targeted.employees.filter(employee => employee.burnout === 100 && employee.efficacy === 99)).toHaveLength(18);
  });

  test('cooldown resets at the next month and survives a version 4 save reload', () => {
    const snapshot = createFreshSession();
    const highBurnout = {
      ...snapshot.simulation,
      employees: snapshot.simulation.employees.map(employee => ({ ...employee, burnout: 80 })),
    };
    const funded = fundStaffRecovery(highBurnout);
    const loaded = parseSession(serializeSession({ ...snapshot, simulation: funded }));
    expect(loaded).not.toBeNull();
    expect(getStaffRecoveryQuote(loaded.simulation).alreadyFunded).toBe(true);
    expect(fundStaffRecovery(loaded.simulation)).toBe(loaded.simulation);
    const nextMonth = advanceSimulationMonth(loaded.simulation, deps);
    expect(getStaffRecoveryQuote(nextMonth).canFund).toBe(true);
    expect(fundStaffRecovery(nextMonth).financialHistory.at(-1).cashMovements)
      .toContainEqual({ kind: 'staff-recovery', amount: -7500 });
  });

  test('targeted recovery reloads with the shared monthly cooldown', () => {
    const snapshot = createFreshSession();
    const highBurnout = {
      ...snapshot.simulation,
      employees: snapshot.simulation.employees.map(employee => ({ ...employee, burnout: 80 })),
    };
    const targeted = fundStaffRecovery(highBurnout, 'targeted');
    const loaded = parseSession(serializeSession({ ...snapshot, simulation: targeted }));
    expect(loaded).not.toBeNull();
    expect(getStaffRecoveryQuote(loaded.simulation).alreadyFunded).toBe(true);
    expect(getStaffRecoveryQuote(loaded.simulation, 'targeted').alreadyFunded).toBe(true);
    expect(fundStaffRecovery(loaded.simulation)).toBe(loaded.simulation);
    const nextMonth = advanceSimulationMonth(loaded.simulation, deps);
    expect(getStaffRecoveryQuote(nextMonth, 'targeted').canFund).toBe(true);
  });
});
