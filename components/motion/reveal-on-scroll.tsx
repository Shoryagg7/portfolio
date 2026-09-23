"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * One-shot fade and short rise as the element scrolls into view. A plain CSS
 * transition toggled by an IntersectionObserver: no animation library.
 *
 * The server renders content visible. It's hidden only once hydration confirms
 * it's still below the fold, so no JS, no IntersectionObserver or reduced motion
 * all leave it readable rather than stuck at opacity 0.
 */
export function RevealOnScroll({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen, or scrolled past: hiding it now would only make it blink.
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.reveal = "hidden";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.reveal = "shown";
        io.disconnect();
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      delete el.dataset.reveal;
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        // The transition lives only on "shown", so hiding is instant and only the reveal animates.
        "data-[reveal=hidden]:translate-y-4 data-[reveal=hidden]:opacity-0",
        "data-[reveal=shown]:transition-[opacity,translate] data-[reveal=shown]:duration-700 data-[reveal=shown]:ease-out-expo",
        className,
      )}
    >
      {children}
    </div>
  );
}
