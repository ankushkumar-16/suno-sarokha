import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Suno Sarokha — Pehle verify karo, phir pay karo",
  description: "AI-powered anti-scam copilot for Indian families. Real-time scam detection for WhatsApp, voice notes, and messages.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-suno-dark text-suno-text min-h-screen">
        {children}
      </body>
    </html>
  );
}
