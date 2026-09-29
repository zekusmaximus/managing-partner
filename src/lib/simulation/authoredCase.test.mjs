import { describe, expect, test } from 'bun:test';
import { CASE_EVENT_IDS, createAuthoredCaseSimulationState, getCaseAdvanceBlocker, leaveAuthoredCase } from './authoredCase';
import { createInitialSimulationState } from './initialState';
import { advanceSimulationMonth, applyInboxChoice, getInboxChoiceQuote, sumReceivables } from './engine';
import { getClientServiceCoverage } from './clientService';
import { parseSession, serializeSession } from '../session/save';
import { createInitialTutorialState } from '../session/tutorialState';

const actionDeps = random => ({ random: () => random, generateId: () => 'case-test-client' });
const monthDeps = random => ({
  random: () => random,
  generateAlerts: () => [],
  generateInboxMessages: () => [],
});
const advance = (state, random = 0.5) => advanceSimulationMonth(state, monthDeps(random));
const event = (state, key) => state.inbox.find(message => message.id === CASE_EVENT_IDS[key]);
const choose = (state, key, choice, random = 0.5) => {
  expect(event(state, key)?.requiresAction).toBe(true);
  return applyInboxChoice(state, CASE_EVENT_IDS[key], choice, actionDeps(random));
};
const startFebruary = (collection = 'hold-collection') =>
  advance(choose(createAuthoredCaseSimulationState(), 'collection', collection));
const startMarch = (prospect = 'decline', random = 0.5) => {
  let state = startFebruary();
  state = choose(state, 'intakeReview', 'review');
  state = choose(state, 'prospect', prospect, random);
  return advance(state);
};
const finishMarch = (state, policy = 'defer', complaint = 'ignore', random = 0.5) =>
  advance(choose(choose(state, 'policy', policy), 'complaint', complaint), random);

const assertReconciled = state => {
  const entry = state.financialHistory.at(-1);
  expect(sumReceivables(state.receivables)).toEqual(state.arAging);
  expect(entry.openingCash + entry.collections - entry.recurringCashExpensesPaid +
    entry.cashMovements.reduce((sum, movement) => sum + movement.amount, 0)).toBeCloseTo(entry.cashOnHand, 2);
  expect(state.financials.cashOnHand).toBe(entry.cashOnHand);
  expect(state.financials.netProfit).toBe(entry.profit);
  expect(entry.revenue - entry.expenses).toBeCloseTo(entry.profit, 2);
};

