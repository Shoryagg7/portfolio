import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { SectionHeading } from "./section-heading";

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
            <SectionHeading kicker={kicker} title={title} lead={lead} />
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
