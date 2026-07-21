"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { EASE } from "@/lib/design/motion";

/**
 * Animated section header. Every section heading on the site used to appear
 * instantly, with no motion wrapper at all, which is a large part of why the
 * page read as static once you scrolled past the hero.
 *
 * The three parts arrive on a short stagger so the eye lands on the kicker,
 * then the title, then the lead, instead of the whole block flashing in at once.
 */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

export function SectionHeading({
  kicker,
  title,
  lead,
}: {
  kicker?: string;
  title?: string;
  lead?: string;
}) {
  const reduce = useReducedMotion();

  const item: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 22, filter: "blur(7px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: EASE.outExpo },
    },
  };

  return (
    <motion.div
      className="max-w-3xl"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-90px" }}
    >
      {kicker && (
        <motion.p
          variants={item}
          className="mb-4 flex items-center gap-3 font-mono text-xs tracking-[0.25em] text-accent uppercase"
        >
          {kicker}
          {/* Hairline that draws itself outward from the kicker. */}
          <motion.span
            aria-hidden
            className="h-px flex-1 origin-left bg-gradient-to-r from-accent to-transparent"
            initial={reduce ? { opacity: 0 } : { scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 0.5 }}
            viewport={{ once: true, margin: "-90px" }}
            transition={{ duration: 0.9, delay: 0.25, ease: EASE.outExpo }}
          />
        </motion.p>
      )}
      {title && (
        <motion.h2
          variants={item}
          className="font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance text-foreground md:text-6xl"
        >
          {title}
        </motion.h2>
      )}
      {lead && (
        <motion.p
          variants={item}
          className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg"
        >
          {lead}
        </motion.p>
      )}
    </motion.div>
  );
}
