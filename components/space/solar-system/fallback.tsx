"use client";

import type { OrbitalBody } from "./bodies";

/**
 * Pure CSS stand-in for the 3D scene, used when WebGL is unavailable.
 * It keeps the same idea — a star with two orbits carrying real entities — so
 * the hero never falls back to an empty box.
 *
 * Deliberately static apart from the star's pulse. Rotating a CSS ellipse
 * tumbles the whole ring instead of moving a body along it, and a wrong-looking
 * animation on a rare fallback path is worse than none.
 */
export function SolarSystemFallback({ bodies }: { bodies: OrbitalBody[] }) {
  const rings = [
    { key: "inner" as const, width: 52, opacity: 0.3 },
    { key: "outer" as const, width: 86, opacity: 0.18 },
  ];

  return (
    <div aria-hidden className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div className="relative aspect-square w-[min(78vw,640px)]">
        <div
          className="absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, var(--accent-glow), transparent 68%)" }}
        />
        <div className="absolute top-1/2 left-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent motion-safe:animate-pulse [animation-duration:4s]" />

        {rings.map((ring) => {
          const members = bodies.filter((b) => b.ring === ring.key);
          return (
            <div
              key={ring.key}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-(--accent)"
              style={{
                width: `${ring.width}%`,
                height: `${ring.width * 0.42}%`,
                opacity: ring.opacity,
              }}
            >
              {members.map((b, j) => {
                // Spread members around the ellipse by parametric angle.
                const t = (j / Math.max(members.length, 1)) * Math.PI * 2 + b.phase;
                const left = 50 + Math.cos(t) * 50;
                const top = 50 + Math.sin(t) * 50;
                return (
                  <span
                    key={b.id}
                    className="absolute block -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-bright"
                    style={{
                      width: `${Math.round(b.size * 48)}px`,
                      height: `${Math.round(b.size * 48)}px`,
                      left: `${left}%`,
                      top: `${top}%`,
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
