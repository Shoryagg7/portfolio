"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";

/**
 * Accent progress bar pinned to the top of the viewport.
 *
 * Was 1px tall, which made it the site's only scroll-linked animation and also
 * an invisible one. Now 2px with a travelling glow at the leading edge, so the
 * page gives some feedback about how far through you are.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });
  // Fades the bar out at the very top so it doesn't sit as a stray line on load.
  const opacity = useTransform(scrollYProgress, [0, 0.01, 0.03], [0, 0.6, 1]);

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX, opacity }}
      className="fixed inset-x-0 top-0 z-[80] h-0.5 origin-left bg-gradient-to-r from-accent/70 via-accent to-accent-bright"
    >
      <div className="absolute right-0 h-full w-24 bg-gradient-to-r from-transparent to-accent-bright shadow-[0_0_12px_2px_var(--accent-glow)]" />
    </motion.div>
  );
}
