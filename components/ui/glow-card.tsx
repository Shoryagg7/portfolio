import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Density = "compact" | "default" | "roomy";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
  /**
   * Padding weight. The first pass hardcoded p-6 everywhere, which made a
   * three-line stat tile and a full project summary sit in identical boxes.
   */
  density?: Density;
}

const densities: Record<Density, string> = {
  compact: "p-5",
  default: "p-6 md:p-8",
  roomy: "p-8 md:p-10",
};

/** Raised card with subtle border, resting elevation, and accent lift on hover. */
export function GlowCard({
  children,
  className,
  as: Tag = "div",
  density = "default",
}: GlowCardProps) {
  return (
    <Tag
      className={cn(
        "glow-hover rounded-2xl border border-edge bg-raised/85",
        densities[density],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
