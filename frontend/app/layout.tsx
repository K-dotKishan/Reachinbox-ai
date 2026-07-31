import type { Metadata } from "next";
import "./globals.css";
import ToasterProvider from "@/components/providers/ToasterProvider";

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
      <body className="font-sans antialiased">
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
