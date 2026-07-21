import { RatingGraph } from "@/components/ui/rating-graph";
import type { PlatformStats } from "@/types";

/**
 * One platform's contest rating over time. Renders nothing when that platform
 * returned no usable history, so a failed fetch drops the card instead of
 * showing an empty chart.
 */
export function RatingTrajectory({ stats }: { stats?: PlatformStats }) {
  if (!stats || (stats.ratingHistory?.length ?? 0) < 2) return null;

  const history = stats.ratingHistory!;
  const contests = stats.contests ?? history.length;

  return (
    <div className="h-full rounded-2xl border border-edge bg-raised/85 p-6 md:p-8">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-sm font-medium text-foreground">
          {stats.title} rating trajectory
        </h3>
        <span className="font-mono text-xs text-faint">
          {stats.live ? "live · cached 6h" : "verified"}
        </span>
      </div>
      <RatingGraph history={history} label={`${contests} rated contests`} />
    </div>
  );
}
