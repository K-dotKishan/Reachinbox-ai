"use client";

import { useRef, useCallback, useEffect } from "react";
import { useCompose } from "@/hooks/useCompose";
import Spinner from "./ui/Spinner";

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
}

export default function ComposeModal({
  isOpen,
  onClose,
  onScheduled,
}: ComposeModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { form, submitting, updateField, handleFileUpload, reset, submit, recipientCount } =
    useCompose(() => {
      onScheduled();
      onClose();
    });

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    // Reset input so same file can be re-uploaded
    e.target.value = "";
  };

  if (!isOpen) return null;

  // Min scheduledAt = now (rounded to next minute)
  const minDateTime = new Date(Math.ceil(Date.now() / 60000) * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="compose-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Panel */}
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="compose-modal-title" className="text-lg font-semibold text-gray-900">
            Compose Email
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-5">

          {/* CSV Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipients (CSV / TXT)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                className="sr-only"
                onChange={handleFileChange}
                aria-label="Upload CSV or TXT file with email addresses"
              />
              {recipientCount > 0 ? (
                <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
                  {recipientCount} valid email{recipientCount !== 1 ? "s" : ""} found
                </span>
              ) : (
                <span className="text-sm text-gray-400">
                  No emails detected yet
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Accepts .csv or .txt — emails are extracted automatically
            </p>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="subject"
              type="text"
              value={form.subject}
              onChange={(e) => updateField("subject", e.target.value)}
              placeholder="Your email subject"
              maxLength={998}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Body */}
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
              Body <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <textarea
              id="body"
              rows={6}
              value={form.body}
              onChange={(e) => updateField("body", e.target.value)}
              placeholder="Write your email body here…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              required
            />
          </div>

          {/* Schedule Date & Time */}
          <div>
            <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-1">
              Schedule Date &amp; Time <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="scheduledAt"
              type="datetime-local"
              value={form.scheduledAt}
              min={minDateTime}
              onChange={(e) => updateField("scheduledAt", e.target.value ? new Date(e.target.value).toISOString() : "")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Delay & Hourly Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="delayBetweenMs" className="block text-sm font-medium text-gray-700 mb-1">
                Delay Between Emails (ms)
              </label>
              <input
                id="delayBetweenMs"
                type="number"
                min={0}
                step={500}
                value={form.delayBetweenMs}
                onChange={(e) =>
                  updateField("delayBetweenMs", Math.max(0, Number(e.target.value)))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-400">
                Milliseconds between sends (e.g. 2000 = 2s)
              </p>
            </div>

            <div>
              <label htmlFor="hourlyLimit" className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Limit
              </label>
              <input
                id="hourlyLimit"
                type="number"
                min={1}
                max={1000}
                value={form.hourlyLimit}
                onChange={(e) =>
                  updateField("hourlyLimit", Math.max(1, Number(e.target.value)))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-400">
                Max emails sent per hour per sender
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={submitting || recipientCount === 0}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Spinner size="sm" />
                Scheduling…
              </>
            ) : (
              <>
                Schedule
                {recipientCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                    {recipientCount}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
