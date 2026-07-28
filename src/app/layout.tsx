import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import { NavigationProgressHost } from "@/components/shared/navigation-progress-host";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";

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
    <html lang="en" className={manrope.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="bg-paper font-sans text-ink antialiased">
        <ThemeProvider>
          <NavigationProgressHost />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
