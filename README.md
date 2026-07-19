# shoryagupta.dev — Portfolio

A premium, production-grade personal portfolio for a backend & distributed systems engineer. Dark-first, space-themed ("distributed topology" — starfields, constellation networks, signal pulses), built to feel closer to a SaaS product than a developer template.

**Central narrative:** *this engineer builds reliable distributed systems* — every section answers a recruiter question, from deep project case studies (with Context / Decision / Why / Trade-offs / Lesson breakdowns) to a live competitive programming dashboard.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16 (App Router)** | RSC-first: content and data fetching stay on the server, client JS is reserved for interaction. SSG + ISR gives static speed with live data. |
| Language | **TypeScript** | Typed content models (`types/`) make every project, post, and stat structurally verified. |
| Styling | **Tailwind CSS v4** | Design tokens as CSS variables (`app/globals.css`), themeable accent via `[data-accent]`. |
| Motion | **`motion` (Framer Motion)** + Canvas 2D | Purposeful reveals and one hand-rolled starfield canvas — no react-three-fiber, no heavy deps. |
| Palette | **cmdk** | ⌘K command palette: navigation, project/blog search, actions, theme switching. |
| Content | **MDX** (`next-mdx-remote`) + typed TS data | Blog posts are MDX files; projects/skills/profile are typed data modules. |
| Icons | **Lucide** (+ 2 inline brand SVGs) | Lucide v1 dropped brand icons; GitHub/LinkedIn are self-hosted inline SVGs. |

## Architecture

```
app/                    # routes: home (single-page sections), case studies, blog, SEO routes
  projects/[slug]/      # deep case-study pages (SSG)
  blog/[slug]/          # MDX posts (SSG)
  feed.xml/ sitemap.ts robots.ts opengraph-image.tsx not-found.tsx
components/
  layout/               # Navbar (scroll-spy, mobile menu), Footer, ScrollProgress, Section shell
  sections/             # Hero, About, Philosophy, Skills, Projects, CP dashboard, Blog, Contact
  space/                # Starfield canvas, OrbitRing, ArchitectureDiagram (animated SVG)
  command/              # cmdk palette + provider (global ⌘K / mobile entry point)
  ui/                   # GlowCard, StatCounter, Magnetic, Button, Badge, RatingGraph
  motion/               # Reveal / Stagger wrappers (all respect prefers-reduced-motion)
hooks/                  # useActiveSection (scroll spy)
lib/
  services/cp-stats.ts  # service layer: live Codeforces API (ISR 6h) + static fallbacks
  content/              # typed content: profile, projects (case studies), skills, philosophy
  blog.ts               # MDX loader (gray-matter, reading time, tags)
types/                  # shared interfaces
content/blog/           # posts as .mdx
public/resume.pdf       # ← replace with the PDF compiled from resume.tex
```

**Separation of concerns:** presentation (components) never touches data access. All copy lives in `lib/content/`; all external data goes through the `cp-stats` service interface, so swapping a static provider for a live API touches one file.

## Live data with graceful degradation

The Codeforces card and rating graph hit the **official Codeforces API** at build/revalidate time (`next: { revalidate: 21600 }` — every 6 hours). If the API is down, typed static fallbacks (verified resume numbers) render instead — the UI never breaks and never shows a loading spinner. CodeChef/LeetCode have no official APIs and use verified static numbers behind the same interface.

## Performance

- **Everything prerenders**: all routes are Static/SSG (`npm run build` output), ISR only re-fetches CF stats.
- **Minimal client JS**: sections are server components; client code is limited to the starfield, palette, nav, and motion wrappers. The palette itself is `dynamic()`-imported on first open.
- **Canvas discipline**: starfield caps `devicePixelRatio` at 2, reduces star/node density ~55% on mobile, and pauses via `IntersectionObserver` when offscreen.
- **Fonts** via `next/font` (self-hosted, `display: swap`) — zero layout shift.
- No images to optimize — diagrams are inline SVG rendered from typed node/edge data.

## Accessibility

- Semantic landmarks, one `h1` per page, labelled nav/diagrams (`role="img"` + descriptive `aria-label`).
- Full keyboard support: palette (cmdk), visible `:focus-visible` rings, skip-friendly link order.
- **`prefers-reduced-motion`**: starfield renders a single static frame; reveals become plain fades; counters, orbits, and packet animations disable.
- Contrast-checked token palette on `#05050a`.

## Design philosophy

Premium, minimal, technical, calm. One accent color (electric blue, swappable to cyan/violet from the palette — try `⌘K → theme`), restrained glow, generous whitespace, mono type for data. The space metaphor stays abstract: network nodes, orbital paths, packet pulses — no rockets.

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build (all static)
npm run lint
```

## Deploy (Vercel)

Push to GitHub → import in Vercel → framework auto-detected. No env vars required. ISR revalidation for Codeforces works out of the box. Update `SITE_URL`/`metadataBase` (in `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/feed.xml/route.ts`) if the domain differs from `shoryagupta.dev`.

**Before going live:** replace `public/resume.pdf` (placeholder) with the PDF compiled from `resume.tex`.