describe('authored opening and January collections', () => {
  test('the case has a distinct reconciled fixture and does not alter free play', () => {
    const free = createInitialSimulationState();
    const state = createAuthoredCaseSimulationState();
    expect(free.clients.find(client => client.id === 'client1').contractMonthsRemaining).toBe(12);
    expect(free.authoredCase ?? null).toBeNull();
    expect(state.authoredCase.status).toBe('active');
    expect(state.clients.find(client => client.id === 'client1').contractMonthsRemaining).toBe(3);
    expect(state.financials.netProfit).toBeGreaterThan(0);
    expect(state.financials.cashOnHand).toBeGreaterThan(0);
    expect(state.financials.cashOnHand).toBeLessThan(free.financials.cashOnHand);
    expect(getClientServiceCoverage(state)).toBeGreaterThan(0.9);
    expect(getClientServiceCoverage(state)).toBeLessThan(1.15);
    expect(state.receivables.find(account => account.clientId === 'client1')?.aging.sixtyDay).toBeGreaterThan(0);
    expect(event(state, 'collection')).toMatchObject({ requiresAction: true,
      scenario: { kind: 'collections-problem', clientId: 'client1' } });
    assertReconciled(state);
  });

  test('the required January choice blocks advancement and rapid repeats cannot skip February', () => {
    const state = createAuthoredCaseSimulationState();
    expect(getCaseAdvanceBlocker(state)).toBeTruthy();
    expect(advance(state)).toBe(state);
    const held = choose(state, 'collection', 'hold-collection');
    expect(held.financials).toEqual(state.financials);
    expect(held.arAging).toEqual(state.arAging);
    expect(held.inbox.find(message => message.id === CASE_EVENT_IDS.collection).requiresAction).toBe(false);
    expect(applyInboxChoice(held, CASE_EVENT_IDS.collection, 'demand-letter', actionDeps(0.5))).toBe(held);
    const february = advance(held);
    expect(february.month).toBe(2);
    expect(event(february, 'intakeReview')?.requiresAction).toBe(true);
    expect(february.inbox.filter(message => message.id === CASE_EVENT_IDS.collection)).toHaveLength(1);
    expect(advance(february)).toBe(february);
  });

  test('collection tactics reconcile cash, AR, profit, client relationship, and attention', () => {
    for (const choice of ['demand-letter', 'personal-call', 'write-off-ar']) {
      const state = createAuthoredCaseSimulationState();
      const quote = getInboxChoiceQuote(state, CASE_EVENT_IDS.collection, choice);
      const next = choose(state, 'collection', choice);
      const cashChange = next.financials.cashOnHand - state.financials.cashOnHand;
      const arChange = next.arAging.sixtyDay - state.arAging.sixtyDay;
      if (choice === 'write-off-ar') {
        expect(cashChange).toBe(0);
        expect(next.financials.netProfit - state.financials.netProfit).toBe(arChange);
        expect(next.financialHistory.at(-1).arWriteOff).toBe(-arChange);
      } else {
        expect(cashChange).toBe(quote.collectionEstimate);
        expect(arChange).toBe(-quote.collectionEstimate);
        expect(next.financials.netProfit).toBe(state.financials.netProfit);
      }
      expect(next.clients.find(client => client.id === 'client1').satisfaction -
        state.clients.find(client => client.id === 'client1').satisfaction).toBe(quote.satisfactionChange);
      expect(next.lastPartnerIntervention?.action ?? null).toBe(choice === 'personal-call' ? 'personal-collection' : null);
      assertReconciled(next);
      expect(advance(next).month).toBe(2);
    }
  });

  test('automatic credit activity is recorded separately from collections and reported profit', () => {
    const january = choose(createAuthoredCaseSimulationState(), 'collection', 'hold-collection');
    const february = advance(january);
    const entry = february.financialHistory.at(-1);
    const draw = entry.cashMovements.find(movement => movement.kind === 'loc-draw');
    expect(draw?.amount).toBeGreaterThan(0);
    expect(february.lineOfCredit.drawn - january.lineOfCredit.drawn).toBe(draw.amount);
    expect(entry.collections).toBe(february.financials.collectionsThisMonth);
    expect(entry.revenue - entry.expenses).toBe(entry.profit);
    assertReconciled(february);
  });
});

describe('February conflict review and pursuit', () => {
  test('review is required ordinary work; original conflicting scope cannot be signed', () => {
    const state = startFebruary();
    expect(getCaseAdvanceBlocker(state)).toBeTruthy();
    expect(advance(state)).toBe(state);
    const reviewed = choose(state, 'intakeReview', 'review');
    expect(reviewed.lastPartnerIntervention).toEqual(state.lastPartnerIntervention);
    expect(reviewed.financials).toEqual(state.financials);
    expect(event(reviewed, 'prospect')?.requiresAction).toBe(true);
    expect(getInboxChoiceQuote(reviewed, CASE_EVENT_IDS.prospect, 'original-scope').available).toBe(false);
    expect(applyInboxChoice(reviewed, CASE_EVENT_IDS.prospect, 'original-scope', actionDeps(0.99))).toBe(reviewed);
    expect(advance(reviewed)).toBe(reviewed);
  });

  for (const choice of ['decline', 'hold']) test(`${choice} records a finite path without fees, pursuit cost, or added service workload`, () => {
    const february = choose(startFebruary(), 'intakeReview', 'review');
    const next = choose(february, 'prospect', choice);
    expect(next.clients).toHaveLength(february.clients.length);
    expect(next.financials).toEqual(february.financials);
    expect(getClientServiceCoverage(next)).toBe(getClientServiceCoverage(february));
    expect(event(next, 'prospect').requiresAction).toBe(false);
    expect(advance(next).month).toBe(3);
  });

  for (const [label, choice, roll, signs, cost] of [
    ['paid pursuit fails', 'pursue', 0, false, 3000],
    ['paid pursuit succeeds', 'pursue', 0.99, true, 3000],
    ['initial contact fails', 'initial-contact', 0, false, 0],
    ['initial contact succeeds', 'initial-contact', 0.99, true, 0],
  ]) test(`${label} records the expense and workload implications`, () => {
    const february = choose(startFebruary(), 'intakeReview', 'review');
    const quote = getInboxChoiceQuote(february, CASE_EVENT_IDS.prospect, choice);
    expect(quote.effect).toContain('Current service coverage');
    expect(quote.effect).toContain('if signed');
    expect(quote.effect).toContain('billable hire');
    const next = choose(february, 'prospect', choice, roll);
    expect(next.financials.cashOnHand).toBe(february.financials.cashOnHand - cost);
    expect(next.financials.netProfit).toBe(february.financials.netProfit - cost);
    expect(next.clients).toHaveLength(february.clients.length + Number(signs));
    if (signs) {
      expect(getClientServiceCoverage(next)).toBeLessThan(getClientServiceCoverage(february));
      expect(next.clients.find(client => client.name === 'Community Energy Council')?.monthlyFee).toBe(12000);
    } else {
      expect(getClientServiceCoverage(next)).toBe(getClientServiceCoverage(february));
      expect(event(next, 'prospect').resolution.summary).toContain('did not sign');
    }
    expect(next.financialHistory.at(-1).cashMovements.filter(movement => movement.kind === 'client-pursuit'))
      .toHaveLength(cost > 0 ? 1 : 0);
    assertReconciled(next);
    expect(advance(next).month).toBe(3);
  });
});

