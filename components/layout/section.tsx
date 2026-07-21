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
  /**
   * Optional right-rail content aligned to the section heading. Without it the
   * header block leaves ~400px of empty gutter on desktop, six times down the page.
   */
  aside?: ReactNode;
}

/** Shared section shell: consistent spacing, kicker, display heading, lead. */
export function Section({
  id,
  children,
  className,
  kicker,
  title,
  lead,
  aside,
}: SectionProps) {
  return (
    <section id={id} className={cn("relative scroll-mt-20 py-32 md:py-44", className)}>
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        {(kicker || title) && (
          <div
            className={cn(
              "mb-16 md:mb-24",
              aside &&
                "md:flex md:items-end md:justify-between md:gap-12",
            )}
          >
            <div className="max-w-3xl">
              {kicker && (
                <p className="mb-4 font-mono text-xs tracking-[0.25em] text-accent uppercase">
                  {kicker}
                </p>
              )}
              {title && (
                <h2 className="font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance text-foreground md:text-6xl">
                  {title}
                </h2>
              )}
              {lead && (
                <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
                  {lead}
                </p>
              )}
            </div>
            {aside && (
              <div className="mt-8 shrink-0 md:mt-0 md:pb-2 md:text-right">{aside}</div>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
