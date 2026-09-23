import { ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/ui/brand-icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Project, ProjectFinding, ProjectResults } from "@/types";

interface ProjectCardProps {
  project: Project;
  /** h3 under the home page's projects h2; h1 on the project's own page. */
  as?: "h1" | "h3";
  className?: string;
}

/**
 * One project: description, measured results, a called-out finding, stack, repo link.
 * Shared by the home page section and /projects/[slug], so it lays out against its
 * own width (container queries) rather than the viewport's.
 */
export function ProjectCard({ project, as: Heading = "h3", className }: ProjectCardProps) {
  const headingId = `project-${project.slug}`;
  const SubHeading = Heading === "h1" ? "h2" : "h4";

  return (
    <article
      aria-labelledby={headingId}
      className={cn(
        "glow-hover @container rounded-2xl border border-edge bg-raised/85 p-6 sm:p-8 md:p-10",
        className,
      )}
    >
      <Heading id={headingId}>
        <span
          className={cn(
            "block font-display font-semibold tracking-tight text-foreground",
            Heading === "h1" ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl",
          )}
        >
          {project.name}
        </span>
        <span className="sr-only"> — </span>
        <span className="mt-2 block font-mono text-sm text-accent">{project.tagline}</span>
      </Heading>

      <div
        className={cn(
          "mt-6 grid gap-8",
          project.results && "@4xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] @4xl:gap-14",
        )}
      >
        <p className="max-w-prose text-[15px] leading-relaxed text-muted md:text-base">
          {project.summary}
        </p>
        {project.results && <Results results={project.results} heading={SubHeading} />}
      </div>

      {project.finding && <Finding finding={project.finding} />}

      <div className="mt-8 flex flex-col gap-5 border-t border-edge pt-6 @2xl:flex-row @2xl:items-center @2xl:justify-between">
        <ul aria-label={`${project.name} tech stack`} className="flex flex-wrap gap-1.5">
          {project.stack.map((t) => (
            <li key={t}>
              <Badge variant="mono">{t}</Badge>
            </li>
          ))}
        </ul>
        <a
          href={project.links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-edge-strong bg-elevated px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent-bright @2xl:self-auto"
        >
          <GithubIcon aria-hidden className="size-4" />
          View on GitHub
          <span className="sr-only">: {project.name}</span>
          <ArrowUpRight
            aria-hidden
            className="size-3.5 text-faint transition group-hover/link:text-accent-bright motion-safe:group-hover/link:translate-x-0.5 motion-safe:group-hover/link:-translate-y-0.5"
          />
        </a>
      </div>
    </article>
  );
}

function Results({
  results,
  heading: Heading,
}: {
  results: ProjectResults;
  heading: "h2" | "h4";
}) {
  return (
    <div className="@container/results min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <Heading className="font-mono text-xs tracking-[0.2em] text-faint uppercase">
          Measured results
        </Heading>
        <a
          href={results.source.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-xs text-faint transition-colors hover:text-accent-bright"
        >
          <span className="sr-only">Source: </span>
          {results.source.label}
          <ArrowUpRight aria-hidden className="size-3" />
        </a>
      </div>
      <dl className="mt-3 border-t border-edge">
        {results.rows.map((r) => (
          <div
            key={r.label}
            className="grid gap-x-6 gap-y-1 border-b border-edge py-3.5 last:border-b-0 @md/results:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]"
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

function Finding({ finding }: { finding: ProjectFinding }) {
  return (
    <div className="relative mt-8 rounded-xl border border-edge bg-elevated/60 py-5 pr-5 pl-6 md:py-6 md:pr-7 md:pl-8">
      <span aria-hidden className="absolute inset-y-5 -left-px w-0.5 rounded-full bg-accent" />
      <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
        {finding.label}
      </p>
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
