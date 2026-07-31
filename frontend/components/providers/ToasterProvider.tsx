"use client";

import dynamic from "next/dynamic";

// Dynamically import Toaster with no SSR so it never runs during
// static prerendering of Next.js internal pages (_error, 404, etc.)
const Toaster = dynamic(
  () => import("sonner").then((mod) => mod.Toaster),
  { ssr: false }
);

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: "8px",
          fontSize: "14px",
        },
      }}
    />
  );
}
