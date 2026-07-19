import type { PlatformStats } from "@/types";

/*
  Service layer for competitive programming stats. All three platforms are
  fetched live at build/revalidate time; each has its own typed static
  fallback so a single flaky source never breaks the page. Swapping any
  provider's transport later only touches its fetch* function below.

  - Codeforces: official public API.
  - LeetCode: public GraphQL endpoint (unofficial, but stable and widely used).
  - CodeChef: no public API; scraped from the profile page's public HTML.
    Most fragile of the three, so it's the most defensively wrapped.
*/

const staticStats: Record<string, PlatformStats> = {
  codeforces: {
    platform: "codeforces",
    handle: "Shoryagg7",
    url: "https://codeforces.com/profile/Shoryagg7",
    title: "Codeforces",
    currentRating: 1634,
    peakRating: 1687,
    problemsSolved: 300,
    contests: 16,
    rankLabel: "Expert",
    live: false,
  },
  codechef: {
    platform: "codechef",
    handle: "shoryagg7",
    url: "https://www.codechef.com/users/shoryagg7",
    title: "CodeChef",
    currentRating: 1731,
    peakRating: 1733,
    problemsSolved: 109,
    contests: 16,
    rankLabel: "3★",
    live: false,
  },
  leetcode: {
    platform: "leetcode",
    handle: "shoryag7",
    url: "https://leetcode.com/u/shoryag7",
    title: "LeetCode",
    currentRating: 2013,
    peakRating: 2014,
    problemsSolved: 844,
    contests: 23,
    rankLabel: "Top 5%",
    live: false,
  },
};

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Codeforces — official API
// ---------------------------------------------------------------------------

interface CFUserResult {
  status: string;
  result?: Array<{ handle: string; rating?: number; maxRating?: number; maxRank?: string }>;
}
interface CFRatingResult {
  status: string;
  result?: Array<{ newRating: number }>;
}
interface CFStatusResult {
  status: string;
  result?: Array<{ verdict?: string; problem: { contestId?: number; index?: string } }>;
}

async function fetchCodeforces(): Promise<PlatformStats> {
  const fallback = staticStats.codeforces;
  try {
    const [userRes, ratingRes, statusRes] = await Promise.all([
      fetch("https://codeforces.com/api/user.info?handles=Shoryagg7", {
        next: { revalidate: 21600 },
      }),
      fetch("https://codeforces.com/api/user.rating?handle=Shoryagg7", {
        next: { revalidate: 21600 },
      }),
      fetch("https://codeforces.com/api/user.status?handle=Shoryagg7", {
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

    let problemsSolved = fallback.problemsSolved;
    if (statusRes.ok) {
      const statusData = (await statusRes.json()) as CFStatusResult;
      if (statusData.status === "OK" && statusData.result) {
        const solved = new Set<string>();
        for (const sub of statusData.result) {
          if (sub.verdict === "OK") solved.add(`${sub.problem.contestId}-${sub.problem.index}`);
        }
        problemsSolved = solved.size;
      }
    }

    return {
      ...fallback,
      currentRating: user.rating ?? fallback.currentRating,
      peakRating: user.maxRating ?? fallback.peakRating,
      rankLabel: user.maxRank ? titleCase(user.maxRank) : fallback.rankLabel,
      contests,
      problemsSolved,
      ratingHistory,
      live: true,
    };
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// LeetCode — public GraphQL endpoint
// ---------------------------------------------------------------------------

interface LCResponse {
  data?: {
    matchedUser?: {
      profile?: { ranking?: number };
      submitStatsGlobal?: { acSubmissionNum?: Array<{ difficulty: string; count: number }> };
    };
    userContestRankingHistory?: Array<{ attended: boolean; rating: number }>;
  };
}

async function fetchLeetCode(): Promise<PlatformStats> {
  const fallback = staticStats.leetcode;
  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
      body: JSON.stringify({
        query: `query($u: String!) {
          matchedUser(username: $u) {
            profile { ranking }
            submitStatsGlobal { acSubmissionNum { difficulty count } }
          }
          userContestRankingHistory(username: $u) { attended rating }
        }`,
        variables: { u: "shoryag7" },
      }),
      next: { revalidate: 21600 },
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as LCResponse;
    const user = data.data?.matchedUser;
    if (!user) return fallback;

    const totalSolved = user.submitStatsGlobal?.acSubmissionNum?.find(
      (d) => d.difficulty === "All",
    )?.count;

    const attended = (data.data?.userContestRankingHistory ?? []).filter((h) => h.attended);
    const ratings = attended.map((h) => Math.round(h.rating));
    const currentRating = ratings.length ? ratings[ratings.length - 1] : null;
    const peakRating = ratings.length ? Math.max(...ratings) : null;

    const ranking = user.profile?.ranking;
    const rankLabel = ranking ? `Rank #${ranking.toLocaleString("en-US")}` : fallback.rankLabel;

    return {
      ...fallback,
      currentRating: currentRating ?? fallback.currentRating,
      peakRating: peakRating ?? fallback.peakRating,
      problemsSolved: totalSolved ?? fallback.problemsSolved,
      contests: attended.length || fallback.contests,
      rankLabel,
      ratingHistory: ratings.length >= 2 ? ratings : undefined,
      live: true,
    };
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// CodeChef — no public API; best-effort scrape of the public profile page
// ---------------------------------------------------------------------------

async function fetchCodeChef(): Promise<PlatformStats> {
  const fallback = staticStats.codechef;
  try {
    const res = await fetch("https://www.codechef.com/users/shoryagg7", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      },
      next: { revalidate: 21600 },
    });
    if (!res.ok) return fallback;
    const html = await res.text();

    const ratingNumbers = [...html.matchAll(/rating-number">\s*([0-9]+|NA)\s*</g)].map(
      (m) => m[1],
    );
    const currentRating =
      ratingNumbers[0] && ratingNumbers[0] !== "NA" ? Number(ratingNumbers[0]) : null;

    const peakMatch = html.match(/Highest Rating (\d+)/);
    const peakRating = peakMatch ? Number(peakMatch[1]) : null;

    const solvedMatch = html.match(/Total Problems Solved:\s*(\d+)/);
    const problemsSolved = solvedMatch ? Number(solvedMatch[1]) : null;

    const contestsMatch = html.match(/Contests \((\d+)\)/);
    const contests = contestsMatch ? Number(contestsMatch[1]) : null;

    const starBlock = html.match(/rating-star">([\s\S]{0,400}?)<\/div>/);
    const starCount = starBlock ? (starBlock[1].match(/<span/g) ?? []).length : 0;

    if (currentRating === null && peakRating === null) return fallback;

    return {
      ...fallback,
      currentRating: currentRating ?? fallback.currentRating,
      peakRating: peakRating ?? fallback.peakRating,
      problemsSolved: problemsSolved ?? fallback.problemsSolved,
      contests: contests ?? fallback.contests,
      rankLabel: starCount > 0 ? `${starCount}★` : fallback.rankLabel,
      live: true,
    };
  } catch {
    return fallback;
  }
}

export async function getAllPlatformStats(): Promise<PlatformStats[]> {
  const [codeforces, codechef, leetcode] = await Promise.all([
    fetchCodeforces(),
    fetchCodeChef(),
    fetchLeetCode(),
  ]);
  return [codeforces, codechef, leetcode];
}
