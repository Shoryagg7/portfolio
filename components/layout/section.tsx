import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  children: ReactNode;
  className?: string;
  /** Small mono kicker above the heading, e.g. "01 · about" */
  kicker?: string;
  title?: string;
  lead?: string;
}

/** Shared section shell: consistent spacing, kicker, display heading, lead. */
export function Section({ id, children, className, kicker, title, lead }: SectionProps) {
  return (
    <section id={id} className={cn("relative scroll-mt-20 py-24 md:py-32", className)}>
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        {(kicker || title) && (
          <div className="mb-12 max-w-2xl md:mb-16">
            {kicker && (
              <p className="mb-3 font-mono text-xs tracking-[0.25em] text-accent uppercase">
                {kicker}
              </p>
            )}
            {title && (
              <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {title}
              </h2>
            )}
            {lead && <p className="mt-4 text-base leading-relaxed text-muted">{lead}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
