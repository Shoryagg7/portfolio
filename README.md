<div align="center">

# Shorya Gupta — Portfolio

**A portfolio that argues its own thesis: _this engineer builds reliable distributed systems._**

[**→ Live site**](https://shoryagg7.github.io/portfolio/) · [Case studies](https://shoryagg7.github.io/portfolio/#projects) · [CP dashboard](https://shoryagg7.github.io/portfolio/#competitive-programming) · [Writing](https://shoryagg7.github.io/portfolio/blog)

![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)
![Deploy](https://github.com/Shoryagg7/portfolio/actions/workflows/deploy.yml/badge.svg)

</div>

---

Dark-first, space-themed, and deliberately not a template. The organizing idea is that **a solar system is a distributed system**: independent bodies, stable periods, coordination through gravity rather than a central commander. So the hero is a real orbital scene whose bodies are the projects and CP platforms this site is about, and the rest of the page carries that through as abstract distributed topology: parallax starfields, constellation networks, packet pulses tracing edges between nodes. No rockets, no astronauts, no rainbow gradients.

Every section answers one recruiter question:

| Section | Answers |
|---|---|
| Hero | Who am I? |
| About | Why this domain? |
| Engineering Philosophy | How do I think? |
| Skills | What do I reach for? |
| Projects | What can I build? |
| Competitive Programming | Can I solve hard problems? |
| Blog | Can I communicate technical depth? |
| Contact | How do I get reached? |

## Highlights

- **Deep case studies, not cards.** Each project ([DeliverIQ](https://shoryagg7.github.io/portfolio/projects/deliveriq/), [SemanticCache](https://shoryagg7.github.io/portfolio/projects/semanticcache/)) gets a full page: problem statement, animated SVG architecture diagram, performance numbers, challenges, and every major decision broken down as **Context → Decision → Why → Trade-offs → Lesson**.
- **Live competitive programming dashboard.** Real ratings and solved counts pulled from all three platforms at build time, each with independent graceful fallback.
- **⌘K command palette.** Fuzzy navigation, project/blog search, resume download, profile links, copy-email, and a live accent-theme switcher. There's a visible entry point on touch devices, where ⌘K doesn't exist.
- **A hero solar system whose bodies are real data.** The inner orbit carries the projects, the outer carries the three CP platforms, each sized by its live rating. Hover one and it labels itself while the rest dim. Rendered in react-three-fiber, lazy-loaded so it never blocks first paint.
- **Hand-rolled Canvas starfield.** Parallax layers, twinkle, drifting network nodes, proximity-linked edges, and accent-colored signal pulses, in ~200 lines of Canvas 2D behind the 3D scene.
- **Fully static.** Every route prerenders to HTML. No server, no database, no runtime API calls from the browser.

## Tech stack

| Layer | Choice | Why this one |
|---|---|---|
| Framework | **Next.js 16** (App Router) | RSC-first, so content and data fetching stay on the server and client JS is spent only on interaction. |
| Language | **TypeScript** | Content is typed data (`types/`), so a malformed project or post is a compile error, not a runtime blank. |
| Styling | **Tailwind CSS v4** | Design tokens as CSS variables; the entire accent palette swaps at runtime via one `[data-accent]` attribute. |
| Motion | **`motion`** (Framer) | Scroll-linked backdrop parallax, section-heading choreography, card lift. Reduced-motion honored throughout. |
| 3D | **react-three-fiber** + drei + three | Hero solar system only. Dynamically imported after `load`, in its own chunk. Everything else stays 2D/CSS. |
| Palette | **cmdk** | Accessible, unstyled command menu primitive. |
| Content | **MDX** + typed TS modules | Posts are files; projects/skills/profile are typed objects. |
| Icons | **Lucide** + 2 inline SVGs | Lucide v1 dropped brand glyphs, so GitHub/LinkedIn are self-hosted (also avoids a network request). |

Zero runtime UI dependencies beyond these. No component library, no CSS-in-JS, no analytics bundle.

## Live data pipeline

The CP dashboard shows **real numbers**, fetched during the build rather than from the browser:

| Platform | Source | Retrieved |
|---|---|---|
| **Codeforces** | Official public API | Current & peak rating, rank, contests, rating history, solved count computed from distinct `OK` verdicts |
| **LeetCode** | Public GraphQL endpoint | Contest rating & peak, contests attended, total solved, global rank |
| **CodeChef** | Profile page HTML (no public API exists) | Current & peak rating, star count, problems solved, contests |

Three properties make this safe to ship:

1. **Independent failure.** Each source is wrapped separately, so CodeChef's scrape breaking never affects the Codeforces card.
2. **Typed static fallbacks.** Every platform has verified numbers baked in. A failed fetch silently renders those instead of a spinner or a blank, and the card's `live` badge reflects which path was taken.
3. **Zero client cost.** Because fetching happens at build time, visitors download plain HTML. No loading states, no CORS proxying, no API keys in the bundle.

A scheduled GitHub Action rebuilds daily at **02:30 UTC**, so ratings stay current without a server.

> **Design note on the counters.** The stats count up when scrolled into view, but the animation is strictly *additive*: the real number is what the server renders and what React holds by default, and the count-up only overrides it while actively running. An earlier version initialized to `0` and animated upward, which meant a viewport observer that never fired left a permanent zero on screen. That's exactly what happened on mobile. Inverting the default makes the failure mode "no animation" instead of "wrong number," and the sweep is delayed to match each container's reveal so it's fully visible rather than half-finished by the time it fades in.

## Design system

The first version of this site was a competent minimal template that read as flat
and cramped. Fixing that meant treating "it feels tidy" as measurable, not as taste:

| Symptom | Measurement | Fix |
|---|---|---|
| Cards didn't read as raised | background layers **1.03:1** apart | Elevation ladder spaced by *perceptual lightness* (L\* 1.5 / 6.5 / 11), since contrast ratio is meaningless this close to black |
| Everything felt flat | **zero** resting shadows sitewide | `--shadow-card` / `--shadow-lift`, carried by an inset top highlight (a black shadow on near-black does nothing) |
| Small text hard to read | `--faint` at **3.38:1**, failing WCAG AA | `#82899b`, ≥4.5:1 on all three surfaces |
| Cards never moved | `.glow-hover` declared a `transform` transition its `:hover` rule never set | Actual lift, measured at `translateY(-3px)` |
| Cramped rhythm | **82%** of gaps ≤16px | Sections `py-32/44`, gaps 24–32px, cards `p-6/8`, radius `2xl` |
| No visual hierarchy | **71%** of type ≤16px; nothing past the hero above 36px | Section `h2` to 36/60px, 12px floor on everything |
| Orphan rows | Skills: 7 cards in a 3-col grid | 6-col bento with spans totalling 18, so rows fill exactly |

Mobile is designed separately rather than scaled down. The hero solar system, for
instance, gets its own band above the headline on phones and its own camera
framing, because the desktop placement dimmed behind body copy was worth neither
the pixels nor the battery.

## Architecture

```
app/                      # routes
  page.tsx                #   single-page composition of all sections
  projects/[slug]/        #   deep case studies          (SSG)
  blog/[slug]/            #   MDX posts                  (SSG)
  feed.xml/ sitemap.ts robots.ts opengraph-image.tsx not-found.tsx
components/
  layout/                 # Navbar (scroll-spy), Footer, ScrollProgress, Section, SectionHeading
  sections/               # one file per page section
  space/
    solar-system/         #   ← the 3D hero; lazy, aria-hidden, WebGL-optional
    starfield.tsx         #   Canvas 2D star layer
    cosmic-backdrop.tsx   #   parallax nebula behind every section
    architecture-diagram.tsx
  command/                # cmdk palette + context provider
  ui/                     # Button, Badge, GlowCard, Magnetic, RatingGraph, brand icons
  motion/                 # Reveal / Stagger wrappers
lib/design/motion.ts      # shared easings, durations, orbital periods
hooks/                    # useActiveSection (scroll spy)
lib/
  services/cp-stats.ts    # ← all external data access lives here
  content/                # profile, projects, skills, philosophy (typed)
  blog.ts                 # MDX loader: frontmatter, tags, reading time
  site.ts                 # SITE_URL / basePath, env-overridable
types/                    # shared interfaces
content/blog/             # posts as .mdx
```

**The rule the structure enforces:** presentation never touches data access. Components receive typed props; every external call is behind `lib/services/`. Swapping CodeChef's scrape for a real API someday is a one-file change with no component edits.

## Performance & accessibility

- **All routes prerendered.** Verified in the build output. Nothing is server-rendered on demand.
- **The 3D scene never blocks first paint.** `ssr: false` alone wasn't enough: the import still fired on mount, and profiling a cold load showed hydration and ~900KB of three.js parsing as two back-to-back long tasks, with the hero paragraph stuck behind both. `requestIdleCallback` alone also fired too eagerly, since the thread looks idle right after first paint. The scene now waits for `load` *then* idle. Verified: LCP is the hero DOM text, and no eagerly-referenced chunk contains three.js.
- **Adaptive 3D quality.** drei's `PerformanceMonitor` scales body detail and dust count down on weak GPUs; DPR capped at 2; a CSS fallback covers no-WebGL; `prefers-reduced-motion` renders one static frame via `frameloop="demand"`.
- **Canvas discipline.** Device pixel ratio capped at 2, star/node density cut ~55% below 768px, and the render loop pauses via `IntersectionObserver` when scrolled offscreen.
- **`next/font`** self-hosts Space Grotesk / Inter / JetBrains Mono with `display: swap`, so there's no layout shift and no third-party font request.
- **No images to optimize.** Architecture diagrams are inline SVG generated from typed node/edge data, so they're crisp at any zoom and theme-aware for free.
- **`prefers-reduced-motion`** is honored throughout: the starfield renders one static frame, reveals become plain fades, orbits and packet pulses stop.
- Semantic landmarks, one `h1` per page, `role="img"` + descriptive labels on diagrams, visible focus rings, and full keyboard navigation.

## Running locally

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # production build
npm run lint
```

Opening the dev server from another device (phone testing) works out of the box, because the LAN origin is allowlisted in `next.config.ts` via `allowedDevOrigins`. Add your machine's IP there if your subnet differs.

To reproduce the exact deployed artifact:

```bash
GITHUB_PAGES=true NEXT_PUBLIC_BASE_PATH=/portfolio npm run build   # emits ./out
```

## Deployment

Hosted on **GitHub Pages** via GitHub Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).

- Push to `main` → build + deploy (~2 min). Pushing is the only step; ratings refresh on every build.
- Scheduled daily rebuild keeps live stats fresh with no commits.
- `workflow_dispatch` allows a manual redeploy from the Actions tab.

`GITHUB_PAGES=true` switches `next.config.ts` to `output: "export"` with the `/portfolio` base path. Deploying to Vercel or a custom domain instead needs no code changes. Drop the env vars and set `NEXT_PUBLIC_SITE_URL`, since every URL flows from `lib/site.ts`.

## Making it yours

| To change | Edit |
|---|---|
| Name, links, intro, hero stats | `lib/content/profile.ts` |
| Projects & case studies | `lib/content/projects.ts` |
| Skills / principles | `lib/content/skills.ts`, `lib/content/philosophy.ts` |
| CP handles & fallbacks | `lib/services/cp-stats.ts` |
| Blog posts | add `.mdx` to `content/blog/` |
| Accent & background palette | `app/globals.css` (`:root` tokens) |
| Résumé PDF | `public/resume.pdf` |

---

<div align="center">

Built by **[Shorya Gupta](https://github.com/Shoryagg7)** · [LinkedIn](https://linkedin.com/in/shoryag7) · [Codeforces](https://codeforces.com/profile/Shoryagg7) · [LeetCode](https://leetcode.com/u/shoryag7)

</div>
