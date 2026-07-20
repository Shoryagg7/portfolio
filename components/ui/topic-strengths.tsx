"use client";

import { motion, useReducedMotion } from "motion/react";
import type { TagCount } from "@/types";

/**
 * Most-solved problem topics as proportional bars. Widths are relative to the
 * top tag, so the shape reads as "where the reps went" rather than raw counts.
 */
export function TopicStrengths({ tags, total }: { tags: TagCount[]; total: number | null }) {
  const reduce = useReducedMotion();
  const max = Math.max(...tags.map((t) => t.count), 1);

  return (
    <div className="h-full rounded-xl border border-edge bg-raised/80 p-6">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-sm font-medium text-foreground">Topic strengths</h3>
        <span className="font-mono text-[10px] text-faint">
          Codeforces{total ? ` · ${total} solved` : ""}
        </span>
      </div>

      <ul className="space-y-2.5">
        {tags.map((t, i) => (
          <li key={t.tag} className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="min-w-0">
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="truncate font-mono text-[11px] text-muted">{t.tag}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-accent-bright"
                  initial={reduce ? { width: `${(t.count / max) * 100}%` } : { width: 0 }}
                  whileInView={{ width: `${(t.count / max) * 100}%` }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.8, delay: 0.06 * i, ease: [0.21, 0.47, 0.32, 0.98] }}
                />
              </div>
            </div>
            <span className="font-mono text-xs tabular-nums text-faint">{t.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
