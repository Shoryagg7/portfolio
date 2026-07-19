import { GraduationCap, MapPin, Sparkles } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { GlowCard } from "@/components/ui/glow-card";
import { Badge } from "@/components/ui/badge";
import { profile, currentlyExploring } from "@/lib/content/profile";

const focusAreas = [
  "Backend infrastructure",
  "Distributed systems",
  "System design",
  "Databases",
  "Event-driven architecture",
  "Competitive programming",
];

export function About() {
  return (
    <Section
      id="about"
      kicker="01 · about"
      title="Why distributed systems?"
      lead="Because the interesting failures only start when there's more than one machine."
    >
      <div className="grid gap-10 lg:grid-cols-5">
        <Reveal className="space-y-5 text-base leading-relaxed text-muted lg:col-span-3">
          <p>
            I&apos;m a final-year Computer Science undergraduate at{" "}
            <span className="text-foreground">{profile.university}</span>, and most of what I
            build lives on the backend: APIs that stay fast under load, services that
            coordinate over queues instead of luck, and data models that make illegal states
            unrepresentable.
          </p>
          <p>
            My path here started with competitive programming — thousands of problems that
            taught me to reason precisely about invariants, complexity, and edge cases. At
            some point I realized that a race condition in a dispatch service is just another
            invariant violation, except it only reproduces at 2 a.m. under production load.
            That intersection — algorithmic rigor applied to real infrastructure — is exactly
            where I want to work.
          </p>
          <p>
            So I build systems that take failure seriously: two-phase claims over Postgres row
            locks, replayable Kafka streams, idempotent endpoints, rate limits, dashboards.
            Not because a checklist said so, but because I&apos;ve load-tested what happens
            without them.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {focusAreas.map((area) => (
              <Badge key={area}>{area}</Badge>
            ))}
          </div>
        </Reveal>

        <div className="space-y-4 lg:col-span-2">
          <Reveal delay={0.1}>
            <GlowCard>
              <div className="flex items-start gap-3">
                <GraduationCap aria-hidden className="mt-0.5 size-5 text-accent" />
                <div>
                  <h3 className="font-medium text-foreground">{profile.university}</h3>
                  <p className="mt-1 text-sm text-muted">{profile.degree}</p>
                  <p className="mt-2 font-mono text-xs text-faint">
                    {profile.years} · GPA {profile.gpa}
                  </p>
                  <p className="mt-1 font-mono text-xs text-faint">
                    Merit Scholarship — academic excellence (9.34 AGPA)
                  </p>
                </div>
              </div>
            </GlowCard>
          </Reveal>
          <Reveal delay={0.18}>
            <GlowCard>
              <div className="flex items-start gap-3">
                <Sparkles aria-hidden className="mt-0.5 size-5 text-accent" />
                <div>
                  <h3 className="font-medium text-foreground">Currently exploring</h3>
                  <ul className="mt-2 space-y-1.5">
                    {currentlyExploring.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted">
                        <span aria-hidden className="size-1 rounded-full bg-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlowCard>
          </Reveal>
          <Reveal delay={0.26}>
            <GlowCard>
              <div className="flex items-start gap-3">
                <MapPin aria-hidden className="mt-0.5 size-5 text-accent" />
                <div>
                  <h3 className="font-medium text-foreground">Beyond the terminal</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    Vice Head of Photography at FAPS Society, state-level footballer, and a
                    long jumper on the college athletics team.
                  </p>
                </div>
              </div>
            </GlowCard>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
