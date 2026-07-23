"use client";

import { useEffect } from "react";

/**
 * Feeds the cursor position into every .glow-hover card as --mx/--my, which the
 * card's ::before/::after spotlight layers read.
 *
 * One delegated pointermove listener for the whole page rather than a handler
 * per card, and writes are rAF-throttled so a fast mouse can't outrun the
 * compositor. Only the card currently under the cursor is touched.
 */
export function CardSpotlight() {
  useEffect(() => {
    /*
      No pointer-capability guard on purpose. Gating on (hover: hover) reads as an
      optimisation, but it makes the whole feature untestable in headless (which
      honestly reports pointer:coarse) and lets it silently no-op if the query is
      ever wrong. The handler is already near-free on touch: pointermove only
      fires there mid-gesture, and :hover never applies, so the glow it feeds
      stays invisible regardless.
    */
    let card: HTMLElement | null = null;
    let x = 0;
    let y = 0;
    let raf = 0;

    const flush = () => {
      raf = 0;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${x - r.left}px`);
      card.style.setProperty("--my", `${y - r.top}px`);
    };

    const onMove = (e: PointerEvent) => {
      const hit = (e.target as Element | null)?.closest?.(
        ".glow-hover",
      ) as HTMLElement | null;
      if (!hit) return;
      card = hit;
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(flush);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
