import { describe, expect, test } from 'bun:test';
import { SessionStore } from '@/context/SessionContext';
import {
  createFreshSession, LEGACY_TUTORIAL_STORAGE_KEY, loadSession, parseSession,
  serializeSession, SESSION_STORAGE_KEY, PREVIOUS_SESSION_STORAGE_KEY, FIRST_SESSION_STORAGE_KEY,
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

describe('versioned game save', () => {
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

  test('rejects wrong versions and malformed nested data', () => {
    const valid = JSON.parse(serializeSession(createFreshSession()));
    expect(parseSession(JSON.stringify({ ...valid, version: 4 }))).toBeNull();
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
    const previous = JSON.parse(serializeSession(createFreshSession()));
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

  test('migrates V2 cash differences as unclassified and retires its key after a V3 save', () => {
    const storage = memoryStorage();
    const previous = JSON.parse(serializeSession(createFreshSession()));
    previous.version = 2;
    const january = removeV3CashFields(previous.simulation.financialHistory[0]);
    const february = {
      ...january, month: 2, collections: 60000, expenses: 80000,
      cashOnHand: january.cashOnHand + 60000 - 80000 + 5000,
    };
    previous.simulation.month = 2;
    previous.simulation.financials.cashOnHand = february.cashOnHand;
    previous.simulation.financialHistory = [january, february];
    storage.setItem(PREVIOUS_SESSION_STORAGE_KEY, JSON.stringify(previous));

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
    expect(storage.getItem(PREVIOUS_SESSION_STORAGE_KEY)).toBeNull();
    const upgraded = JSON.parse(storage.getItem(SESSION_STORAGE_KEY));
    expect(upgraded.version).toBe(3);
    expect(parseSession(JSON.stringify(upgraded))?.simulation.financialHistory[1].cashMovements).toEqual([
      { kind: 'unclassified', amount: 5000 },
    ]);
  });

  test('does not discard older saves when the V3 write fails', () => {
    const previous = JSON.parse(serializeSession(createFreshSession()));
    previous.version = 2;
    previous.simulation.financialHistory = previous.simulation.financialHistory.map(removeV3CashFields);
    const values = new Map([[PREVIOUS_SESSION_STORAGE_KEY, JSON.stringify(previous)]]);
    const storage = {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key) => { if (key === SESSION_STORAGE_KEY) throw new Error('quota'); },
      removeItem: (key) => { values.delete(key); },
    };
    const store = new SessionStore(storage);
    store.initializeStorage();
    expect(values.has(PREVIOUS_SESSION_STORAGE_KEY)).toBe(true);
    expect(store.getSnapshot().notice).toContain('storage is unavailable');
  });

  test('a corrupt V3 save cannot silently restore a stale V2 save', () => {
    const storage = memoryStorage();
    storage.setItem(SESSION_STORAGE_KEY, '{corrupt');
    const previous = JSON.parse(serializeSession(createFreshSession()));
    previous.version = 2;
    previous.simulation.month = 8;
    previous.simulation.financialHistory = previous.simulation.financialHistory.map(removeV3CashFields);
    storage.setItem(PREVIOUS_SESSION_STORAGE_KEY, JSON.stringify(previous));
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
