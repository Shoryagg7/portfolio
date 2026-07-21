import { Mail, Rss } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { profile } from "@/lib/content/profile";
import { withBasePath } from "@/lib/site";

const links = [
  { href: profile.links.github, label: "GitHub", icon: GithubIcon },
  { href: profile.links.linkedin, label: "LinkedIn", icon: LinkedinIcon },
  { href: `mailto:${profile.links.email}`, label: "Email", icon: Mail },
  { href: withBasePath("/feed.xml"), label: "RSS feed", icon: Rss },
];

export function Footer() {
  return (
    <footer className="border-t border-edge bg-raised/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-faint sm:flex-row md:px-8">
        <p className="font-mono text-xs">
          © {new Date().getFullYear()} {profile.name} · built with Next.js · deployed on GitHub Pages
        </p>
        <div className="flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
              aria-label={l.label}
              className="flex size-9 items-center justify-center rounded-md text-faint transition-colors hover:bg-elevated hover:text-foreground"
            >
              <l.icon aria-hidden className="size-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