describe('March policy delay, shared attention, and April renewal', () => {
  for (const prospect of ['decline', 'hold']) test(`external policy event occurs after the prospect is ${prospect}`, () => {
    const march = startMarch(prospect);
    expect(event(march, 'policy')?.requiresAction).toBe(true);
    expect(event(march, 'complaint')?.requiresAction).toBe(true);
    expect(event(march, 'complaint').scenario.clientId).not.toBe('client1');
    expect(getCaseAdvanceBlocker(march)).toBeTruthy();
    expect(advance(march)).toBe(march);
    const april = finishMarch(march, 'defer', 'ignore', 0.99);
    expect(april.month).toBe(4);
    expect(april.authoredCase.status).toBe('completed');
    expect(april.authoredCase.renewalOutcome).toBe('departed');
    expect(april.authoredCase.renewal).toMatchObject({ serviceCoverage: expect.any(Number), satisfaction: expect.any(Number), chance: expect.any(Number) });
    assertReconciled(april);
  });

  for (const [label, prospect, roll] of [
    ['failed paid pursuit', 'pursue', 0],
    ['successful paid pursuit', 'pursue', 0.99],
    ['failed initial contact', 'initial-contact', 0],
  ]) test(`policy event also occurs after ${label}`, () => {
      const march = startMarch(prospect, roll);
      expect(event(march, 'policy')?.requiresAction).toBe(true);
      expect(event(march, 'complaint')?.requiresAction).toBe(true);
      expect(march.inbox.filter(message => message.id === CASE_EVENT_IDS.policy)).toHaveLength(1);
      const april = finishMarch(march, 'defer', 'ignore', 0.99);
      expect(april.authoredCase.status).toBe('completed');
      expect(april.authoredCase.renewalOutcome).toBe('departed');
    });

  test('personal policy response uses the attention slot, while the other complaint can be delegated or deferred', () => {
    const march = startMarch();
    const policy = choose(march, 'policy', 'personal');
    expect(policy.lastPartnerIntervention?.month).toBe(3);
    expect(getInboxChoiceQuote(policy, CASE_EVENT_IDS.complaint, 'address').available).toBe(false);
    expect(applyInboxChoice(policy, CASE_EVENT_IDS.complaint, 'address', actionDeps(0.5))).toBe(policy);
    for (const response of ['assign', 'ignore']) {
      const answered = choose(policy, 'complaint', response);
      expect(advance(answered).month).toBe(4);
    }
  });

  test('a complaint meeting first blocks personal policy response but leaves delegation and deferral', () => {
    const march = startMarch();
    const complaint = choose(march, 'complaint', 'address');
    expect(getInboxChoiceQuote(complaint, CASE_EVENT_IDS.policy, 'personal').available).toBe(false);
    expect(applyInboxChoice(complaint, CASE_EVENT_IDS.policy, 'personal', actionDeps(0.5))).toBe(complaint);
    const delegated = choose(complaint, 'policy', 'delegate');
    expect(delegated.lastPartnerIntervention).toEqual(complaint.lastPartnerIntervention);
    expect(advance(delegated).authoredCase.status).toBe('completed');
  });

  for (const [label, policy, complaint] of [
    ['personal policy and deferred complaint', 'personal', 'ignore'],
    ['delegated policy and deferred complaint', 'delegate', 'ignore'],
    ['deferred policy and delegated complaint', 'defer', 'assign'],
  ]) test(`${label} can finish with renewal or departure`, () => {
      const march = startMarch();
      const decided = choose(choose(march, 'policy', policy), 'complaint', complaint);
      for (const roll of [0, 0.99]) {
        const april = advance(decided, roll);
        expect(april.authoredCase.status).toBe('completed');
        expect(april.authoredCase.renewalOutcome).toBe(roll === 0 ? 'renewed' : 'departed');
        expect(april.inbox.filter(message => message.id === CASE_EVENT_IDS.policy)).toHaveLength(1);
        assertReconciled(april);
      }
    });

  test('zero staff and poor management still reach the case ending without a favorable roll', () => {
    const january = createAuthoredCaseSimulationState();
    january.employees = [];
    january.clients = january.clients.map(client => ({ ...client, satisfaction: 20 }));
    const february = advance(choose(january, 'collection', 'hold-collection'), 0.99);
    const reviewed = choose(february, 'intakeReview', 'review');
    const march = advance(choose(reviewed, 'prospect', 'decline'), 0.99);
    expect(getInboxChoiceQuote(march, CASE_EVENT_IDS.policy, 'delegate').available).toBe(false);
    expect(getInboxChoiceQuote(march, CASE_EVENT_IDS.complaint, 'assign').available).toBe(false);
    const april = finishMarch(march, 'defer', 'ignore', 0);
    expect(april.authoredCase.status).toBe('completed');
    expect(april.authoredCase.renewalOutcome).toBe('departed');
    expect(april.month).toBe(4);
    assertReconciled(april);
  });
});

