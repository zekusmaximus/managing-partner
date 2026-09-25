import { describe, expect, test } from 'bun:test';
import { createInitialSimulationState } from './initialState';
import { advanceSimulationMonth, applyInboxChoice, isValidAmount, reallocateBudget, writeOffReceivables } from './engine';
import { calculateProfitAndLoss } from './metrics';

const deps = { random: () => 0.6, generateAlerts: () => [], generateInboxMessages: () => [] };
const advance = (state) => advanceSimulationMonth(state, deps);

describe('month advancement and finance', () => {
  test('January starts with one month of recorded actual spend', () => {
    const state = createInitialSimulationState();
    expect(state.budget.find(item => item.category === 'Payroll')?.actualQuarterlySpend).toBe(state.financials.totalPayroll);
    expect(state.budget.find(item => item.category === 'Rent')?.actualQuarterlySpend).toBe(state.operatingCosts.rent);
  });

  test('new quarter records its opening month and carries planned amounts', () => {
    let state = createInitialSimulationState();
    state = advance(advance(advance(state)));
    expect(state.month).toBe(4);
    const q1Payroll = state.budget.find(item => item.category === 'Payroll' && item.quarter === 1);
    const q2Payroll = state.budget.find(item => item.category === 'Payroll' && item.quarter === 2);
    expect(q2Payroll?.plannedQuarterly).toBe(q1Payroll?.plannedQuarterly);
    expect(q2Payroll?.actualQuarterlySpend).toBe(state.financials.totalPayroll);
  });

  test('January rollover records spend in the new year', () => {
    let state = createInitialSimulationState();
    for (let index = 0; index < 12; index += 1) state = advance(state);
    expect([state.month, state.year]).toEqual([1, 2027]);
    expect(state.budget.find(item => item.quarter === 1 && item.year === 2027 && item.category === 'Payroll')?.actualQuarterlySpend).toBe(state.financials.totalPayroll);
  });

  test('automatic bad debt is an expense without a cash outflow', () => {
    const state = createInitialSimulationState();
    state.arAging.ninetyPlus = 1000;
    const next = advance(state);
    const entry = next.financialHistory.at(-1);
    expect(entry.arWriteOff).toBeGreaterThan(0);
    expect(entry.expenses).toBe(entry.payroll + entry.operatingCosts + entry.vendorCosts + entry.partnerDraw + entry.locInterest + entry.arWriteOff);
    expect(next.financials.cashOnHand).toBe(state.financials.cashOnHand + entry.collections - (entry.expenses - entry.arWriteOff));
    expect(next.financials.netProfit).toBe(entry.revenue - entry.expenses);
  });

  test('manual write-off changes profit and AR, not cash', () => {
    const state = createInitialSimulationState();
    state.arAging.ninetyPlus = 100;
    const next = writeOffReceivables(state, 40);
    expect(next.arAging.ninetyPlus).toBe(60);
    expect(next.financials.cashOnHand).toBe(state.financials.cashOnHand);
    expect(next.financialHistory.at(-1)?.arWriteOff).toBe(40);
    expect(next.financialHistory.at(-1)?.profit).toBe(state.financialHistory.at(-1).profit - 40);
    expect(calculateProfitAndLoss(next.financialHistory.slice(-1)).netIncome).toBe(next.financials.netProfit);
  });

  test('operating margin and historical categories follow booked entries', () => {
    const state = createInitialSimulationState();
    const second = { ...state.financialHistory[0], month: 2, operatingCostBreakdown: { ...state.operatingCosts, rent: 9000 }, operatingCosts: 17000, expenses: state.financialHistory[0].expenses - 3000, profit: state.financialHistory[0].profit + 3000 };
    const ytd = calculateProfitAndLoss([state.financialHistory[0], second]);
    expect(ytd.operatingCosts.rent).toBe(21000);
    expect(ytd.operatingMarginPercent).toBeCloseTo(ytd.operatingIncome / ytd.revenue * 100);
    expect(ytd.netIncome).toBe(state.financialHistory[0].profit + second.profit);
  });
});

