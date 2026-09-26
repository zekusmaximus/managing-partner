"use client";

import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import type { SimulationState } from '@/types/simulation';
import type { TutorialState } from '@/lib/session/tutorialState';
import {
  createFreshSession, FIRST_SESSION_STORAGE_KEY, LEGACY_TUTORIAL_STORAGE_KEY, PREVIOUS_SESSION_STORAGE_KEY, loadSession,
  saveSession, type SessionSnapshot, type SessionStorage,
} from '@/lib/session/save';

interface SessionView {
  snapshot: SessionSnapshot;
  notice: string | null;
}

const UNAVAILABLE_NOTICE = 'Browser storage is unavailable. Progress will last only until this tab closes.';
const INVALID_NOTICE = 'The saved game could not be read. A new game has started.';

export class SessionStore {
  private view: SessionView;
  private listeners = new Set<() => void>();
  private storageNoticeDismissed = false;

  constructor(private storage: SessionStorage | null, storageUnavailable = false) {
    const loaded = storage ? loadSession(storage) : { status: 'unavailable' as const };
    this.view = {
      snapshot: loaded.status === 'loaded' ? loaded.snapshot : createFreshSession(),
      notice: storageUnavailable || loaded.status === 'unavailable' ? UNAVAILABLE_NOTICE
        : loaded.status === 'invalid' ? INVALID_NOTICE : null,
    };
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): SessionView => this.view;

  private publish(view: SessionView): void {
    this.view = view;
    this.listeners.forEach((listener) => listener());
  }

  private commit(snapshot: SessionSnapshot): void {
    const saved = this.storage !== null && saveSession(this.storage, snapshot);
    if (saved) this.storageNoticeDismissed = false;
    this.publish({
      snapshot,
      notice: saved || this.storageNoticeDismissed ? null : UNAVAILABLE_NOTICE,
    });
  }

  setSimulation: Dispatch<SetStateAction<SimulationState>> = (action) => {
    const current = this.view.snapshot.simulation;
    const simulation = typeof action === 'function' ? action(current) : action;
    if (simulation === current) return;
    this.commit({ ...this.view.snapshot, simulation });
  };

  setTutorial: Dispatch<SetStateAction<TutorialState>> = (action) => {
    const current = this.view.snapshot.tutorial;
    const tutorial = typeof action === 'function' ? action(current) : action;
    if (tutorial === current) return;
    this.commit({ ...this.view.snapshot, tutorial });
  };

  newGame = (): void => {
    this.commit(createFreshSession());
  };

  dismissNotice = (): void => {
    if (!this.view.notice) return;
    if (this.view.notice === UNAVAILABLE_NOTICE) this.storageNoticeDismissed = true;
    this.publish({ ...this.view, notice: null });
  };

  // Called after hydration, so render never mutates browser storage.
  initializeStorage = (): void => {
    if (!this.storage) return;
    try {
      this.storage.removeItem(LEGACY_TUTORIAL_STORAGE_KEY);
    } catch {
      // A blocked storage API is reported by the write below.
    }
    if (saveSession(this.storage, this.view.snapshot)) {
      for (const oldKey of [PREVIOUS_SESSION_STORAGE_KEY, FIRST_SESSION_STORAGE_KEY]) {
        try {
          this.storage.removeItem(oldKey);
        } catch {
          // The new save is already durable; old data can be ignored on the next load.
        }
      }
    } else if (!this.storageNoticeDismissed && this.view.notice !== UNAVAILABLE_NOTICE) {
      this.publish({ ...this.view, notice: UNAVAILABLE_NOTICE });
    }
  };
}

function createStore(): SessionStore {
  if (typeof window === 'undefined') return new SessionStore(null);
  try {
    return new SessionStore(window.localStorage);
  } catch {
    return new SessionStore(null, true);
  }
}

const SessionContext = createContext<SessionStore | null>(null);
const subscribeHydration = () => () => {};
const clientHydrated = () => true;
const serverHydrated = () => false;

export function SessionProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createStore);
  const hydrated = useSyncExternalStore(subscribeHydration, clientHydrated, serverHydrated);

  useEffect(() => {
    store.initializeStorage();
  }, [store]);

  return (
    <SessionContext.Provider value={store}>
      {hydrated ? children : null}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const store = useContext(SessionContext);
  if (!store) throw new Error('useSession must be used within a SessionProvider');
  const { snapshot, notice } = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return {
    simulation: snapshot.simulation,
    tutorial: snapshot.tutorial,
    setSimulation: store.setSimulation,
    setTutorial: store.setTutorial,
    newGame: store.newGame,
    notice,
    dismissNotice: store.dismissNotice,
    hydrated: true,
  };
}
