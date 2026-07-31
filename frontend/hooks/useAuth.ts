"use client";

import { useState, useEffect, useCallback } from "react";
import { authApi, getToken } from "@/services/api";
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
    // Don't even try if there's no token and no session
    const token = getToken();
    if (!token) {
      // Still try — might have a session cookie in local dev
      try {
        const user = await authApi.getMe();
        setState({ user, loading: false, error: null });
      } catch {
        setState({ user: null, loading: false, error: null });
      }
      return;
    }

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
    } catch {
      // ignore logout errors
    } finally {
      setState({ user: null, loading: false, error: null });
      window.location.href = "/";
    }
  }, []);

  return { ...state, logout, refetch: fetchUser };
}
