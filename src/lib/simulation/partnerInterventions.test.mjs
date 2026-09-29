import { describe, expect, test } from 'bun:test';
import { createInitialSimulationState } from './initialState';
import { advanceSimulationMonth, applyInboxChoice, collectOverdueReceivables, getClientMeetingQuote,
  getInboxChoiceQuote, getPartnerInterventionStatus, scheduleClientMeeting, sumReceivables } from './engine';
import { getClientServiceCoverage } from './clientService';
import { fundStaffRecovery, getStaffRecoveryQuote } from './burnout';
import { getComplaintChoices, getCollectionsChoices, getCurrentInboxChoices } from './inboxChoices';

const deps = { random: () => 0.5, generateId: () => 'new' };
const advance = state => advanceSimulationMonth(state, { ...deps, generateAlerts: () => [], generateInboxMessages: () => [] });
const complaint = (clientId, id = 'complaint') => ({
  id, type: 'alert', title: 'Client Feedback', description: 'Slow responses', urgency: 'high',
  requiresAction: true, read: false, timestamp: new Date('2026-01-01T00:00:00Z'),
  choices: getComplaintChoices(), scenario: { kind: 'client-feedback', clientId },
});
const collection = (clientId, id = 'collection') => ({
  ...complaint(clientId, id), title: 'Collections problem', choices: getCollectionsChoices(),
  scenario: { kind: 'collections-problem', clientId, overdueAmount: 10000 },
});
const fixture = () => {
  const state = createInitialSimulationState();
  state.clients[0].satisfaction = 72;
  state.inbox = [complaint(state.clients[0].id), collection(state.clients[1].id)];
  state.receivables.push({ clientId: state.clients[1].id, clientName: state.clients[1].name,
    paymentProfile: 'normal', aging: { current: 0, thirtyDay: 0, sixtyDay: 10000, ninetyPlus: 0 } });
  state.arAging = sumReceivables(state.receivables);
  return state;
};

