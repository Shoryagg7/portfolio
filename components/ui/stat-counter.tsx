"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

interface StatCounterProps {
  value: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

/** Counts up from 0 when scrolled into view. Skips animation under reduced motion. */
export function StatCounter({
  value,
  suffix = "",
  decimals = 0,
  duration = 1.4,
  className,
}: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const shown = !inView || reduce ? value : display;

  useEffect(() => {
    if (!inView || reduce) return;
    if (display === value) return;

    let raf = 0;
    const start = performance.now();
    const from = display;
    const delta = value - from;
    const ms = duration * 1000;
    const tick = (now: number) => {
      const t = Math.min((now - start) / ms, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + delta * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduce, display]);

  return (
    <span ref={ref} className={className}>
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}
