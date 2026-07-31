"use client";

import { Email } from "@/types";
import Badge from "./ui/Badge";
import Spinner from "./ui/Spinner";
import EmptyState from "./ui/EmptyState";
import ErrorMessage from "./ui/ErrorMessage";
import { format } from "date-fns";

interface EmailTableProps {
  emails: Email[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  type: "scheduled" | "sent";
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return format(new Date(dateStr), "MMM d, yyyy h:mm a");
  } catch {
    return "—";
  }
}

export default function EmailTable({
  emails,
  loading,
  error,
  onRetry,
  type,
}: EmailTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  if (emails.length === 0) {
    return (
      <EmptyState
        title={
          type === "scheduled"
            ? "No scheduled emails"
            : "No sent emails yet"
        }
        description={
          type === "scheduled"
            ? "Use the Compose button to schedule your first email."
            : "Sent emails will appear here once delivered."
        }
        icon={
          <svg className="h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide text-xs">
              Recipient
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide text-xs">
              Subject
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide text-xs">
              {type === "scheduled" ? "Scheduled Time" : "Sent Time"}
            </th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wide text-xs">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {emails.map((email) => (
            <tr key={email.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-900 font-medium max-w-[200px] truncate">
                {email.recipient}
              </td>
              <td className="px-4 py-3 text-gray-700 max-w-[260px] truncate">
                {email.subject}
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {type === "scheduled"
                  ? formatDate(email.scheduledAt)
                  : formatDate(email.sentAt)}
              </td>
              <td className="px-4 py-3">
                <Badge status={email.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
