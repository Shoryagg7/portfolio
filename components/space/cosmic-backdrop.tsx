"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Persistent deep-space wash behind every section.
 *
 * Before this, only the hero, contact, and 404 had any theme; sections 01-06 sat
 * on flat #05050a, which is why the middle of the page felt like a different site
 * from the top of it. Three nebula layers drift at different rates as you scroll,
 * so the page reads as depth rather than a single flat plane.
 *
 * Deliberately CSS gradients on a fixed layer, not a canvas: it costs one
 * composited element and animates transform only, so it never touches layout or
 * paint on the scroll thread.
 */
export function CosmicBackdrop() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Different rates are the whole point: matched rates would read as one plane.
  const near = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const mid = useTransform(scrollYProgress, [0, 1], ["0%", "-16%"]);
  const far = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  const layer = (y: typeof near) => (reduce ? undefined : { y });

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: "var(--bg-deep)" }}
    >
      <motion.div
        style={{
          ...layer(far),
          background:
            "radial-gradient(ellipse 46% 32% at 78% 12%, var(--nebula-far), transparent 70%)",
        }}
        className="absolute inset-x-0 -top-[10%] h-[130%]"
      />
      <motion.div
        style={{
          ...layer(mid),
          background:
            "radial-gradient(ellipse 54% 26% at 16% 42%, var(--nebula-core), transparent 72%)",
        }}
        className="absolute inset-x-0 -top-[10%] h-[130%]"
      />
      <motion.div
        style={{
          ...layer(near),
          background:
            "radial-gradient(ellipse 40% 24% at 62% 78%, var(--nebula-cold), transparent 70%)",
        }}
        className="absolute inset-x-0 -top-[10%] h-[130%]"
      />

      {/* Keeps the wash from lifting the page background off true black at the edges. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 50%, transparent 40%, var(--bg-deep) 100%)",
        }}
      />
    </div>
  );
}
