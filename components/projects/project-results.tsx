import { ArrowUpRight } from "lucide-react";
import type { ProjectFinding, ProjectResults } from "@/types";

/** The measured-results table, with the file every number is quoted from. */
export function ResultsTable({ results }: { results: ProjectResults }) {
  return (
    <div className="@container/results min-w-0 rounded-2xl border border-edge bg-raised/85 px-5 pt-4 pb-2 shadow-card md:px-7 md:pt-5">
      <p className="flex flex-wrap items-baseline gap-x-2 font-mono text-xs text-faint">
        Quoted from
        <a
          href={results.source.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-muted underline decoration-edge-strong underline-offset-4 transition-colors hover:text-accent-bright hover:decoration-accent"
        >
          {results.source.label}
          <ArrowUpRight aria-hidden className="size-3" />
        </a>
      </p>
      <dl className="mt-3 border-t border-edge">
        {results.rows.map((r) => (
          <div
            key={r.label}
            className="grid gap-x-6 gap-y-1 border-b border-edge py-3.5 last:border-b-0 @md/results:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]"
          >
            <dt className="text-sm text-muted">{r.label}</dt>
            <dd>
              <span className="block font-mono text-sm font-medium text-accent-bright">
                {r.value}
              </span>
              {r.note && <span className="mt-0.5 block text-xs text-faint">{r.note}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** A single result worth calling out on its own. */
export function FindingCallout({ finding }: { finding: ProjectFinding }) {
  return (
    <div className="relative rounded-xl border border-edge bg-elevated/60 py-5 pr-5 pl-6 md:py-6 md:pr-7 md:pl-8">
      <span aria-hidden className="absolute inset-y-5 -left-px w-0.5 rounded-full bg-accent" />
      <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{finding.label}</p>
      <p className="mt-3 text-base leading-relaxed text-foreground md:text-lg">
        {withMonoNumbers(finding.text)}
      </p>
    </div>
  );
}

/** Sets the decimals in a sentence in mono, so the scores being compared stand out. */
function withMonoNumbers(text: string) {
  return text.split(/(\d+\.\d+)/).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-mono text-accent-bright">
        {part}
      </span>
    ) : (
      part
    ),
  );
}
