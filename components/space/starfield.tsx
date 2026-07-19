"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Star {
  x: number;
  y: number;
  r: number;
  layer: number; // 0 = far, 1 = mid, 2 = near
  twinklePhase: number;
  twinkleSpeed: number;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Pulse {
  from: number;
  to: number;
  t: number;
  speed: number;
}

interface StarfieldProps {
  /** Stars per 10,000 px². Scaled down automatically on small screens. */
  density?: number;
  /** Draw constellation network nodes + link lines + traveling pulses. */
  network?: boolean;
  className?: string;
}

/**
 * Canvas 2D starfield with parallax drift, twinkle, and an optional
 * constellation network (drifting nodes, proximity links, signal pulses).
 * Renders a single static frame when prefers-reduced-motion is set.
 */
export function Starfield({ density = 1.1, network = true, className }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let nodes: Node[] = [];
    let pulses: Pulse[] = [];
    let raf = 0;
    let running = true;

    const accent = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#4f8dff";

    function setup() {
      const rect = canvas!.parentElement?.getBoundingClientRect();
      width = rect?.width ?? window.innerWidth;
      height = rect?.height ?? window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const isMobile = width < 768;
      const effectiveDensity = density * (isMobile ? 0.45 : 1);
      const count = Math.floor(((width * height) / 10000) * effectiveDensity);

      stars = Array.from({ length: count }, () => {
        const layer = Math.random() < 0.55 ? 0 : Math.random() < 0.75 ? 1 : 2;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          r: layer === 0 ? 0.5 + Math.random() * 0.5 : layer === 1 ? 0.7 + Math.random() * 0.7 : 1 + Math.random() * 1.1,
          layer,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.3 + Math.random() * 1.2,
        };
      });

      const nodeCount = network ? (isMobile ? 7 : 14) : 0;
      nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
      }));
      pulses = [];
    }

    const LINK_DIST = 180;

    function draw(time: number) {
      ctx!.clearRect(0, 0, width, height);
      const accentColor = accent();

      // Stars with parallax drift + twinkle
      for (const s of stars) {
        const twinkle = reducedMotion
          ? 0.75
          : 0.55 + 0.45 * Math.sin(s.twinklePhase + (time / 1000) * s.twinkleSpeed);
        const drift = reducedMotion ? 0 : (time / 1000) * (2 + s.layer * 3);
        const x = (s.x + drift) % width;
        ctx!.beginPath();
        ctx!.arc(x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fillStyle =
          s.layer === 2
            ? `rgba(200, 215, 255, ${0.5 * twinkle})`
            : `rgba(180, 195, 235, ${(s.layer === 1 ? 0.35 : 0.22) * twinkle})`;
        ctx!.fill();
      }

      if (network && nodes.length) {
        // Move nodes
        if (!reducedMotion) {
          for (const n of nodes) {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0 || n.x > width) n.vx *= -1;
            if (n.y < 0 || n.y > height) n.vy *= -1;
          }
        }

        // Links between nearby nodes
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.hypot(dx, dy);
            if (dist < LINK_DIST) {
              const alpha = (1 - dist / LINK_DIST) * 0.14;
              ctx!.beginPath();
              ctx!.moveTo(nodes[i].x, nodes[i].y);
              ctx!.lineTo(nodes[j].x, nodes[j].y);
              ctx!.strokeStyle = `rgba(148, 163, 200, ${alpha})`;
              ctx!.lineWidth = 0.6;
              ctx!.stroke();

              // Occasionally launch a pulse along a link
              if (!reducedMotion && pulses.length < 4 && Math.random() < 0.0015) {
                pulses.push({ from: i, to: j, t: 0, speed: 0.004 + Math.random() * 0.006 });
              }
            }
          }
        }

        // Node dots
        for (const n of nodes) {
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
          ctx!.fillStyle = "rgba(160, 178, 220, 0.45)";
          ctx!.fill();
        }

        // Traveling signal pulses (accent-colored)
        pulses = pulses.filter((p) => p.t <= 1);
        for (const p of pulses) {
          p.t += p.speed;
          const a = nodes[p.from];
          const b = nodes[p.to];
          if (!a || !b) continue;
          const x = a.x + (b.x - a.x) * p.t;
          const y = a.y + (b.y - a.y) * p.t;
          const fade = Math.sin(p.t * Math.PI);
          ctx!.beginPath();
          ctx!.arc(x, y, 1.8, 0, Math.PI * 2);
          ctx!.fillStyle = accentColor;
          ctx!.globalAlpha = 0.8 * fade;
          ctx!.fill();
          ctx!.globalAlpha = 0.25 * fade;
          ctx!.beginPath();
          ctx!.arc(x, y, 4.5, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.globalAlpha = 1;
        }
      }
    }

    function loop(time: number) {
      if (!running) return;
      draw(time);
      raf = requestAnimationFrame(loop);
    }

    setup();
    if (reducedMotion) {
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    // Pause when offscreen to save cycles
    const observer = new IntersectionObserver(([entry]) => {
      if (reducedMotion) return;
      if (entry.isIntersecting && !running) {
        running = true;
        raf = requestAnimationFrame(loop);
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    observer.observe(canvas);

    const onResize = () => {
      setup();
      if (reducedMotion) draw(0);
    };
    window.addEventListener("resize", onResize);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [density, network]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    />
  );
}
