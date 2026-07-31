"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

  // Prevent duplicate fetches
  const fetchingRef = useRef(false);

  const fetchUser = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const user = await authApi.getMe();
      setState({ user, loading: false, error: null });
    } catch {
      setState({ user: null, loading: false, error: null });
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchUser();
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      setState({ user: null, loading: false, error: null });
      window.location.href = "/";
    }
  }, []);

  return { ...state, logout, refetch: fetchUser };
}
