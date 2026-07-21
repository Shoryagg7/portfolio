/**
 * Shared motion vocabulary. These mirror the --ease-* custom properties in
 * globals.css so a CSS transition and a Framer spring on the same element
 * don't disagree about how the site moves.
 */

export const EASE = {
  /** Long, confident decel. Entrances and camera moves. */
  outExpo: [0.16, 1, 0.3, 1],
  /** Gentler decel. Hovers, small state changes. */
  outSoft: [0.22, 0.61, 0.36, 1],
  /** The reveal curve the site already used. Kept for continuity. */
  reveal: [0.21, 0.47, 0.32, 0.98],
} as const;

export const DURATION = {
  fast: 0.25,
  base: 0.55,
  slow: 0.9,
  /** Full intro run, from black to settled hero. */
  intro: 1.8,
} as const;

/** Orbital periods in seconds. Deliberately non-harmonic so the system never re-syncs. */
export const ORBIT_PERIOD = {
  inner: 28,
  outer: 47,
} as const;
