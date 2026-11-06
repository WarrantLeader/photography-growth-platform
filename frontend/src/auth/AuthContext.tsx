import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Provider } from "@supabase/supabase-js";
import { authClient, isProviderConfigured } from "./client";
interface AuthContextType {
  user: string | null;
  userId: string | null;
  loading: boolean;
  demo: boolean;
  login: (email: string) => boolean;
  logout: () => void;
  signIn: (provider: Provider) => Promise<void>;
  providerReady: (provider: Provider) => boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  createAccount: (email: string, password: string) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}
const Context = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null),
    [userId, U] = useState<string | null>(null),
    [loading, L] = useState(!!authClient),
    [demo, D] = useState(false);
  useEffect(() => {
    if (!authClient) {
      L(false);
      return;
    }
    let alive = true;
    authClient.auth.getSession().then(({ data, error }) => {
      if (!alive) return;
      setUser(
        error
          ? null
          : data.session?.user.email || data.session?.user.id || null,
      );
      U(error ? null : data.session?.user.id || null);
      L(false);
    });
    const {
      data: { subscription },
    } = authClient.auth.onAuthStateChange((_event, session) => {
      if (!alive) return;
      setUser(session?.user.email || session?.user.id || null);
      U(session?.user.id || null);
      D(false);
      L(false);
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);
  function login() {
    if (authClient) return false;
    setUser("Demo workspace");
    U("demo");
    D(true);
    return true;
  }
  async function signIn(provider: Provider) {
    if (!authClient || !isProviderConfigured(provider))
      throw Error(
        "This sign-in provider needs to be connected by the workspace owner.",
      );
    const { error } = await authClient.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + "/login",
        scopes: provider === "azure" ? "email" : undefined,
      },
    });
    if (error) throw error;
  }
  async function signInWithPassword(email: string, password: string) {
    if (!authClient) throw Error("Authentication is not configured.");
    const { error } = await authClient.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  }
  async function createAccount(email: string, password: string) {
    if (!authClient) throw Error("Authentication is not configured.");
    const { data, error } = await authClient.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + "/login" },
    });
    if (error) throw error;
    return !!data.session;
  }
  async function sendPasswordReset(email: string) {
    if (!authClient) throw Error("Authentication is not configured.");
    const { error } = await authClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    if (error) throw error;
  }
  async function updatePassword(password: string) {
    if (!authClient) throw Error("Authentication is not configured.");
    const { error } = await authClient.auth.updateUser({ password });
    if (error) throw error;
  }
  async function logout() {
    if (authClient) {
      const { error } = await authClient.auth.signOut();
      if (error) return;
    }
    setUser(null);
    U(null);
    D(false);
  }
  return (
    <Context.Provider
      value={{
        user,
        userId,
        loading,
        demo,
        login,
        logout,
        signIn,
        providerReady: isProviderConfigured,
        signInWithPassword,
        createAccount,
        sendPasswordReset,
        updatePassword,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAuth() {
  return useContext(Context);
}
