"use client";

import { useEffect, useState } from "react";

/**
 * Reads the live --accent token so the 3D scene follows the command-palette
 * theme switcher. Without this the canvas would keep the blue it was built
 * with while the rest of the page turned cyan or violet.
 */
export function useAccentColor(fallback = "#4f8dff"): string {
  const [color, setColor] = useState(fallback);

  useEffect(() => {
    const read = () => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue("--accent")
        .trim();
      if (v) setColor(v);
    };
    read();

    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-accent"],
    });
    return () => obs.disconnect();
  }, []);

  return color;
}
