"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getToken } from "@/services/api";
import Spinner from "@/components/ui/Spinner";
import LoginClient from "./login/LoginClient";

export default function HomeClient() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && getToken()) {
      // Only redirect to dashboard if token is present AND user is loaded
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user && getToken()) return null;

  return <LoginClient />;
}
