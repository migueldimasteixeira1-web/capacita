import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { UserAccount } from "@/domain/types";
import { findUserByRegistrationOrCpf, setUserPassword } from "@/services/capacitaActions";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { hashPassword, verifyPassword } from "@/lib/password";
import { validateInstitutionalIdentity } from "@/domain/rules";
import { ROUTES } from "@/constants/routes";
import {
  canAccessAdminArea,
  canAccessInstructorArea,
  canAccessParticipantArea,
} from "./permissions";

const SESSION_KEY = "capacita-session-v1";
const SESSION_MS = 30 * 60 * 1000;

type SessionPayload = { userId: string; expiresAt: number };

function loadSession(): SessionPayload | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as SessionPayload;
    if (!p.userId || !p.expiresAt) return null;
    if (Date.now() > p.expiresAt) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

function saveSession(p: SessionPayload | null) {
  if (!p) sessionStorage.removeItem(SESSION_KEY);
  else sessionStorage.setItem(SESSION_KEY, JSON.stringify(p));
}

type AuthContextValue = {
  user: UserAccount | null;
  loading: boolean;
  login: (
    identifier: string,
    password: string
  ) => Promise<{ ok: true; user: UserAccount } | { ok: false; message: string }>;
  logout: (redirectTo?: string) => void;
  completeFirstAccess: (
    registrationNumber: string,
    cpf: string,
    birthDate: string,
    newPassword: string
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  pingSession: () => void;
  isSessionValid: () => boolean;
  postLoginRoute: (u: UserAccount) => string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function resolvePostLoginRoute(u: UserAccount): string {
  if (canAccessAdminArea(u)) return ROUTES.admin.root;
  if (canAccessInstructorArea(u)) return ROUTES.instructor.home;
  if (canAccessParticipantArea(u)) return ROUTES.portal.home;
  return ROUTES.access.denied;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const users = useCapacitaSelector((s) => s.users);
  const usersById = useMemo(() => Object.fromEntries(users.map((x) => [x.id, x])), [users]);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef<UserAccount | null>(null);
  userRef.current = user;

  const applySession = useCallback(
    (userId: string | null) => {
      if (!userId) {
        setUser(null);
        saveSession(null);
        return;
      }
      const u = usersById[userId];
      if (!u) {
        setUser(null);
        saveSession(null);
        return;
      }
      const expiresAt = Date.now() + SESSION_MS;
      saveSession({ userId, expiresAt });
      setUser(u);
    },
    [usersById]
  );

  useEffect(() => {
    const s = loadSession();
    if (s) applySession(s.userId);
    setLoading(false);
  }, [applySession]);

  useEffect(() => {
    const s = loadSession();
    if (!s?.userId) return;
    const u = usersById[s.userId];
    if (u) setUser(u);
  }, [usersById]);

  useEffect(() => {
    const tick = () => {
      const s = loadSession();
      if (userRef.current && (!s || Date.now() > s.expiresAt)) {
        saveSession(null);
        setUser(null);
      }
    };
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const pingSession = useCallback(() => {
    const s = loadSession();
    if (!s || !userRef.current) return;
    saveSession({ userId: s.userId, expiresAt: Date.now() + SESSION_MS });
  }, []);

  const isSessionValid = useCallback(() => {
    const s = loadSession();
    return !!(s && Date.now() <= s.expiresAt && userRef.current);
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const u = findUserByRegistrationOrCpf(identifier);
      if (!u || !u.passwordHash) {
        return { ok: false as const, message: "Matrícula/CPF ou senha incorretos." };
      }
      const ok = await verifyPassword(password, u.passwordHash);
      if (!ok) return { ok: false as const, message: "Matrícula/CPF ou senha incorretos." };
      applySession(u.id);
      return { ok: true as const, user: u };
    },
    [applySession]
  );

  const logout = useCallback((redirectTo?: string) => {
    saveSession(null);
    setUser(null);
    if (redirectTo && typeof window !== "undefined") {
      window.location.href = redirectTo;
    }
  }, []);

  const completeFirstAccess = useCallback(
    async (registrationNumber: string, cpf: string, birthDate: string, newPassword: string) => {
      const u = findUserByRegistrationOrCpf(registrationNumber.trim());
      if (!u) return { ok: false as const, message: "Dados não conferem com a base institucional." };
      if (u.firstAccessCompleted && u.passwordHash) {
        return { ok: false as const, message: "Primeiro acesso já concluído. Utilize o login." };
      }
      if (!validateInstitutionalIdentity(u, cpf, birthDate)) {
        return { ok: false as const, message: "Validação de identidade não confere." };
      }
      if (newPassword.length < 8) {
        return { ok: false as const, message: "Senha deve ter no mínimo 8 caracteres." };
      }
      const h = await hashPassword(newPassword);
      setUserPassword(u.id, h);
      applySession(u.id);
      return { ok: true as const };
    },
    [applySession]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      logout,
      completeFirstAccess,
      pingSession,
      isSessionValid,
      postLoginRoute: resolvePostLoginRoute,
    }),
    [user, loading, login, logout, completeFirstAccess, pingSession, isSessionValid]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fora do AuthProvider");
  return ctx;
}
