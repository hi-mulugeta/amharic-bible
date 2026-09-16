import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { request, setAccessToken, setOnUnauthorized } from "@/api/client";
import type {
  UserOut,
  TokenOut,
  UserLogin,
  UserRegister,
} from "@/api/queries/auth";

const ACCESS_KEY = "catena.access_token";
const REFRESH_KEY = "catena.refresh_token";

type AuthContextValue = {
  user: UserOut | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: UserLogin) => Promise<UserOut>;
  register: (payload: UserRegister) => Promise<UserOut>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const qc = useQueryClient();

  // Clear all auth state
  const clearAuth = useCallback(() => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    setAccessToken(null);
    setUser(null);
    qc.removeQueries({ queryKey: ["auth"] });
  }, [qc]);

  // On mount: if we have a token, verify it and load the user
  useEffect(() => {
    const token = localStorage.getItem(ACCESS_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    setAccessToken(token);

    request<UserOut>("/api/auth/me")
      .then((u) => setUser(u))
      .catch(() => clearAuth())
      .finally(() => setIsLoading(false));
  }, [clearAuth]);

  // Wire the client's 401 handler to attempt a refresh
  useEffect(() => {
    setOnUnauthorized(async () => {
      const refreshToken = localStorage.getItem(REFRESH_KEY);
      if (!refreshToken) {
        clearAuth();
        return null;
      }
      try {
        const { access_token } = await request<{ access_token: string }>(
          "/api/auth/refresh",
          {
            method: "POST",
            query: { refresh_token: refreshToken },
          },
        );
        localStorage.setItem(ACCESS_KEY, access_token);
        setAccessToken(access_token);
        return access_token;
      } catch {
        clearAuth();
        return null;
      }
    });
    return () => setOnUnauthorized(null);
  }, [clearAuth]);

  const login = useCallback(async (payload: UserLogin) => {
    const data = await request<TokenOut>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    localStorage.setItem(ACCESS_KEY, data.access_token);
    localStorage.setItem(REFRESH_KEY, data.refresh_token);
    setAccessToken(data.access_token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload: UserRegister) => {
    const data = await request<TokenOut>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    localStorage.setItem(ACCESS_KEY, data.access_token);
    localStorage.setItem(REFRESH_KEY, data.refresh_token);
    setAccessToken(data.access_token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
