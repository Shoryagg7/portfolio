import type { Project } from "@/types";

export const projects: Project[] = [
  {
    slug: "deliveriq",
    name: "DeliverIQ",
    tagline: "Distributed Order Dispatch API",
    summary:
      "A dispatch service that hands delivery orders to riders across three API replicas without ever assigning one twice, even under concurrent load. Built on two-phase claiming, Kafka event streams, and the hardening a service needs before real traffic hits it.",
    year: "2026",
    stack: [
      "Python",
      "FastAPI",
      "PostgreSQL",
      "Redis",
      "Kafka",
      "Docker",
      "Prometheus",
      "Grafana",
    ],
    overview:
      "DeliverIQ is a distributed order-dispatch backend. Orders arrive, a scheduler prioritizes them, riders get matched and assigned. All of that runs across three API replicas working the same queue without stepping on each other. The interesting problems here are concurrency and reliability. How do multiple workers claim work safely? How do downstream systems learn about events durably? And what happens when a component dies halfway through an assignment?",
    problem:
      "Order dispatch looks simple until you run more than one instance. Two replicas polling the same table will grab the same order, and a rider gets assigned twice. Or an order is dispatched, the process dies before the commit lands, and the order disappears. What the system needed was horizontal scaling with exactly-one assignment semantics, rider matching that stays fair without starving low-priority orders, and event delivery to several independent consumers that survives a restart intact.",
    architectureNotes: [
      "Three stateless FastAPI replicas behind a load balancer; all coordination happens in PostgreSQL and Redis, never in process memory.",
      "Two-phase claiming: replicas claim orders with SELECT … FOR UPDATE SKIP LOCKED inside a transaction, then confirm the assignment in a second phase. If a replica dies between the two, the row lock releases and the order becomes claimable again.",
      "A priority-queue scheduler (O(log n)) with time-based aging so old low-priority orders eventually outrank fresh high-priority ones.",
      "Geohash-based rider matching: riders are indexed by geohash cell, turning nearest-rider lookup from an O(n) scan into an O(1) cell lookup with neighbor expansion.",
      "Order events stream through Kafka to independent notification, analytics, and audit consumer groups. Each group tracks its own offset, so a slow consumer never blocks the others.",
      "Redis provides token-bucket rate limiting and idempotency-key storage for safe client retries.",
    ],
    diagram: {
      nodes: [
        { id: "client", label: "Clients", sublabel: "orders in", x: 60, y: 150, kind: "client" },
        { id: "lb", label: "Load Balancer", x: 200, y: 150, kind: "external" },
        { id: "api1", label: "API Replica 1", sublabel: "FastAPI", x: 360, y: 60, kind: "service" },
        { id: "api2", label: "API Replica 2", sublabel: "FastAPI", x: 360, y: 150, kind: "service" },
        { id: "api3", label: "API Replica 3", sublabel: "FastAPI", x: 360, y: 240, kind: "service" },
        { id: "pg", label: "PostgreSQL", sublabel: "SKIP LOCKED claims", x: 540, y: 100, kind: "store" },
        { id: "redis", label: "Redis", sublabel: "rate limit · idempotency", x: 540, y: 210, kind: "store" },
        { id: "kafka", label: "Kafka", sublabel: "order events", x: 700, y: 150, kind: "queue" },
        { id: "notif", label: "Notifications", x: 850, y: 60, kind: "service" },
        { id: "analytics", label: "Analytics", x: 850, y: 150, kind: "service" },
        { id: "audit", label: "Audit Log", x: 850, y: 240, kind: "service" },
      ],
      edges: [
        { from: "client", to: "lb" },
        { from: "lb", to: "api1" },
        { from: "lb", to: "api2" },
        { from: "lb", to: "api3" },
        { from: "api1", to: "pg" },
        { from: "api2", to: "pg" },
        { from: "api3", to: "pg" },
        { from: "api2", to: "redis" },
        { from: "api3", to: "redis" },
        { from: "pg", to: "kafka", label: "events" },
        { from: "kafka", to: "notif", dashed: true },
        { from: "kafka", to: "analytics", dashed: true },
        { from: "kafka", to: "audit", dashed: true },
      ],
    },
    decisions: [
      {
        title: "SELECT FOR UPDATE SKIP LOCKED for work claiming",
        context:
          "Three API replicas poll the same orders table for dispatchable work. Under load testing, two of them would occasionally claim the same order. A classic double-dispatch race.",
        decision:
          "Claim orders with SELECT … FOR UPDATE SKIP LOCKED inside a transaction, wrapped in a two-phase claim-then-confirm flow.",
        why:
          "SKIP LOCKED lets each replica atomically lock the next unclaimed rows and skip past anything another replica already holds. No external lock manager, no advisory-lock bookkeeping. The database handles mutual exclusion itself. And a crash mid-claim just rolls back the transaction, which makes the order claimable again with no cleanup job involved.",
        tradeoffs:
          "Claiming is tied to Postgres transaction lifetimes, so a long-running claim holds its row lock the whole time. Queue depth also gets harder to observe, since locked rows are invisible to other workers' scans. A dedicated queue like SQS or RabbitMQ would decouple all this, but it adds infrastructure and gives up transactional atomicity with order state.",
        lesson:
          "After the fix, the same Locust run that used to reproduce the race showed zero duplicate assignments. The database you already run is often the most correct queue available. Reach for new infrastructure when it buys you something the transaction model can't.",
      },
      {
        title: "Kafka consumer groups over Redis Pub/Sub",
        context:
          "Notifications, analytics, and audit all need every order event. The first version used Redis Pub/Sub, which is fire-and-forget: a consumer that's down during publish simply misses the message.",
        decision:
          "Moved event distribution to Kafka topics with three independent consumer groups.",
        why:
          "Kafka gives durable, replayable delivery with per-group offsets. An audit consumer that's been offline for an hour resumes exactly where it left off, and analytics can be rebuilt by replaying the topic from the start. Each group scales and fails on its own.",
        tradeoffs:
          "Kafka is operationally heavier than Redis Pub/Sub. There are brokers, partitions, and rebalancing to reason about. For ephemeral signals where loss is fine, Pub/Sub stays simpler. The rule that came out of this: facts go through Kafka, hints can go through Pub/Sub.",
        lesson:
          "Choose delivery semantics first, technology second. 'Can any consumer afford to miss this message?' answers the Kafka-vs-Pub/Sub question in one sentence.",
      },
      {
        title: "Geohash cells for rider matching",
        context:
          "Nearest-rider matching started as an O(n) distance scan across every active rider, run once per order. Fine at 100 riders. Hopeless at 10,000.",
        decision:
          "Index riders by geohash cell in Redis; match by looking up the order's cell and its eight neighbors, expanding outward only if empty.",
        why:
          "Cell lookup is O(1), and neighbor expansion bounds the search to the local area. Geohashes are plain strings, so Redis sets handle the index with no geospatial extension required.",
        tradeoffs:
          "Geohash cells are rectangles rather than circles, so boundaries need neighbor checks to stay correct. Cell size becomes a tuning knob too: too big and you're scanning again, too small and you expand constantly. PostGIS would be more precise, but it's heavier than this access pattern warrants.",
        lesson:
          "Approximate spatial indexing is usually enough. The rider 50m away in the next cell matters. The rider 30km away never did.",
      },
      {
        title: "Priority queue with time-based aging",
        context:
          "Pure priority ordering starved low-priority orders indefinitely whenever high-priority volume was sustained.",
        decision:
          "Heap-based scheduler where effective priority = base priority + age factor, so waiting orders climb the queue over time.",
        why:
          "O(log n) insert and pop keeps scheduling cheap. Aging then guarantees a bounded worst-case wait for every order, which turns fairness into something you can promise rather than hope for. Fairness-banded assignment also balances rider earnings inside the delivery SLA.",
        tradeoffs:
          "The aging coefficient is a policy decision disguised as a constant. Set it too aggressively and priority stops meaning anything; set it too weakly and starvation comes back. It needs monitoring, not just a value.",
        lesson:
          "Starvation is a design bug, not an edge case. Any priority system without aging is an eventual outage for somebody's order.",
      },
      {
        title: "Idempotency keys + token-bucket rate limiting",
        context:
          "Mobile clients retry on timeouts. A retried order-creation request must not create a second order, and abusive clients must not exhaust capacity.",
        decision:
          "Client-supplied idempotency keys stored in Redis with the response cached against the key; Redis token-bucket rate limiting per client; JWT-protected admin endpoints; a validated order state machine rejecting illegal transitions.",
        why:
          "Idempotency turns retries from a correctness hazard into a no-op. The token bucket allows bursts while capping sustained rates, which matches real client behavior better than fixed windows.",
        tradeoffs:
          "Idempotency storage needs a TTL policy, which raises an awkward question: how long is a retry still a retry? It also adds a Redis round-trip to the hot path. That cost was measured at well under a millisecond and accepted.",
        lesson:
          "Safe retries are a feature you design, not a property you inherit. Every mutating endpoint should answer 'what happens when this is called twice?'",
      },
    ],
    performance: [
      { label: "Throughput", value: "~123 RPS", detail: "sustained, Locust load test" },
      { label: "p99 latency", value: "220 ms", detail: "under full load" },
      { label: "Duplicate dispatches", value: "0", detail: "verified under concurrent load" },
      { label: "API replicas", value: "3", detail: "horizontally scaled, stateless" },
      { label: "Matching lookup", value: "O(1)", detail: "geohash cell vs O(n) scan" },
    ],
    challenges: [
      "Diagnosing the double-dispatch race: it only appeared under concurrent load, and reproducing it reliably meant building a Locust scenario that hammered the claim path before it could be fixed with SKIP LOCKED.",
      "Kafka consumer rebalancing during rolling deploys briefly paused consumption; tuning session timeouts and using cooperative rebalancing kept event lag inside SLA.",
      "Following one order's journey across three replicas and three consumers meant structured JSON logs carrying a request ID end to end. Observability had to be designed in rather than bolted on afterward.",
    ],
    lessons: [
      "Concurrency bugs don't show up in unit tests. They show up under load. That makes load testing a correctness tool, not just a performance one.",
      "Durable event streams and ephemeral signals are different tools. Choosing between Kafka and Pub/Sub by delivery semantics avoids both over- and under-engineering.",
      "Production-readiness is a checklist you can build incrementally: rate limiting, idempotency, health checks, dashboards, correlated logs. Each piece is small on its own. Together they change what the service can survive.",
    ],
    links: {
      github: "https://github.com/Shoryagg7/deliveriq",
    },
    highlights: [
      "Zero duplicate assignments across 3 replicas, using SKIP LOCKED two-phase claiming",
      "Kafka consumer groups: durable, replayable event delivery",
      "~123 RPS at p99 220 ms under Locust load",
      "Prometheus + Grafana observability, request-ID correlated logs",
    ],
  },
  {
    slug: "semanticcache",
    name: "SemanticCache",
    tagline: "LLM Caching & RAG Gateway",
    summary:
      "An API gateway that caches LLM responses by meaning rather than exact text, so a rephrased question reuses an answer it already paid for. A FAISS-backed RAG pipeline runs on the same embeddings, and the whole thing cuts redundant LLM calls, cost, and latency.",
    year: "2026",
    stack: ["Python", "FastAPI", "Redis", "FAISS", "LLM APIs", "Docker"],
    overview:
      "SemanticCache sits between applications and LLM providers. Every incoming query is embedded into a vector; if a sufficiently similar query has been answered before, the cached response is returned in milliseconds instead of paying for a fresh LLM round-trip. The same embedding infrastructure powers a retrieval-augmented generation pipeline that grounds answers in a document corpus.",
    problem:
      "LLM APIs are slow and priced per token, yet real query streams are full of near-duplicates. 'How do I reset my password' and 'password reset steps?' pay for two separate calls that produce the same answer. Exact-match caching catches none of it, because the strings differ. So the gateway had to recognize semantic equivalence, bound the cost of getting that judgment wrong, and track spend per user before the bill turned into a surprise.",
    architectureNotes: [
      "Gateway pattern: applications call SemanticCache with the same shape they'd use for the LLM itself, so caching, RAG, and cost controls stay transparent to callers.",
      "Embedding pipeline converts queries to vectors once; the same vectors serve cache lookup and RAG retrieval.",
      "FAISS performs approximate nearest-neighbor search over cached query vectors; a cosine-similarity threshold decides cache hit vs miss.",
      "Cache hits return in single-digit milliseconds from Redis; misses fall through to the LLM and the response is written back with its embedding.",
      "RAG path: document corpus chunked and embedded offline, retrieved by FAISS similarity at query time, injected into the LLM prompt for grounded answers.",
      "Redis tracks per-user token spend and enforces per-user rate limits, which makes cost control a first-class API concern instead of a monthly surprise.",
    ],
    diagram: {
      nodes: [
        { id: "app", label: "Client Apps", x: 60, y: 150, kind: "client" },
        { id: "gw", label: "Gateway", sublabel: "FastAPI", x: 230, y: 150, kind: "service" },
        { id: "embed", label: "Embedding", sublabel: "pipeline", x: 400, y: 60, kind: "service" },
        { id: "faiss", label: "FAISS", sublabel: "vector search", x: 560, y: 60, kind: "store" },
        { id: "redis", label: "Redis", sublabel: "cache · budgets", x: 400, y: 240, kind: "store" },
        { id: "corpus", label: "Doc Corpus", sublabel: "chunked + embedded", x: 720, y: 60, kind: "store" },
        { id: "llm", label: "LLM API", x: 560, y: 240, kind: "external" },
      ],
      edges: [
        { from: "app", to: "gw" },
        { from: "gw", to: "embed" },
        { from: "embed", to: "faiss", label: "ANN lookup" },
        { from: "faiss", to: "corpus", dashed: true, label: "RAG retrieve" },
        { from: "gw", to: "redis", label: "hit: cached answer" },
        { from: "gw", to: "llm", label: "miss", dashed: true },
        { from: "llm", to: "redis", label: "write-back", dashed: true },
      ],
    },
    decisions: [
      {
        title: "Semantic similarity threshold for cache hits",
        context:
          "The cache's correctness hinges on one number: how similar must two queries be before serving one's answer for the other? Too loose and users get wrong answers; too strict and the hit rate collapses to exact-match.",
        decision:
          "Cosine similarity over normalized embeddings with a conservative threshold, tuned empirically against a labeled set of query pairs.",
        why:
          "A wrong cached answer is worse than a slow correct one, so the threshold errs toward misses. Evaluating against real paraphrase pairs turned the precision and hit-rate trade-off into something measurable rather than a matter of taste.",
        tradeoffs:
          "A single global threshold treats every query type the same. Short ambiguous ones like 'it doesn't work' embed close to almost anything, so they needed a minimum-length guard. Per-category thresholds would be finer-grained but harder to maintain.",
        lesson:
          "When a cache can be semantically wrong, threshold tuning is a model evaluation problem. It wants a dataset and metrics, not intuition.",
      },
      {
        title: "FAISS in-process over a hosted vector database",
        context:
          "Vector search needed sub-10ms lookups over a corpus that fits comfortably in memory on one node.",
        decision:
          "FAISS as an in-process index inside the gateway, persisted to disk, rather than a hosted vector DB.",
        why:
          "No network hop, no extra service to operate, and FAISS's approximate search is far quicker than it needs to be at this scale. The index rebuilds from Redis-persisted vectors on startup.",
        tradeoffs:
          "In-process indexes don't share across replicas, so scaling horizontally would mean replicating the index or moving to a served vector store. That was a deliberate deferral: solve the scaling problem when the corpus outgrows one machine, not before.",
        lesson:
          "Embedding infrastructure has a real 'small scale' regime where the simple thing is also the fast thing. The trick is knowing which regime you're actually in.",
      },
      {
        title: "Per-user token budgets in Redis",
        context:
          "LLM spend is unbounded by default. One runaway client loop can burn a month's budget in an afternoon.",
        decision:
          "Track token consumption per user in Redis counters and enforce both rate limits and spend ceilings at the gateway before the LLM is called.",
        why:
          "The gateway is the one choke point every request passes through, so enforcing budgets there means no client can route around them. The counters double as a cost-attribution report.",
        tradeoffs:
          "Enforcing before the call means estimating response tokens before you know them, so budgets are approximate and get reconciled once the response lands. Exact enforcement would need clawback semantics that punish users for the estimator's mistakes.",
        lesson:
          "Cost is a runtime resource, no different from memory or connections. Meter it, cap it, surface it. Otherwise it surprises you.",
      },
    ],
    performance: [
      { label: "Cache hit latency", value: "ms-scale", detail: "Redis + FAISS vs seconds for LLM" },
      { label: "LLM calls avoided", value: "every hit", detail: "direct cost reduction" },
      { label: "Vector search", value: "ANN", detail: "approximate NN via FAISS" },
      { label: "Cost tracking", value: "per-user", detail: "token budgets in Redis" },
    ],
    challenges: [
      "Embedding drift: swapping the embedding model invalidates every stored vector. Versioning the index by model became necessary the first time that model was upgraded.",
      "Cache invalidation for RAG: when corpus documents change, any cached answer grounded in a stale chunk has to be evicted. Tying cache entries to source-document versions solved it.",
      "Telling 'similar query' apart from 'same query, opposite intent'. Negation is the hard case, because 'how to enable X' and 'how to disable X' embed deceptively close. That's most of why the threshold ended up conservative.",
    ],
    lessons: [
      "Semantic caching is a precision and recall system wearing a cache's clothes. It should be evaluated like one.",
      "The gateway pattern concentrates cross-cutting concerns like caching, budgets, and rate limits somewhere they can't be bypassed.",
      "Cost optimization for LLM systems is a property of the architecture, not a prompt-engineering afterthought.",
    ],
    links: {
      github: "https://github.com/Shoryagg7/semanticcache",
    },
    highlights: [
      "Semantic cache: similar queries hit, not just identical strings",
      "FAISS ANN search + embedding pipeline shared with RAG",
      "Per-user token budgets, capping LLM spend at the gateway",
      "Milliseconds on hit vs seconds on LLM round-trip",
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
