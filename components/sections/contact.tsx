"use client";

import { useState } from "react";
import {
  Mail,
  Download,
  Code2,
  ChefHat,
  Braces,
  Copy,
  Check,
  ArrowUpRight,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/brand-icons";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Magnetic } from "@/components/ui/magnetic-button";
import { Button } from "@/components/ui/button";
import { Starfield } from "@/components/space/starfield";
import { profile } from "@/lib/content/profile";

const channels = [
  { label: "GitHub", href: profile.links.github, icon: GithubIcon, handle: "Shoryagg7" },
  { label: "LinkedIn", href: profile.links.linkedin, icon: LinkedinIcon, handle: "shoryag7" },
  { label: "Codeforces", href: profile.links.codeforces, icon: Code2, handle: "Shoryagg7" },
  { label: "CodeChef", href: profile.links.codechef, icon: ChefHat, handle: "shoryag7" },
  { label: "LeetCode", href: profile.links.leetcode, icon: Braces, handle: "shoryag7" },
];

export function Contact() {
  const [copied, setCopied] = useState(false);

  function copyEmail() {
    navigator.clipboard.writeText(profile.links.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <Section id="contact" className="overflow-hidden">
      <div className="relative rounded-2xl border border-edge bg-raised/60 px-6 py-16 text-center md:px-12 md:py-20">
        <Starfield density={0.8} network className="opacity-70" />
        <div
          aria-hidden
          className="absolute inset-0 rounded-2xl"
          style={{
            background:
              "radial-gradient(ellipse 55% 60% at 50% 0%, var(--accent-dim), transparent 70%)",
          }}
        />
        <div className="relative">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
              07 · contact
            </p>
            <h2 className="mx-auto mt-4 max-w-xl font-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              Let&apos;s build something reliable.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted">
              Open to Software Engineer roles in real-time, high-availability systems. The
              fastest route is email — I reply quickly.
            </p>
          </Reveal>

          <Reveal delay={0.15} className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Magnetic>
              <Button asChild size="lg">
                <a href={`mailto:${profile.links.email}`}>
                  <Mail aria-hidden /> {profile.links.email}
                </a>
              </Button>
            </Magnetic>
            <Button variant="outline" size="lg" onClick={copyEmail} aria-live="polite">
              {copied ? <Check aria-hidden className="text-accent" /> : <Copy aria-hidden />}
              {copied ? "Copied" : "Copy email"}
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={profile.resumePath} target="_blank" rel="noopener">
                <Download aria-hidden /> Resume
              </a>
            </Button>
          </Reveal>

          <Reveal delay={0.25} className="mt-10">
            <ul className="flex flex-wrap items-center justify-center gap-2">
              {channels.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 rounded-lg border border-edge bg-elevated/80 px-3.5 py-2 text-sm text-muted transition-colors hover:border-edge-strong hover:text-foreground"
                  >
                    <c.icon aria-hidden className="size-4" />
                    {c.label}
                    <ArrowUpRight
                      aria-hidden
                      className="size-3 text-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
