import type { Project } from "@/types";

export const projects: Project[] = [
  {
    slug: "deliveriq",
    name: "DeliverIQ",
    tagline: "Distributed Order Dispatch API",
    summary:
      "A dispatch service that hands delivery orders to riders across three API replicas without ever assigning one twice, even under concurrent load. Built on two-phase claiming, Kafka event streams with a dead-letter queue, and a self-run security audit that closed four unauthenticated endpoints before real traffic ever touched them.",
    year: "2026",
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
    overview:
      "DeliverIQ is a distributed order-dispatch backend. Orders arrive, a scheduler prioritizes them, riders get matched and assigned. All of that runs across three API replicas working the same queue without stepping on each other. The interesting problems here are concurrency and reliability: how do multiple workers claim work safely, how do downstream systems learn about events durably, and what happens when a component dies halfway through an assignment. A later pass through the whole codebase, done the way an attacker would read it rather than the way I wrote it, turned up a second class of problem entirely — endpoints nobody had gotten around to locking down.",
    problem:
      "Order dispatch looks simple until you run more than one instance. Two replicas polling the same table will grab the same order, and a rider gets assigned twice. Or an order is dispatched, the process dies before the commit lands, and the order disappears. What the system needed was horizontal scaling with exactly-one assignment semantics, rider matching that stays fair without starving low-priority orders, event delivery to several independent consumers that survives a restart intact, and an auth surface that had actually been checked rather than assumed correct because it looked routine.",
    architectureNotes: [
      "Three stateless FastAPI replicas behind a load balancer; all coordination happens in PostgreSQL and Redis, never in process memory.",
      "Two-phase claiming: replicas claim orders with SELECT … FOR UPDATE SKIP LOCKED inside a transaction, then confirm the assignment in a second phase. If a replica dies between the two, the row lock releases and the order becomes claimable again.",
      "A priority-queue scheduler (O(log n)) with time-based aging so old low-priority orders eventually outrank fresh high-priority ones.",
      "Geohash-based rider matching: riders are indexed by geohash cell, turning nearest-rider lookup from an O(n) scan into an O(1) cell lookup with neighbor expansion.",
      "Order events stream through Kafka to independent notification, analytics, and audit consumer groups. Manual offset commits after each handler returns keep delivery at-least-once through a crash, and unprocessable messages go to a dead-letter topic instead of wedging their partition forever.",
      "JWT authentication with role-based authorization (ops / rider / customer) on every endpoint that changes state or exposes another user's data. Redis backs token-bucket rate limiting, evaluated atomically in a single Lua script, and idempotency-key storage namespaced per authenticated user.",
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
        { id: "kafka", label: "Kafka", sublabel: "order events · DLQ", x: 700, y: 150, kind: "queue" },
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
          "After the fix, the same concurrency test that used to reproduce the race showed zero duplicate assignments. The database you already run is often the most correct queue available. Reach for new infrastructure when it buys you something the transaction model can't.",
      },
      {
        title: "Kafka consumer groups over Redis Pub/Sub",
        context:
          "Notifications, analytics, and audit all need every order event. The first version used Redis Pub/Sub, which is fire-and-forget: a consumer that's down during publish simply misses the message.",
        decision:
          "Moved event distribution to Kafka topics with three independent consumer groups, manual offset commits, and a dead-letter topic for messages that fail to process.",
        why:
          "Kafka gives durable, replayable delivery with per-group offsets. An audit consumer that's been offline for an hour resumes exactly where it left off, and analytics can be rebuilt by replaying the topic from the start. Committing the offset only after the handler returns keeps delivery at-least-once through a crash; routing anything that throws to a DLQ instead of retrying it forever stops one poison message from blocking every event queued behind it on that partition. Each group scales and fails on its own.",
        tradeoffs:
          "Kafka is operationally heavier than Redis Pub/Sub. There are brokers, partitions, and rebalancing to reason about. At-least-once also means duplicates are possible, so the analytics consumer deduplicates on (partition, offset) rather than assuming single delivery. For ephemeral signals where loss is fine, Pub/Sub stays simpler. The rule that came out of this: facts go through Kafka, hints can go through Pub/Sub.",
        lesson:
          "Choose delivery semantics first, technology second. 'Can any consumer afford to miss this message?' answers the Kafka-vs-Pub/Sub question in one sentence.",
      },
      {
        title: "Geohash cells for rider matching",
        context:
          "Nearest-rider matching started as an O(n) distance scan across every active rider, run once per order. Fine at 100 riders. Hopeless at 10,000.",
        decision:
          "Index riders by geohash cell in Redis; match by looking up the order's cell and its eight neighbors, expanding outward only if empty, then apply a bounded fairness band on top of distance so idle riders aren't starved by nearest-only assignment.",
        why:
          "Cell lookup is O(1), and neighbor expansion bounds the search to the local area. Geohashes are plain strings, so Redis sets handle the index with no geospatial extension required. The fairness band then picks the least-loaded rider among those within a small distance of the nearest one, instead of hammering the single closest rider forever.",
        tradeoffs:
          "Geohash cells are rectangles rather than circles, so boundaries need neighbor checks to stay correct — a rider ten meters away in the next cell is invisible if you only check the home cell. Cell size becomes a tuning knob too: too big and you're scanning again, too small and you expand constantly. PostGIS would be more precise, but it's heavier than this access pattern warrants.",
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
          "O(log n) insert and pop keeps scheduling cheap. Aging then guarantees a bounded worst-case wait for every order, which turns fairness into something you can promise rather than hope for.",
        tradeoffs:
          "The aging coefficient is a policy decision disguised as a constant. Set it too aggressively and priority stops meaning anything; set it too weakly and starvation comes back. It needs monitoring, not just a value. Reloading and rebuilding the heap on every call is also O(n log n) rather than the O(log n) a persistent structure would give — fine at this scale, a known next step past it.",
        lesson:
          "Starvation is a design bug, not an edge case. Any priority system without aging is an eventual outage for somebody's order.",
      },
      {
        title: "Idempotency keys + Lua-atomic rate limiting",
        context:
          "Mobile clients retry on timeouts. A retried order-creation request must not create a second order, and abusive clients must not exhaust capacity. The first rate limiter did a read, a Python-side computation, then a write — three separate Redis round-trips with a gap between them wide enough for two concurrent requests to both read the same token count and both pass.",
        decision:
          "Client-supplied idempotency keys stored in Redis with the response cached against the key and namespaced by the verified token subject; a token-bucket rate limiter whose entire check-refill-decrement runs as a single atomic Lua script; a validated order state machine rejecting illegal transitions.",
        why:
          "Idempotency turns retries from a correctness hazard into a no-op. The token bucket allows bursts while capping sustained rates, which matches real client behavior better than fixed windows. Collapsing the limiter into one Lua script closes the read-modify-write gap entirely — Redis runs it to completion before serving any other client, so nothing can interleave.",
        tradeoffs:
          "Idempotency storage needs a TTL policy, which raises an awkward question: how long is a retry still a retry? It also adds a Redis round-trip to the hot path. Both middlewares fail open on a Redis error, since a protective control shouldn't cause the outage it exists to prevent — the trade there is that a client that opts out of Redis entirely also opts out of rate limiting for as long as the outage lasts.",
        lesson:
          "Safe retries are a feature you design, not a property you inherit. Every mutating endpoint should answer 'what happens when this is called twice?' — and 'what happens when two different users send the same key?' is a second question worth asking, because the first version of this cache didn't scope by caller and let two users collide on one key.",
      },
      {
        title: "Auditing my own auth surface",
        context:
          "A line-by-line pass through every route, done the way an attacker reads code rather than the way I wrote it, turned up four endpoints with no authentication at all — including the rider-location update that writes straight into the Redis geohash index dispatch matches against. Anyone could call it and move the whole fleet onto one coordinate, defeating the distance filter and the fairness band in a single request. The JWT signing key also shipped with a working default, so every 'ops-only' guard in the project was decorative unless that default had explicitly been overridden.",
        decision:
          "Added JWT auth with role-based checks (ops / rider / customer) to every endpoint that changes state or exposes another user's data, removed the JWT secret's default entirely so the app refuses to boot without a real one, and rewrote 71 integration tests to cover the auth boundary on every route rather than just the happy path.",
        why:
          "The dangerous endpoint didn't look dangerous — it read like a routine profile update, not a write into the matching engine. A default secret is worse than a weak one: it's a control nobody has to bypass, because it's already off. Testing the auth boundary explicitly, not just the feature behind it, is what would have caught this the first time.",
        tradeoffs:
          "Every state-changing request now costs a token verification, and some routes pay for a user-row lookup instead of trusting the token's claims wholesale — a deliberate per-request cost so a deleted or demoted user can't keep acting on a still-valid token for the rest of its lifetime.",
        lesson:
          "'Who may write this field' and 'who may decide dispatch outcomes' turned out to be the same question for that location endpoint, and I hadn't noticed they were. Classifying an endpoint's risk by what it looks like instead of its actual blast radius is exactly how it shipped open — and a flaw I found and fixed myself is worth more than one nobody ever finds.",
      },
    ],
    performance: [
      { label: "Duplicate dispatches", value: "0", detail: "verified under concurrent load across 3 replicas" },
      { label: "Integration tests", value: "71", detail: "covers the auth boundary on every route" },
      { label: "Auth holes closed", value: "4", detail: "endpoints that shipped with no auth check" },
      { label: "Kafka consumer groups", value: "3", detail: "independent offsets, DLQ for poison messages" },
      { label: "Matching lookup", value: "O(1)", detail: "geohash cell vs O(n) scan" },
    ],
    challenges: [
      "Diagnosing the double-dispatch race: it only appeared under concurrent load, and reproducing it reliably meant building a test that hammered the claim path before it could be fixed with SKIP LOCKED.",
      "Kafka consumer rebalancing during rolling deploys briefly paused consumption; tuning session timeouts and handling SIGTERM properly (not just Ctrl-C) kept event lag inside SLA.",
      "Following one order's journey across three replicas and three consumers meant structured JSON logs carrying a request ID end to end. Observability had to be designed in rather than bolted on afterward.",
      "Auditing the project after already calling it done: a full pass surfaced nine more issues beyond what I already knew about, including all four of the unauthenticated endpoints — findings I only got by treating my own code as adversarially as I would someone else's.",
    ],
    lessons: [
      "Concurrency bugs don't show up in unit tests. They show up under load. That makes load testing a correctness tool, not just a performance one.",
      "Durable event streams and ephemeral signals are different tools. Choosing between Kafka and Pub/Sub by delivery semantics avoids both over- and under-engineering.",
      "Production-readiness is a checklist you can build incrementally: rate limiting, idempotency, health checks, dashboards, correlated logs. Each piece is small on its own. Together they change what the service can survive.",
      "A self-reported flaw reads as engineering judgment; the same flaw found by someone else reads as carelessness. Auditing your own surface before someone else does is worth the discomfort.",
    ],
    links: {
      github: "https://github.com/Shoryagg7/deliveriq",
    },
    highlights: [
      "Zero duplicate dispatches across 3 replicas via two-phase SKIP LOCKED claiming",
      "Kafka: 3 consumer groups, manual offset commits, DLQ for poison messages",
      "Self-audit closed 4 unauthenticated endpoints and a forgeable admin JWT",
      "RBAC, Lua-atomic rate limiting, 71 integration tests",
    ],
  },
  {
    slug: "docmind",
    name: "DocMind",
    tagline: "Agentic RAG Document Assistant",
    summary:
      "A document Q&A pipeline that checks its own retrieval before trusting it. A LangGraph loop retrieves, grades the chunks it found, rewrites the query and retries on a bad first search, then answers with citations back to source — with a Redis semantic cache in front of the whole graph so a paraphrased repeat question never pays for retrieval or an LLM call twice.",
    year: "2026",
    stack: [
      "Python",
      "LangGraph",
      "Groq",
      "Sentence-Transformers",
      "pgvector",
      "PostgreSQL",
      "Redis",
      "FastAPI",
    ],
    overview:
      "DocMind answers questions over a corpus of PDFs. Documents are chunked and embedded with Sentence-Transformers, stored in pgvector alongside their text and metadata. A query doesn't just trigger one retrieval and one answer — it runs through a LangGraph state machine that retrieves candidate chunks, grades whether they actually address the question, and rewrites the query to retry retrieval when they don't, before generating a final answer that cites the chunks it's grounded in. A Redis-backed semantic cache sits in front of that entire graph, so a question that's a rewording of one already answered returns in milliseconds instead of re-running retrieval and paying for another Groq call.",
    problem:
      "Naive RAG performs exactly one retrieval and answers regardless of what it found. A bad first search — an ambiguous question, a query that doesn't share vocabulary with the source text — still produces an answer, just one confidently grounded in irrelevant chunks. The system needed retrieval that could recognize its own failure and correct it instead of answering anyway, responses a user could actually verify against source material, and a way to avoid paying full retrieval-plus-generation cost on questions the system had, in substance, already answered once.",
    architectureNotes: [
      "Ingestion pipeline: PDFs are parsed, chunked, and embedded with Sentence-Transformers; vectors, chunk text, and document metadata all live in pgvector inside the same Postgres instance — one store for both structured and vector data, not two systems to keep in sync.",
      "LangGraph orchestrates the query path as an explicit state machine: retrieve from pgvector, grade each candidate chunk's relevance, and branch — enough relevant chunks moves to generation, too few triggers a query rewrite and a bounded retry of retrieval.",
      "Groq serves as the LLM for both the grading step and final answer generation; grading is a cheap, structured call, not the same cost as generation.",
      "Answers are generated with citations back to the specific chunks they're grounded in, so a response is checkable against the source document rather than taken on faith.",
      "A semantic cache in Redis sits in front of the whole graph, not just the LLM call: the incoming query is embedded and checked against cached query/answer pairs by cosine similarity before retrieval, grading, or generation ever run. A hit skips the entire pipeline; a miss runs the graph and writes the result back.",
      "FastAPI exposes the pipeline as an API: a single endpoint runs the graph end to end and returns the answer, its cited chunks, and whether it was served from cache.",
    ],
    diagram: {
      nodes: [
        { id: "client", label: "Clients", x: 60, y: 150, kind: "client" },
        { id: "gw", label: "Gateway", sublabel: "FastAPI", x: 230, y: 150, kind: "service" },
        { id: "graph", label: "LangGraph", sublabel: "retrieve · grade · rewrite", x: 400, y: 60, kind: "service" },
        { id: "pgvector", label: "pgvector", sublabel: "chunk embeddings", x: 560, y: 60, kind: "store" },
        { id: "corpus", label: "PDF Corpus", sublabel: "chunked + embedded", x: 720, y: 60, kind: "store" },
        { id: "cache", label: "Redis", sublabel: "semantic query cache", x: 400, y: 240, kind: "store" },
        { id: "groq", label: "Groq", sublabel: "grading + generation", x: 560, y: 240, kind: "external" },
      ],
      edges: [
        { from: "client", to: "gw" },
        { from: "gw", to: "cache", label: "check" },
        { from: "gw", to: "graph", label: "miss", dashed: true },
        { from: "graph", to: "pgvector", label: "retrieve" },
        { from: "pgvector", to: "corpus", dashed: true, label: "chunks" },
        { from: "graph", to: "groq", label: "grade / generate" },
        { from: "groq", to: "cache", dashed: true, label: "write-back" },
      ],
    },
    decisions: [
      {
        title: "Self-correcting retrieval loop over single-shot RAG",
        context:
          "Naive RAG performs one retrieval and answers regardless of relevance. A bad first search silently produces a confidently wrong answer grounded in chunks that don't actually address the question, with nothing in the pipeline positioned to notice.",
        decision:
          "Built a LangGraph state machine: retrieve, grade each returned chunk's relevance to the question, and if too few chunks pass, rewrite the query and retry retrieval — bounded to a fixed number of rounds — before generating a cited answer.",
        why:
          "Grading turns 'did retrieval work' into an explicit, checkable state the graph can branch on, instead of a hope baked silently into the prompt. Grading is a cheap structured call, far cheaper than shipping a wrong answer downstream and having no way to tell it happened.",
        tradeoffs:
          "Grading and a possible rewrite add one or two extra LLM round-trips on the miss path, so a hard question costs more latency than a single-shot system would. The retry cap trades recall for a bounded worst-case latency — a genuinely unanswerable question still terminates instead of looping.",
        lesson:
          "Retrieval quality should be a checked state, not an assumption the prompt quietly relies on.",
      },
      {
        title: "pgvector over a hosted or standalone vector database",
        context:
          "Vector storage was needed for two things at once — document chunks for RAG and cached query embeddings for the semantic cache — at a scale that fits comfortably on one Postgres instance.",
        decision:
          "Store both in pgvector, alongside the relational metadata (documents, chunks, cache entries) that already lives in the same Postgres instance, rather than standing up a dedicated vector database.",
        why:
          "One database instead of two systems to keep consistent. Chunk inserts and their metadata commit together under normal ACID guarantees, and approximate nearest-neighbor indexing is fast enough at this corpus size with no separate vector service to run, deploy, or monitor.",
        tradeoffs:
          "pgvector's ANN indexes don't scale as gracefully as a purpose-built vector database past tens of millions of vectors. That's a deliberate deferral, not a blind spot — this corpus is nowhere near that regime.",
        lesson:
          "Reach for a dedicated vector database when the corpus actually outgrows one Postgres instance, not preemptively because the tool has 'vector' in its name.",
      },
      {
        title: "A semantic cache in front of the whole pipeline, not just the LLM call",
        context:
          "Real query streams repeat with rephrasing — 'how do I reset my password' and 'password reset steps' are the same intent in different words. Exact-match caching misses almost all of that, so every rephrased repeat still pays for full retrieval, grading, and generation.",
        decision:
          "Embed each incoming query and check Redis for a similar cached query, above a tuned cosine-similarity threshold, before running retrieval or calling Groq at all. A hit returns the cached answer directly; a miss runs the full graph and writes the result back.",
        why:
          "Placing the check in front of the entire pipeline means a hit skips retrieval and grading too, not just the final generation call — the most expensive path is also the one avoided. The threshold is tuned conservative, because a wrong cached answer is worse than a slow correct one.",
        tradeoffs:
          "Same precision/recall tension as any semantic cache: too loose a threshold serves a stale or wrong answer for a subtly different question; a short ambiguous query embeds close to almost anything and needs a minimum-length guard. A cached answer is also only valid as long as the source chunks it cites are unchanged, which ties cache invalidation to document versioning if the corpus updates.",
        lesson:
          "Cache the expensive path, not just its last step. Putting the check before retrieval saves more than putting it before generation alone.",
      },
    ],
    performance: [
      { label: "Cache hit latency", value: "ms-scale", detail: "Redis vector lookup vs. a full retrieve-grade-generate pass" },
      { label: "Retrieval loop", value: "self-correcting", detail: "bounded rewrite-and-retry on low-relevance chunks" },
      { label: "Vector store", value: "pgvector", detail: "shared by document chunks and the query cache" },
      { label: "Answers", value: "cited", detail: "every response traces back to source chunks" },
    ],
    challenges: [
      "Bounding the rewrite loop: an ungraded retry can spin indefinitely on a genuinely unanswerable question, which meant designing a max-retry cap and an explicit 'insufficient context' response rather than an infinite chase for a better query.",
      "Grading chunk relevance without doubling the cost of every query: a full LLM judgment call per chunk got expensive fast, so grading batches all candidate chunks from one retrieval round into a single structured call.",
      "Cache correctness for RAG: a cached answer is only trustworthy as long as the chunks it cites haven't changed, so any future corpus update needs invalidation tied to document versions rather than a flat TTL.",
    ],
    lessons: [
      "Self-correction is worth the extra hop only when failure is checkable — grading turned 'did retrieval work' into a yes/no the graph could branch on, rather than something the prompt just had to hope for.",
      "A cache in front of a multi-step pipeline is worth more than a cache in front of its last step. Placement decides how much it actually saves.",
      "One database that does both structured queries and vector search removes an entire class of consistency bugs that a two-database split would otherwise have to solve.",
    ],
    links: {
      github: "https://github.com/Shoryagg7/docmind",
    },
    highlights: [
      "Self-correcting LangGraph loop: retrieve, grade, rewrite, and retry before answering",
      "Cited answers grounded in pgvector-retrieved source chunks",
      "Redis semantic cache in front of the full pipeline, not just the LLM call",
      "One Postgres instance for both structured data and vector search via pgvector",
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
