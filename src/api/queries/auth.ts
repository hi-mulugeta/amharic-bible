// Auth queries — stub for Tier 1
export {};
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "@/api/client";

// ---------- Types ----------

export type UserOut = {
  id: number;
  email: string;
  username: string;
  display_name_am: string | null;
  role: "reader" | "contributor" | "admin";
  preferred_language: string;
  created_at: string;
};

export type TokenOut = {
  user: UserOut;
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type UserRegister = {
  email: string;
  username: string;
  password: string;
  display_name_am?: string | null;
};

export type UserLogin = {
  email: string;
  password: string;
};

// ---------- Keys ----------

export const authKeys = {
  me: ["auth", "me"] as const,
};

// ---------- Queries & mutations ----------

export function useMe(opts?: { enabled?: boolean }) {
  return useQuery({
    enabled: opts?.enabled ?? true,
    queryKey: authKeys.me,
    queryFn: () => request<UserOut>("/api/auth/me"),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserLogin) =>
      request<TokenOut>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      // Prime the cache so the header updates instantly
      qc.setQueryData(authKeys.me, data.user);
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserRegister) =>
      request<TokenOut>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      qc.setQueryData(authKeys.me, data.user);
    },
  });
}
