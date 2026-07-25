import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Email Scheduler",
  description: "Schedule and send bulk emails with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1f2937",
              color: "#f9fafb",
              borderRadius: "8px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#f9fafb" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#f9fafb" } },
          }}
        />
      </body>
    </html>
  );
}
