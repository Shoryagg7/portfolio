import type { Principle } from "@/types";

export const principles: Principle[] = [
  {
    title: "Simplicity over cleverness",
    body: "The best system is the one the next engineer can hold in their head. Complexity is a cost you pay every day — I add it only when the problem genuinely demands it.",
    icon: "minimize",
  },
  {
    title: "Design for failure",
    body: "Processes crash mid-transaction, networks partition, consumers fall behind. I design the failure path first — two-phase claims, replayable events, idempotent retries — so failures degrade instead of cascade.",
    icon: "shield",
  },
  {
    title: "Measure before optimizing",
    body: "Every performance claim in my projects has a load test behind it. Intuition finds candidates; Locust, Prometheus, and p99 charts decide what actually gets optimized.",
    icon: "gauge",
  },
  {
    title: "Reliability beats raw speed",
    body: "A dispatch system that's fast but occasionally assigns an order twice is broken. Correctness under concurrency comes first; then I make it fast.",
    icon: "anchor",
  },
  {
    title: "Explicit trade-offs",
    body: "Kafka over Pub/Sub, FAISS over a hosted vector DB, SKIP LOCKED over a message queue — every choice writes down what it costs. If I can't state the trade-off, I don't understand the decision yet.",
    icon: "scale",
  },
  {
    title: "Maintainable first",
    body: "Typed interfaces, small modules, structured logs, boring names. Software spends most of its life being read and changed — I optimize for that life, not the first commit.",
    icon: "wrench",
  },
];
