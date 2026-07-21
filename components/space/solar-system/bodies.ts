import type { PlatformStats } from "@/types";

/**
 * A body in the hero's orbital system.
 *
 * These are real entities, not ornaments: the inner ring carries the projects
 * and the outer ring carries the competitive-programming platforms, sized by
 * rating. That is what makes the solar system thematic rather than decorative,
 * since a solar system is itself a distributed system — independent bodies,
 * stable periods, coordination through gravity rather than a central commander.
 */
export interface OrbitalBody {
  id: string;
  label: string;
  detail: string;
  ring: "inner" | "outer";
  /** Sphere radius in world units. */
  size: number;
  /** Starting angle in radians, so bodies don't launch in a line. */
  phase: number;
  /** 0 = pure accent, 1 = pure cool white. Keeps bodies distinguishable. */
  tint: number;
}

const INNER_RADIUS = 2.05;
const OUTER_RADIUS = 3.15;

export { INNER_RADIUS, OUTER_RADIUS };

/** Map a CP rating onto a sphere radius. Clamped so a weak platform is still visible. */
function ratingToSize(rating: number | null): number {
  if (!rating || rating <= 0) return 0.075;
  const t = Math.min(Math.max((rating - 1200) / 1200, 0), 1);
  return 0.075 + t * 0.06;
}

export function buildBodies(
  projects: { slug: string; name: string; tagline: string }[],
  cpStats: PlatformStats[],
): OrbitalBody[] {
  const inner: OrbitalBody[] = projects.map((p, i) => ({
    id: p.slug,
    label: p.name,
    detail: p.tagline,
    ring: "inner",
    size: 0.115,
    phase: (i / Math.max(projects.length, 1)) * Math.PI * 2,
    tint: 0.15,
  }));

  const outer: OrbitalBody[] = cpStats.map((s, i) => ({
    id: s.platform,
    label: s.title,
    detail: s.currentRating ? `${s.currentRating} · ${s.rankLabel}` : s.rankLabel,
    ring: "outer",
    size: ratingToSize(s.currentRating),
    // Offset so the outer ring never starts aligned with the inner one.
    phase: (i / Math.max(cpStats.length, 1)) * Math.PI * 2 + 0.6,
    tint: 0.32,
  }));

  return [...inner, ...outer];
}
