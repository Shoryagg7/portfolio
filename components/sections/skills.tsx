import {
  Server,
  Database,
  Workflow,
  Network,
  Container,
  Trophy,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { GlowCard } from "@/components/ui/glow-card";
import { Badge } from "@/components/ui/badge";
import { skillCategories } from "@/lib/content/skills";

const icons: Record<string, LucideIcon> = {
  server: Server,
  database: Database,
  workflow: Workflow,
  network: Network,
  container: Container,
  trophy: Trophy,
  sparkles: Sparkles,
};

export function Skills() {
  return (
    <Section
      id="skills"
      kicker="03 · skills"
      title="Tools I reach for"
      lead="Organized by what they're for, not by proficiency bars."
    >
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skillCategories.map((cat) => {
          const Icon = icons[cat.icon] ?? Server;
          return (
            <StaggerItem key={cat.name}>
              <GlowCard className="group h-full">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg border border-edge bg-elevated text-accent transition-colors group-hover:border-(--accent)/40">
                    <Icon aria-hidden className="size-4" />
                  </span>
                  <div>
                    <h3 className="font-medium text-foreground">{cat.name}</h3>
                    <p className="font-mono text-[11px] text-faint">{cat.note}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {cat.skills.map((s) => (
                    <Badge key={s} variant="mono">
                      {s}
                    </Badge>
                  ))}
                </div>
              </GlowCard>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}
