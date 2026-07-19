import { ArrowUpRight, Radio } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { RatingGraph } from "@/components/ui/rating-graph";
import { StatCounter } from "@/components/ui/stat-counter";
import { getAllPlatformStats } from "@/lib/services/cp-stats";
import type { PlatformStats } from "@/types";

function StatCell({ label, value, suffix = "" }: { label: string; value: number | null; suffix?: string }) {
  return (
    <div>
      <p className="font-display text-xl font-semibold text-foreground md:text-2xl">
        {value === null ? <span className="text-faint">—</span> : <StatCounter value={value} suffix={suffix} />}
      </p>
      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-faint">{label}</p>
    </div>
  );
}

function PlatformCard({ stats }: { stats: PlatformStats }) {
  return (
    <article className="glow-hover flex h-full flex-col rounded-xl border border-edge bg-raised/80 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-display text-lg font-medium text-foreground">{stats.title}</h3>
          <p className="font-mono text-xs text-faint">@{stats.handle}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-elevated px-2.5 py-1 font-mono text-[10px] text-muted">
          {stats.live && (
            <Radio aria-hidden className="size-3 text-emerald-400" />
          )}
          {stats.live ? "live" : "verified"}
          · {stats.rankLabel}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5">
        <StatCell label="Current rating" value={stats.currentRating} />
        <StatCell label="Peak rating" value={stats.peakRating} />
        <StatCell label="Problems solved" value={stats.problemsSolved} suffix="+" />
        <StatCell label="Contests" value={stats.contests} />
      </div>

      <a
        href={stats.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group mt-auto inline-flex items-center gap-1.5 pt-6 font-mono text-xs text-accent transition-colors hover:text-accent-bright"
      >
        view profile
        <ArrowUpRight
          aria-hidden
          className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </a>
    </article>
  );
}

export async function CPDashboard() {
  const allStats = await getAllPlatformStats();
  const codeforces = allStats.find((s) => s.platform === "codeforces");

  return (
    <Section
      id="competitive-programming"
      kicker="05 · competitive programming"
      title="Can I solve hard problems?"
      lead="2000+ problems across three platforms. Codeforces Expert — earned one contest at a time."
    >
      <Stagger className="grid gap-4 md:grid-cols-3">
        {allStats.map((stats) => (
          <StaggerItem key={stats.platform}>
            <PlatformCard stats={stats} />
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal delay={0.15} className="mt-4">
        <div className="rounded-xl border border-edge bg-raised/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-sm font-medium text-foreground">
              Codeforces rating trajectory
            </h3>
            <span className="font-mono text-[10px] text-faint">
              {codeforces?.live ? "official Codeforces API · cached 6h" : "representative curve"}
            </span>
          </div>
          <RatingGraph history={codeforces?.ratingHistory} label="contest rating over time" />
        </div>
      </Reveal>
    </Section>
  );
}
