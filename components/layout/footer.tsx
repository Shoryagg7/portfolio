import Link from "next/link";
import { Mail, Rss } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { profile } from "@/lib/content/profile";

const links = [
  { href: profile.links.github, label: "GitHub", icon: GithubIcon },
  { href: profile.links.linkedin, label: "LinkedIn", icon: LinkedinIcon },
  { href: `mailto:${profile.links.email}`, label: "Email", icon: Mail },
  { href: "/feed.xml", label: "RSS feed", icon: Rss },
];

export function Footer() {
  return (
    <footer className="border-t border-edge bg-raised/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-faint sm:flex-row md:px-8">
        <p className="font-mono text-xs">
          © {new Date().getFullYear()} {profile.name} · built with Next.js — deployed at the edge
        </p>
        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              target={l.href.startsWith("/") ? undefined : "_blank"}
              rel={l.href.startsWith("/") ? undefined : "noopener noreferrer"}
              aria-label={l.label}
              className="flex size-9 items-center justify-center rounded-md text-faint transition-colors hover:bg-elevated hover:text-foreground"
            >
              <l.icon aria-hidden className="size-4" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
