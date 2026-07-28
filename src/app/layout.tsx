import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import { NavigationProgressHost } from "@/components/shared/navigation-progress-host";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Market Studio",
  description:
    "AI-powered daycare marketing and lead-management platform for Canadian daycare businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="font-sans">
        <NavigationProgressHost />
        {children}
      </body>
    </html>
  );
}
