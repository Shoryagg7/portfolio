"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ArchitectureDiagram as DiagramData, ArchitectureNode } from "@/types";

const kindStyles: Record<ArchitectureNode["kind"], { fill: string; stroke: string }> = {
  client: { fill: "rgba(148,163,200,0.06)", stroke: "rgba(148,163,200,0.35)" },
  external: { fill: "rgba(148,163,200,0.06)", stroke: "rgba(148,163,200,0.35)" },
  service: { fill: "var(--accent-dim)", stroke: "var(--accent)" },
  store: { fill: "rgba(52,211,153,0.07)", stroke: "rgba(52,211,153,0.45)" },
  queue: { fill: "rgba(251,191,36,0.07)", stroke: "rgba(251,191,36,0.45)" },
};

const NODE_W = 108;
const NODE_H = 44;

/**
 * Themed SVG architecture diagram rendered from typed node/edge data.
 * Edges animate a traveling dash (packet flow) unless reduced motion is set.
 */
export function ArchitectureDiagram({ data, title }: { data: DiagramData; title: string }) {
  const reduce = useReducedMotion();
  const byId = new Map(data.nodes.map((n) => [n.id, n]));

  const maxX = Math.max(...data.nodes.map((n) => n.x)) + NODE_W / 2 + 20;
  const maxY = Math.max(...data.nodes.map((n) => n.y)) + NODE_H / 2 + 20;

  return (
    <div className="overflow-x-auto rounded-xl border border-edge bg-raised/60 p-4">
      <svg
        viewBox={`0 0 ${maxX} ${maxY}`}
        role="img"
        aria-label={`Architecture diagram: ${title}`}
        className="mx-auto h-auto w-full min-w-[640px] max-w-4xl"
      >
        <defs>
          <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L8,4 L0,8 z" fill="rgba(148,163,200,0.5)" />
          </marker>
        </defs>

        {data.edges.map((edge, i) => {
          const from = byId.get(edge.from);
          const to = byId.get(edge.to);
          if (!from || !to) return null;

          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.hypot(dx, dy) || 1;
          // Trim endpoints to node borders (approximate with half-diagonal)
          const trimFrom = Math.min(NODE_W, NODE_H) / 2 + 14;
          const trimTo = trimFrom + 4;
          const x1 = from.x + (dx / dist) * trimFrom;
          const y1 = from.y + (dy / dist) * trimFrom;
          const x2 = to.x - (dx / dist) * trimTo;
          const y2 = to.y - (dy / dist) * trimTo;
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;

          return (
            <g key={`${edge.from}-${edge.to}-${i}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(148,163,200,0.28)"
                strokeWidth="1"
                strokeDasharray={edge.dashed ? "4 4" : undefined}
                markerEnd="url(#arrow)"
              />
              {!reduce && (
                <motion.circle
                  r="2.2"
                  fill="var(--accent)"
                  initial={{ cx: x1, cy: y1, opacity: 0 }}
                  animate={{ cx: [x1, x2], cy: [y1, y2], opacity: [0, 0.9, 0] }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    delay: i * 0.35,
                    repeatDelay: 1.4,
                    ease: "easeInOut",
                  }}
                />
              )}
              {edge.label && (
                <text
                  x={midX}
                  y={midY - 6}
                  textAnchor="middle"
                  className="fill-[var(--faint)] font-mono"
                  fontSize="8.5"
                >
                  {edge.label}
                </text>
              )}
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
                rx="8"
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth="1"
              />
              <text
                x={node.x}
                y={node.sublabel ? node.y - 2 : node.y + 3.5}
                textAnchor="middle"
                className="fill-[var(--foreground)]"
                fontSize="10.5"
                fontWeight="500"
              >
                {node.label}
              </text>
              {node.sublabel && (
                <text
                  x={node.x}
                  y={node.y + 12}
                  textAnchor="middle"
                  className="fill-[var(--faint)] font-mono"
                  fontSize="7.5"
                >
                  {node.sublabel}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <p className="mt-3 text-center font-mono text-[11px] text-faint">
        {title} — service <span className="text-accent">■</span> · datastore{" "}
        <span className="text-emerald-400">■</span> · stream{" "}
        <span className="text-amber-400">■</span>
      </p>
    </div>
  );
}
