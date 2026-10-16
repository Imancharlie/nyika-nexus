import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, setAuthLostHandler, tokens } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";
import { useQueryClient } from "@tanstack/react-query";

export type User = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  phoneVerified: boolean;
  region: string;
  location: string;
  language: "sw" | "en";
  avatar: string;
  isStaff: boolean;
  dateJoined: string;
};

export type AuthPayload = { access: string; refresh: string; user: User };

export type PendingVerification = {
  requiresVerification?: boolean;
  code?: string;
  phone: string;
  phoneMasked: string;
  resendIn: number;
};

type AuthValue = {
  user: User | null;
  loading: boolean;
  acceptAuth: (payload: AuthPayload) => User;
  setUser: (user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => Boolean(tokens.get()));
  const queryClient = useQueryClient();
  const { setLang } = useLanguage();

  const logout = useCallback(() => {
    tokens.set(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  const refreshUser = useCallback(async () => {
    if (!tokens.get()) return;
    try {
      setUser(await api.get<User>("/auth/me/"));
    } catch {
      tokens.set(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setAuthLostHandler(() => setUser(null));
    if (tokens.get()) refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  useEffect(() => {
    if (user?.language === "sw" || user?.language === "en") setLang(user.language);
  }, [user?.language, setLang]);

  const acceptAuth = useCallback(
    (payload: AuthPayload) => {
      tokens.set({ access: payload.access, refresh: payload.refresh });
      queryClient.clear();
      setUser(payload.user);
      return payload.user;
    },
    [queryClient],
  );

  const value = useMemo(
    () => ({ user, loading, acceptAuth, setUser, logout, refreshUser }),
    [user, loading, acceptAuth, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
