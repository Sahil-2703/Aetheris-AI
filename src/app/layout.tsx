import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "AI Workspace SaaS — Supercharge Your Productivity",
  description: "Multi-tenant AI productivity platform for developers, creators, employees, and businesses with real-time email & social media intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-purple-600 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
