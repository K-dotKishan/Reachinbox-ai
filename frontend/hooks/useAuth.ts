"use client";

import { useState, useEffect, useCallback } from "react";
import { authApi } from "@/services/api";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const fetchUser = useCallback(async () => {
    try {
      const user = await authApi.getMe();
      setState({ user, loading: false, error: null });
    } catch {
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
      setState({ user: null, loading: false, error: null });
      window.location.href = "/";
    } catch {
      setState((prev) => ({ ...prev, error: "Logout failed" }));
    }
  }, []);

  return { ...state, logout, refetch: fetchUser };
}
