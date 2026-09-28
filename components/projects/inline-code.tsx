import type { ReactNode } from "react";

/** Renders `backticked` spans in project copy as inline code. */
export function withInlineCode(text: string): ReactNode[] {
  return text.split(/`([^`]+)`/).map((part, i) =>
    i % 2 === 1 ? (
      <code
        key={i}
        className="rounded-[5px] border border-edge bg-elevated px-1 py-px font-mono text-[0.86em] text-foreground"
      >
        {part}
      </code>
    ) : (
      part
    ),
  );
}