describe('one monthly partner intervention', () => {
  test('Inbox and Clients produce one canonical paid recovery transition and one award', () => {
    const state = fixture();
    const fromInbox = applyInboxChoice(state, 'complaint', 'address', deps);
    const fromClients = scheduleClientMeeting(state, state.clients[0].id);
    expect(fromInbox).toEqual(fromClients);
    expect(fromInbox.clients[0].satisfaction).toBe(78);
    expect(fromInbox.financials.cashOnHand).toBe(state.financials.cashOnHand - 1000);
    expect(fromInbox.financials.netProfit).toBe(state.financials.netProfit - 1000);
    expect(fromInbox.lastPartnerIntervention.action).toBe('complaint-recovery');
    expect(fromInbox.inbox[0].resolution).toMatchObject({ choiceId: 'address', month: 1, year: 2026 });
    expect(applyInboxChoice(fromClients, 'complaint', 'address', deps)).toBe(fromClients);
    expect(applyInboxChoice(fromClients, 'complaint', 'assign', deps)).toBe(fromClients);
    expect(scheduleClientMeeting(fromInbox, state.clients[0].id)).toBe(fromInbox);
  });

  test.each([70, 71, 72, 73, 74])('an active complaint is eligible at %i satisfaction', satisfaction => {
    const state = fixture();
    state.clients = [{ ...state.clients[0], satisfaction, contractMonthsRemaining: 12 }];
    expect(getClientMeetingQuote(state, state.clients[0].id)).toMatchObject({
      available: true, eligibleReasons: ['Client has an unresolved complaint'], satisfactionGain: 6,
    });
    expect(getInboxChoiceQuote(state, 'complaint', 'address').available).toBe(true);
  });

  test('Clients meeting blocks Inbox personal collection without resolving that request', () => {
    const state = fixture();
    const met = scheduleClientMeeting(state, state.clients[0].id);
    const quote = getInboxChoiceQuote(met, 'collection', 'personal-call');
    expect(quote.available).toBe(false);
    expect(quote.disabledReason).toContain('Recovery meeting with TechTrade Association');
    expect(quote.disabledReason).toContain('February 2026');
    expect(applyInboxChoice(met, 'collection', 'personal-call', deps)).toBe(met);
    expect(met.inbox[1].requiresAction).toBe(true);
    expect(getInboxChoiceQuote(met, 'collection', 'demand-letter').available).toBe(true);
  });

  test('personal collections retain the 40% formula and block both meeting routes without a meeting expense', () => {
    const state = fixture();
    const quote = getInboxChoiceQuote(state, 'collection', 'personal-call');
    expect(quote).toMatchObject({ available: true, cost: 0, collectionEstimate: 4000, usesPartnerIntervention: true });
    const next = applyInboxChoice(state, 'collection', 'personal-call', deps);
    expect(next.financials.cashOnHand).toBe(state.financials.cashOnHand + 4000);
    expect(next.financials.netProfit).toBe(state.financials.netProfit);
    expect(next.clients).toBe(state.clients);
    expect(next.arAging.sixtyDay).toBe(state.arAging.sixtyDay - 4000);
    expect(next.financialHistory.at(-1).collections).toBe(state.financialHistory.at(-1).collections + 4000);
    expect(next.financialHistory.at(-1).cashMovements).toEqual(state.financialHistory.at(-1).cashMovements);
    expect(next.financialHistory.at(-1).cashOnHand).toBe(next.financials.cashOnHand);
    expect(next.lastPartnerIntervention).toMatchObject({ action: 'personal-collection', month: 1, year: 2026 });
    expect(scheduleClientMeeting(next, state.clients[0].id)).toBe(next);
    expect(applyInboxChoice(next, 'complaint', 'address', deps)).toBe(next);
    expect(applyInboxChoice(next, 'collection', 'personal-call', deps)).toBe(next);
    expect(next.inbox[0].requiresAction).toBe(true);
  });

  test('two pending collection calls share one attention allowance', () => {
    const state = fixture();
    state.inbox.push(collection(state.clients[1].id, 'other-collection'));
    const first = applyInboxChoice(state, 'collection', 'personal-call', deps);
    expect(applyInboxChoice(first, 'other-collection', 'personal-call', deps)).toBe(first);
    expect(first.inbox[2].requiresAction).toBe(true);
  });

  test('manual collections and recovery keep separate monthly limits', () => {
    const state = fixture();
    const called = applyInboxChoice(state, 'collection', 'personal-call', deps);
    const manual = collectOverdueReceivables(called);
    expect(manual.financials.cashOnHand).toBeGreaterThan(called.financials.cashOnHand);
    expect(collectOverdueReceivables(manual)).toBe(manual);
    expect(manual.lastPartnerIntervention).toEqual(called.lastPartnerIntervention);
    expect(getStaffRecoveryQuote(manual).canFund).toBe(true);
    const recovered = fundStaffRecovery(manual);
    expect(recovered.lastPartnerIntervention).toEqual(called.lastPartnerIntervention);
    expect(getStaffRecoveryQuote(recovered).alreadyFunded).toBe(true);
    expect(collectOverdueReceivables(recovered)).toBe(recovered);
  });

  test('December use becomes available in January of the next year', () => {
    const state = fixture();
    state.month = 12;
    const used = scheduleClientMeeting(state, state.clients[0].id);
    expect(getPartnerInterventionStatus(used)).toMatchObject({ available: false, availableAgain: 'January 2027' });
    const january = advance(used);
    expect(january).toMatchObject({ month: 1, year: 2027 });
    expect(getPartnerInterventionStatus(january).available).toBe(true);
    january.inbox = [complaint(january.clients[0].id, 'new-complaint')];
    expect(getInboxChoiceQuote(january, 'new-complaint', 'address').available).toBe(true);
  });

  test('unaffordable and stale complaints leave all state including attention and pending status untouched', () => {
    const state = fixture();
    state.financials.cashOnHand = 999;
    expect(getInboxChoiceQuote(state, 'complaint', 'address').disabledReason).toContain('$1,000 cash');
    expect(applyInboxChoice(state, 'complaint', 'address', deps)).toBe(state);
    expect(scheduleClientMeeting(state, state.clients[0].id)).toBe(state);
    const stale = { ...state, clients: state.clients.slice(1) };
    for (const choice of ['address', 'assign', 'ignore']) {
      expect(applyInboxChoice(stale, 'complaint', choice, deps)).toBe(stale);
    }
    expect(applyInboxChoice(state, 'complaint', 'unknown', deps)).toBe(state);
    expect(state.lastPartnerIntervention).toBeNull();
    expect(state.inbox[0].requiresAction).toBe(true);
  });

  test('stale, zero and rounded-zero collection balances cannot spend attention or close messages', () => {
    const state = fixture();
    for (const balance of [0, 0.1]) {
      const stale = { ...state, receivables: state.receivables.map(account => ({ ...account,
        aging: { ...account.aging, sixtyDay: balance } })) };
      stale.arAging = sumReceivables(stale.receivables);
      expect(applyInboxChoice(stale, 'collection', 'personal-call', deps)).toBe(stale);
      expect(stale.lastPartnerIntervention).toBeNull();
      expect(stale.inbox[1].requiresAction).toBe(true);
    }
  });
});

