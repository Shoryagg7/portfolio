import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { Badge } from "@/components/ui/badge";
import { getAllPosts, getPost } from "@/lib/blog";
import { mdxComponents } from "@/components/blog/mdx-components";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.meta.title,
    description: post.meta.description,
    openGraph: {
      type: "article",
      title: post.meta.title,
      description: post.meta.description,
      publishedTime: post.meta.date,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-28 md:px-8 md:pt-36">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-faint transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden className="size-3.5" /> all posts
        </Link>

        <header className="mt-6">
          <div className="flex items-center gap-3 font-mono text-xs text-faint">
            <time dateTime={post.meta.date}>
              {new Date(post.meta.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <span aria-hidden>·</span>
            <span>{post.meta.readingTime}</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
            {post.meta.title}
          </h1>
          <p className="mt-3 text-base text-muted">{post.meta.description}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.meta.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        </header>

        <hr className="my-10 border-edge" />

        <article className="max-w-none">
          <MDXRemote source={post.content} components={mdxComponents} />
        </article>
      </main>
      <Footer />
    </>
  );
}
