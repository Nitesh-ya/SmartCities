import { useEffect, useState, useSyncExternalStore } from "react";
import { MOCK_ISSUES, type Issue, type Role, type Department, STATUS_ORDER } from "./mock-data";

// ---------- Issues store (in-memory, broadcasts changes) ----------
let issues: Issue[] = [...MOCK_ISSUES];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const issuesStore = {
  getAll: () => issues,
  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  add: (issue: Issue) => {
    issues = [issue, ...issues];
    emit();
  },
  update: (id: string, patch: Partial<Issue>) => {
    issues = issues.map((i) => (i.id === id ? { ...i, ...patch } : i));
    emit();
  },
  advanceStatus: (id: string) => {
    const i = issues.find((x) => x.id === id);
    if (!i) return;
    const idx = STATUS_ORDER.indexOf(i.status);
    if (idx < STATUS_ORDER.length - 1) {
      issuesStore.update(id, { status: STATUS_ORDER[idx + 1] });
    }
  },
};

export function useIssues() {
  return useSyncExternalStore(
    (cb) => {
      const u = issuesStore.subscribe(cb);
      return () => { u; };
    },
    () => issues,
    () => issues,
  );
}

// ---------- Auth (mock, localStorage) ----------
export type Session = {
  role: Role;
  name: string;
  id: string;
  department?: Department;
  area?: string;
};

const SESSION_KEY = "civic.session";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(s: Session | null) {
  if (typeof window === "undefined") return;
  if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event("civic.session"));
}

export function useSession() {
  const [s, setS] = useState<Session | null>(null);
  useEffect(() => {
    setS(getSession());
    const h = () => setS(getSession());
    window.addEventListener("civic.session", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("civic.session", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return s;
}
