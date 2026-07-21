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

/*
  Bento spans over a 6-column track. Seven categories in an even 3-column grid
  left a two-slot hole in the last row; these widths total 18, so the rows fill
  exactly while staying deliberately uneven. The wide slots go to the categories
  that carry the most tools.
*/
const spans: Record<string, string> = {
  Backend: "sm:col-span-2 lg:col-span-3",
  "Databases & Caching": "lg:col-span-3",
  "Messaging & Streaming": "lg:col-span-2",
  "System Design": "lg:col-span-2",
  "AI / GenAI": "lg:col-span-2",
  "Infrastructure & Observability": "lg:col-span-3",
  "Competitive Programming": "lg:col-span-3",
};

const order = Object.keys(spans);

const ordered = [...skillCategories].sort((a, b) => {
  const ai = order.indexOf(a.name);
  const bi = order.indexOf(b.name);
  return (ai === -1 ? order.length : ai) - (bi === -1 ? order.length : bi);
});

export function Skills() {
  const toolCount = skillCategories.reduce((n, c) => n + c.skills.length, 0);

  return (
    <Section
      id="skills"
      kicker="03 · skills"
      title="Tools I reach for"
      lead="Organized by what they're for, not by proficiency bars."
      aside={
        <p className="font-mono text-xs text-faint">
          <span className="text-foreground">{skillCategories.length}</span> domains
          <span className="mx-2 text-edge-strong">/</span>
          <span className="text-foreground">{toolCount}</span> tools
        </p>
      }
    >
      <Stagger className="grid gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-6">
        {ordered.map((cat) => {
          const Icon = icons[cat.icon] ?? Server;
          return (
            <StaggerItem key={cat.name} className={spans[cat.name] ?? "lg:col-span-2"}>
              <GlowCard className="group h-full">
                <div className="flex items-center gap-3.5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-edge bg-elevated text-accent transition-colors group-hover:border-(--accent)/40">
                    <Icon aria-hidden className="size-4.5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-medium text-foreground">
                      {cat.name}
                    </h3>
                    <p className="font-mono text-xs text-faint">{cat.note}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-1.5">
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
