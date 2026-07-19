import type { PlatformStats } from "@/types";

/*
  Service layer for competitive programming stats.
  Codeforces is fetched live from the official public API (ISR-cached, 6h);
  CodeChef and LeetCode have no official APIs, so they use verified static
  numbers. Everything returns the same PlatformStats shape, so swapping a
  static provider for a live one later touches only this file.
*/

const staticStats: Record<string, PlatformStats> = {
  codeforces: {
    platform: "codeforces",
    handle: "Shoryagg7",
    url: "https://codeforces.com/profile/Shoryagg7",
    title: "Codeforces",
    currentRating: 1687,
    peakRating: 1687,
    problemsSolved: 1100,
    contests: null,
    rankLabel: "Expert",
    live: false,
  },
  codechef: {
    platform: "codechef",
    handle: "shoryag7",
    url: "https://www.codechef.com/users/shoryag7",
    title: "CodeChef",
    currentRating: 1732,
    peakRating: 1732,
    problemsSolved: null,
    contests: null,
    rankLabel: "3★",
    live: false,
  },
  leetcode: {
    platform: "leetcode",
    handle: "shoryag7",
    url: "https://leetcode.com/u/shoryag7",
    title: "LeetCode",
    currentRating: null,
    peakRating: null,
    problemsSolved: 900,
    contests: null,
    rankLabel: "2000+ total solved",
    live: false,
  },
};

interface CFUserResult {
  status: string;
  result?: Array<{
    handle: string;
    rating?: number;
    maxRating?: number;
    rank?: string;
    maxRank?: string;
  }>;
}

interface CFRatingResult {
  status: string;
  result?: Array<{ newRating: number; contestId: number }>;
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

async function fetchCodeforces(): Promise<PlatformStats> {
  const fallback = staticStats.codeforces;
  try {
    const [userRes, ratingRes] = await Promise.all([
      fetch("https://codeforces.com/api/user.info?handles=Shoryagg7", {
        next: { revalidate: 21600 },
      }),
      fetch("https://codeforces.com/api/user.rating?handle=Shoryagg7", {
        next: { revalidate: 21600 },
      }),
    ]);

    if (!userRes.ok) return fallback;
    const userData = (await userRes.json()) as CFUserResult;
    if (userData.status !== "OK" || !userData.result?.length) return fallback;

    const user = userData.result[0];
    let contests: number | null = null;
    let ratingHistory: number[] | undefined;

    if (ratingRes.ok) {
      const ratingData = (await ratingRes.json()) as CFRatingResult;
      if (ratingData.status === "OK" && ratingData.result) {
        contests = ratingData.result.length;
        ratingHistory = ratingData.result.map((r) => r.newRating);
      }
    }

    return {
      ...fallback,
      currentRating: user.rating ?? fallback.currentRating,
      peakRating: user.maxRating ?? fallback.peakRating,
      rankLabel: user.maxRank ? titleCase(user.maxRank) : fallback.rankLabel,
      contests,
      ratingHistory,
      live: true,
    };
  } catch {
    return fallback;
  }
}

export async function getAllPlatformStats(): Promise<PlatformStats[]> {
  const codeforces = await fetchCodeforces();
  return [codeforces, staticStats.codechef, staticStats.leetcode];
}
