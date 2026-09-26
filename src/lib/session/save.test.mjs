import { describe, expect, test } from 'bun:test';
import { SessionStore } from '@/context/SessionContext';
import {
  createFreshSession, LEGACY_TUTORIAL_STORAGE_KEY, loadSession, parseSession,
  serializeSession, SESSION_STORAGE_KEY, PREVIOUS_SESSION_STORAGE_KEY,
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

describe('versioned game save', () => {
  test('restores simulation, tutorial, and alert/message Dates together', () => {
    const snapshot = createFreshSession();
    snapshot.simulation.month = 3;
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
    expect(parseSession(JSON.stringify({ ...valid, version: 3 }))).toBeNull();
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
    storage.setItem(PREVIOUS_SESSION_STORAGE_KEY, JSON.stringify(previous));

    const store = new SessionStore(storage);
    expect(store.getSnapshot().snapshot.simulation.receivables).toEqual([{
      clientId: null,
      clientName: 'Prior balance (unassigned)',
      paymentProfile: 'normal',
      aging: previous.simulation.arAging,
    }]);
    store.initializeStorage();
    expect(storage.getItem(PREVIOUS_SESSION_STORAGE_KEY)).toBeNull();
    expect(loadSession(storage).status).toBe('loaded');
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
