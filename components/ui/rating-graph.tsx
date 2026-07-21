"use client";

import { motion, useReducedMotion } from "motion/react";

interface RatingGraphProps {
  /** Rating history, oldest first. Falls back to a stylized placeholder curve. */
  history?: number[];
  label: string;
}

const PLACEHOLDER = [1200, 1264, 1231, 1345, 1310, 1402, 1388, 1455, 1521, 1489, 1573, 1628, 1601, 1687];

/** Minimal area sparkline for contest rating history. */
export function RatingGraph({ history, label }: RatingGraphProps) {
  const reduce = useReducedMotion();
  const data = history && history.length >= 2 ? history : PLACEHOLDER;

  const W = 560;
  const H = 120;
  const PAD = 8;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;

  const pts = data.map((v, i) => ({
    x: PAD + (i / (data.length - 1)) * (W - PAD * 2),
    y: PAD + (1 - (v - min) / span) * (H - PAD * 2),
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${H} L${pts[0].x.toFixed(1)},${H} Z`;
  const last = pts[pts.length - 1];

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${label}: rating from ${data[0]} to ${data[data.length - 1]}, peak ${max}`}
        className="h-auto w-full"
      >
        <defs>
          <linearGradient id="rating-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PAD}
            x2={W - PAD}
            y1={H * f}
            y2={H * f}
            stroke="rgba(148,163,200,0.08)"
            strokeDasharray="3 5"
          />
        ))}
        <path d={area} fill="url(#rating-fill)" />
        <motion.path
          d={line}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.8"
          strokeLinecap="round"
          initial={reduce ? undefined : { pathLength: 0 }}
          whileInView={reduce ? undefined : { pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />
        <circle cx={last.x} cy={last.y} r="3" fill="var(--accent-bright)" />
        <circle cx={last.x} cy={last.y} r="7" fill="var(--accent)" opacity="0.2" />
      </svg>
      <figcaption className="mt-1 flex justify-between font-mono text-xs text-faint">
        <span>{min}</span>
        <span>{label}</span>
        <span>{max}</span>
      </figcaption>
    </figure>
  );
}
