import type { SkillCategory } from "@/types";

export const skillCategories: SkillCategory[] = [
  {
    name: "Backend",
    icon: "server",
    skills: ["Python", "FastAPI", "REST APIs", "SQLAlchemy", "Pydantic", "Async programming"],
    note: "Low-latency APIs and event-driven services",
  },
  {
    name: "Databases & Caching",
    icon: "database",
    skills: ["PostgreSQL", "Redis", "FAISS", "SQL", "Query optimization", "Vector search"],
    note: "Correctness under concurrency, speed under load",
  },
  {
    name: "Messaging & Streaming",
    icon: "workflow",
    skills: ["Apache Kafka", "Event-driven architecture", "Consumer groups", "Pub/Sub", "Redis Streams"],
    note: "Durable, replayable event pipelines",
  },
  {
    name: "System Design",
    icon: "network",
    skills: ["Rate limiting", "Idempotency", "Caching strategies", "Fault tolerance", "Horizontal scaling", "State machines"],
    note: "Designing for failure before it happens",
  },
  {
    name: "Infrastructure & Observability",
    icon: "container",
    skills: ["Docker", "Docker Compose", "GitHub Actions", "CI/CD", "Prometheus", "Grafana", "Linux", "Git"],
    note: "Ship it, measure it, keep it up",
  },
  {
    name: "Competitive Programming",
    icon: "trophy",
    skills: ["C++", "Data structures", "Algorithms", "Graph theory", "Dynamic programming", "Number theory"],
    note: "Codeforces Expert · 2000+ problems",
  },
  {
    name: "AI / GenAI",
    icon: "sparkles",
    skills: ["LLM integration", "RAG", "Embeddings", "Semantic search", "Prompt engineering"],
    note: "LLM systems with real cost & latency budgets",
  },
];
