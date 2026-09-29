import { describe, expect, test } from 'bun:test';
import { fundStaffRecovery, getStaffRecoveryQuote } from './burnout';
import { runBalanceSimulation, createSeededRandom, getBalancePolicyChoice } from './balanceHarness';
import { advanceSimulationMonth, applyInboxChoice, sumReceivables } from './engine';
import { createInitialSimulationState } from './initialState';
import { generateInboxMessages } from './scenarios';

const seeds = [7, 23, 41, 89, 127];
const run = (seed, months, policy) => runBalanceSimulation({
  seed, months, policy, fundRecovery: fundStaffRecovery,
  getRecoveryQuote: getStaffRecoveryQuote,
});

describe('seeded balance simulation', () => {
  const complaint = (id, clientId) => ({
    id, type: 'alert', title: 'Complaint', description: 'Review this complaint', urgency: 'high',
    requiresAction: true, read: false, choices: [], timestamp: new Date('2026-01-01'),
    scenario: { kind: 'client-feedback', clientId },
  });

  test('stewardship resolves a second complaint through delegation after spending shared attention', () => {
    const initial = createInitialSimulationState();
    const first = complaint('first', initial.clients[0].id);
    const second = complaint('second', initial.clients[1].id);
    let state = { ...initial, inbox: [first, second] };
    const deps = { random: () => 0.5, generateId: () => 'test' };
    expect(getBalancePolicyChoice(state, first, 'stewardship')).toBe('address');
    state = applyInboxChoice(state, first.id, getBalancePolicyChoice(state, first, 'stewardship'), deps);
    expect(getBalancePolicyChoice(state, second, 'stewardship')).toBe('assign');
    state = applyInboxChoice(state, second.id, getBalancePolicyChoice(state, second, 'stewardship'), deps);
    expect(state.inbox.every(message => !message.requiresAction)).toBe(true);
    expect(state.clients[0].satisfaction).toBe(initial.clients[0].satisfaction + 6);
    expect(state.clients[1].satisfaction).toBe(initial.clients[1].satisfaction + 3);
  });

  test('unaffordable personal handling delegates, or explicitly defers without billable staff', () => {
    const initial = createInitialSimulationState();
    const message = complaint('complaint', initial.clients[0].id);
    const state = { ...initial, inbox: [message], financials: { ...initial.financials, cashOnHand: 0 } };
    expect(getBalancePolicyChoice(state, message, 'stewardship')).toBe('assign');
    const noStaff = { ...state, employees: [] };
    expect(getBalancePolicyChoice(noStaff, message, 'stewardship')).toBe('ignore');
    const next = applyInboxChoice(noStaff, message.id, getBalancePolicyChoice(noStaff, message, 'stewardship'), { random: () => 0.5, generateId: () => 'test' });
    expect(next.inbox[0].requiresAction).toBe(false);
    expect(next.clients[0].satisfaction).toBe(state.clients[0].satisfaction - 10);
  });

  test('collections use a demand letter when a recovery meeting spent the intervention', () => {
    const initial = createInitialSimulationState();
    const message = complaint('complaint', initial.clients[0].id);
    const collections = { ...message, id: 'collections', scenario: {
      kind: 'collections-problem', clientId: initial.clients[1].id, overdueAmount: 1000,
    } };
    const receivables = [{ clientId: initial.clients[1].id, clientName: initial.clients[1].name,
      paymentProfile: 'normal', aging: { current: 0, thirtyDay: 0, sixtyDay: 1000, ninetyPlus: 0 } }];
    let state = { ...initial, receivables, arAging: sumReceivables(receivables), inbox: [message, collections] };
    const deps = { random: () => 0.5, generateId: () => 'test' };
    state = applyInboxChoice(state, message.id, 'address', deps);
    expect(getBalancePolicyChoice(state, collections, 'stewardship')).toBe('demand-letter');
    const next = applyInboxChoice(state, collections.id, getBalancePolicyChoice(state, collections, 'stewardship'), deps);
    expect(next.inbox.every(item => !item.requiresAction)).toBe(true);
    expect(next.financials.cashOnHand - state.financials.cashOnHand).toBe(600);
  });

  test('is repeatable over 12 and 24 months but differs by seed', () => {
    const short = run(7, 12, 'stewardship');
    const long = run(7, 24, 'stewardship');
    expect(short).toEqual(run(7, 12, 'stewardship'));
    expect(long).toEqual(run(7, 24, 'stewardship'));
    expect(short.monthly).toHaveLength(12);
    expect(long.monthly).toHaveLength(24);
    expect(long.monthly).not.toEqual(run(23, 24, 'stewardship').monthly);
    expect(() => run(7, 11, 'stewardship')).toThrow();
    expect(() => run(7, 25, 'stewardship')).toThrow();
  });

  test('keeps staff, reputation, and credit bounded in long runs', () => {
    for (const policy of ['stewardship', 'cash-guard', 'cash-pressure']) {
      for (const seed of seeds) {
        const result = run(seed, 24, policy);
        for (const month of result.monthly) {
          expect(Number.isFinite(month.cash)).toBe(true);
          expect(Number.isFinite(month.profit)).toBe(true);
          expect(month.clients).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(month.serviceCapacity)).toBe(true);
          expect(month.serviceCapacity).toBeGreaterThanOrEqual(0);
          expect(month.meanBurnout).toBeGreaterThanOrEqual(0);
          expect(month.meanBurnout).toBeLessThanOrEqual(100);
          expect(month.meanEfficacy).toBeGreaterThanOrEqual(0);
          expect(month.meanEfficacy).toBeLessThanOrEqual(100);
          expect(month.reputation).toBeGreaterThanOrEqual(0);
          expect(month.reputation).toBeLessThanOrEqual(100);
          expect(month.creditDrawn).toBeGreaterThanOrEqual(0);
          expect(month.creditDrawn).toBeLessThanOrEqual(100000);
          expect(month.creditDrawnThisMonth).toBeGreaterThanOrEqual(0);
          expect(month.pendingBeforeDecisions).toBeGreaterThanOrEqual(month.pendingAfterDecisions);
          if (month.recoveryPlan === 'targeted') {
            expect(month.recoverySpend).toBeGreaterThanOrEqual(500);
            expect(month.recoverySpend).toBeLessThanOrEqual(1000);
          }
          if (policy === 'cash-pressure' && month.recoveryPlan) {
            expect(month.creditDrawn).toBe(0);
            expect(month.cash).toBeGreaterThanOrEqual(month.recurringCashPaid *
              (month.recoveryPlan === 'full' ? 3 : 1));
          }
        }
        expect(result.creditDrawnTotal).toBe(result.monthly.reduce((sum, month) =>
          sum + month.creditDrawnThisMonth, 0));
        expect(result.creditDrawnTotal).toBeGreaterThanOrEqual(result.peakCreditDrawn);
      }
    }
    expect(run(7, 24, 'stewardship').recoverySpend).toBeGreaterThan(0);
    expect(run(7, 24, 'cash-guard').recoverySpend).toBe(0);
    const pressure = run(23, 24, 'cash-pressure');
    expect(pressure.targetedRecoveryActions).toBeGreaterThan(0);
    expect(pressure.fullRecoveryActions + pressure.targetedRecoveryActions)
      .toBe(pressure.monthly.filter(month => month.recoverySpend > 0).length);
    expect(() => runBalanceSimulation({ seed: 23, months: 24, policy: 'cash-pressure' }))
      .toThrow('requires recovery action and quote functions');
  });

  test('individual staff, live contracts, AR, and cash reconcile through long runs', () => {
    for (const seed of seeds) {
      const random = createSeededRandom(seed);
      let state = createInitialSimulationState();
      for (let step = 0; step < 24; step++) {
        state = advanceSimulationMonth(state, {
          random,
          generateAlerts: () => [],
          generateInboxMessages: () => [],
        });
        if (state.employees.reduce((sum, employee) => sum + employee.burnout, 0) / state.employees.length >= 35) {
          state = fundStaffRecovery(state);
        }
        for (const employee of state.employees) {
          expect(employee.burnout).toBeGreaterThanOrEqual(0);
          expect(employee.burnout).toBeLessThanOrEqual(100);
          expect(employee.efficacy).toBeGreaterThanOrEqual(0);
          expect(employee.efficacy).toBeLessThanOrEqual(100);
        }
        expect(state.clients.every(client => client.contractMonthsRemaining > 0)).toBe(true);
        expect(state.arAging).toEqual(sumReceivables(state.receivables));
        expect(Number.isFinite(state.financials.cashOnHand)).toBe(true);
        expect(Number.isFinite(state.financials.netProfit)).toBe(true);
        expect(state.lineOfCredit.drawn).toBeGreaterThanOrEqual(0);
        expect(state.lineOfCredit.drawn).toBeLessThanOrEqual(state.lineOfCredit.limit);
        const entry = state.financialHistory.at(-1);
        const reconciledCash = entry.openingCash + entry.collections - entry.recurringCashExpensesPaid +
          entry.cashMovements.reduce((sum, movement) => sum + movement.amount, 0);
        expect(Math.abs(reconciledCash - entry.cashOnHand)).toBeLessThan(0.01);
      }
    }
  });

  test('tuned discretionary volume remains useful without crowding the inbox', () => {
    const results = ['stewardship', 'cash-guard'].flatMap(policy =>
      seeds.map(seed => run(seed, 24, policy)));
    const monthlyDiscretionary = results.reduce((sum, result) =>
      sum + result.generatedDiscretionary, 0) / (results.length * 24);
    expect(monthlyDiscretionary).toBeGreaterThan(0.9);
    expect(monthlyDiscretionary).toBeLessThan(1.7);
    expect(results.every(result => result.generatedInformation > 0)).toBe(true);
    expect(results.filter(result => result.policy === 'cash-guard')
      .every(result => result.endingPending > 0 && result.peakPending < 20)).toBe(true);
  });

  test('unresolved decisions survive 24 months and tax prompts recur at every quarter end', () => {
    const random = createSeededRandom(41);
    let id = 0;
    let state = createInitialSimulationState();
    state.taxPosition.principalDue = 1000;
    state.inbox = [{
      id: 'permanent-pending', type: 'opportunity', title: 'Pending', description: 'Pending decision',
      urgency: 'low', requiresAction: true, read: false,
      choices: [{ id: 'pass', label: 'Pass', effect: 'No change' }],
      scenario: { kind: 'new-client', name: 'Reserved Prospect', clientType: 'Corporation', monthlyFee: 15000 },
      timestamp: new Date('2026-01-01T00:00:00.000Z'),
    }];
    const taxMonths = [];
    for (let step = 0; step < 24; step++) {
      state = advanceSimulationMonth(state, {
        random,
        generateAlerts: () => [],
        generateInboxMessages: next => {
          const messages = generateInboxMessages(next, {
            random, generateId: () => `test-${++id}`, now: () => new Date('2026-01-01T00:00:00.000Z'),
          });
          if (messages.some(message => message.scenario.kind === 'tax-planning')) {
            taxMonths.push(`${next.year}-${next.month}`);
          }
          return messages;
        },
      });
      expect(state.inbox.some(message => message.id === 'permanent-pending' && message.requiresAction)).toBe(true);
    }
    expect(taxMonths).toEqual([
      '2026-3', '2026-6', '2026-9', '2026-12',
      '2027-3', '2027-6', '2027-9', '2027-12',
    ]);
  });
});
