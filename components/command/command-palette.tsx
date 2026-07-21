"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  User,
  Lightbulb,
  Wrench,
  FolderGit2,
  Trophy,
  PenLine,
  Mail,
  Download,
  Code2,
  ChefHat,
  Braces,
  Copy,
  Check,
  Palette,
  Home,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { profile } from "@/lib/content/profile";
import { projects } from "@/lib/content/projects";
import type { PostMeta } from "@/types";

const sections = [
  { id: "hero", label: "Home", icon: Home },
  { id: "about", label: "About", icon: User },
  { id: "philosophy", label: "Engineering Philosophy", icon: Lightbulb },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "competitive-programming", label: "Competitive Programming", icon: Trophy },
  { id: "blog", label: "Blog", icon: PenLine },
  { id: "contact", label: "Contact", icon: Mail },
];

const externalLinks = [
  { label: "Open GitHub", href: profile.links.github, icon: GithubIcon, keywords: "github code" },
  { label: "Open LinkedIn", href: profile.links.linkedin, icon: LinkedinIcon, keywords: "linkedin hire me" },
  { label: "Open Codeforces", href: profile.links.codeforces, icon: Code2, keywords: "codeforces stats cp" },
  { label: "Open CodeChef", href: profile.links.codechef, icon: ChefHat, keywords: "codechef stats" },
  { label: "Open LeetCode", href: profile.links.leetcode, icon: Braces, keywords: "leetcode stats" },
];

const accents = [
  { id: "blue", label: "Electric Blue" },
  { id: "cyan", label: "Cyan" },
  { id: "violet", label: "Violet" },
] as const;

interface CommandPaletteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  posts: PostMeta[];
}

export function CommandPalette({ open, setOpen, posts }: CommandPaletteProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  function run(action: () => void) {
    action();
    setOpen(false);
  }

  function goTo(id: string) {
    run(() => router.push(id === "hero" ? "/" : `/#${id}`));
  }

  function setAccent(id: string) {
    if (id === "blue") {
      document.documentElement.removeAttribute("data-accent");
    } else {
      document.documentElement.setAttribute("data-accent", id);
    }
    try {
      localStorage.setItem("accent", id);
    } catch {
      /* private mode */
    }
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command palette"
      loop
      /*
        Panel styling belongs on contentClassName, not className. cmdk forwards
        className to the inner Command div and contentClassName to Radix's
        Dialog.Content, and only the latter carries the data-state attribute the
        open/close animations key off.
      */
      contentClassName="palette-panel fixed left-1/2 top-[18%] z-[100] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-edge-strong bg-elevated/95 shadow-2xl shadow-black/60 backdrop-blur-xl"
      overlayClassName="palette-veil fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
    >
      <Command.Input
        placeholder="Type a command or search…"
        className="w-full border-b border-edge bg-transparent px-4 py-3.5 font-mono text-sm text-foreground outline-none placeholder:text-faint"
      />
      <Command.List className="max-h-[min(60vh,380px)] overflow-y-auto p-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-faint">
        <Command.Empty className="px-3 py-8 text-center text-sm text-faint">
          No results. Signal lost in transit.
        </Command.Empty>

        <Command.Group heading="Navigate">
          {sections.map((s) => (
            <PaletteItem key={s.id} onSelect={() => goTo(s.id)} keywords={[s.label]}>
              <s.icon aria-hidden className="size-4 text-faint" />
              {s.label}
            </PaletteItem>
          ))}
        </Command.Group>

        <Command.Group heading="Projects">
          {projects.map((p) => (
            <PaletteItem
              key={p.slug}
              onSelect={() => run(() => router.push(`/projects/${p.slug}`))}
              keywords={[p.name, ...p.stack]}
            >
              <FolderGit2 aria-hidden className="size-4 text-faint" />
              {p.name}
              <span className="ml-auto truncate text-xs text-faint">{p.tagline}</span>
            </PaletteItem>
          ))}
        </Command.Group>

        {posts.length > 0 && (
          <Command.Group heading="Blog">
            {posts.map((post) => (
              <PaletteItem
                key={post.slug}
                onSelect={() => run(() => router.push(`/blog/${post.slug}`))}
                keywords={[post.title, ...post.tags]}
              >
                <PenLine aria-hidden className="size-4 text-faint" />
                <span className="truncate">{post.title}</span>
              </PaletteItem>
            ))}
          </Command.Group>
        )}

        <Command.Group heading="Actions">
          <PaletteItem
            onSelect={() => run(() => window.open(profile.resumePath, "_blank"))}
            keywords={["resume", "cv", "download"]}
          >
            <Download aria-hidden className="size-4 text-faint" />
            Download Resume
          </PaletteItem>
          <PaletteItem
            onSelect={() => {
              navigator.clipboard.writeText(profile.links.email);
              setCopied(true);
            }}
            keywords={["email", "copy", "contact", "hire me"]}
          >
            {copied ? (
              <Check aria-hidden className="size-4 text-accent" />
            ) : (
              <Copy aria-hidden className="size-4 text-faint" />
            )}
            {copied ? "Copied!" : "Copy Email"}
            <span className="ml-auto font-mono text-xs text-faint">{profile.links.email}</span>
          </PaletteItem>
          {externalLinks.map((l) => (
            <PaletteItem
              key={l.label}
              onSelect={() => run(() => window.open(l.href, "_blank", "noopener"))}
              keywords={l.keywords.split(" ")}
            >
              <l.icon aria-hidden className="size-4 text-faint" />
              {l.label}
            </PaletteItem>
          ))}
        </Command.Group>

        <Command.Group heading="Theme">
          {accents.map((a) => (
            <PaletteItem
              key={a.id}
              onSelect={() => run(() => setAccent(a.id))}
              keywords={["theme", "accent", "color", a.label]}
            >
              <Palette aria-hidden className="size-4 text-faint" />
              Accent: {a.label}
            </PaletteItem>
          ))}
        </Command.Group>
      </Command.List>

      <div className="flex items-center gap-3 border-t border-edge px-4 py-2 font-mono text-xs text-faint">
        <span>↑↓ navigate</span>
        <span>↵ select</span>
        <span>esc close</span>
      </div>
    </Command.Dialog>
  );
}

function PaletteItem({
  children,
  onSelect,
  keywords,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  keywords?: string[];
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      keywords={keywords}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted data-[selected=true]:bg-accent-dim data-[selected=true]:text-foreground"
    >
      {children}
    </Command.Item>
  );
}
