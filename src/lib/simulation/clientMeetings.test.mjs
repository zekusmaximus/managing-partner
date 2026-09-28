import { describe, expect, test } from 'bun:test';
import { advanceSimulationMonth, getClientMeetingQuote, scheduleClientMeeting, sumReceivables } from './engine';
import { createInitialSimulationState } from './initialState';

const advance = state => advanceSimulationMonth(state, {
  random: () => 0.5,
  generateAlerts: () => [],
  generateInboxMessages: () => [],
});

describe('client meetings', () => {
  test('a routine healthy client cannot receive a free satisfaction boost', () => {
    const state = createInitialSimulationState();
    const quote = getClientMeetingQuote(state, state.clients[0].id);
    expect(quote.available).toBe(false);
    expect(quote.eligibleReasons).toEqual([]);
    expect(scheduleClientMeeting(state, state.clients[0].id)).toBe(state);
    expect(scheduleClientMeeting(state, 'departed-client')).toBe(state);
  });

  test('a renewal-risk meeting pays a one-time cost and raises satisfaction', () => {
    const state = createInitialSimulationState();
    state.clients[0].contractMonthsRemaining = 2;
    const client = state.clients[0];
    const quote = getClientMeetingQuote(state, client.id);
    expect(quote).toMatchObject({
      available: true, cost: 1000, satisfactionGain: 6,
      nextSatisfaction: 86, collectionEstimate: 0, netCashEstimate: -1000,
    });
    expect(quote.eligibleReasons).toContain('Contract ends within three months');

    const next = scheduleClientMeeting(state, client.id);
    const entry = next.financialHistory.at(-1);
    expect(next.clients[0].satisfaction).toBe(86);
    expect(next.lastClientMeeting).toEqual({ month: 1, year: 2026, clientId: client.id });
    expect(next.financials.cashOnHand).toBe(state.financials.cashOnHand - 1000);
    expect(next.financials.netProfit).toBe(state.financials.netProfit - 1000);
    expect(entry.oneTimeOperatingExpenses).toBe(1000);
    expect(entry.cashMovements).toEqual([{ kind: 'client-meeting', amount: -1000 }]);
    expect(entry.openingCash + entry.collections - entry.recurringCashExpensesPaid +
      entry.cashMovements.reduce((total, movement) => total + movement.amount, 0)).toBe(entry.cashOnHand);
    expect(next.budget.find(item => item.category === 'Misc' && item.quarter === 1)?.actualQuarterlySpend)
      .toBe(state.budget.find(item => item.category === 'Misc' && item.quarter === 1).actualQuarterlySpend + 1000);
    expect(next.alerts[0].message).toContain('TechTrade Association');
    expect(next.alerts[0].message).toContain('satisfaction +6');
    expect(next.alerts[0].message).toContain('$1,000 meeting expense');
  });

  test('overdue-client meeting collects only that account, oldest debt first', () => {
    const state = createInitialSimulationState();
    const target = state.clients[2];
    state.receivables.push({
      clientId: target.id, clientName: target.name, paymentProfile: target.paymentProfile,
      aging: { current: 2000, thirtyDay: 4000, sixtyDay: 4000, ninetyPlus: 4000 },
    });
    state.receivables.push({
      clientId: state.clients[1].id, clientName: state.clients[1].name,
      paymentProfile: state.clients[1].paymentProfile,
      aging: { current: 0, thirtyDay: 1000, sixtyDay: 0, ninetyPlus: 0 },
    });
    state.arAging = sumReceivables(state.receivables);
    const quote = getClientMeetingQuote(state, target.id);
    expect(quote).toMatchObject({
      available: true, overdueAmount: 12000, collectionEstimate: 1800, netCashEstimate: 800,
    });
    expect(quote.eligibleReasons).toContain('Client has invoices over 30 days old');

    const next = scheduleClientMeeting(state, target.id);
    expect(next.receivables.find(account => account.clientId === target.id).aging)
      .toEqual({ current: 2000, thirtyDay: 4000, sixtyDay: 4000, ninetyPlus: 2200 });
    expect(next.receivables.find(account => account.clientId === state.clients[1].id))
      .toEqual(state.receivables.find(account => account.clientId === state.clients[1].id));
    expect(next.arAging).toEqual(sumReceivables(next.receivables));
    expect(next.financials.collectionsThisMonth).toBe(state.financials.collectionsThisMonth + 1800);
    expect(next.financials.cashOnHand).toBe(state.financials.cashOnHand + 800);
    expect(next.financials.netProfit).toBe(state.financials.netProfit - 1000);
    expect(next.financialHistory.at(-1).collections).toBe(state.financialHistory.at(-1).collections + 1800);
    expect(next.financialHistory.at(-1).arWriteOff).toBe(0);
    expect(next.alerts[0].message).toContain('collected $1,800');
  });

  test('the same renewal roll can succeed after a meeting raises satisfaction', () => {
    const state = createInitialSimulationState();
    state.clients = [{ ...state.clients[0], satisfaction: 70, contractMonthsRemaining: 1 }];
    const resolveRenewal = current => advanceSimulationMonth(current, {
      random: () => 0.78,
      generateAlerts: () => [],
      generateInboxMessages: () => [],
    });
    expect(resolveRenewal(state).clients).toHaveLength(0);
    expect(resolveRenewal(scheduleClientMeeting(state, state.clients[0].id)).clients[0].contractMonthsRemaining)
      .toBe(12);
  });

  test('one firmwide monthly slot blocks repeat or alternate clients, then resets next month', () => {
    const state = createInitialSimulationState();
    state.clients[0].contractMonthsRemaining = 3;
    state.clients[1].contractMonthsRemaining = 3;
    const first = scheduleClientMeeting(state, state.clients[0].id);
    expect(scheduleClientMeeting(first, state.clients[0].id)).toBe(first);
    expect(getClientMeetingQuote(first, state.clients[1].id).disabledReason)
      .toContain('already held a client meeting this month');
    expect(scheduleClientMeeting(first, state.clients[1].id)).toBe(first);

    const february = advance(first);
    expect(getClientMeetingQuote(february, state.clients[1].id).available).toBe(true);
    const second = scheduleClientMeeting(february, state.clients[1].id);
    expect(second.lastClientMeeting).toEqual({ month: 2, year: 2026, clientId: state.clients[1].id });
  });

  test('insufficient cash and stale client IDs do not spend or consume the slot', () => {
    const state = createInitialSimulationState();
    state.clients[0].contractMonthsRemaining = 1;
    state.financials.cashOnHand = 999;
    expect(getClientMeetingQuote(state, state.clients[0].id).disabledReason)
      .toContain('needs $1,000 cash');
    expect(scheduleClientMeeting(state, state.clients[0].id)).toBe(state);
    expect(getClientMeetingQuote(state, 'missing').nextSatisfaction).toBeNull();
  });
});