describe('resumption and idempotence', () => {
  test('leaving the case holds case-only pending decisions and resumes free play without resetting the firm', () => {
    const january = createAuthoredCaseSimulationState();
    const left = leaveAuthoredCase(january);
    expect(left.authoredCase.status).toBe('left');
    expect(left.financials).toEqual(january.financials);
    expect(left.clients).toEqual(january.clients);
    expect(left.inbox.find(message => message.id === CASE_EVENT_IDS.collection)).toMatchObject({
      requiresAction: false, resolution: { choiceId: 'held-on-exit' },
    });
    expect(advance(left).month).toBe(2);
    expect(advance(left).inbox.some(message => message.id === CASE_EVENT_IDS.intakeReview)).toBe(false);
  });

  test('a saved case resumes the current round and records one copy of each event', () => {
    let state = createAuthoredCaseSimulationState();
    for (const expected of ['collection', 'intakeReview', 'policy']) {
      const loaded = parseSession(serializeSession({ simulation: state, tutorial: createInitialTutorialState() }));
      expect(loaded).not.toBeNull();
      state = loaded.simulation;
      expect(event(state, expected)?.requiresAction).toBe(true);
      expect(state.inbox.filter(message => message.id === CASE_EVENT_IDS[expected])).toHaveLength(1);
      if (expected === 'collection') state = advance(choose(state, 'collection', 'hold-collection'));
      else if (expected === 'intakeReview') {
        state = choose(state, 'intakeReview', 'review');
        state = advance(choose(state, 'prospect', 'decline'));
      }
    }
    state = finishMarch(state);
    const completed = parseSession(serializeSession({ simulation: state, tutorial: createInitialTutorialState() }));
    expect(completed?.simulation.authoredCase).toEqual(state.authoredCase);
    expect(completed?.simulation.inbox.filter(message => message.id === CASE_EVENT_IDS.policy)).toHaveLength(1);
  });

  test('completed case is terminal and later free play does not duplicate case events', () => {
    const april = finishMarch(startMarch());
    const further = advance(april);
    expect(further.month).toBe(5);
    expect(further.authoredCase.status).toBe('completed');
    for (const id of Object.values(CASE_EVENT_IDS)) {
      expect(further.inbox.filter(message => message.id === id).length).toBeLessThanOrEqual(1);
    }
  });
});
