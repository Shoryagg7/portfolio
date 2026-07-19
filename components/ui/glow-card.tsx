import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}

/** Raised card with subtle border and accent glow on hover. */
export function GlowCard({ children, className, as: Tag = "div" }: GlowCardProps) {
  return (
    <Tag
      className={cn(
        "glow-hover rounded-xl border border-edge bg-raised/80 p-6",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
