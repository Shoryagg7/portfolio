export interface SocialLinks {
  github: string;
  linkedin: string;
  codeforces: string;
  codechef: string;
  leetcode: string;
  email: string;
}

export interface Profile {
  name: string;
  role: string;
  tagline: string;
  intro: string;
  location: string;
  university: string;
  degree: string;
  gpa: string;
  years: string;
  links: SocialLinks;
  resumePath: string;
}

export interface EngineeringDecision {
  title: string;
  context: string;
  decision: string;
  why: string;
  tradeoffs: string;
  lesson: string;
}

export interface PerformanceMetric {
  label: string;
  value: string;
  detail?: string;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  kind: "service" | "store" | "queue" | "external" | "client";
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}

export interface ArchitectureDiagram {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  year: string;
  stack: string[];
  overview: string;
  problem: string;
  architectureNotes: string[];
  diagram: ArchitectureDiagram;
  decisions: EngineeringDecision[];
  performance: PerformanceMetric[];
  challenges: string[];
  lessons: string[];
  links: { github?: string; demo?: string; docs?: string };
  highlights: string[];
}

export type PlatformId = "codeforces" | "codechef" | "leetcode";

export interface PlatformStats {
  platform: PlatformId;
  handle: string;
  url: string;
  title: string;
  currentRating: number | null;
  peakRating: number | null;
  problemsSolved: number | null;
  contests: number | null;
  rankLabel: string;
  live: boolean;
  ratingHistory?: number[];
  /** Solved split by problem difficulty (LeetCode). */
  difficultySplit?: DifficultySplit;
}

export interface DifficultySplit {
  easy: number;
  medium: number;
  hard: number;
}

export interface SkillCategory {
  name: string;
  icon: string;
  skills: string[];
  note: string;
}

export interface Principle {
  title: string;
  body: string;
  icon: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readingTime: string;
}
