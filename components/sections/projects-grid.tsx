import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/ui/brand-icons";
import { Section } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { projects } from "@/lib/content/projects";

export function ProjectsGrid() {
  return (
    <Section
      id="projects"
      kicker="04 · projects"
      title="Built, load-tested, shipped"
      lead="Not weekend demos. These have race conditions I found and fixed, numbers I actually measured, and trade-offs written down. Each one opens into a full case study."
    >
      <Stagger className="grid gap-5 lg:grid-cols-2">
        {projects.map((p) => (
          <StaggerItem key={p.slug}>
            <article className="glow-hover group relative flex h-full flex-col rounded-xl border border-edge bg-raised/80 p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-foreground">
                    <Link href={`/projects/${p.slug}`} className="focus-visible:outline-none">
                      {/* Stretched link covers the card */}
                      <span className="absolute inset-0" aria-hidden />
                      {p.name}
                    </Link>
                  </h3>
                  <p className="mt-1 font-mono text-xs text-accent">{p.tagline}</p>
                </div>
                <span className="font-mono text-xs text-faint">{p.year}</span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted">{p.summary}</p>

              <ul className="mt-5 space-y-2">
                {p.highlights.slice(0, 3).map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-sm text-muted">
                    <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                <div className="flex flex-wrap gap-1.5">
                  {p.stack.slice(0, 5).map((t) => (
                    <Badge key={t} variant="mono">
                      {t}
                    </Badge>
                  ))}
                  {p.stack.length > 5 && <Badge variant="mono">+{p.stack.length - 5}</Badge>}
                </div>
                <div className="relative z-10 flex items-center gap-1.5">
                  {p.links.github && (
                    <a
                      href={p.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${p.name} on GitHub`}
                      className="flex size-8 items-center justify-center rounded-md border border-edge text-faint transition-colors hover:border-edge-strong hover:text-foreground"
                    >
                      <GithubIcon aria-hidden className="size-4" />
                    </a>
                  )}
                  <span className="flex items-center gap-1 font-mono text-xs text-accent">
                    case study
                    <ArrowUpRight
                      aria-hidden
                      className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
