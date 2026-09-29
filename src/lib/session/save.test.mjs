import { describe, expect, test } from 'bun:test';
import { SessionStore } from '@/context/SessionContext';
import { fundStaffRecovery, getStaffRecoveryQuote } from '@/lib/simulation/burnout';
import { applyInboxChoice, getClientMeetingQuote, getInboxChoiceQuote, getPartnerInterventionStatus, scheduleClientMeeting, sumReceivables } from '@/lib/simulation/engine';
import {
  createFreshSession, LEGACY_TUTORIAL_STORAGE_KEY, loadSession, parseSession,
  serializeSession, SESSION_STORAGE_KEY, PREVIOUS_SESSION_STORAGE_KEY, SECOND_SESSION_STORAGE_KEY, FIRST_SESSION_STORAGE_KEY,
} from './save';

function memoryStorage() {
  const values = new Map();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

function removeV3CashFields(entry) {
  const legacy = { ...entry };
  delete legacy.openingCash;
  delete legacy.recurringCashExpensesPaid;
  delete legacy.cashMovements;
  delete legacy.oneTimeOperatingExpenses;
  delete legacy.isOpeningSnapshot;
  return legacy;
}

function removeV4TaxFields(snapshot) {
  delete snapshot.simulation.taxPosition;
  snapshot.simulation.financialHistory.forEach(entry => {
    const oldTaxExpense = entry.taxExpense + entry.taxPenalty;
    entry.expenses -= oldTaxExpense;
    entry.profit += oldTaxExpense;
    delete entry.taxExpense;
    delete entry.taxPenalty;
  });
  const current = snapshot.simulation.financialHistory.at(-1);
  snapshot.simulation.financials.operatingExpenses = current.expenses;
  snapshot.simulation.financials.netProfit = current.profit;
  delete snapshot.tutorial.simulationYearAtStart;
  return snapshot;
}

describe('versioned game save', () => {
  test('migrates a spent legacy meeting into shared attention without inventing earlier interventions', () => {
    const previous = JSON.parse(serializeSession(createFreshSession()));
    delete previous.simulation.lastPartnerIntervention;
    previous.simulation.lastClientMeeting = { month: 1, year: 2026, clientId: 'client1' };
    let loaded = parseSession(JSON.stringify(previous));
    expect(loaded.simulation.lastPartnerIntervention).toMatchObject({
      month: 1, year: 2026, clientId: 'client1', action: 'client-meeting', clientName: 'TechTrade Association',
    });
    expect(getPartnerInterventionStatus(loaded.simulation).available).toBe(false);
    expect(getPartnerInterventionStatus(loaded.simulation).usedBy).toContain('TechTrade Association');
    expect(loaded.simulation.financialHistory).toEqual(createFreshSession().simulation.financialHistory);
    expect(loaded.simulation.employees).toEqual(createFreshSession().simulation.employees);

    previous.simulation.lastPartnerIntervention = null;
    loaded = parseSession(JSON.stringify(previous));
    expect(getPartnerInterventionStatus(loaded.simulation).available).toBe(false);
    previous.simulation.lastClientMeeting = { month: 12, year: 2025, clientId: 'departed' };
    loaded = parseSession(JSON.stringify(previous));
    expect(loaded.simulation.lastPartnerIntervention).toMatchObject({ action: 'client-meeting', month: 12, year: 2025 });
    expect(getPartnerInterventionStatus(loaded.simulation).available).toBe(true);
    delete previous.simulation.lastClientMeeting;
    loaded = parseSession(JSON.stringify(previous));
    expect(loaded.simulation.lastPartnerIntervention).toBeNull();
    expect(loaded.simulation.lastClientMeeting).toBeNull();
  });

  test('personal collection reload preserves its shared limit, exact cash/AR, and no meeting expense', () => {
    const snapshot = createFreshSession();
    const state = snapshot.simulation;
    state.clients[0].contractMonthsRemaining = 2;
    state.receivables.push({ clientId: 'client1', clientName: state.clients[0].name, paymentProfile: 'normal',
      aging: { current: 0, thirtyDay: 0, sixtyDay: 10000, ninetyPlus: 0 } });
    state.arAging = sumReceivables(state.receivables);
    state.inbox = [{
      id: 'collection', type: 'alert', title: 'Collections', description: 'Unpaid invoices', urgency: 'high',
      requiresAction: true, read: false, timestamp: new Date('2026-01-01T00:00:00Z'),
      choices: [{ id: 'personal-call', label: 'Personal call', effect: 'Collect 40%' }],
      scenario: { kind: 'collections-problem', clientId: 'client1', overdueAmount: 10000 },
    }];
    snapshot.simulation = applyInboxChoice(state, 'collection', 'personal-call', { random: () => 0, generateId: () => 'unused' });
    const loaded = parseSession(serializeSession(snapshot));
    expect(loaded.simulation).toEqual(snapshot.simulation);
    expect(getClientMeetingQuote(loaded.simulation, 'client1').available).toBe(false);
    expect(loaded.simulation.lastClientMeeting).toBeNull();
    expect(loaded.simulation.financialHistory[0].cashMovements).toEqual([]);
    expect(loaded.simulation.lastPartnerIntervention.action).toBe('personal-collection');
  });

  test('preserves delegated resolution through reload without reopening its complaint for another award', () => {
    const snapshot = createFreshSession();
    snapshot.simulation.clients[0].satisfaction = 50;
    snapshot.simulation.inbox = [{
      id: 'complaint', type: 'alert', title: 'Client feedback', description: 'Slow responses', urgency: 'high',
      requiresAction: true, read: false, timestamp: new Date('2026-01-01T00:00:00Z'),
      choices: [{ id: 'assign', label: 'Add service check-ins', effect: '+8' }],
      scenario: { kind: 'client-feedback', clientId: 'client1' },
    }];
    snapshot.simulation = applyInboxChoice(snapshot.simulation, 'complaint', 'assign', { random: () => 0, generateId: () => 'unused' });
    const loaded = parseSession(serializeSession(snapshot));
    expect(loaded.simulation.inbox).toEqual(snapshot.simulation.inbox);
    expect(loaded.simulation.clients[0].satisfaction).toBe(53);
    expect(getClientMeetingQuote(loaded.simulation, 'client1').available).toBe(false);
    expect(getPartnerInterventionStatus(loaded.simulation).available).toBe(true);
  });

  for (const version of [1, 2, 3, 4]) {
    test(`V${version} retains tutorial, capability, balances and pending decisions with current response choices`, () => {
      const prior = JSON.parse(serializeSession(createFreshSession()));
      prior.version = version;
      delete prior.simulation.lastPartnerIntervention;
      delete prior.simulation.lastClientMeeting;
      prior.simulation.employees[0].efficacy = 12;
      prior.tutorial.status = 'in_progress';
      prior.tutorial.currentStepIndex = 5;
      prior.tutorial.completedSteps = ['m1-dashboard-overview'];
      prior.simulation.inbox = [
        { id: 'complaint', type: 'alert', title: 'Client feedback', description: 'Slow responses', urgency: 'high',
          requiresAction: true, read: false, timestamp: '2026-01-01T00:00:00Z',
          choices: [{ id: 'address', label: 'Respond Personally', effect: '+15 for free' },
            { id: 'assign', label: 'Add Service Check-ins', effect: '+8' }],
          scenario: { kind: 'client-feedback', clientId: 'client1' } },
        { id: 'collections', type: 'alert', title: 'Collections', description: 'Unpaid invoices', urgency: 'high',
          requiresAction: true, read: false, timestamp: '2026-01-01T00:00:00Z',
          choices: [{ id: 'personal-call', label: 'Personal Call from Partner', effect: 'Collect 40%' },
            { id: 'write-off-ar', label: 'Write Off Balance', effect: 'Clear balance' }],
          scenario: { kind: 'collections-problem', overdueAmount: 10000 } },
      ];
      if (version < 4) removeV4TaxFields(prior);
      if (version < 3) prior.simulation.financialHistory = prior.simulation.financialHistory.map(removeV3CashFields);
      if (version === 1) delete prior.simulation.receivables;
      const loaded = parseSession(JSON.stringify(prior));
      expect(loaded).not.toBeNull();
      expect(loaded.tutorial.completedSteps).toEqual(['m1-dashboard-overview']);
      expect(loaded.tutorial.currentStepIndex).toBe(5);
      expect(loaded.simulation.employees[0].efficacy).toBe(12);
      expect(loaded.simulation.arAging).toEqual(prior.simulation.arAging);
      expect(loaded.simulation.financials.cashOnHand).toBe(prior.simulation.financials.cashOnHand);
      expect(loaded.simulation.lastPartnerIntervention).toBeNull();
      expect(loaded.simulation.inbox.every(message => message.requiresAction && !message.read)).toBe(true);
      expect(loaded.simulation.inbox[0].choices[0]).toMatchObject({ id: 'address', label: 'Lead recovery meeting' });
      expect(loaded.simulation.inbox[0].choices[0].effect).toContain('$1,000');
      expect(loaded.simulation.inbox[0].choices[1].effect).toContain('up to 3');
      expect(loaded.simulation.inbox[1].choices.find(choice => choice.id === 'personal-call').effect).toContain('partner intervention');
      expect(loaded.simulation.inbox[1].choices.find(choice => choice.id === 'write-off-ar').label).toBe('Write off and close collection efforts');
      expect(getInboxChoiceQuote(loaded.simulation, 'complaint', 'address').cost).toBe(1000);
      expect(parseSession(serializeSession(loaded))).not.toBeNull();
    });
  }

  test('invalid shared intervention markers cannot silently reset the allowance', () => {
    const snapshot = JSON.parse(serializeSession(createFreshSession()));
    for (const marker of [
      { month: 13, year: 2026, action: 'client-meeting' },
      { month: 1, year: 2026, action: 'invented' },
      { month: 1, year: 2026, action: 'personal-collection', clientName: 12 },
    ]) {
      snapshot.simulation.lastPartnerIntervention = marker;
      expect(parseSession(JSON.stringify(snapshot))).toBeNull();
    }
  });

  test('refreshes an old pending pursuit quote and preserves its paid cash movement', () => {
    const snapshot = createFreshSession();
    const offer = {
      id: 'old-offer', type: 'opportunity', title: 'New Client Interest', description: 'Opportunity', urgency: 'medium',
      requiresAction: true, read: false, timestamp: new Date('2026-01-01T00:00:00.000Z'),
      choices: [
        { id: 'pursue', label: 'Pursue Aggressively', effect: '70% chance; no immediate cost' },
        { id: 'initial-contact', label: 'Initial Contact', effect: '50% chance; no immediate cost' },
      ],
      scenario: { kind: 'new-client', name: 'PolicyLabs', clientType: 'Corporation', monthlyFee: 12000 },
    };
    snapshot.simulation.inbox = [offer];
    const loaded = parseSession(serializeSession(snapshot));
    expect(loaded).not.toBeNull();
    expect(loaded.simulation.inbox[0].choices[0].effect).toContain('$12,000/mo');
    expect(loaded.simulation.inbox[0].choices[0].effect).toContain('pay $3,000 now');
    expect(loaded.simulation.inbox[0].choices[1].effect).toContain('no immediate cost');

    loaded.simulation = applyInboxChoice(loaded.simulation, 'old-offer', 'pursue', {
      random: () => 0, generateId: () => 'unused',
    });
    const reloaded = parseSession(serializeSession(loaded));
    expect(reloaded).not.toBeNull();
    expect(reloaded.simulation.financialHistory.at(-1).cashMovements)
      .toContainEqual({ kind: 'client-pursuit', amount: -3000 });
    expect(reloaded.simulation.financials.cashOnHand).toBe(snapshot.simulation.financials.cashOnHand - 3000);
  });

  test('restores simulation, tutorial, and alert/message Dates together', () => {
    const snapshot = createFreshSession();
    snapshot.simulation.month = 3;
    snapshot.simulation.financials.cashOnHand += 5000;
    snapshot.simulation.financialHistory[0].cashOnHand += 5000;
    snapshot.simulation.financialHistory[0].cashMovements.push({ kind: 'loc-draw', amount: 5000 });
    snapshot.simulation.lineOfCredit.drawn += 5000;
    snapshot.simulation.alerts.push({
      id: 'alert-1', type: 'warning', message: 'Test alert',
      timestamp: new Date('2026-03-01T12:00:00.000Z'),
    });
    snapshot.simulation.inbox.push({
      id: 'message-1', type: 'request', title: 'Raise Request',
      description: 'A request', urgency: 'medium', requiresAction: true,
      read: false, choices: [{ id: 'approve', label: 'Approve', effect: 'Raise' }],
      resolution: { choiceId: 'approve', summary: 'Salary increased by $1,200 per month.' },
      scenario: { kind: 'raise-request', employeeId: 'emp1' },
      timestamp: new Date('2026-03-02T12:00:00.000Z'),
    });
    snapshot.tutorial.status = 'in_progress';
    snapshot.tutorial.currentStepIndex = 3;

    const restored = parseSession(serializeSession(snapshot));
    expect(restored?.simulation.month).toBe(3);
    expect(restored?.simulation.financialHistory[0].cashMovements).toEqual([{ kind: 'loc-draw', amount: 5000 }]);
    expect(restored?.tutorial.currentStepIndex).toBe(3);
    expect(restored?.simulation.alerts[0].timestamp).toBeInstanceOf(Date);
    expect(restored?.simulation.inbox[0].timestamp).toBeInstanceOf(Date);
    expect(restored?.simulation.inbox[0].scenario).toEqual({
      kind: 'raise-request', employeeId: 'emp1',
    });
    expect(restored?.simulation.inbox[0].resolution?.summary).toContain('Salary increased');
  });

  test('persists the client meeting cooldown, expense, collection, and action target', () => {
    const snapshot = createFreshSession();
    snapshot.simulation.clients[0].contractMonthsRemaining = 2;
    snapshot.simulation.receivables.push({
      clientId: 'client1', clientName: snapshot.simulation.clients[0].name,
      paymentProfile: 'normal',
      aging: { current: 0, thirtyDay: 10000, sixtyDay: 0, ninetyPlus: 0 },
    });
    snapshot.simulation.arAging = sumReceivables(snapshot.simulation.receivables);
    snapshot.simulation = scheduleClientMeeting(snapshot.simulation, snapshot.simulation.clients[0].id);
    const reloaded = parseSession(serializeSession(snapshot));
    expect(reloaded?.simulation.lastClientMeeting)
      .toEqual({ month: 1, year: 2026, clientId: 'client1' });
    expect(reloaded?.simulation.financialHistory[0].cashMovements)
      .toContainEqual({ kind: 'client-meeting', amount: -1000 });
    expect(reloaded?.simulation.financialHistory[0].collections).toBe(1500);
    expect(reloaded?.simulation.receivables.find(account => account.clientId === 'client1').aging.thirtyDay)
      .toBe(8500);
    expect(reloaded?.simulation.alerts[0].actionTarget)
      .toEqual({ kind: 'client', clientId: 'client1' });
    expect(reloaded?.simulation.alerts[0].timestamp).toBeInstanceOf(Date);

    const priorV4 = JSON.parse(serializeSession(createFreshSession()));
    delete priorV4.simulation.lastClientMeeting;
    expect(parseSession(JSON.stringify(priorV4))?.simulation.lastClientMeeting).toBeNull();
    priorV4.simulation.lastClientMeeting = { month: 13, year: 2026, clientId: 'client1' };
    expect(parseSession(JSON.stringify(priorV4))).toBeNull();
  });

  test('rejects wrong versions and malformed nested data', () => {
    const valid = JSON.parse(serializeSession(createFreshSession()));
    expect(parseSession(JSON.stringify({ ...valid, version: 5 }))).toBeNull();
    expect(parseSession(JSON.stringify({ ...valid, simulation: { ...valid.simulation, taxPosition: { principalDue: -1, penaltiesDue: 0 } } }))).toBeNull();
    expect(parseSession(JSON.stringify({ ...valid, tutorial: { ...valid.tutorial, simulationYearAtStart: 2019 } }))).toBeNull();
    expect(parseSession(JSON.stringify({ ...valid, simulation: { ...valid.simulation,
      financialHistory: [{ ...valid.simulation.financialHistory[0], taxPenalty: Infinity }],
    } }))).toBeNull();
    expect(parseSession(JSON.stringify({ ...valid, simulation: {
      ...valid.simulation,
      financialHistory: [{ ...valid.simulation.financialHistory[0], cashMovements: [{ kind: 'invented', amount: 1 }] }],
    } }))).toBeNull();
    expect(parseSession(JSON.stringify({ ...valid, simulation: {
      ...valid.simulation,
      financialHistory: [{ ...valid.simulation.financialHistory[0], cashMovements: [{ kind: 'loc-draw', amount: -1 }] }],
    } }))).toBeNull();
    expect(parseSession(JSON.stringify({ ...valid, simulation: {
      ...valid.simulation,
      financialHistory: [{ ...valid.simulation.financialHistory[0], cashMovements: [{ kind: 'unclassified', amount: 0 }] }],
    } }))).toBeNull();
    expect(parseSession(JSON.stringify({ ...valid, simulation: {
      ...valid.simulation,
      financialHistory: [{ ...valid.simulation.financialHistory[0], cashOnHand: 251000 }],
    } }))).toBeNull();
    expect(parseSession(JSON.stringify({ ...valid, simulation: {
      ...valid.simulation,
      financialHistory: [{ ...valid.simulation.financialHistory[0], openingCash: null }],
    } }))).toBeNull();
    expect(parseSession(JSON.stringify({ ...valid, simulation: { ...valid.simulation, employees: null } }))).toBeNull();
    expect(parseSession(JSON.stringify({ ...valid, simulation: {
      ...valid.simulation,
      receivables: [{ ...valid.simulation.receivables[0], aging: {
        ...valid.simulation.receivables[0].aging, current: 1,
      } }],
    } }))).toBeNull();
    const history = [{ ...valid.simulation.financialHistory[0] }];
    delete history[0].operatingCostBreakdown;
    expect(parseSession(JSON.stringify({
      ...valid, simulation: { ...valid.simulation, financialHistory: history },
    }))).toBeNull();
    const message = {
      id: 'message-1', type: 'request', title: 'Raise Request',
      description: 'A request', urgency: 'medium', requiresAction: true,
      read: false, choices: [], timestamp: '2026-03-02T12:00:00.000Z',
    };
    expect(parseSession(JSON.stringify({
      ...valid, simulation: { ...valid.simulation, inbox: [message] },
    }))).toBeNull();
    expect(parseSession(JSON.stringify({
      ...valid, simulation: {
        ...valid.simulation,
        inbox: [{ ...message, timestamp: 'not-a-date', scenario: { kind: 'industry-update' } }],
      },
    }))).toBeNull();
    expect(parseSession('{bad json')).toBeNull();
  });

  test('migrates pooled AR without assigning it to a current client', () => {
    const storage = memoryStorage();
    const previous = removeV4TaxFields(JSON.parse(serializeSession(createFreshSession())));
    previous.version = 1;
    delete previous.simulation.receivables;
    previous.simulation.financialHistory = previous.simulation.financialHistory.map(removeV3CashFields);
    storage.setItem(FIRST_SESSION_STORAGE_KEY, JSON.stringify(previous));

    const store = new SessionStore(storage);
    expect(store.getSnapshot().snapshot.simulation.receivables).toEqual([{
      clientId: null,
      clientName: 'Prior balance (unassigned)',
      paymentProfile: 'normal',
      aging: previous.simulation.arAging,
    }]);
    expect(store.getSnapshot().snapshot.simulation.financialHistory[0]).toMatchObject({
      openingCash: null, recurringCashExpensesPaid: null, cashMovements: [], isOpeningSnapshot: true,
    });
    store.initializeStorage();
    expect(storage.getItem(FIRST_SESSION_STORAGE_KEY)).toBeNull();
    expect(loadSession(storage).status).toBe('loaded');
  });

  test('migrates V2 cash differences as unclassified and retires its key after a V4 save', () => {
    const storage = memoryStorage();
    const previous = removeV4TaxFields(JSON.parse(serializeSession(createFreshSession())));
    previous.version = 2;
    const january = removeV3CashFields(previous.simulation.financialHistory[0]);
    const february = {
      ...january, month: 2, collections: 60000, expenses: 80000,
      cashOnHand: january.cashOnHand + 60000 - 80000 + 5000,
    };
    previous.simulation.month = 2;
    previous.simulation.financials.cashOnHand = february.cashOnHand;
    previous.simulation.financialHistory = [january, february];
    storage.setItem(SECOND_SESSION_STORAGE_KEY, JSON.stringify(previous));

    const store = new SessionStore(storage);
    const history = store.getSnapshot().snapshot.simulation.financialHistory;
    expect(history[0]).toMatchObject({
      openingCash: null, recurringCashExpensesPaid: null, cashMovements: [], isOpeningSnapshot: true,
    });
    expect(history[1]).toMatchObject({
      openingCash: 250000, recurringCashExpensesPaid: 80000,
      cashMovements: [{ kind: 'unclassified', amount: 5000 }],
      oneTimeOperatingExpenses: 0, isOpeningSnapshot: false,
    });
    store.initializeStorage();
    expect(storage.getItem(SECOND_SESSION_STORAGE_KEY)).toBeNull();
    const upgraded = JSON.parse(storage.getItem(SESSION_STORAGE_KEY));
    expect(upgraded.version).toBe(4);
    expect(parseSession(JSON.stringify(upgraded))?.simulation.financialHistory[1].cashMovements).toEqual([
      { kind: 'unclassified', amount: 5000 },
    ]);
  });

  test('migrates V3 without inventing tax debt and expires its pending tax quote', () => {
    const storage = memoryStorage();
    const previous = removeV4TaxFields(JSON.parse(serializeSession(createFreshSession())));
    previous.version = 3;
    previous.simulation.month = 1;
    previous.simulation.year = 2027;
    previous.simulation.financialHistory[0].year = 2027;
    previous.tutorial.simulationMonthAtStart = 12;
    previous.simulation.inbox = [{
      id: 'old-tax', type: 'request', title: 'Quarterly Tax Planning', description: 'Old estimate',
      urgency: 'medium', requiresAction: true, read: false,
      choices: [{ id: 'pay-taxes', label: 'Pay estimate', effect: 'Cash decreases' }],
      timestamp: '2026-12-31T12:00:00.000Z',
      scenario: { kind: 'tax-planning', estimatedTax: 5000 },
    }];
    storage.setItem(PREVIOUS_SESSION_STORAGE_KEY, JSON.stringify(previous));

    const store = new SessionStore(storage);
    const snapshot = store.getSnapshot().snapshot;
    expect(snapshot.simulation.taxPosition).toEqual({ principalDue: 0, penaltiesDue: 0 });
    expect(snapshot.simulation.financialHistory[0]).toMatchObject({ taxExpense: 0, taxPenalty: 0 });
    expect(snapshot.simulation.inbox[0]).toMatchObject({
      read: true, requiresAction: false, resolution: { choiceId: 'expired' },
    });
    expect(snapshot.simulation.inbox[0].resolution.summary).toContain('no payable balance');
    expect(snapshot.tutorial.simulationYearAtStart).toBe(2026);
    store.initializeStorage();
    expect(storage.getItem(PREVIOUS_SESSION_STORAGE_KEY)).toBeNull();
    expect(parseSession(storage.getItem(SESSION_STORAGE_KEY))?.simulation.taxPosition).toEqual({ principalDue: 0, penaltiesDue: 0 });
  });

  test('persists the monthly collections limit and loads older V4 saves without it', () => {
    const snapshot = createFreshSession();
    snapshot.simulation.lastManualCollection = { month: 1, year: 2026 };
    expect(parseSession(serializeSession(snapshot))?.simulation.lastManualCollection)
      .toEqual({ month: 1, year: 2026 });

    const priorV4 = JSON.parse(serializeSession(snapshot));
    delete priorV4.simulation.lastManualCollection;
    expect(parseSession(JSON.stringify(priorV4))?.simulation.lastManualCollection).toBeNull();

    priorV4.simulation.lastManualCollection = { month: 13, year: 2026 };
    expect(parseSession(JSON.stringify(priorV4))).toBeNull();
  });

  for (const version of [1, 2, 3]) {
    test(`funds targeted recovery after loading a V${version} save`, () => {
      const previous = removeV4TaxFields(JSON.parse(serializeSession(createFreshSession())));
      previous.version = version;
      if (version === 1) delete previous.simulation.receivables;
      if (version < 3) previous.simulation.financialHistory = previous.simulation.financialHistory.map(removeV3CashFields);

      const migrated = parseSession(JSON.stringify(previous));
      expect(migrated).not.toBeNull();
      expect(getStaffRecoveryQuote(migrated.simulation, 'targeted')).toMatchObject({
        cost: 1000, canFund: true,
      });
      const funded = fundStaffRecovery(migrated.simulation, 'targeted');
      const reloaded = parseSession(serializeSession({ ...migrated, simulation: funded }));
      expect(reloaded).not.toBeNull();
      expect(reloaded.simulation.financialHistory.at(-1).cashMovements)
        .toContainEqual({ kind: 'staff-recovery', amount: -1000 });
      expect(getStaffRecoveryQuote(reloaded.simulation).alreadyFunded).toBe(true);
    });
  }

  test('does not discard older saves when the V4 write fails', () => {
    const previous = removeV4TaxFields(JSON.parse(serializeSession(createFreshSession())));
    previous.version = 2;
    previous.simulation.financialHistory = previous.simulation.financialHistory.map(removeV3CashFields);
    const values = new Map([[SECOND_SESSION_STORAGE_KEY, JSON.stringify(previous)]]);
    const storage = {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key) => { if (key === SESSION_STORAGE_KEY) throw new Error('quota'); },
      removeItem: (key) => { values.delete(key); },
    };
    const store = new SessionStore(storage);
    store.initializeStorage();
    expect(values.has(SECOND_SESSION_STORAGE_KEY)).toBe(true);
    expect(store.getSnapshot().notice).toContain('storage is unavailable');
  });

  test('a corrupt V4 save cannot silently restore a stale V2 save', () => {
    const storage = memoryStorage();
    storage.setItem(SESSION_STORAGE_KEY, '{corrupt');
    const previous = removeV4TaxFields(JSON.parse(serializeSession(createFreshSession())));
    previous.version = 2;
    previous.simulation.month = 8;
    previous.simulation.financialHistory = previous.simulation.financialHistory.map(removeV3CashFields);
    storage.setItem(SECOND_SESSION_STORAGE_KEY, JSON.stringify(previous));
    const store = new SessionStore(storage);
    expect(store.getSnapshot().snapshot.simulation.month).toBe(1);
    expect(store.getSnapshot().notice).toContain('saved game could not be read');
  });

  test('loads one record, ignores the legacy tutorial-only record, and resets both states', () => {
    const storage = memoryStorage();
    storage.setItem(LEGACY_TUTORIAL_STORAGE_KEY, JSON.stringify({ status: 'completed' }));
    const store = new SessionStore(storage);
    store.initializeStorage();
    expect(storage.getItem(LEGACY_TUTORIAL_STORAGE_KEY)).toBeNull();

    store.setSimulation((state) => ({ ...state, month: 2 }));
    store.setTutorial((state) => ({ ...state, status: 'in_progress', currentStepIndex: 4 }));
    const persisted = loadSession(storage);
    expect(persisted.status).toBe('loaded');
    if (persisted.status !== 'loaded') throw new Error('Expected saved session');
    expect(persisted.snapshot.simulation.month).toBe(2);
    expect(persisted.snapshot.tutorial.currentStepIndex).toBe(4);

    const reloaded = new SessionStore(storage);
    expect(reloaded.getSnapshot().snapshot.simulation.month).toBe(2);
    expect(reloaded.getSnapshot().snapshot.tutorial.currentStepIndex).toBe(4);

    reloaded.newGame();
    expect(reloaded.getSnapshot().snapshot.simulation.month).toBe(1);
    expect(reloaded.getSnapshot().snapshot.simulation.financialHistory[0].cashMovements).toEqual([]);
    expect(reloaded.getSnapshot().snapshot.tutorial.status).toBe('not_started');
    expect(loadSession(storage).status).toBe('loaded');
    expect(storage.values.has(SESSION_STORAGE_KEY)).toBe(true);
  });

  test('explicit New Game case mode replaces both saved firm and tutorial atomically', () => {
    const storage = memoryStorage();
    const store = new SessionStore(storage);
    store.setSimulation(state => ({ ...state, month: 6 }));
    store.setTutorial(state => ({ ...state, status: 'completed', showWelcomeModal: false }));
    const stillFree = new SessionStore(storage).getSnapshot().snapshot;
    expect(stillFree.simulation.month).toBe(6);
    expect(stillFree.simulation.authoredCase).toBeNull();

    store.newGame('case');
    const started = store.getSnapshot().snapshot;
    expect(started.simulation).toMatchObject({ month: 1, year: 2026,
      authoredCase: { status: 'active', renewalOutcome: null } });
    expect(started.simulation.clients.find(client => client.id === 'client1').contractMonthsRemaining).toBe(3);
    expect(started.simulation.inbox.filter(message => message.id === 'case-2026-01-collection')).toHaveLength(1);
    expect(started.tutorial).toMatchObject({ status: 'skipped', showWelcomeModal: false });
    expect(new SessionStore(storage).getSnapshot().snapshot.simulation.authoredCase.status).toBe('active');
  });

  test('starts fresh with a notice when save data is corrupt or storage fails', () => {
    const corruptStorage = memoryStorage();
    corruptStorage.setItem(SESSION_STORAGE_KEY, '{corrupt');
    const corrupt = new SessionStore(corruptStorage);
    expect(corrupt.getSnapshot().snapshot.simulation.month).toBe(1);
    expect(corrupt.getSnapshot().notice).toContain('saved game could not be read');

    const blocked = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    };
    const unavailable = new SessionStore(blocked);
    unavailable.setSimulation((state) => ({ ...state, month: 2 }));
    expect(unavailable.getSnapshot().snapshot.simulation.month).toBe(2);
    expect(unavailable.getSnapshot().notice).toContain('storage is unavailable');
    unavailable.dismissNotice();
    expect(unavailable.getSnapshot().notice).toBeNull();
    unavailable.setSimulation((state) => ({ ...state, month: 3 }));
    expect(unavailable.getSnapshot().notice).toBeNull();
  });
});
