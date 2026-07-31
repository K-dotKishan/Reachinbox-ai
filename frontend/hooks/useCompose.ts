"use client";

import { useState, useCallback } from "react";
import { emailApi, composeFormToPayload, extractEmailsFromText } from "@/services/api";
import { ComposeFormValues } from "@/types";
import { toast } from "sonner";

const DEFAULT_FORM: ComposeFormValues = {
  recipients: [],
  subject: "",
  body: "",
  scheduledAt: "",
  delayBetweenMs: 2000,
  hourlyLimit: 10,
};

export function useCompose(onSuccess?: () => void) {
  const [form, setForm] = useState<ComposeFormValues>(DEFAULT_FORM);
  const [csvText, setCsvText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Parse CSV / text file for emails
  const handleFileUpload = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvText(text);
        const emails = extractEmailsFromText(text);
        setForm((prev) => ({ ...prev, recipients: emails }));
      };
      reader.readAsText(file);
    },
    []
  );

  const updateField = useCallback(
    <K extends keyof ComposeFormValues>(key: K, value: ComposeFormValues[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const reset = useCallback(() => {
    setForm(DEFAULT_FORM);
    setCsvText("");
  }, []);

  const submit = useCallback(async () => {
    if (!form.recipients.length) {
      toast.error("Add at least one recipient");
      return;
    }
    if (!form.subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    if (!form.body.trim()) {
      toast.error("Body is required");
      return;
    }
    if (!form.scheduledAt) {
      toast.error("Schedule date & time is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = composeFormToPayload(form);
      const result = await emailApi.schedule(payload);
      toast.success(`${result.scheduled} email(s) scheduled successfully`);
      reset();
      onSuccess?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to schedule emails";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }, [form, reset, onSuccess]);

  return {
    form,
    csvText,
    submitting,
    updateField,
    handleFileUpload,
    reset,
    submit,
    recipientCount: form.recipients.length,
  };
}
