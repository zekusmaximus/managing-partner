import { describe, expect, test } from 'bun:test';
import { getSalaryIncreaseQuote, increaseEmployeeSalary } from './salary';
import { advanceSimulationMonth } from './engine';
import { createInitialSimulationState } from './initialState';
import { getEmployeeTotalCost } from '../../types/simulation';

describe('salary commitments', () => {
  test('rejects cuts, invalid amounts, and missing employees; an equal amount is an identity no-op', () => {
    const state = createInitialSimulationState();
    const employee = state.employees[0];
    for (const salary of [1, employee.salary - 1, -1, NaN, Infinity, -Infinity, Number.MAX_VALUE]) {
      expect(getSalaryIncreaseQuote(state, employee.id, salary).valid).toBe(false);
      expect(increaseEmployeeSalary(state, employee.id, salary)).toBe(state);
    }
    expect(increaseEmployeeSalary(state, 'missing', employee.salary + 1000)).toBe(state);
    expect(getSalaryIncreaseQuote(state, employee.id, employee.salary)).toMatchObject({ valid: true, isNoOp: true });
    expect(increaseEmployeeSalary(state, employee.id, employee.salary)).toBe(state);
  });

  test('validates a stale dialog against the current salary and current roster', () => {
    const initial = createInitialSimulationState();
    const employee = initial.employees[0];
    const staleProposal = employee.salary + 100;
    const current = increaseEmployeeSalary(initial, employee.id, employee.salary + 1000);
    expect(getSalaryIncreaseQuote(current, employee.id, staleProposal).disabledReason).toContain('current salary');
    expect(increaseEmployeeSalary(current, employee.id, staleProposal)).toBe(current);
    const dismissed = { ...current, employees: current.employees.slice(1) };
    expect(increaseEmployeeSalary(dismissed, employee.id, staleProposal)).toBe(dismissed);
  });

  test('quotes loaded recurring payroll and posts it only at the next advance, including year rollover', () => {
    const initial = createInitialSimulationState();
    const state = { ...initial, month: 12 };
    const employee = state.employees[0];
    const salary = employee.salary + 1000;
    const quote = getSalaryIncreaseQuote(state, employee.id, salary);
    const expectedEmployeeCost = getEmployeeTotalCost({ ...employee, salary });
    expect(quote).toMatchObject({ valid: true, isNoOp: false, employeeLoadedCost: expectedEmployeeCost, effectiveMonth: 1, effectiveYear: 2027 });
    const increased = increaseEmployeeSalary(state, employee.id, salary);
    expect(increased.financials).toBe(state.financials);
    expect(increased.financialHistory).toBe(state.financialHistory);
    expect(quote.loadedPayroll).toBe(increased.employees.reduce((sum, item) => sum + getEmployeeTotalCost(item), 0));
    const deps = { random: () => 0.5, generateAlerts: () => [], generateInboxMessages: () => [] };
    const before = advanceSimulationMonth(state, deps);
    const after = advanceSimulationMonth(increased, deps);
    expect(after.financials.totalPayroll).toBe(quote.loadedPayroll);
    expect(after.financialHistory.at(-1).payroll - before.financialHistory.at(-1).payroll).toBe(quote.addedMonthlyPayroll);
    expect(after.financialHistory.at(-1).recurringCashExpensesPaid - before.financialHistory.at(-1).recurringCashExpensesPaid).toBe(quote.addedMonthlyPayroll);
  });
});
