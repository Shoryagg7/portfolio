"use client";

import { cn } from "@/lib/utils";

interface OrbitRingProps {
  size?: number;
  duration?: number;
  reverse?: boolean;
  className?: string;
}

/**
 * Decorative orbital ring with a small satellite dot tracing the path.
 * Pure CSS animation; pauses under prefers-reduced-motion.
 */
export function OrbitRing({ size = 320, duration = 40, reverse = false, className }: OrbitRingProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute", className)}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full border border-edge motion-safe:animate-spin"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        <span
          className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
          style={{ boxShadow: "0 0 8px 2px var(--accent-glow)" }}
        />
      </div>
    </div>
  );
}
