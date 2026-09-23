import type { Project } from "@/types";

/*
  Every number here traces to the project's own write-up (DocMind: docs/RESULTS.md,
  DeliverIQ: README.md), which each results table links to. None are derived from code.
*/
export const projects: Project[] = [
  {
    slug: "docmind",
    name: "DocMind",
    tagline: "Privacy-aware, evaluated agentic RAG over PDFs",
    summary:
      "Ask questions about your PDFs; a LangGraph agent retrieves chunks from pgvector, has an LLM grade each chunk for relevance, rewrites the query and retries when retrieval comes back weak, then answers with citations. Because the LLM is external, every outbound message passes a local egress gate that replaces names, emails, phone numbers, card numbers, PAN and Aadhaar numbers with placeholders and restores them locally after the answer returns. If the detector errors, the call is blocked rather than sent.",
    stack: [
      "Python",
      "FastAPI",
      "PostgreSQL + pgvector",
      "Redis",
      "LangGraph",
      "Presidio",
      "sentence-transformers",
      "Docker",
    ],
    results: {
      rows: [
        { label: "Retrieval", value: "recall@1 19/27 · MRR@5 0.840" },
        {
          label: "Answer accuracy, privacy on vs off",
          value: "30/31 vs 29/31",
          note: "paired sign test p = 1.000",
        },
        {
          label: "Cost of the privacy layer",
          value: "+107 tokens · +0.28 s",
          note: "per question",
        },
        { label: "Relevance grading", value: "72.7%", note: "of pipeline tokens" },
        {
          label: "A statement vs its own negation",
          value: "0.87 similarity",
          note: "vs 0.47 for genuinely different statements",
        },
      ],
      source: {
        label: "docs/RESULTS.md",
        href: "https://github.com/Shoryagg7/docmind/blob/main/docs/RESULTS.md",
      },
    },
    finding: {
      label: "Finding · semantic cache",
      text: "A negated question scores 0.9879 against the original while the paraphrase the cache exists to serve scores 0.9399 — the case that must be rejected outscores the case that must be accepted, so no similarity threshold separates them.",
    },
    links: {
      github: "https://github.com/Shoryagg7/docmind",
    },
  },
  {
    slug: "deliveriq",
    name: "DeliverIQ",
    tagline: "Distributed Order Dispatch API",
    summary:
      "Assigns incoming delivery orders to available riders across multiple API replicas under concurrent load. Redis holds shared state, including a token-bucket rate limiter run as an atomic Lua script so one limit holds across every replica. Kafka carries order and dispatch events using consumer groups with at-least-once delivery. PostgreSQL transactional locking stops two concurrent requests from assigning the same order. Prometheus and Grafana for metrics.",
    stack: [
      "Python",
      "FastAPI",
      "PostgreSQL",
      "SQLAlchemy",
      "Redis",
      "Kafka",
      "Docker",
      "Prometheus",
      "Grafana",
    ],
    results: {
      rows: [
        {
          label: "Duplicate order or rider assignments",
          value: "0",
          note: "concurrent dispatches across 3 API replicas",
        },
        {
          label: "Dispatch-claim p99, full scan → top 20",
          value: "11000 ms → 2800 ms",
          note: "one-host load test: a comparison, not a capacity number",
        },
      ],
      source: {
        label: "README.md",
        href: "https://github.com/Shoryagg7/deliveriq/blob/main/README.md",
      },
    },
    links: {
      github: "https://github.com/Shoryagg7/deliveriq",
    },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