describe('inbox decisions and amount guards', () => {
  const addMessage = (state, message) => ({ ...state, inbox: [message] });

  test('raise decision affects only the named employee and cannot run twice', () => {
    const state = createInitialSimulationState();
    const message = {
      id: 'raise', type: 'request', title: 'Raise Request', description: 'Employee request', urgency: 'medium',
      requiresAction: true, read: false, choices: [{ id: 'approve', label: 'Approve', effect: 'Increase salary' }],
      timestamp: new Date(), scenario: { kind: 'raise-request', employeeId: state.employees[1].id },
    };
    const first = applyInboxChoice(addMessage(state, message), 'raise', 'approve', { random: () => 0, generateId: () => 'new' });
    expect(first.employees[0].salary).toBe(state.employees[0].salary);
    expect(first.employees[1].salary).toBe(Math.round(state.employees[1].salary * 1.15));
    expect(applyInboxChoice(first, 'raise', 'approve', { random: () => 0, generateId: () => 'new' })).toBe(first);
  });

  test('removed scenario subject closes without changing another employee', () => {
    const state = createInitialSimulationState();
    const message = {
      id: 'raise', type: 'request', title: 'Raise Request', description: 'Employee request', urgency: 'medium',
      requiresAction: true, read: false, choices: [{ id: 'approve', label: 'Approve', effect: 'Increase salary' }],
      timestamp: new Date(), scenario: { kind: 'raise-request', employeeId: 'former-employee' },
    };
    const result = applyInboxChoice(addMessage(state, message), 'raise', 'approve', { random: () => 0, generateId: () => 'new' });
    expect(result.employees).toBe(state.employees);
    expect(result.inbox[0].requiresAction).toBe(false);
    expect(result.inbox[0].description).toContain('no longer available');
  });

  test('client feedback targets its subject and opportunity preserves client type', () => {
    const state = createInitialSimulationState();
    const feedback = {
      id: 'feedback', type: 'alert', title: 'Client Feedback', description: 'Complaint', urgency: 'high',
      requiresAction: true, read: false, choices: [{ id: 'address', label: 'Address', effect: 'Improve' }],
      timestamp: new Date(), scenario: { kind: 'client-feedback', clientId: state.clients[1].id },
    };
    const addressed = applyInboxChoice(addMessage(state, feedback), 'feedback', 'address', { random: () => 0, generateId: () => 'new' });
    expect(addressed.clients[0].satisfaction).toBe(state.clients[0].satisfaction);
    expect(addressed.clients[1].satisfaction).toBe(Math.min(100, state.clients[1].satisfaction + 15));
    const opportunity = { ...feedback, id: 'opportunity', choices: [{ id: 'pursue', label: 'Pursue', effect: 'Win' }], scenario: { kind: 'new-client', name: 'New Nonprofit', clientType: 'Non-Profit', monthlyFee: 12000 } };
    const won = applyInboxChoice(addMessage(addressed, opportunity), 'opportunity', 'pursue', { random: () => 0.9, generateId: () => 'won' });
    expect(won.clients.at(-1)).toMatchObject({ name: 'New Nonprofit', type: 'Non-Profit', monthlyFee: 12000 });
  });

  test('reallocation transfers budget without changing its total', () => {
    const items = [
      { category: 'Payroll', plannedQuarterly: 300, actualQuarterlySpend: 400, quarter: 1, year: 2026 },
      { category: 'Rent', plannedQuarterly: 200, actualQuarterlySpend: 50, quarter: 1, year: 2026 },
    ];
    const changed = reallocateBudget(items, 'Payroll', 1, 2026);
    expect(changed[0].plannedQuarterly).toBe(400);
    expect(changed[1].plannedQuarterly).toBe(100);
    expect(changed.reduce((sum, item) => sum + item.plannedQuarterly, 0)).toBe(500);
  });

  test('nonfinite, negative, and zero invalid amounts cannot write off AR', () => {
    const state = createInitialSimulationState();
    state.arAging.ninetyPlus = 100;
    for (const amount of [NaN, Infinity, -1, 0]) {
      expect(isValidAmount(amount)).toBe(false);
      expect(writeOffReceivables(state, amount)).toBe(state);
    }
  });
});
