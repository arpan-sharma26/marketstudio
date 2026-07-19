import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Market Studio",
  description:
    "AI-powered daycare marketing and lead-management platform for Canadian daycare businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
