import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/ui/brand-icons";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/types";

const VISIBLE_STACK = 5;

/**
 * Home page project card. The whole card opens the case study: the heading link
 * stretches over it with ::after, and the GitHub link sits above that layer so it
 * stays independently clickable.
 */
export function ProjectCard({ project }: { project: Project }) {
  const hidden = project.stack.length - VISIBLE_STACK;

  return (
    <article className="glow-hover group relative flex h-full flex-col rounded-2xl border border-edge bg-raised/85 p-7 md:p-9">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            <Link
              href={`/projects/${project.slug}`}
              className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-accent"
            >
              {project.name}
              <span className="sr-only"> case study</span>
            </Link>
          </h3>
          <p className="mt-1.5 font-mono text-xs text-accent">{project.tagline}</p>
        </div>
        <span className="shrink-0 font-mono text-xs text-faint">{project.year}</span>
      </div>

      <p className="mt-5 text-[15px] leading-relaxed text-muted">{project.summary}</p>

      <ul className="mt-6 space-y-2.5">
        {project.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground/90">
            <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
            {h}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <ul aria-label={`${project.name} tech stack`} className="flex flex-wrap gap-1.5">
          {project.stack.slice(0, VISIBLE_STACK).map((t) => (
            <li key={t}>
              <Badge variant="mono">{t}</Badge>
            </li>
          ))}
          {hidden > 0 && (
            <li>
              <Badge variant="mono">
                +{hidden}
                <span className="sr-only"> more</span>
              </Badge>
            </li>
          )}
        </ul>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-edge pt-5">
          <a
            href={project.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex items-center gap-2 rounded-md text-sm text-faint transition-colors hover:text-foreground"
          >
            <GithubIcon aria-hidden className="size-4" />
            Source
            <span className="sr-only">: {project.name} on GitHub</span>
          </a>
          <span
            aria-hidden
            className="flex items-center gap-1 font-mono text-xs whitespace-nowrap text-accent transition-colors group-hover:text-accent-bright"
          >
            read the case study
            <ArrowUpRight className="size-3.5 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
