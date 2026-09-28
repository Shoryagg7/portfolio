import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CircleSlash, TriangleAlert } from "lucide-react";
import { GithubIcon } from "@/components/ui/brand-icons";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { ArchitectureDiagram } from "@/components/space/architecture-diagram";
import { withInlineCode } from "@/components/projects/inline-code";
import { FindingCallout, ResultsTable } from "@/components/projects/project-results";
import { getProject, projects } from "@/lib/content/projects";
import type { EngineeringDecision, FlowStep, Project } from "@/types";

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

function sectionsOf(project: Project) {
  return [
    { id: "overview", label: "Overview" },
    { id: "problem", label: "Problem" },
    { id: "architecture", label: "Architecture" },
    { id: "decisions", label: "Decisions" },
    ...(project.results ? [{ id: "results", label: "Results" }] : []),
    { id: "challenges", label: "Challenges" },
    { id: "limitations", label: "Limitations" },
  ];
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const others = projects.filter((p) => p.slug !== project.slug);

  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-5 pb-24 pt-28 md:px-8 md:pt-36">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-faint transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden className="size-3.5" /> all projects
        </Link>

        <header className="mt-6">
          <p className="font-mono text-xs tracking-[0.2em] text-faint uppercase">
            Case study · {project.year}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            {project.name}
          </h1>
          <p className="mt-3 font-mono text-sm text-accent">{project.tagline}</p>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            {project.summary}
          </p>

          <ul aria-label={`${project.name} tech stack`} className="mt-6 flex flex-wrap gap-1.5">
            {project.stack.map((t) => (
              <li key={t}>
                <Badge variant="mono">{t}</Badge>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-lg border border-edge-strong bg-elevated px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent-bright"
            >
              <GithubIcon aria-hidden className="size-4" />
              View on GitHub
              <ArrowUpRight
                aria-hidden
                className="size-3.5 text-faint transition group-hover:text-accent-bright motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        </header>

        <nav
          aria-label="On this page"
          className="mt-12 border-y border-edge py-4"
        >
          <ol className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs">
            {sectionsOf(project).map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-faint transition-colors hover:text-accent-bright"
                >
                  <span className="text-accent/70">{String(i + 1).padStart(2, "0")}</span>{" "}
                  {s.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <CaseSection id="overview" title="Overview">
          <p className="max-w-3xl text-base leading-relaxed text-muted md:text-[17px]">
            {withInlineCode(project.overview)}
          </p>
        </CaseSection>

        <CaseSection id="problem" title="The problem">
          <p className="max-w-3xl text-base leading-relaxed text-muted md:text-[17px]">
            {withInlineCode(project.problem)}
          </p>
        </CaseSection>

        <CaseSection
          id="architecture"
          title="Architecture"
          lead="The system as a diagram, then the same path walked in the order a request travels it."
        >
          <ArchitectureDiagram data={project.diagram} title={`${project.name} topology`} />
          <Flow steps={project.flow} />
        </CaseSection>

        <CaseSection
          id="decisions"
          title="Engineering decisions"
          lead="Each one with the context that forced it, and what it cost."
        >
          <div className="space-y-6">
            {project.decisions.map((d, i) => (
              <Decision key={d.title} decision={d} index={i} />
            ))}
          </div>
        </CaseSection>

        {project.results && (
          <CaseSection
            id="results"
            title="Measured results"
            lead="Quoted from the project's own write-up, so every number can be checked against its source."
          >
            <ResultsTable results={project.results} />
            {project.finding && (
              <div className="mt-6">
                <FindingCallout finding={project.finding} />
              </div>
            )}
          </CaseSection>
        )}

        <CaseSection id="challenges" title="What was hard">
          <IconList items={project.challenges} icon={<TriangleAlert className="text-amber-400/80" />} />
        </CaseSection>

        <CaseSection
          id="limitations"
          title="Known limitations"
          lead="What it doesn't do, written down before someone else finds it."
        >
          <IconList items={project.limitations} icon={<CircleSlash className="text-faint" />} />
        </CaseSection>

        {others.length > 0 && (
          <nav className="mt-24 border-t border-edge pt-8" aria-label="More projects">
            <ul className="grid gap-4 sm:grid-cols-2">
              {others.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/projects/${p.slug}`}
                    className="glow-hover group block rounded-2xl border border-edge bg-raised/85 p-6"
                  >
                    <span className="font-mono text-xs text-faint">next case study</span>
                    <span className="mt-2 flex items-center gap-2 font-display text-xl font-semibold text-foreground">
                      {p.name}
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 text-accent motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
                      />
                    </span>
                    <span className="mt-1 block font-mono text-xs text-accent">{p.tagline}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </main>
      <Footer />
    </>
  );
}

function CaseSection({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <RevealOnScroll className="mt-20 md:mt-24">
      <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24">
        <h2
          id={`${id}-heading`}
          className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
        >
          {title}
        </h2>
        {lead && <p className="mt-2 max-w-2xl text-sm text-faint md:text-base">{lead}</p>}
        <div className="mt-8">{children}</div>
      </section>
    </RevealOnScroll>
  );
}

/** The architecture walked as a numbered path, joined by a connector line. */
function Flow({ steps }: { steps: FlowStep[] }) {
  return (
    <ol className="mt-12">
      {steps.map((step, i) => (
        <li key={step.title} className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-5 pb-9 last:pb-0">
          {i < steps.length - 1 && (
            <span
              aria-hidden
              className="absolute top-11 bottom-1 left-5 w-px -translate-x-1/2 bg-gradient-to-b from-accent/50 to-edge-strong"
            />
          )}
          <span className="flex size-10 items-center justify-center rounded-full border border-accent/40 bg-accent-dim font-mono text-xs font-medium text-accent-bright">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="pt-2">
            <h3 className="font-display text-lg font-medium text-foreground">{step.title}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted md:text-[15px]">
              {withInlineCode(step.body)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Decision({ decision: d, index }: { decision: EngineeringDecision; index: number }) {
  return (
    <article className="rounded-2xl border border-edge bg-raised/85 shadow-card">
      <h3 className="flex items-baseline gap-3 border-b border-edge px-6 py-4 font-display text-lg font-medium text-foreground md:px-7">
        <span className="font-mono text-xs text-accent">{String(index + 1).padStart(2, "0")}</span>
        {d.title}
      </h3>
      <dl className="space-y-4 px-6 py-5 md:px-7 md:py-6">
        <DecisionRow label="Context">{d.context}</DecisionRow>
        <DecisionRow label="Decision">{d.decision}</DecisionRow>
        <DecisionRow label="Why">{d.why}</DecisionRow>
        <DecisionRow label="Trade-offs">{d.tradeoffs}</DecisionRow>
        <DecisionRow label="Lesson" accent>
          {d.lesson}
        </DecisionRow>
      </dl>
    </article>
  );
}

function DecisionRow({
  label,
  children,
  accent = false,
}: {
  label: string;
  children: string;
  accent?: boolean;
}) {
  return (
    <div className="grid gap-1 md:grid-cols-[110px_minmax(0,1fr)] md:gap-4">
      <dt
        className={`pt-0.5 font-mono text-xs tracking-wider uppercase ${
          accent ? "text-accent" : "text-faint"
        }`}
      >
        {label}
      </dt>
      <dd className={`text-sm leading-relaxed ${accent ? "text-foreground" : "text-muted"}`}>
        {withInlineCode(children)}
      </dd>
    </div>
  );
}

function IconList({ items, icon }: { items: string[]; icon: ReactNode }) {
  return (
    <ul className="space-y-5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3.5 text-sm leading-relaxed text-muted md:text-[15px]">
          <span aria-hidden className="mt-0.5 shrink-0 [&>svg]:size-4">
            {icon}
          </span>
          <span className="max-w-3xl">{withInlineCode(item)}</span>
        </li>
      ))}
    </ul>
  );
}
