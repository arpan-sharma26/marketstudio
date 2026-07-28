import { redirect } from "next/navigation";
import type { CSSProperties } from "react";

import { AnimatedSignInLogo } from "@/components/shared/animated-sign-in-logo";
import { BRAND } from "@/config/brand";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { getAuthenticatedProfile } from "@/lib/auth";

export const metadata = {
  title: "Sign in · Market Studio",
};

export default async function SignInPage() {
  const profile = await getAuthenticatedProfile();
  if (profile) redirect("/dashboard");

  return (
    <main className="sign-in-page relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="sign-in-page__base" aria-hidden />
      <div className="sign-in-page__grid" aria-hidden />
      <div className="sign-in-page__orb sign-in-page__orb--a" aria-hidden />
      <div className="sign-in-page__orb sign-in-page__orb--b" aria-hidden />
      <div className="sign-in-page__orb sign-in-page__orb--c" aria-hidden />
      <div className="sign-in-page__scan" aria-hidden />
      <div className="sign-in-page__particles" aria-hidden>
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="sign-in-page__particle"
            style={{ "--i": i } as CSSProperties}
          />
        ))}
      </div>

      <div className="sign-in-page__content relative z-10 w-full max-w-md">
        <div className="sign-in-page__hero mb-9 flex flex-col items-center text-center">
          <AnimatedSignInLogo />
          <p className="sign-in-page__tagline mt-5 max-w-sm text-sm font-medium tracking-wide text-ink-muted">
            {BRAND.tagline}
          </p>
          <div className="sign-in-page__status mt-3 flex items-center gap-2 text-xs text-brand-700">
            <span className="sign-in-page__status-dot" aria-hidden />
            <span>AI workspace ready</span>
          </div>
        </div>

        <section className="sign-in-page__panel">
          <div className="sign-in-page__panel-glow" aria-hidden />
          <div className="brand-gradient-bar" aria-hidden />
          <div className="relative p-6 sm:p-7">
            <header className="sign-in-page__panel-header mb-5 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-ink">Sign in</h1>
              <p className="text-sm text-ink-muted">
                Enter your credentials to access your AI marketing workspace.
              </p>
            </header>
            <SignInForm />
          </div>
        </section>
      </div>
    </main>
  );
}
