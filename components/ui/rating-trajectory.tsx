"use client";

import { useState } from "react";
import { RatingGraph } from "@/components/ui/rating-graph";
import { cn } from "@/lib/utils";
import type { PlatformStats } from "@/types";

/**
 * Rating trajectory with a platform switcher. Only platforms that actually
 * returned a contest history are offered, so a failed fetch removes a tab
 * rather than showing an empty chart.
 */
export function RatingTrajectory({ platforms }: { platforms: PlatformStats[] }) {
  const withHistory = platforms.filter((p) => (p.ratingHistory?.length ?? 0) >= 2);
  const [active, setActive] = useState(0);

  if (!withHistory.length) return null;

  const current = withHistory[Math.min(active, withHistory.length - 1)];

  return (
    <div className="rounded-xl border border-edge bg-raised/80 p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-sm font-medium text-foreground">Rating trajectory</h3>

        <div className="flex items-center gap-3">
          {withHistory.length > 1 && (
            <div
              role="tablist"
              aria-label="Rating trajectory platform"
              className="flex items-center gap-1 rounded-lg border border-edge bg-elevated p-0.5"
            >
              {withHistory.map((p, i) => (
                <button
                  key={p.platform}
                  role="tab"
                  type="button"
                  aria-selected={i === active}
                  onClick={() => setActive(i)}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors",
                    i === active
                      ? "bg-accent-dim text-accent-bright"
                      : "text-faint hover:text-foreground",
                  )}
                >
                  {p.title}
                </button>
              ))}
            </div>
          )}
          <span className="font-mono text-[10px] text-faint">
            {current.live ? "live · cached 6h" : "verified"}
          </span>
        </div>
      </div>

      <RatingGraph
        key={current.platform}
        history={current.ratingHistory}
        label={`${current.title} · ${current.contests ?? current.ratingHistory?.length} contests`}
      />
    </div>
  );
}
