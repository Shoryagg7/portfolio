"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Download } from "lucide-react";
import { Starfield } from "@/components/space/starfield";
import { OrbitRing } from "@/components/space/orbit-ring";
import { Magnetic } from "@/components/ui/magnetic-button";
import { Button } from "@/components/ui/button";
import { StatCounter } from "@/components/ui/stat-counter";
import { profile, heroStats } from "@/lib/content/profile";

const ease: [number, number, number, number] = [0.21, 0.47, 0.32, 0.98];

export function Hero() {
  const reduce = useReducedMotion();
  const fade = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 20, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.7, delay, ease },
  });

  return (
    <section id="hero" className="relative flex min-h-svh items-center overflow-hidden">
      {/* Layered background: starfield network + grid + radial accent haze */}
      <Starfield density={1.2} network className="opacity-90" />
      <div aria-hidden className="grid-texture absolute inset-0" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 8%, var(--accent-dim), transparent 65%)",
        }}
      />
      <OrbitRing size={620} duration={70} className="-right-64 -top-64 opacity-60 max-md:hidden" />
      <OrbitRing size={420} duration={50} reverse className="-right-40 -top-40 opacity-40 max-md:hidden" />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-32 md:px-8">
        <motion.p
          {...fade(0.05)}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-edge bg-raised/70 px-3.5 py-1.5 font-mono text-xs text-muted backdrop-blur"
        >
          <span className="relative flex size-1.5">
            <span className="absolute h-full w-full rounded-full bg-emerald-400 opacity-70 motion-safe:animate-ping [animation-duration:2s]" />
            <span className="relative size-1.5 rounded-full bg-emerald-400" />
          </span>
          open to SWE roles · real-time & high-availability systems
        </motion.p>

        <motion.h1
          {...fade(0.15)}
          className="max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-7xl"
        >
          {profile.name.split(" ")[0]}{" "}
          <span className="text-faint">{profile.name.split(" ")[1]}</span>
        </motion.h1>

        <motion.p {...fade(0.25)} className="mt-4 font-mono text-sm text-accent md:text-base">
          Backend &amp; Distributed Systems Engineer
        </motion.p>

        <motion.p {...fade(0.35)} className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          {profile.intro}
        </motion.p>

        <motion.div {...fade(0.45)} className="mt-9 flex flex-wrap items-center gap-4">
          <Magnetic>
            <Button asChild size="lg">
              <a href="#projects">
                View Projects <ArrowRight aria-hidden />
              </a>
            </Button>
          </Magnetic>
          <Magnetic>
            <Button asChild variant="outline" size="lg">
              <Link href={profile.resumePath} target="_blank">
                <Download aria-hidden /> Resume
              </Link>
            </Button>
          </Magnetic>
        </motion.div>

        <motion.dl
          {...fade(0.6)}
          className="mt-16 grid max-w-xl grid-cols-3 divide-x divide-edge border-y border-edge"
        >
          {heroStats.map((stat) => (
            <div key={stat.label} className="px-4 py-5 first:pl-0 md:px-6">
              <dt className="order-last mt-1 font-mono text-[11px] text-faint">{stat.note}</dt>
              <dd className="font-display text-2xl font-semibold text-foreground md:text-3xl">
                <StatCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={"decimals" in stat ? stat.decimals : 0}
                />
              </dd>
              <dd className="mt-0.5 text-xs text-muted">{stat.label}</dd>
            </div>
          ))}
        </motion.dl>
      </div>

      {/* Bottom fade into the page background */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-deep" />
    </section>
  );
}
