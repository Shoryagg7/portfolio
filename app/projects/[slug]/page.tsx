import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { ProjectCard } from "@/components/projects/project-card";
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

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <>
      <ScrollProgress />
      <Navbar />
      {/* w-full: body is a flex column, and the card's container query gives it no
          intrinsic width, so without it mx-auto would shrink main to the back link. */}
      <main className="mx-auto w-full max-w-4xl px-5 pb-24 pt-28 md:px-8 md:pt-36">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-faint transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden className="size-3.5" /> all projects
        </Link>

        <ProjectCard project={project} as="h1" className="mt-6" />

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
                  next project: {p.name}
                  <ArrowUpRight
                    aria-hidden
                    className="size-4 motion-safe:transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
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
