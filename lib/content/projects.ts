import type { Project } from "@/types";

/*
  Every number here traces to the project's own write-up (DocMind: docs/RESULTS.md and
  docs/DECISIONS.md, DeliverIQ: README.md), which each results table links to. None are
  derived from code. Backticks mark inline code; the case study page renders them as such.
*/
export const projects: Project[] = [
  {
    slug: "docmind",
    name: "DocMind",
    tagline: "Privacy-aware, evaluated agentic RAG over PDFs",
    summary:
      "A LangGraph agent that grades its own retrieval and retries before answering, behind a local egress gate that swaps names, emails and ID numbers for placeholders before any text reaches the external LLM. Every number it claims was measured, and is published with the command that produced it.",
    year: "2026",
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
    highlights: [
      "Egress gate: PII leaves as placeholders, is restored locally, and fails closed",
      "Privacy on vs off: 30/31 vs 29/31 correct, for +107 tokens per question",
      "Showed a negation outscores the paraphrase a semantic cache must serve",
    ],
    overview:
      "Ask questions about your PDFs; a LangGraph agent retrieves chunks from pgvector, has an LLM grade each chunk for relevance, rewrites the query and retries when retrieval comes back weak, then answers with citations. Because the LLM is external, every outbound message passes a local egress gate that replaces names, emails, phone numbers, card numbers, PAN and Aadhaar numbers with placeholders and restores them locally after the answer returns. If the detector errors, the call is blocked rather than sent.",
    problem:
      "Two problems, stacked. Naive RAG retrieves once and answers regardless of what it found, so a bad first search still produces a confident answer grounded in the wrong chunks. And the model doing the reading is a third-party API: every grade, rewrite and generate call ships document text — names, emails, phone numbers, ID numbers — off the machine. DocMind needed retrieval that notices its own failures, a privacy boundary that holds even when a document is prompt-injected to leak what it contains, and measured evidence of what that boundary costs rather than an assumption that it's free.",
    diagram: {
      nodes: [
        { id: "client", label: "Browser / curl", sublabel: "POST /query · SSE", x: 80, y: 70, kind: "client" },
        { id: "api", label: "FastAPI", sublabel: "query · stream", x: 270, y: 70, kind: "service" },
        { id: "policy", label: "Privacy policy", sublabel: "consent · block", x: 460, y: 70, kind: "service" },
        { id: "cache", label: "Redis", sublabel: "semantic cache", x: 650, y: 70, kind: "store" },
        { id: "ingest", label: "PDF upload", sublabel: "POST /documents", x: 80, y: 200, kind: "client" },
        { id: "pgvector", label: "pgvector", sublabel: "chunks · HNSW", x: 270, y: 200, kind: "store" },
        { id: "retrieve", label: "Retrieve", sublabel: "top-k chunks", x: 460, y: 200, kind: "service" },
        { id: "grade", label: "Grade", sublabel: "LLM relevance", x: 650, y: 200, kind: "service" },
        { id: "generate", label: "Generate", sublabel: "cited answer", x: 840, y: 200, kind: "service" },
        { id: "rewrite", label: "Rewrite", sublabel: "≤ 2 retries", x: 555, y: 330, kind: "service" },
        { id: "gate", label: "Egress gate", sublabel: "mask · restore", x: 840, y: 330, kind: "service" },
        { id: "groq", label: "Groq API", sublabel: "gpt-oss-120b", x: 840, y: 470, kind: "external" },
      ],
      edges: [
        { from: "client", to: "api" },
        { from: "api", to: "policy" },
        { from: "policy", to: "cache", label: "allowed" },
        { from: "cache", to: "retrieve", label: "miss", dashed: true },
        { from: "ingest", to: "pgvector", label: "embed" },
        { from: "retrieve", to: "pgvector", label: "search" },
        { from: "retrieve", to: "grade" },
        { from: "grade", to: "generate", label: "relevant" },
        { from: "grade", to: "rewrite", label: "weak", dashed: true },
        { from: "rewrite", to: "retrieve", label: "retry", dashed: true },
        { from: "generate", to: "cache", label: "write-back", dashed: true },
        { from: "grade", to: "gate" },
        { from: "rewrite", to: "gate" },
        { from: "generate", to: "gate" },
        { from: "gate", to: "groq" },
      ],
      boundary: {
        y: 400,
        above: "local · this machine",
        below: "external · sees placeholders only",
      },
    },
    flow: [
      {
        title: "Ingest",
        body: "`POST /documents` extracts text with pypdf, splits it into 500-character chunks with 50 of overlap, and embeds each one in-process with `all-MiniLM-L6-v2` (384 dimensions, on CPU). Chunks land in Postgres behind an HNSW index. Nothing about ingestion leaves the machine.",
      },
      {
        title: "Privacy policy",
        body: "Before anything else, the detector runs over the question. If it errors, the request is blocked with zero outbound calls. If the question needs the model to reason over a value's content — “is her email on example.com?” — the reply asks for consent instead, again with zero LLM calls.",
      },
      {
        title: "Semantic cache",
        body: "The question is normalized, embedded and looked up in Redis. A hit answers in 0.017 s with no LLM calls, against 2.58 s cold. A lexical guard rejects a hit whose question is the negation of the cached one, and answers given under consent never touch the cache in either direction.",
      },
      {
        title: "Agent loop",
        body: "On a miss, a LangGraph agent retrieves the top chunks from pgvector and has the LLM grade each one for relevance. If nothing relevant comes back it rewrites the query and retries, at most twice, then generates an answer with citations — or refuses, when the documents don't contain one.",
      },
      {
        title: "Egress gate",
        body: "Every grade, rewrite and generate call passes through `services/llm_client.py`, the only module allowed to import the Groq SDK (a test enforces it). Outbound, Presidio and spaCy replace names, emails, phones, card, PAN and Aadhaar numbers with request-scoped placeholders like `<PERSON_1>`. Inbound, the placeholders are restored locally — including ones the stream splits across tokens.",
      },
      {
        title: "Answer and egress record",
        body: "The response carries the answer, its sources, and a record of every outbound message exactly as it was sent. What left the machine is checkable text, not a claim.",
      },
    ],
    decisions: [
      {
        title: "Pseudonymize reversibly instead of redacting",
        context:
          "The LLM is external, so document text goes to a third party on every grade, rewrite and generate call. A local model would keep everything in, but on a CPU-only machine it's out of reach at useful quality and speed.",
        decision:
          "Replace each sensitive value with a typed placeholder (`<EMAIL_1>`) before the call, and swap the real value back in on this machine after the answer returns. Six entity types only: person, email, phone, card, PAN and Aadhaar.",
        why: "Redaction breaks the questions people actually ask: with `[REDACTED]` in the chunk, “what is her email?” has no answer. With a placeholder, the model copies `<EMAIL_1>` into its answer and the real value is restored locally. Companies and cities stay visible, because nearly every answer names one and hiding them destroys utility for little privacy gain.",
        tradeoffs:
          "The model can't reason about a value it can't see, which is what the consent flow is for. Placeholders could cost answer quality, so it was measured: 30/31 correct with privacy on against 29/31 off, for about 6% more tokens. A company, a city and a job title together can still identify someone.",
        lesson:
          "Measure what a safety layer costs instead of assuming it. At 31 questions the honest result is “no detectable cost”, not “no cost”.",
      },
      {
        title: "One egress gate, both directions, failing closed",
        context:
          "Three places call the LLM: grading, query rewriting and generation. Redacting at each call site means the next call site someone adds can forget to.",
        decision:
          "Make `services/llm_client.py` the only module that imports the Groq SDK, with a test that fails if any other module does. It pseudonymizes every message before the HTTP call and restores every response. Any exception from the detector, of any type, becomes a block with zero outbound calls.",
        why: "One place to audit, and no call site can skip it. Restoring at the gate too means a rewritten query comes back as real text before local retrieval embeds it. The catch-all is deliberate: an unexpected error type from spaCy must not open the gate.",
        tradeoffs:
          "A bug in DocMind's own code can also surface as a block; the error is chained so it can still be debugged. System prompts that never contain PII get pseudonymized anyway, a small waste of CPU.",
        lesson:
          "A privacy control that fails open is a suggestion. If the detector can't vouch for a message, the message doesn't go.",
      },
      {
        title: "Consent is a deterministic rule, and consented answers are never cached",
        context:
          "Some questions need the model to read a value's content — “is her email on example.com?”, “does her PAN start with ABC?” — which a placeholder can't answer.",
        decision:
          "A local keyword-plus-entity-type rule flags those questions and asks for `allow_sensitive` before anything is sent. Consent releases only the entity types it names, and a consented answer skips both the cache read and the cache write.",
        why: "It's local, instant, explainable and easy to test; asking an LLM to classify the question would send the question before the policy had run. The cache rule matters because the cache matches by similarity: a later paraphrase asked without consent would otherwise hit, and receive an answer that depended on releasing the value.",
        tradeoffs:
          "Keyword rules have known false negatives. “Is her address a Google one?” isn't flagged, so the model sees only a placeholder and should say it can't tell. Consented questions always pay for a full pipeline run.",
        lesson:
          "A similarity cache is a data-sharing channel between questions. Anything gated by consent has to stay out of it.",
      },
      {
        title: "Grade retrieval, then rewrite and retry",
        context:
          "Single-shot RAG answers whatever the first search returns. A question that doesn't share vocabulary with the source text still gets an answer, just one grounded in the wrong chunks.",
        decision:
          "A LangGraph state machine: retrieve, have the LLM grade each chunk's relevance, and if nothing relevant comes back, rewrite the query and retry, at most twice, before generating a cited answer or refusing.",
        why: "Grading turns “did retrieval work?” into a state the graph can branch on, instead of a hope baked into the prompt. On the golden set it refused all 4 unanswerable questions, and wrongly refused 1 of the 27 answerable ones.",
        tradeoffs:
          "Grading is where the tokens go: 72.7% of the pipeline's, against 23.1% for generation and 4.2% for rewrites. The retry cap bounds worst-case latency, so a question the documents can't answer still terminates.",
        lesson:
          "Measure where the tokens go before optimizing anything. The obvious suspect, generation, was under a quarter of the bill.",
      },
      {
        title: "A semantic cache needs a signal from outside the embedding",
        context:
          "Repeated and paraphrased questions shouldn't pay for a full pipeline run: 2.58 s cold, against 0.017 s for a cache hit.",
        decision:
          "Normalize the question, embed it, and serve a cached answer above a 0.92 cosine threshold — but only once a lexical negation guard has checked that the two questions aren't negations of each other.",
        why: "“Which tiers are eligible for the 14-day refund?” and its negation score 0.9879, higher than the true paraphrase the cache exists to serve at 0.9399. No threshold admits one and rejects the other, so the check has to come from somewhere else. Normalizing matters too: a missing “?” alone dropped a paraphrase to 0.8754.",
        tradeoffs:
          "The guard is lexical. “Barred from” carries no negation word, scores 0.9262, and is served the wrong cached answer. A real fix, a cross-encoder or LLM check on every hit, costs the latency the cache exists to save.",
        lesson:
          "Embedding similarity measures topic, not meaning. A negation keeps the topic and flips the answer.",
      },
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
    challenges: [
      "Streaming split placeholders in half: the model emits `<PER` and `SON_1>` as separate tokens, so restoring token by token leaked fragments. The stream restorer holds back only the text after an unclosed `<` or `[`, up to 24 characters, so the answer keeps streaming and the value still comes back whole.",
      "Presidio's email recognizer validates the top-level domain and rejected `rohan.deshpande@tamarind.example`, so during development that address went out in clear. A regex recognizer closed the gap, alongside the ones for PAN, Aadhaar-like numbers and +91 phones.",
      "NER is inconsistent from one sentence to the next: on a seven-sentence probe the medium spaCy model found the name in 5 of 6 sentences that contain one, the small model in 2. So the placeholder map is request-scoped — once a value has been seen, it's replaced wherever it reappears, even where NER misses it.",
      "A full evaluation run is about 190 calls against a free-tier limit, so each privacy mode got one run. The comparison pairs questions across the two runs and applies an exact sign test to the ones that flip, which makes the noise explicit instead of hiding it.",
    ],
    limitations: [
      "A name spaCy doesn't recognise goes out in clear. Companies, cities, dates and job titles are deliberately not hidden, and together they can still identify someone.",
      "Consent detection is keyword-based, so a paraphrase outside its word list isn't flagged.",
      "The cache's negation guard is lexical, and a Redis error silently degrades to a cache miss with no log.",
      "Citations aren't verified: nothing checks that a cited chunk actually supports the claim.",
      "The evaluation is 31 questions, one run per arm, with at least one visible judge error. Single user and no auth, by design.",
    ],
    links: {
      github: "https://github.com/Shoryagg7/docmind",
    },
  },
  {
    slug: "deliveriq",
    name: "DeliverIQ",
    tagline: "Distributed Order Dispatch API",
    summary:
      "Assigns delivery orders to riders across three API replicas without ever assigning either twice. Row-level claims in Postgres, a transactional outbox into Kafka, and an auth surface audited endpoint by endpoint.",
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
    highlights: [
      "0 duplicate order or rider assignments across 3 concurrent API replicas",
      "Transactional outbox into Kafka: 3 consumer groups and a dead-letter topic",
      "A self-audit found and closed 4 endpoints reachable without a token",
    ],
    overview:
      "Assigns incoming delivery orders to available riders across multiple API replicas under concurrent load. Redis holds shared state, including a token-bucket rate limiter run as an atomic Lua script so one limit holds across every replica. Kafka carries order and dispatch events using consumer groups with at-least-once delivery. PostgreSQL transactional locking stops two concurrent requests from assigning the same order. Prometheus and Grafana for metrics.",
    problem:
      "Orders arrive continuously; riders are scarce, mobile, and contested by several API replicas at once. Run more than one instance and two replicas polling the same table grab the same order, so a rider gets assigned twice. Commit an order and crash before publishing its event, and every downstream consumer silently misses it. The service had to decide which order goes to which rider without double-assigning either, publish that decision durably, keep working when a dependency failed — and, as an audit later showed, stop anyone without a token from steering dispatch.",
    diagram: {
      nodes: [
        { id: "client", label: "Client", sublabel: "React console", x: 80, y: 70, kind: "client" },
        { id: "mw", label: "Middleware", sublabel: "limit · idempotency", x: 270, y: 70, kind: "service" },
        { id: "api", label: "API replicas ×3", sublabel: "JWT + RBAC", x: 460, y: 70, kind: "service" },
        { id: "dispatch", label: "Dispatch", sublabel: "priority + aging", x: 650, y: 70, kind: "service" },
        { id: "pg", label: "PostgreSQL", sublabel: "orders · riders", x: 840, y: 70, kind: "store" },
        { id: "obs", label: "Prometheus", sublabel: "→ Grafana", x: 80, y: 200, kind: "external" },
        { id: "redis", label: "Redis", sublabel: "geo index · limits", x: 460, y: 200, kind: "store" },
        { id: "match", label: "Matching", sublabel: "geohash + fairness", x: 650, y: 200, kind: "service" },
        { id: "outbox", label: "Outbox table", sublabel: "same transaction", x: 840, y: 200, kind: "store" },
        { id: "dlq", label: "Dead-letter topic", sublabel: "poison messages", x: 270, y: 330, kind: "queue" },
        { id: "consumers", label: "3 consumer groups", sublabel: "own offsets", x: 460, y: 330, kind: "service" },
        { id: "kafka", label: "Kafka", sublabel: "3 brokers · RF=3", x: 650, y: 330, kind: "queue" },
        { id: "relay", label: "Outbox relay", sublabel: "publish → mark", x: 840, y: 330, kind: "service" },
      ],
      edges: [
        { from: "client", to: "mw" },
        { from: "mw", to: "api" },
        { from: "api", to: "dispatch" },
        { from: "dispatch", to: "pg", label: "claim" },
        { from: "mw", to: "obs", label: "metrics", dashed: true },
        { from: "mw", to: "redis", label: "buckets", dashed: true },
        { from: "dispatch", to: "match" },
        { from: "match", to: "redis", label: "9 cells" },
        { from: "dispatch", to: "outbox", label: "same txn" },
        { from: "outbox", to: "relay" },
        { from: "relay", to: "kafka", label: "publish" },
        { from: "kafka", to: "consumers" },
        { from: "consumers", to: "dlq", label: "fail", dashed: true },
      ],
    },
    flow: [
      {
        title: "Middleware chain",
        body: "Four middlewares run outermost first, and the order is load-bearing. `request_id` comes first so every log line, even a 429, carries a trace id. `metrics` sees every response, including rejections and replays that never reach a route. The rate limiter, an atomic Lua token bucket keyed on verified identity, runs before idempotency so a flood of replayed keys is still throttled.",
      },
      {
        title: "Authenticate on stateless replicas",
        body: "Three stateless FastAPI replicas verify the JWT and check the role: ops, rider or customer. Identity is derived from the token, never accepted in the body — `POST /orders` takes the customer from the token, and the field no longer exists in the request schema.",
      },
      {
        title: "Prioritize and claim",
        body: "Postgres orders pending work by `value + minutes_waited × weight`, capped at the top 20, so high-value orders go first but nothing starves. The order row and the rider row are both claimed with `SELECT … FOR UPDATE SKIP LOCKED`: a contending replica skips locked rows instead of waiting on them.",
      },
      {
        title: "Match",
        body: "Riders live in geohash cells in Redis (precision 6, about 1.2 km × 0.61 km). Matching reads the order's cell and its eight neighbours in a single pipeline, because every round trip here is time spent holding a row lock. A 500 m fairness band then picks whichever nearby rider has taken the fewest orders today.",
      },
      {
        title: "Write the outbox",
        body: "Dispatch doesn't publish to Kafka. It writes the event as a row in an `outbox` table inside the same transaction as the order and the rider, so one commit covers all three.",
      },
      {
        title: "Relay to Kafka",
        body: "A relay publishes outbox rows to Kafka — three brokers, replication factor 3, keyed by `order_id` so each order's events stay in order — and marks each row done only after the publish is acknowledged.",
      },
      {
        title: "Consume",
        body: "Notifications, analytics and audit each read the topic as their own consumer group with their own offsets, committing after processing. Analytics deduplicates on `(partition, offset)`, and a message that can never be processed goes to a dead-letter topic instead of wedging its partition.",
      },
    ],
    decisions: [
      {
        title: "Two-phase claiming with SKIP LOCKED",
        context:
          "Three API replicas race for the same pending orders. Under concurrent load two of them would occasionally claim the same order — a double-dispatch race that never shows up in a unit test.",
        decision:
          "Claim the order row and the rider row with `SELECT … FOR UPDATE SKIP LOCKED` before mutating anything. If the chosen rider is lost mid-claim, re-select the next-best rider for the same order instead of dropping it.",
        why: "Contenders skip locked rows instead of blocking, so a contested dispatch degrades into a retry rather than a deadlock. The database does the mutual exclusion itself: no lock manager, no advisory-lock bookkeeping, and a crash mid-claim just rolls back and frees the rows.",
        tradeoffs:
          "Row locks last as long as the transaction, so everything inside the claim is lock-hold time — which is why the Redis candidate reads go out as one pipeline. Claiming is also tied to Postgres; a dedicated queue would decouple it, but give up atomicity with order state.",
        lesson:
          "Verified with concurrent dispatches across replicas: zero duplicate order or rider assignments. The database you already run is often the most correct queue available.",
      },
      {
        title: "Bound the search, then balance fairly",
        context:
          "Nearest-rider matching started as a scan over every active rider, once per order. Greedy-nearest also means the closest rider takes every order while the others idle.",
        decision:
          "Index riders into geohash cells in Redis and read only the order's cell plus its eight neighbours. Within that candidate set, a 500 m fairness band admits everyone near the closest rider, then picks whoever has taken the fewest orders today.",
        why: "Nine set lookups, regardless of fleet size. Scoring is still linear in the riders inside those nine cells, so the honest claim is a bounded candidate set, not constant time end to end. The fairness band turns dispatch into a constrained assignment problem: throughput inside an SLA, distributed fairly.",
        tradeoffs:
          "A rider more than one cell out is never considered. And the index is derived state: a flushed Redis leaves every rider invisible to dispatch with no error raised anywhere, so a reindex script rebuilds it from Postgres.",
        lesson:
          "Approximate spatial indexing is usually enough, as long as you say exactly what it bounds. “O(1) matching” would have been the more impressive claim, and the wrong one.",
      },
      {
        title: "A transactional outbox instead of publishing after commit",
        context:
          "Committing the order and then publishing to Kafka are two writes to two systems. A crash between `db.commit()` and the publish lost the event forever: the order was assigned, and no consumer ever heard about it.",
        decision:
          "Write the event as a row in an `outbox` table inside the same transaction as the order and the rider. A separate relay publishes those rows and then marks them done — in that order.",
        why: "One commit covers the order, the rider and the event, which closes the dual-write hole. The relay publishes before marking because marking first would only move the same hole one layer down.",
        tradeoffs:
          "The event is durable but no longer instant: the relay adds latency between commit and publish. Publish-then-mark also means a relay crash can publish a row twice, which the consumers have to absorb.",
        lesson:
          "Two writes to two systems are never atomic. Make it one write, then move the data with something that can retry.",
      },
      {
        title: "At-least-once consumers with a dead-letter topic",
        context:
          "Notifications, analytics and audit all need every order event. The first version used Redis Pub/Sub, which is fire-and-forget: a consumer that's down during a publish simply misses the message.",
        decision:
          "Three Kafka consumer groups on one topic, each with its own committed offsets, committing only after the handler returns. Messages that can never be processed go to `order.dispatched.dlq` with full context, and the offset advances only once that publish is acknowledged.",
        why: "Independent offsets mean one consumer failing or falling behind can't affect the others, and a new group can replay history from the start. Without the dead-letter topic, one poison message would wedge its partition forever — invisibly, since a partition with no committed offset reports no lag.",
        tradeoffs:
          "Committing after processing means duplicates, so the analytics consumer deduplicates on `(partition, offset)` with `ON CONFLICT DO NOTHING`. Kafka is also far heavier to run than Pub/Sub: three brokers, replication factor 3, and rebalancing to reason about.",
        lesson:
          "Delivery stays at-least-once; the effect becomes exactly-once. Choose the delivery semantics first, and the technology follows.",
      },
      {
        title: "Auditing my own auth surface",
        context:
          "Once the service was feature-complete, I read every route the way an attacker would. The audit found more than the feature work had: four endpoints reachable with no token at all, a JWT signing key with a working default, and an idempotency cache that could serve one user another user's response.",
        decision:
          "JWT with role checks on every endpoint that changes state or exposes another user's data. `JWT_SECRET` has no default: the app refuses to start without one, rejects known placeholders and requires 32 bytes. Idempotency keys are namespaced per caller and bound to a hash of the request body.",
        why: "The worst of the open endpoints was rider location, which writes straight into the geohash index that dispatch matches against — whoever can move riders can steer assignment. It read like a profile update, so it had been guarded like one. A default secret is worse than a weak one: nobody has to bypass it, because it's already off.",
        tradeoffs:
          "Every state-changing request pays for token verification. Reads are scoped in the query rather than filtered afterwards, and an order you may not see answers 404 rather than 403, because a 403 would confirm the id exists.",
        lesson:
          "Classify an endpoint by its blast radius, not by what it looks like. `scripts/verify.sh` now re-checks every auth boundary, including minting a token with the old shipped secret and asserting it's rejected.",
      },
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
        {
          label: "Test suite",
          value: "79 tests",
          note: "55 integration, against real Postgres and Redis",
        },
      ],
      source: {
        label: "README.md",
        href: "https://github.com/Shoryagg7/deliveriq/blob/main/README.md",
      },
    },
    finding: {
      label: "Finding · load test",
      text: "The first load figure measured a plain INSERT, with no matching, locking or Kafka, so it was retired. Pointed at the dispatch claim instead, one run found that with a large backlog and no free riders, every call scanned the entire pending set just to answer “nobody is available”.",
    },
    challenges: [
      "The double-dispatch race only appeared under concurrent load, so it couldn't be fixed until a concurrency test could reproduce it on demand by hammering the claim path across replicas.",
      "Workers that ignored `SIGTERM` stalled every `docker compose stop`: the replacement waited out `session.timeout.ms`, about 45 s measured, before the group rebalanced. They now leave their consumer group cleanly.",
      "Tests that patched Kafka publishing where it was defined still passed while events reached the real broker, because every module that imported `publish_event` held its own binding. The fixture now patches the call sites, and fails if any code path constructs a real producer.",
      "Liveness and readiness had to be split. A `/health` that depended on Redis would turn one cache blip into an orchestrator restarting the whole fleet, so `/health` touches nothing and `/ready` round-trips Postgres, Redis and Kafka and names what failed.",
    ],
    limitations: [
      "A rider more than one geohash cell away is never considered, even when they're the only one free.",
      "The rate limiter fails open: while Redis is down, nothing is rate-limited. Right for a protective control, wrong for auth or payments.",
      "Events are durable but not instant; the outbox relay adds latency between commit and publish.",
      "Load numbers come from one laptop running the API, Postgres, Redis and three Kafka brokers. They're valid as a before/after comparison, not as a capacity figure.",
    ],
    links: {
      github: "https://github.com/Shoryagg7/deliveriq",
    },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
