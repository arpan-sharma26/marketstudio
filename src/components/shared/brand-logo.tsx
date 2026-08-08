import Image from "next/image";

import { BRAND } from "@/config/brand";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  /** Visual size preset. Source logo is portrait (~897×1024). */
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
  priority?: boolean;
}

/** Width/height keep the native portrait aspect ratio so Next/Image does not crop. */
const SIZE_MAP = {
  sm: { width: 120, height: 137, className: "h-14 w-auto" },
  md: { width: 160, height: 183, className: "h-[4.5rem] w-auto" },
  lg: { width: 240, height: 274, className: "h-28 w-auto" },
  hero: { width: 320, height: 365, className: "h-36 w-auto sm:h-40" },
} as const;

/** Official Market Studio wordmark + pixel-wave mark. */
export function BrandLogo({ size = "md", className, priority = false }: BrandLogoProps) {
  const dims = SIZE_MAP[size];

  return (
    <Image
      src={BRAND.logoSrc}
      alt={BRAND.name}
      width={dims.width}
      height={dims.height}
      priority={priority}
      className={cn(dims.className, "object-contain object-left", className)}
    />
  );
}
