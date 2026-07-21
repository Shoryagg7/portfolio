import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";

/** Typed MDX element styling for blog posts — calm, readable, mono where it counts. */
export const mdxComponents: MDXComponents = {
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight text-foreground">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="mt-8 font-display text-xl font-medium text-foreground">{children}</h3>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="mt-5 leading-relaxed text-muted">{children}</p>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="mt-5 list-disc space-y-2 pl-5 leading-relaxed text-muted marker:text-accent">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="mt-5 list-decimal space-y-2 pl-5 leading-relaxed text-muted marker:text-accent">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: ReactNode }) => <li className="pl-1">{children}</li>,
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }: { children?: ReactNode }) => <em className="italic">{children}</em>,
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="text-accent-bright underline decoration-(--accent)/40 underline-offset-4 transition-colors hover:decoration-(--accent)"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="mt-5 border-l-2 border-(--accent) bg-accent-dim/50 py-1 pl-5 pr-4 text-muted [&_p]:mt-2">
      {children}
    </blockquote>
  ),
  code: ({ children }: { children?: ReactNode }) => (
    <code className="rounded border border-edge bg-elevated px-1.5 py-0.5 font-mono text-[0.85em] text-accent-bright">
      {children}
    </code>
  ),
  pre: ({ children }: { children?: ReactNode }) => (
    <pre className="mt-5 overflow-x-auto rounded-2xl border border-edge bg-raised p-5 font-mono text-sm leading-relaxed text-foreground [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-[13px] [&_code]:text-foreground">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-10 border-edge" />,
};
