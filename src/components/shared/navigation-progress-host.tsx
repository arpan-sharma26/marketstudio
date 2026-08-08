"use client";

import { Suspense } from "react";

import { NavigationOverlay } from "@/components/shared/navigation-overlay";
import { NavigationProgress } from "@/components/shared/navigation-progress";

/** Suspense boundary required because both indicators read searchParams. */
export function NavigationProgressHost() {
  return (
    <Suspense fallback={null}>
      <NavigationProgress />
      <NavigationOverlay />
    </Suspense>
  );
}
