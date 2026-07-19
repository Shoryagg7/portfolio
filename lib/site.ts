/*
  Single source of truth for the deployed URL and base path.
  GitHub Pages serves from https://shoryagg7.github.io/portfolio (basePath /portfolio);
  Vercel or a custom domain serves from the root — override via env.
*/
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://shoryagg7.github.io/portfolio";

/** Prefix a public asset path with the base path (for raw hrefs / window.open). */
export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
