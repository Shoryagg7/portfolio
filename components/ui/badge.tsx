import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "accent" | "mono";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs",
        variant === "default" && "border border-edge bg-elevated text-muted",
        variant === "accent" && "border border-(--accent)/30 bg-accent-dim text-accent-bright",
        variant === "mono" && "border border-edge bg-elevated font-mono text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
