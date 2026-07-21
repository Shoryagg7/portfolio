"use client";

import { motion, useReducedMotion } from "motion/react";
import type { DifficultySplit as Split } from "@/types";

const tiers = [
  { key: "easy", label: "Easy", color: "#34d399" },
  { key: "medium", label: "Medium", color: "#fbbf24" },
  { key: "hard", label: "Hard", color: "#fb7185" },
] as const;

/**
 * LeetCode solves as one proportional bar, split by difficulty. Semantic
 * colors (not the site accent) because they map to LeetCode's own tiers.
 */
export function DifficultySplit({ split, total }: { split: Split; total: number | null }) {
  const reduce = useReducedMotion();
  const sum = split.easy + split.medium + split.hard || 1;

  return (
    <div className="h-full rounded-2xl border border-edge bg-raised/85 p-6 md:p-8">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-sm font-medium text-foreground">Solve distribution</h3>
        <span className="font-mono text-xs text-faint">
          LeetCode{total ? ` · ${total} solved` : ""}
        </span>
      </div>

      <div className="flex h-2.5 overflow-hidden rounded-full bg-elevated">
        {tiers.map((tier, i) => {
          const pct = (split[tier.key] / sum) * 100;
          return (
            <motion.div
              key={tier.key}
              style={{ backgroundColor: tier.color }}
              initial={reduce ? { width: `${pct}%` } : { width: 0 }}
              whileInView={{ width: `${pct}%` }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.8, delay: 0.1 * i, ease: [0.21, 0.47, 0.32, 0.98] }}
            />
          );
        })}
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3">
        {tiers.map((tier) => (
          <div key={tier.key}>
            <dt className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-faint">
              <span
                aria-hidden
                className="size-1.5 rounded-full"
                style={{ backgroundColor: tier.color }}
              />
              {tier.label}
            </dt>
            <dd className="mt-1 font-display text-lg font-semibold tabular-nums text-foreground">
              {split[tier.key]}
              <span className="ml-1 font-mono text-xs font-normal text-faint">
                {Math.round((split[tier.key] / sum) * 100)}%
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 border-t border-edge pt-4 text-sm text-muted">
        <span className="font-display text-lg font-semibold text-accent-bright">
          {Math.round(((split.medium + split.hard) / sum) * 100)}%
        </span>{" "}
        of solves are Medium or Hard. That&apos;s {split.medium + split.hard} problems past
        the easy tier.
      </p>
    </div>
  );
}
