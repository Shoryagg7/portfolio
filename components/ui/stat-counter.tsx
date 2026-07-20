"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

interface StatCounterProps {
  value: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
  /** Seconds to wait before counting — align with the container's reveal so the sweep is visible. */
  delay?: number;
  className?: string;
}

/**
 * Counts up to `value` once scrolled into view.
 *
 * A `null` display means "not animating" and renders the real value — which is
 * what the server emits, what shows before hydration, and what shows under
 * reduced motion. The count-up is purely additive: if it never starts (no JS,
 * hydration failure, an IntersectionObserver callback that never fires on
 * mobile) the correct number is already on screen. An earlier version
 * defaulted to 0 and got stuck there instead.
 */
export function StatCounter({
  value,
  suffix = "",
  decimals = 0,
  duration = 1.4,
  delay = 0,
  className,
}: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState<number | null>(null);

  useEffect(() => {
    if (reduce || !inView) return;

    let raf = 0;
    const ms = duration * 1000;
    let start = 0;

    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min((now - start) / ms, 1);
      if (t >= 1) {
        // Settle on the exact value rather than an eased float.
        setDisplay(null);
        return;
      }
      setDisplay(value * (1 - Math.pow(1 - t, 3)));
      raf = requestAnimationFrame(tick);
    };

    // Start when the container's reveal begins, so the whole sweep is visible.
    // The first frame evaluates to 0, so no separate reset is needed.
    const timer = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay * 1000);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      // Never leave a half-counted number behind on unmount.
      setDisplay(null);
    };
  }, [inView, reduce, value, duration, delay]);

  return (
    <span ref={ref} className={className}>
      {(display ?? value).toFixed(decimals)}
      {suffix}
    </span>
  );
}
