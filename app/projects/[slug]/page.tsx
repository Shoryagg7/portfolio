import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Globe,
  Lightbulb,
  TriangleAlert,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/brand-icons";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { GlowCard } from "@/components/ui/glow-card";
import { ArchitectureDiagram } from "@/components/space/architecture-diagram";
import { getProject, projects } from "@/lib/content/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.name} — ${project.tagline}`,
    description: project.summary,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const externalLinks = [
    { href: project.links.github, label: "GitHub", icon: GithubIcon },
    { href: project.links.demo, label: "Live Demo", icon: Globe },
    { href: project.links.docs, label: "Documentation", icon: BookOpen },
  ].filter((l): l is { href: string; label: string; icon: typeof GithubIcon } => Boolean(l.href));

  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main className="mx-auto max-w-4xl px-5 pb-24 pt-28 md:px-8 md:pt-36">
        <Reveal from="none">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-faint transition-colors hover:text-foreground"
          >
            <ArrowLeft aria-hidden className="size-3.5" /> all projects
          </Link>

          <header className="mt-6">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                {project.name}
              </h1>
              <span className="font-mono text-sm text-faint">{project.year}</span>
            </div>
            <p className="mt-2 font-mono text-sm text-accent">{project.tagline}</p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">
              {project.summary}
            </p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {project.stack.map((t) => (
                <Badge key={t} variant="mono">
                  {t}
                </Badge>
              ))}
            </div>
            {externalLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {externalLinks.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-lg border border-edge bg-raised px-3.5 py-2 text-sm text-muted transition-colors hover:border-edge-strong hover:text-foreground"
                  >
                    <l.icon aria-hidden className="size-4" />
                    {l.label}
                    <ArrowUpRight
                      aria-hidden
                      className="size-3 text-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                ))}
              </div>
            )}
          </header>
        </Reveal>

        <CaseSection title="Overview">
          <p className="leading-relaxed text-muted">{project.overview}</p>
        </CaseSection>

        <CaseSection title="Problem Statement">
          <p className="leading-relaxed text-muted">{project.problem}</p>
        </CaseSection>

        <CaseSection title="Architecture">
          <ArchitectureDiagram data={project.diagram} title={`${project.name} topology`} />
          <ul className="mt-6 space-y-3">
            {project.architectureNotes.map((note) => (
              <li key={note} className="flex items-start gap-3 text-sm leading-relaxed text-muted">
                <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                {note}
              </li>
            ))}
          </ul>
        </CaseSection>

        <CaseSection
          title="Engineering Decisions"
          lead="Every major decision, with its context and its cost."
        >
          <div className="space-y-6">
            {project.decisions.map((d, i) => (
              <Reveal key={d.title}>
                <GlowCard className="p-0">
                  <div className="border-b border-edge px-6 py-4">
                    <h3 className="flex items-baseline gap-3 font-display text-lg font-medium text-foreground">
                      <span className="font-mono text-xs text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {d.title}
                    </h3>
                  </div>
                  <dl className="space-y-4 px-6 py-5">
                    <DecisionRow label="Context">{d.context}</DecisionRow>
                    <DecisionRow label="Decision">{d.decision}</DecisionRow>
                    <DecisionRow label="Why">{d.why}</DecisionRow>
                    <DecisionRow label="Trade-offs">{d.tradeoffs}</DecisionRow>
                    <DecisionRow label="Lesson" accent>
                      {d.lesson}
                    </DecisionRow>
                  </dl>
                </GlowCard>
              </Reveal>
            ))}
          </div>
        </CaseSection>

        <CaseSection title="Performance">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {project.performance.map((m) => (
              <div
                key={m.label}
                className="rounded-2xl border border-edge bg-raised/85 px-4 py-5 text-center"
              >
                <p className="font-mono text-xl font-semibold text-accent-bright md:text-2xl">
                  {m.value}
                </p>
                <p className="mt-1 text-xs font-medium text-foreground">{m.label}</p>
                {m.detail && <p className="mt-1 text-xs text-faint">{m.detail}</p>}
              </div>
            ))}
          </div>
        </CaseSection>

        <CaseSection title="Challenges">
          <ul className="space-y-4">
            {project.challenges.map((c) => (
              <li key={c} className="flex items-start gap-3 text-sm leading-relaxed text-muted">
                <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-amber-400/80" />
                {c}
              </li>
            ))}
          </ul>
        </CaseSection>

        <CaseSection title="Lessons Learned">
          <ul className="space-y-4">
            {project.lessons.map((l) => (
              <li key={l} className="flex items-start gap-3 text-sm leading-relaxed text-muted">
                <Lightbulb aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
                {l}
              </li>
            ))}
          </ul>
        </CaseSection>

        <nav className="mt-20 border-t border-edge pt-8" aria-label="More projects">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {projects
              .filter((p) => p.slug !== project.slug)
              .map((p) => (
                <Link
                  key={p.slug}
                  href={`/projects/${p.slug}`}
                  className="group flex items-center gap-2 font-mono text-sm text-muted transition-colors hover:text-accent-bright"
                >
                  next case study: {p.name}
                  <ArrowUpRight
                    aria-hidden
                    className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </Link>
              ))}
          </div>
        </nav>
      </main>
      <Footer />
    </>
  );
}

function CaseSection({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal className="mt-16">
      <section>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {lead && <p className="mt-1.5 text-sm text-faint">{lead}</p>}
        <div className="mt-6">{children}</div>
      </section>
    </Reveal>
  );
}

function DecisionRow({
  label,
  children,
  accent = false,
}: {
  label: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="grid gap-1 md:grid-cols-[110px_1fr] md:gap-4">
      <dt
        className={`font-mono text-xs uppercase tracking-wider ${
          accent ? "text-accent" : "text-faint"
        }`}
      >
        {label}
      </dt>
      <dd className={`text-sm leading-relaxed ${accent ? "text-foreground" : "text-muted"}`}>
        {children}
      </dd>
    </div>
  );
}
