import { describe, expect, test } from 'bun:test';
import {
  CASE_EVENT_IDS, createAuthoredCaseSimulationState, getCaseAdvanceBlocker,
  getCaseRequiredDecisionBlocker, leaveAuthoredCase, recordCaseApplication,
  recordCasePrediction, recordCaseReflection, setCaseGuidancePaused,
} from './authoredCase';
import { createInitialSimulationState } from './initialState';
import { advanceSimulationMonth, applyInboxChoice, getClientMeetingQuote, getInboxChoiceQuote, recordCashMovement, scheduleClientMeeting, sumReceivables } from './engine';
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
  const round = state.month;
  const predicted = recordCasePrediction(state, 'not-sure');
  const decided = applyInboxChoice(predicted, CASE_EVENT_IDS[key], choice, actionDeps(random));
  return round >= 1 && round <= 3 && !getCaseRequiredDecisionBlocker(decided)
    ? recordCaseReflection(decided, 'not-sure') : decided;
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
    expect(state.financials.netProfit).toBe(16589);
    expect(state.financials.grossRevenue).toBe(111000);
    expect(state.financials.operatingExpenses).toBe(94411);
    expect(state.financials.cashOnHand).toBe(45000);
    expect(state.arAging).toEqual({ current: 15000, thirtyDay: 0, sixtyDay: 18000, ninetyPlus: 0 });
    expect(state.taxPosition).toEqual({ principalDue: 5530, penaltiesDue: 0 });
    expect(state.lineOfCredit).toMatchObject({ limit: 100000, drawn: 0 });
    expect(state.budget.find(item => item.category === 'Payroll').actualQuarterlySpend).toBe(49081);
    expect(state.financialHistory[0].isOpeningSnapshot).toBe(true);
    expect(state.financialHistory[0].recurringCashExpensesPaid).toBe(0);
    expect(state.employees).toHaveLength(5);
    expect(state.clients).toHaveLength(8);
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
      const quote = getInboxChoiceQuote(recordCasePrediction(state, 'not-sure'), CASE_EVENT_IDS.collection, choice);
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

  test('insufficient cash blocks both personal meetings but explicit alternatives reach April', () => {
    const march = startMarch();
    const noCash = recordCashMovement(march, { kind: 'unclassified', amount: -march.financials.cashOnHand });
    expect(noCash.financials.cashOnHand).toBe(0);
    expect(getInboxChoiceQuote(noCash, CASE_EVENT_IDS.policy, 'personal').available).toBe(false);
    expect(getInboxChoiceQuote(noCash, CASE_EVENT_IDS.complaint, 'address').available).toBe(false);
    const april = finishMarch(noCash, 'defer', 'ignore', 0.99);
    expect(april.month).toBe(4);
    expect(april.authoredCase.status).toBe('completed');
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

describe('guided decisions and teaching evidence', () => {
  test('a prediction is required before the case decision; a wrong prediction and reflection still advance', () => {
    const january = createAuthoredCaseSimulationState();
    expect(getCaseAdvanceBlocker(january)).toContain('prediction');
    expect(getInboxChoiceQuote(january, CASE_EVENT_IDS.collection, 'hold-collection').available).toBe(false);
    expect(applyInboxChoice(january, CASE_EVENT_IDS.collection, 'hold-collection', actionDeps(0.5))).toBe(january);
    expect(recordCasePrediction(january, 'invented')).toBe(january);
    expect(recordCaseReflection(january, 'not-sure')).toBe(january);

    const predicted = recordCasePrediction(january, 'profit');
    expect(predicted.authoredCase.guidance.predictions).toEqual(['profit', null, null]);
    expect(recordCasePrediction(predicted, 'cash-ar')).toBe(predicted);
    const decided = applyInboxChoice(predicted, CASE_EVENT_IDS.collection, 'hold-collection', actionDeps(0.5));
    expect(decided.authoredCase.guidance.decisions).toMatchObject([{
      messageId: CASE_EVENT_IDS.collection, choiceId: 'hold-collection',
      cashDelta: 0, arDelta: 0, profitDelta: 0,
    }]);
    expect(getCaseAdvanceBlocker(decided)).toContain('reflection');
    expect(advance(decided)).toBe(decided);
    expect(recordCaseReflection(decided, 'invented')).toBe(decided);

    const reflected = recordCaseReflection(decided, 'all-income');
    expect(reflected.authoredCase.guidance.reflections[0]).toBe('all-income');
    const february = advance(reflected);
    expect(february.month).toBe(2);
    expect(february.authoredCase.guidance.predictions[1]).toBeNull();
    expect(advance(february)).toBe(february);
  });

  test('all January paths record exact immediate effects and monthly credit separately', () => {
    for (const choice of ['demand-letter', 'personal-call', 'write-off-ar', 'hold-collection']) {
      const opening = createAuthoredCaseSimulationState();
      const decided = choose(opening, 'collection', choice);
      const evidence = decided.authoredCase.guidance.decisions[0];
      expect(evidence.choiceId).toBe(choice);
      expect(evidence.cashDelta).toBe(decided.financials.cashOnHand - opening.financials.cashOnHand);
      expect(evidence.arDelta).toBe(sumReceivables(decided.receivables).sixtyDay - sumReceivables(opening.receivables).sixtyDay);
      expect(evidence.profitDelta).toBe(decided.financials.netProfit - opening.financials.netProfit);
      expect(evidence.usedPartnerIntervention).toBe(choice === 'personal-call');
      const february = advance(decided);
      const month = february.authoredCase.guidance.monthly[0];
      const entry = february.financialHistory.at(-1);
      expect(month.round).toBe(1);
      expect(month.opening.cash).toBe(45000);
      expect(month.closing.cash).toBe(february.financials.cashOnHand);
      expect(month.collections).toBe(entry.collections);
      expect(month.recurringCashExpenses).toBe(entry.recurringCashExpensesPaid);
      expect(month.creditDraw).toBe(entry.cashMovements
        .filter(movement => movement.kind === 'loc-draw')
        .reduce((total, movement) => total + movement.amount, 0));
      expect(month.creditRepayment).toBe(Math.max(0, -entry.cashMovements
        .filter(movement => movement.kind === 'loc-repayment')
        .reduce((total, movement) => total + movement.amount, 0)));
    }
  });

  for (const [choice, roll] of [
    ['decline', 0.5], ['hold', 0.5], ['initial-contact', 0],
    ['initial-contact', 0.99], ['pursue', 0], ['pursue', 0.99],
  ]) test(`February ${choice} with roll ${roll} records the actual prospect outcome`, () => {
    const reviewed = choose(startFebruary(), 'intakeReview', 'review');
    const decided = choose(reviewed, 'prospect', choice, roll);
    const evidence = decided.authoredCase.guidance.decisions.at(-1);
    expect(evidence).toMatchObject({ messageId: CASE_EVENT_IDS.prospect, choiceId: choice });
    expect(evidence.cashDelta).toBe(decided.financials.cashOnHand - reviewed.financials.cashOnHand);
    expect(evidence.profitDelta).toBe(decided.financials.netProfit - reviewed.financials.netProfit);
    expect(evidence.clientDelta).toBe(decided.clients.length - reviewed.clients.length);
    expect(evidence.summary).toBe(event(decided, 'prospect').resolution.summary);
    expect(decided.authoredCase.guidance.decisions.filter(item => item.messageId === CASE_EVENT_IDS.prospect)).toHaveLength(1);
    expect(advance(decided).month).toBe(3);
  });

  for (const [policy, complaint] of [
    ['personal', 'assign'], ['personal', 'ignore'],
    ['delegate', 'address'], ['delegate', 'assign'], ['delegate', 'ignore'],
    ['defer', 'address'], ['defer', 'assign'], ['defer', 'ignore'],
  ]) test(`March ${policy} and ${complaint} reaches the April review`, () => {
    const march = startMarch();
    const decided = choose(choose(march, 'policy', policy), 'complaint', complaint);
    expect(decided.authoredCase.guidance.decisions.filter(item =>
      item.messageId === CASE_EVENT_IDS.policy || item.messageId === CASE_EVENT_IDS.complaint)).toHaveLength(2);
    expect(decided.authoredCase.guidance.reflections[2]).toBe('not-sure');
    const april = advance(decided, 0.99);
    expect(april.authoredCase.status).toBe('completed');
    expect(april.authoredCase.guidance.monthly.map(month => month.round)).toEqual([1, 2, 3]);
    expect(april.authoredCase.guidance.decisions).toHaveLength(5);
    expect(april.authoredCase.guidance.monthly[2].closing.anchorSatisfaction)
      .toBe(april.authoredCase.renewal.satisfaction === null ? null :
        april.clients.find(client => client.id === 'client1')?.satisfaction ?? null);
  });

  test('Clients route meeting requires the March prediction and records the complaint once', () => {
    const march = startMarch();
    expect(getClientMeetingQuote(march, 'client2').available).toBe(false);
    expect(scheduleClientMeeting(march, 'client2')).toBe(march);
    const predicted = recordCasePrediction(march, 'date-moves');
    const met = scheduleClientMeeting(predicted, 'client2');
    expect(event(met, 'complaint')).toMatchObject({ requiresAction: false,
      resolution: { choiceId: 'address' } });
    expect(met.authoredCase.guidance.decisions.filter(decision =>
      decision.messageId === CASE_EVENT_IDS.complaint)).toMatchObject([{
        choiceId: 'address', profitDelta: -1000, usedPartnerIntervention: true,
      }]);
    expect(scheduleClientMeeting(met, 'client2')).toBe(met);
    expect(applyInboxChoice(met, CASE_EVENT_IDS.complaint, 'address', actionDeps(0.5))).toBe(met);
    const policy = choose(met, 'policy', 'delegate');
    expect(policy.authoredCase.guidance.reflections[2]).toBe('not-sure');
    expect(advance(policy).month).toBe(4);
  });

  test('renewal and departure both permit an ungraded fresh application answer', () => {
    const decided = choose(choose(startMarch(), 'policy', 'defer'), 'complaint', 'ignore');
    expect(recordCaseApplication(decided, 'not-sure')).toBe(decided);
    for (const [roll, outcome, answer] of [
      [0, 'renewed', 'cash-only'], [0.99, 'departed', 'not-sure'],
    ]) {
      const april = advance(decided, roll);
      expect(april.authoredCase.renewalOutcome).toBe(outcome);
      expect(april.authoredCase.guidance.monthly).toHaveLength(3);
      const answered = recordCaseApplication(april, answer);
      expect(answered.authoredCase.guidance.application).toBe(answer);
      expect(recordCaseApplication(answered, 'scope-capacity')).toBe(answered);
      expect(advance(answered).month).toBe(5);
      expect(advance(answered).authoredCase.guidance.application).toBe(answer);
    }
  });

  test('pause and reload preserve guidance and firm; leave keeps the firm but ends case scheduling', () => {
    const predicted = recordCasePrediction(createAuthoredCaseSimulationState(), 'not-sure');
    const paused = setCaseGuidancePaused(predicted, true);
    expect(paused.authoredCase.guidance.paused).toBe(true);
    const loaded = parseSession(serializeSession({ simulation: paused, tutorial: createInitialTutorialState() }));
    expect(loaded.simulation.authoredCase.guidance).toEqual(paused.authoredCase.guidance);
    const decided = choose(loaded.simulation, 'collection', 'hold-collection');
    expect(decided.authoredCase.guidance.paused).toBe(true);
    const february = advance(decided);
    expect(february.month).toBe(2);
    expect(february.authoredCase.guidance.paused).toBe(true);
    const resumed = setCaseGuidancePaused(february, false);
    expect(resumed.authoredCase.guidance.paused).toBe(false);
    const left = leaveAuthoredCase(resumed);
    expect(left.authoredCase.status).toBe('left');
    expect(left.financials).toEqual(resumed.financials);
    expect(left.clients).toEqual(resumed.clients);
    expect(event(left, 'intakeReview').resolution.choiceId).toBe('held-on-exit');
    expect(advance(left).inbox.some(message => message.id === CASE_EVENT_IDS.policy)).toBe(false);
  });
});
