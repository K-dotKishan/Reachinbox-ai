"use client";

import { useState, useCallback } from "react";
import { emailApi } from "@/services/api";
import { Email } from "@/types";

interface EmailsState {
  emails: Email[];
  loading: boolean;
  error: string | null;
}

export function useScheduledEmails() {
  const [state, setState] = useState<EmailsState>({
    emails: [],
    loading: false,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const emails = await emailApi.getScheduled();
      setState({ emails, loading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load emails";
      setState({ emails: [], loading: false, error: msg });
    }
  }, []);

  return { ...state, refetch: fetch };
}

export function useSentEmails() {
  const [state, setState] = useState<EmailsState>({
    emails: [],
    loading: false,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const emails = await emailApi.getSent();
      setState({ emails, loading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load emails";
      setState({ emails: [], loading: false, error: msg });
    }
  }, []);

  return { ...state, refetch: fetch };
}
