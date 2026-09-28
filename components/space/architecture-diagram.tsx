"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { ArchitectureDiagram as DiagramData, ArchitectureNode } from "@/types";

const kindStyles: Record<ArchitectureNode["kind"], { fill: string; stroke: string }> = {
  client: { fill: "rgba(148,163,200,0.06)", stroke: "rgba(148,163,200,0.35)" },
  external: { fill: "rgba(148,163,200,0.06)", stroke: "rgba(148,163,200,0.35)" },
  service: { fill: "var(--accent-dim)", stroke: "var(--accent)" },
  store: { fill: "rgba(52,211,153,0.07)", stroke: "rgba(52,211,153,0.45)" },
  queue: { fill: "rgba(251,191,36,0.07)", stroke: "rgba(251,191,36,0.45)" },
};

const NODE_W = 136;
const NODE_H = 52;
const PAD = 20;
/** Rough advance of one JetBrains Mono character at the edge-label size. */
const LABEL_CHAR_W = 5.7;

/** Distance from a node's centre to its border along the unit vector (ux, uy). */
function toBorder(ux: number, uy: number) {
  const tx = ux === 0 ? Infinity : NODE_W / 2 / Math.abs(ux);
  const ty = uy === 0 ? Infinity : NODE_H / 2 / Math.abs(uy);
  return Math.min(tx, ty);
}

/**
 * Themed SVG architecture diagram rendered from typed node/edge data.
 * Edges run border to border and animate a traveling packet unless reduced
 * motion is set. Below ~760px it scrolls sideways rather than shrinking the
 * labels past legibility.
 */
export function ArchitectureDiagram({ data, title }: { data: DiagramData; title: string }) {
  const reduce = useReducedMotion();
  const markerId = `arrow-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const byId = new Map(data.nodes.map((n) => [n.id, n]));

  const minX = Math.min(...data.nodes.map((n) => n.x)) - NODE_W / 2 - PAD;
  const maxX = Math.max(...data.nodes.map((n) => n.x)) + NODE_W / 2 + PAD;
  const minY = Math.min(...data.nodes.map((n) => n.y)) - NODE_H / 2 - PAD;
  const maxY = Math.max(...data.nodes.map((n) => n.y)) + NODE_H / 2 + PAD;

  const edges = data.edges.flatMap((edge) => {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    if (!from || !to) return [];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;
    const start = toBorder(ux, uy) + 4;
    const end = toBorder(ux, uy) + 7;
    return [
      {
        ...edge,
        x1: from.x + ux * start,
        y1: from.y + uy * start,
        x2: to.x - ux * end,
        y2: to.y - uy * end,
        // A pill on a short horizontal edge would swallow the arrowhead, so those
        // labels sit above the line; everything else sits on it.
        above: Math.abs(dy) < Math.abs(dx) * 0.25,
      },
    ];
  });

  return (
    <figure className="rounded-2xl border border-edge bg-raised shadow-card">
      <div className="overflow-x-auto p-4 md:p-6">
        <svg
          viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
          role="img"
          aria-label={`Architecture diagram: ${title}. The numbered flow below describes it step by step.`}
          className="mx-auto h-auto w-full min-w-[760px]"
        >
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L8,4 L0,8 z" fill="rgba(148,163,200,0.6)" />
            </marker>
          </defs>

          {data.boundary && (
            <g>
              <line
                x1={minX}
                x2={maxX}
                y1={data.boundary.y}
                y2={data.boundary.y}
                stroke="rgba(148,163,200,0.3)"
                strokeDasharray="6 5"
              />
              <text
                x={minX + 12}
                y={data.boundary.y - 9}
                className="fill-[var(--faint)] font-mono uppercase"
                fontSize="9.5"
                letterSpacing="1.2"
              >
                ▲ {data.boundary.above}
              </text>
              <text
                x={minX + 12}
                y={data.boundary.y + 19}
                className="fill-[var(--faint)] font-mono uppercase"
                fontSize="9.5"
                letterSpacing="1.2"
              >
                ▼ {data.boundary.below}
              </text>
            </g>
          )}

          {edges.map((e, i) => (
            <g key={`${e.from}-${e.to}`}>
              <line
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke="rgba(148,163,200,0.38)"
                strokeWidth="1.1"
                strokeDasharray={e.dashed ? "4 4" : undefined}
                markerEnd={`url(#${markerId})`}
              />
              {!reduce && (
                <motion.circle
                  r="2.6"
                  fill="var(--accent)"
                  initial={{ cx: e.x1, cy: e.y1, opacity: 0 }}
                  animate={{ cx: [e.x1, e.x2], cy: [e.y1, e.y2], opacity: [0, 0.95, 0] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    repeatDelay: 1.4,
                    ease: "easeInOut",
                  }}
                />
              )}
            </g>
          ))}

          {edges.map((e) => {
            if (!e.label) return null;
            const midX = (e.x1 + e.x2) / 2;
            const midY = (e.y1 + e.y2) / 2;
            if (e.above) {
              return (
                <text
                  key={`${e.from}-${e.to}-label`}
                  x={midX}
                  y={midY - 7}
                  textAnchor="middle"
                  className="fill-[var(--faint)] font-mono"
                  fontSize="9.5"
                >
                  {e.label}
                </text>
              );
            }
            const w = e.label.length * LABEL_CHAR_W + 12;
            return (
              <g key={`${e.from}-${e.to}-label`}>
                <rect
                  x={midX - w / 2}
                  y={midY - 8}
                  width={w}
                  height={16}
                  rx="8"
                  fill="var(--bg-raised)"
                  stroke="rgba(148,163,200,0.16)"
                />
                <text
                  x={midX}
                  y={midY + 3.3}
                  textAnchor="middle"
                  className="fill-[var(--faint)] font-mono"
                  fontSize="9.5"
                >
                  {e.label}
                </text>
              </g>
            );
          })}

          {data.nodes.map((node) => {
            const style = kindStyles[node.kind];
            return (
              <g key={node.id}>
                <rect
                  x={node.x - NODE_W / 2}
                  y={node.y - NODE_H / 2}
                  width={NODE_W}
                  height={NODE_H}
                  rx="10"
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth="1.1"
                />
                <text
                  x={node.x}
                  y={node.sublabel ? node.y - 3 : node.y + 4.5}
                  textAnchor="middle"
                  className="fill-[var(--foreground)]"
                  fontSize="13"
                  fontWeight="500"
                >
                  {node.label}
                </text>
                {node.sublabel && (
                  <text
                    x={node.x}
                    y={node.y + 14}
                    textAnchor="middle"
                    className="fill-[var(--faint)] font-mono"
                    fontSize="9.5"
                  >
                    {node.sublabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-edge px-4 py-3 font-mono text-xs text-faint">
        <span>{title}</span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-[3px] border border-accent bg-accent-dim" />
          service
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-[3px] border border-emerald-400/60 bg-emerald-400/10" />
          datastore
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-[3px] border border-amber-400/60 bg-amber-400/10" />
          stream
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-[3px] border border-edge-strong bg-elevated" />
          client · external
        </span>
        <span className="md:hidden">scroll sideways to see it all →</span>
      </figcaption>
    </figure>
  );
}
