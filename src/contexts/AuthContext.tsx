import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { UserRole } from "@/components/resume/types";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLocalUser: boolean;
  userRole: UserRole;
  signInLocal: (email: string, password: string) => Promise<void>;
  signUpLocal: (email: string, password: string, role: UserRole, autoLogin?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
}

const LOCAL_ACCOUNTS_KEY = "inkwell_local_accounts";
const LOCAL_SESSION_KEY = "inkwell_local_session";

type LocalAccount = {
  id: string;
  email: string;
  password: string;
  role: UserRole;
};

const makeLocalId = (email: string) => `local-${btoa(email.toLowerCase()).replace(/[^a-z0-9]/gi, "")}`;

const makeLocalUser = (email: string, id = makeLocalId(email)) =>
  ({
    id,
    email,
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
  }) as User;

const readAccounts = (): LocalAccount[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ACCOUNTS_KEY) ?? "[]") as LocalAccount[];
  } catch {
    return [];
  }
};

const writeAccounts = (accounts: LocalAccount[]) => {
  localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  isLocalUser: false,
  userRole: "college_student",
  signInLocal: async () => {},
  signUpLocal: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [localRole, setLocalRole] = useState<UserRole>("college_student");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreLocalUser = () => {
      const saved = localStorage.getItem(LOCAL_SESSION_KEY);
      if (!saved) return null;
      try {
        const account = JSON.parse(saved) as Pick<LocalAccount, "id" | "email">;
        setLocalRole(account.role ?? "college_student");
        return makeLocalUser(account.email, account.id);
      } catch {
        localStorage.removeItem(LOCAL_SESSION_KEY);
        return null;
      }
    };

    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) setLocalUser(null);
      setLoading(false);
    });
    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (!s) setLocalUser(restoreLocalUser());
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUpLocal = async (email: string, password: string, role: UserRole, autoLogin = true) => {
    const normalizedEmail = email.trim().toLowerCase();
    const accounts = readAccounts();
    const existing = accounts.find((a) => a.email === normalizedEmail);
    const account = existing ?? { id: makeLocalId(normalizedEmail), email: normalizedEmail, password, role };
    if (existing) {
      existing.password = password;
      existing.role = role;
      writeAccounts(accounts);
    } else {
      writeAccounts([...accounts, account]);
    }
    if (autoLogin) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ id: account.id, email: account.email, role: account.role }));
      setSession(null);
      setLocalRole(account.role);
      setLocalUser(makeLocalUser(account.email, account.id));
    }
  };

  const signInLocal = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const account = readAccounts().find((a) => a.email === normalizedEmail && a.password === password);
    if (!account) throw new Error("Invalid email or password");
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ id: account.id, email: account.email, role: account.role }));
    setSession(null);
    setLocalRole(account.role ?? "college_student");
    setLocalUser(makeLocalUser(account.email, account.id));
  };

  const signOut = async () => {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setLocalUser(null);
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? localUser,
        session,
        loading,
        isLocalUser: !session && !!localUser,
        userRole: ((session?.user.user_metadata?.user_role as UserRole | undefined) ?? localRole),
        signInLocal,
        signUpLocal,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
