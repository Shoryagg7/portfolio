import type { Profile } from "@/types";
import { withBasePath } from "@/lib/site";

export const profile: Profile = {
  name: "Shorya Gupta",
  role: "Backend & Distributed Systems Engineer",
  tagline: "I build reliable distributed systems.",
  intro:
    "Final-year Computer Science undergraduate at Thapar Institute. I design and build scalable, low-latency backend services — event-driven architectures, careful concurrency, and systems that stay up when things go wrong.",
  location: "India",
  university: "Thapar Institute of Engineering and Technology",
  degree: "B.E. Computer Science Engineering",
  gpa: "8.87 / 10.0",
  years: "2023 — 2027",
  links: {
    github: "https://github.com/Shoryagg7",
    linkedin: "https://linkedin.com/in/shoryag7",
    codeforces: "https://codeforces.com/profile/Shoryagg7",
    codechef: "https://www.codechef.com/users/shoryagg7",
    leetcode: "https://leetcode.com/u/shoryag7",
    email: "shoryag.gupta@gmail.com",
  },
  resumePath: withBasePath("/resume.pdf"),
};

export const heroStats = [
  { label: "Codeforces", value: 1687, suffix: "", note: "Expert · peak rating" },
  { label: "Problems solved", value: 2000, suffix: "+", note: "CF · LC · CC" },
  { label: "CGPA", value: 8.87, suffix: "", note: "Thapar Institute", decimals: 2 },
] as const;

export const currentlyExploring = [
  "Raft & consensus internals",
  "Postgres query planning",
  "Vector search at scale",
  "Go for systems programming",
];
