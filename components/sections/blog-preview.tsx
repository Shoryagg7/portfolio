import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import type { PostMeta } from "@/types";

export function BlogPreview({ posts }: { posts: PostMeta[] }) {
  return (
    <Section
      id="blog"
      kicker="06 · writing"
      title="Can I explain hard ideas?"
      lead="Short technical notes and longer system design breakdowns, kept in one place and tagged by topic."
      aside={
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 font-mono text-xs text-faint transition-colors hover:text-accent"
        >
          <span className="text-foreground">{posts.length}</span> posts
          <ArrowRight
            aria-hidden
            className="size-3.5 transition-transform group-hover:translate-x-1"
          />
        </Link>
      }
    >
      <Stagger className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        {posts.slice(0, 3).map((post) => (
          <StaggerItem key={post.slug}>
            <article className="glow-hover group relative flex h-full flex-col rounded-2xl border border-edge bg-raised/85 p-6 md:p-8">
              <div className="flex items-center gap-2.5 font-mono text-xs text-faint">
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </time>
                <span aria-hidden>·</span>
                <span>{post.readingTime}</span>
              </div>
              <h3 className="mt-3 font-display text-lg font-medium leading-snug text-foreground transition-colors group-hover:text-accent-bright">
                <Link href={`/blog/${post.slug}`}>
                  <span className="absolute inset-0" aria-hidden />
                  {post.title}
                </Link>
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                {post.description}
              </p>
              <div className="mt-auto flex items-center gap-1.5 pt-4">
                {post.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
                <ArrowUpRight
                  aria-hidden
                  className="ml-auto size-4 text-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                />
              </div>
            </article>
          </StaggerItem>
        ))}
      </Stagger>
      <Reveal delay={0.2} className="mt-8">
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 font-mono text-sm text-accent transition-colors hover:text-accent-bright"
        >
          all posts <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </Reveal>
    </Section>
  );
}
