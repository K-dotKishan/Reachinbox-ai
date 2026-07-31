"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useScheduledEmails, useSentEmails } from "@/hooks/useEmails";
import { saveToken } from "@/services/api";
import Header from "@/components/Header";
import EmailTable from "@/components/EmailTable";
import ComposeModal from "@/components/ComposeModal";
import Spinner from "@/components/ui/Spinner";

type Tab = "scheduled" | "sent";

export default function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, logout, refetch } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("scheduled");
  const [composeOpen, setComposeOpen] = useState(false);
  // Track whether we're in the middle of processing the OAuth token
  const [tokenProcessed, setTokenProcessed] = useState(false);

  const scheduled = useScheduledEmails();
  const sent = useSentEmails();

  // Step 1: Extract and save JWT token from URL on first mount
  const tokenRef = useRef(false);
  useEffect(() => {
    if (tokenRef.current) return;
    tokenRef.current = true;

    const token = searchParams.get("token");
    if (token) {
      // Save token to localStorage BEFORE anything else
      saveToken(token);
      // Fetch user with the new token
      refetch().then(() => {
        // Clean the URL after user is loaded
        router.replace("/dashboard");
        setTokenProcessed(true);
      });
    } else {
      setTokenProcessed(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Step 2: Only redirect to login after token is processed AND user is null
  useEffect(() => {
    if (!tokenProcessed) return; // wait for token processing
    if (!authLoading && !user) {
      router.replace("/");
    }
  }, [user, authLoading, router, tokenProcessed]);

  // Fetch data when tab changes
  useEffect(() => {
    if (!user) return;
    if (activeTab === "scheduled") {
      scheduled.refetch();
    } else {
      sent.refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  const handleScheduled = useCallback(() => {
    scheduled.refetch();
    setActiveTab("scheduled");
  }, [scheduled]);

  // Show spinner while auth is loading or token is being processed
  if (authLoading || !tokenProcessed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={logout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page heading + Compose button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your scheduled and sent emails
            </p>
          </div>
          <button
            onClick={() => setComposeOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Compose Email
          </button>
        </div>

        {/* Tab bar */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex gap-6" aria-label="Email tabs">
            {(["scheduled", "sent"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                aria-current={activeTab === tab ? "page" : undefined}
              >
                {tab === "scheduled" ? "Scheduled Emails" : "Sent Emails"}
                {tab === "scheduled" && scheduled.emails.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {scheduled.emails.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Table */}
        {activeTab === "scheduled" ? (
          <EmailTable
            emails={scheduled.emails}
            loading={scheduled.loading}
            error={scheduled.error}
            onRetry={scheduled.refetch}
            type="scheduled"
          />
        ) : (
          <EmailTable
            emails={sent.emails}
            loading={sent.loading}
            error={sent.error}
            onRetry={sent.refetch}
            type="sent"
          />
        )}
      </main>

      <ComposeModal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        onScheduled={handleScheduled}
      />
    </div>
  );
}
