import { Section } from "@/components/layout/section";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { ProjectCard } from "@/components/projects/project-card";
import { projects } from "@/lib/content/projects";

export function ProjectsGrid() {
  return (
    <Section
      id="projects"
      kicker="04 · projects"
      title="Measured, not assumed"
      lead="Most of what I find interesting sits in the failure modes — what breaks under concurrency, what a cache quietly gets wrong, what an evaluation number doesn't actually prove. Each project opens into a full case study."
    >
      <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
        {projects.map((p) => (
          <RevealOnScroll key={p.slug} className="h-full">
            <ProjectCard project={p} />
          </RevealOnScroll>
        ))}
      </div>
    </Section>
  );
}
