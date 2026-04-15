import { useCallback, useRef, useSyncExternalStore } from "react";
import type { AppState } from "@/domain/types";
import { createInitialState } from "@/domain/seed";

const STORAGE_KEY = "capacita-app-state-v1";

function pickArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function migrateState(rawState: unknown): { state: AppState; migrated: boolean } {
  const base = createInitialState();
  if (!rawState || typeof rawState !== "object") {
    return { state: base, migrated: false };
  }

  const source = rawState as Partial<AppState>;

  const next: AppState = {
    secretariats: pickArray(source.secretariats, base.secretariats),
    users: pickArray(source.users, base.users),
    instructors: pickArray(source.instructors, base.instructors),
    courses: pickArray(source.courses, base.courses),
    sessions: pickArray(source.sessions, base.sessions),
    enrollments: pickArray(source.enrollments, base.enrollments),
    attendance: pickArray(source.attendance, base.attendance),
    certificates: pickArray(source.certificates, base.certificates),
    documents: pickArray(source.documents, base.documents),
    audit: pickArray(source.audit, base.audit),
  };

  // Se a base estiver quebrada (sem usuários), volta ao seed íntegro.
  if (!next.users.length) {
    return { state: base, migrated: true };
  }

  const migrated =
    !Array.isArray(source.secretariats) ||
    !Array.isArray(source.users) ||
    !Array.isArray(source.instructors) ||
    !Array.isArray(source.courses) ||
    !Array.isArray(source.sessions) ||
    !Array.isArray(source.enrollments) ||
    !Array.isArray(source.attendance) ||
    !Array.isArray(source.certificates) ||
    !Array.isArray(source.documents) ||
    !Array.isArray(source.audit);

  return { state: next, migrated };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as unknown;
    const { state: migratedState, migrated } = migrateState(parsed);
    if (migrated) {
      save(migratedState);
    }
    return migratedState;
  } catch {
    return createInitialState();
  }
}

function save(s: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

let state: AppState =
  typeof window !== "undefined" ? load() : createInitialState();
const listeners = new Set<() => void>();

export function getCapacitaState(): AppState {
  return state;
}

export function setCapacitaState(updater: (prev: AppState) => AppState): void {
  state = updater(state);
  save(state);
  listeners.forEach((l) => l());
}

export function subscribeCapacita(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useCapacitaSelector<T>(selector: (s: AppState) => T): T {
  const cacheRef = useRef<{ stateRef: AppState; selected: T } | null>(null);

  const getSnapshot = useCallback(() => {
    const cached = cacheRef.current;
    if (cached && cached.stateRef === state) {
      return cached.selected;
    }
    const selected = selector(state);
    cacheRef.current = { stateRef: state, selected };
    return selected;
  }, [selector]);

  return useSyncExternalStore(
    subscribeCapacita,
    getSnapshot,
    getSnapshot
  );
}

export function resetCapacitaDemoData(): void {
  state = createInitialState();
  save(state);
  listeners.forEach((l) => l());
}

/** Para testes ou SSR */
export function _hydrateForTests(initial: AppState) {
  state = initial;
}
