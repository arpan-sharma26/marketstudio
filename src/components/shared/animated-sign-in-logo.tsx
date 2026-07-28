"use client";

import Image from "next/image";

import { BRAND } from "@/config/brand";
import { cn } from "@/lib/utils";

/**
 * Sign-in hero: official mark with living wave motion.
 * Uses the transparent logo asset (wave + wordmark only).
 */
export function AnimatedSignInLogo({ className }: { className?: string }) {
  return (
    <div
      className={cn("sign-in-logo relative mx-auto w-fit", className)}
      aria-label={BRAND.name}
    >
      <div className="sign-in-logo__aura" aria-hidden />
      <div className="sign-in-logo__ring" aria-hidden />

      <div className="sign-in-logo__stage relative isolate">
        <div className="sign-in-logo__mark">
          <Image
            src={BRAND.logoSrc}
            alt=""
            width={320}
            height={365}
            priority
            className="sign-in-logo__image relative z-10 h-36 w-auto object-contain sm:h-40"
          />
          <div className="sign-in-logo__wave-light" aria-hidden />
          <PixelField />
        </div>
      </div>
    </div>
  );
}

function PixelField() {
  const pixels = [
    { x: "4%", y: "20%", size: 4, delay: "0s", duration: "3.8s", color: "#96e5d3" },
    { x: "10%", y: "34%", size: 3, delay: "0.5s", duration: "4.4s", color: "#2fc4ae" },
    { x: "2%", y: "48%", size: 5, delay: "1.2s", duration: "4s", color: "#96e5d3" },
    { x: "16%", y: "14%", size: 3, delay: "0.9s", duration: "5s", color: "#5fd4bf" },
    { x: "84%", y: "16%", size: 4, delay: "0.3s", duration: "4.2s", color: "#0a2f3d" },
    { x: "92%", y: "28%", size: 5, delay: "0.7s", duration: "5.1s", color: "#2fc4ae" },
    { x: "88%", y: "44%", size: 3, delay: "1.4s", duration: "3.9s", color: "#0a4f4c" },
    { x: "96%", y: "52%", size: 4, delay: "0.2s", duration: "4.7s", color: "#0a2f3d" },
    { x: "78%", y: "10%", size: 3, delay: "1.8s", duration: "4.3s", color: "#2fc4ae" },
  ] as const;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-visible" aria-hidden>
      {pixels.map((pixel, index) => (
        <span
          key={index}
          className="sign-in-logo__pixel absolute rounded-[1px]"
          style={{
            left: pixel.x,
            top: pixel.y,
            width: pixel.size,
            height: pixel.size,
            backgroundColor: pixel.color,
            animationDelay: pixel.delay,
            animationDuration: pixel.duration,
          }}
        />
      ))}
    </div>
  );
}
