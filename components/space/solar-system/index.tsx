"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "motion/react";
import { buildBodies, type OrbitalBody } from "./bodies";
import { SolarSystemFallback } from "./fallback";
import type { PlatformStats } from "@/types";

/*
  three.js is ~150KB gzipped. Loading it with ssr:false keeps it out of the
  server render and out of the main bundle, so it downloads after the hero text
  has already painted. The DOM heading stays the LCP element.
*/
const Scene = dynamic(() => import("./scene"), { ssr: false });

/** Cheap one-shot WebGL probe. Cached so we never build two throwaway contexts. */
function detectWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const INTRO_KEY = "solar-intro-seen";

/** Server renders nothing; the client swaps in after hydration. No setState needed. */
const subscribeNoop = () => () => {};
const onClient = () => true;
const onServer = () => false;

interface Props {
  projects: { slug: string; name: string; tagline: string }[];
  cpStats: PlatformStats[];
}

export function SolarSystem({ projects, cpStats }: Props) {
  const reduce = useReducedMotion();
  const mounted = useSyncExternalStore(subscribeNoop, onClient, onServer);

  const bodies: OrbitalBody[] = useMemo(
    () => buildBodies(projects, cpStats),
    [projects, cpStats],
  );

  const webgl = useMemo(() => (mounted ? detectWebGL() : false), [mounted]);

  // Read once, lazily, on the first client render. The intro plays a single
  // time per session so returning to the tab isn't a repeat performance.
  const [firstVisit] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem(INTRO_KEY) !== "1",
  );
  useEffect(() => {
    sessionStorage.setItem(INTRO_KEY, "1");
  }, []);

  /*
    Holding the dynamic import until after `load`, then until the browser idles.

    ssr:false alone only keeps three.js off the server; the import still fires on
    mount. Profiling the cold load showed two long tasks back to back — hydration,
    then ~900KB of three.js parsing — and the hero paragraph (the LCP element) sat
    at opacity 0 behind both of them. Idle alone wasn't enough either: the thread
    looks idle right after first paint, so the import jumped the queue anyway.
    Waiting for `load` first puts the scene strictly behind the page's own work.
  */
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!mounted) return;

    let idleId: number | undefined;
    let timerId: number | undefined;
    const start = () => setReady(true);

    const schedule = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(start, { timeout: 2000 });
      } else {
        timerId = window.setTimeout(start, 300);
      }
    };

    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }

    return () => {
      window.removeEventListener("load", schedule);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, [mounted]);

  if (!mounted) return null;

  const animate = !reduce;
  const playIntro = firstVisit;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      // Fades in after the hero text is already on screen.
      transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {webgl ? (
        ready && (
          <div className="pointer-events-auto absolute inset-0">
            <Scene bodies={bodies} intro={playIntro && animate} animate={animate} />
          </div>
        )
      ) : (
        <SolarSystemFallback bodies={bodies} />
      )}
    </motion.div>
  );
}
