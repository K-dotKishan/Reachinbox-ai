import { Suspense } from "react";
import DashboardClient from "./DashboardClient";
import Spinner from "@/components/ui/Spinner";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Spinner size="lg" />
        </div>
      }
    >
      <DashboardClient />
    </Suspense>
  );
}