describe('complaint alternatives', () => {
  test('delegation adds up to 3 using existing billable staff without fixing coverage or using attention', () => {
    const state = fixture();
    state.employees = [state.employees.find(employee => employee.role !== 'Support')];
    const coverage = getClientServiceCoverage(state);
    const next = applyInboxChoice(state, 'complaint', 'assign', deps);
    expect(next.clients[0].satisfaction).toBe(75);
    expect(next.employees).toBe(state.employees);
    expect(getClientServiceCoverage(next)).toBe(coverage);
    expect(next.financials).toEqual(state.financials);
    expect(next.lastPartnerIntervention).toBeNull();
    expect(next.inbox[0].resolution.summary).toContain('does not repair understaffing');
    expect(applyInboxChoice(next, 'complaint', 'address', deps)).toBe(next);
    expect(getClientMeetingQuote(next, state.clients[0].id).available).toBe(false);
    expect(applyInboxChoice(next, 'collection', 'personal-call', deps).lastPartnerIntervention.action).toBe('personal-collection');
  });

  test('support-only and empty rosters cannot delegate, while explicit deferral remains available', () => {
    for (const supportOnly of [true, false]) {
      const state = fixture();
      state.employees = supportOnly ? state.employees.filter(employee => employee.role === 'Support') : [];
      expect(getInboxChoiceQuote(state, 'complaint', 'assign').disabledReason).toContain('at least one billable employee');
      expect(applyInboxChoice(state, 'complaint', 'assign', deps)).toBe(state);
      const deferred = applyInboxChoice(state, 'complaint', 'ignore', deps);
      expect(deferred.clients[0].satisfaction).toBe(62);
      expect(deferred.financials).toEqual(state.financials);
      expect(deferred.lastPartnerIntervention).toBeNull();
      expect(deferred.inbox[0].requiresAction).toBe(false);
    }
  });

  test('delegated complaint cannot get a second reward; a distinct renewal issue may get a meeting', () => {
    const state = fixture();
    state.clients[0].satisfaction = 50;
    const delegated = applyInboxChoice(state, 'complaint', 'assign', deps);
    expect(getClientMeetingQuote(delegated, state.clients[0].id).available).toBe(false);
    delegated.clients[0].contractMonthsRemaining = 2;
    expect(getClientMeetingQuote(delegated, state.clients[0].id).available).toBe(true);
    const renewalMeeting = scheduleClientMeeting(delegated, state.clients[0].id);
    expect(renewalMeeting.clients[0].satisfaction).toBe(59);
    expect(renewalMeeting.inbox[0].resolution).toEqual(delegated.inbox[0].resolution);
    expect(renewalMeeting.lastPartnerIntervention.action).toBe('client-meeting');
  });

  test('duplicate legacy complaints resolve together with one satisfaction award', () => {
    const state = fixture();
    state.inbox.push(complaint(state.clients[0].id, 'duplicate-complaint'));
    for (const choice of ['address', 'assign']) {
      const next = applyInboxChoice(state, 'complaint', choice, deps);
      expect(next.clients[0].satisfaction).toBe(choice === 'address' ? 78 : 75);
      expect(next.inbox[2].requiresAction).toBe(false);
      expect(applyInboxChoice(next, 'duplicate-complaint', choice, deps)).toBe(next);
    }
  });

  test('bounded gains, current quotes and legacy pending copy match actual effects', () => {
    const state = fixture();
    state.clients[0].satisfaction = 99;
    state.inbox[0].choices = [{ id: 'address', label: 'Respond Personally', effect: '+15 for free' }];
    expect(getCurrentInboxChoices(state.inbox[0]).map(choice => choice.label))
      .toEqual(['Lead recovery meeting', 'Delegate routine response', 'Defer for now']);
    for (const choice of ['address', 'assign']) {
      expect(getInboxChoiceQuote(state, 'complaint', choice).satisfactionChange).toBe(1);
      expect(applyInboxChoice(state, 'complaint', choice, deps).clients[0].satisfaction).toBe(100);
    }
    const resolved = { ...state.inbox[0], requiresAction: false };
    expect(getCurrentInboxChoices(resolved)).toBe(resolved.choices);
  });
});
