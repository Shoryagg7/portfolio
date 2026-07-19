import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Technical notes and system design writeups — distributed systems, databases, and competitive programming.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-28 md:px-8 md:pt-36">
        <Reveal from="none">
          <Link
            href="/#blog"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-faint transition-colors hover:text-foreground"
          >
            <ArrowLeft aria-hidden className="size-3.5" /> home
          </Link>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-foreground">
            Writing
          </h1>
          <p className="mt-3 max-w-xl text-muted">
            Technical notes and system design writeups. Short, specific, and drawn from things
            I actually built or solved.
          </p>
        </Reveal>

        <Stagger className="mt-12 space-y-4">
          {posts.map((post) => (
            <StaggerItem key={post.slug}>
              <article className="glow-hover group relative rounded-xl border border-edge bg-raised/80 p-6">
                <div className="flex items-center gap-3 font-mono text-xs text-faint">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <span aria-hidden>·</span>
                  <span>{post.readingTime}</span>
                </div>
                <h2 className="mt-2 font-display text-xl font-medium text-foreground transition-colors group-hover:text-accent-bright">
                  <Link href={`/blog/${post.slug}`}>
                    <span className="absolute inset-0" aria-hidden />
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{post.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  {post.tags.map((tag) => (
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
      </main>
      <Footer />
    </>
  );
}
