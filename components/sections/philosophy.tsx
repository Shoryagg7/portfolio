import {
  Minimize2,
  ShieldCheck,
  Gauge,
  Anchor,
  Scale,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Section } from "@/components/layout/section";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { GlowCard } from "@/components/ui/glow-card";
import { principles } from "@/lib/content/philosophy";

const icons: Record<string, LucideIcon> = {
  minimize: Minimize2,
  shield: ShieldCheck,
  gauge: Gauge,
  anchor: Anchor,
  scale: Scale,
  wrench: Wrench,
};

export function Philosophy() {
  return (
    <Section
      id="philosophy"
      kicker="02 · philosophy"
      title="How I think about engineering"
      lead="Principles I actually apply. Each one traces back to a decision in my projects."
    >
      <Stagger className="grid gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {principles.map((p) => {
          const Icon = icons[p.icon] ?? Wrench;
          return (
            <StaggerItem key={p.title}>
              <GlowCard className="h-full">
                <Icon aria-hidden className="size-5 text-accent" />
                <h3 className="mt-5 font-display text-xl font-medium text-foreground">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
              </GlowCard>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}
