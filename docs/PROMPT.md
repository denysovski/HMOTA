Use ProUI. ProUI workflow: project HMOTA, the website for [STUDIO NAME], an architectural studio in
[CITY], Czech Republic. The decisions below are already made, so skip the matching intake questions. Write
them to proui/DECISIONS.md. Stop at the workflow's checkpoints (direction, design system, outline, first screen).

## Project name and repository
- Codename: HMOTA. It's the Czech architectural word for a building's mass, the solid volume before any
  detail. Use it for the repository, README and internal naming. The public site carries the studio's
  real name.
- Everything goes in the GitHub repository `denysovski/hmota`. Follow workflow/GITHUB.md and
  templates/github/:
  - README covers what it is, the stack, how to run it, how to add a project, and data and licence credits.
  - CI (lint, typecheck, build), Lighthouse CI quality gates, Dependabot, PR template, .env.example,
    security.txt.
  - Automated deploy to Vercel with a preview per PR. Write the live URL in the README.
  - Commit proui/DECISIONS.md so `ProUI continue` works in a new session.

## Lead reference: Kononenko Architectural Bureau (kononenkogroup.com)
Follow its design language closely, but never copy its copy, images or code. What to take from it:
- A monochrome paper-and-ink page. The interface almost disappears and the architecture and type carry
  everything.
- A tiny stacked wordmark top left (three short lines). Tiny comma-separated navigation top right
  ("Index, Projekty, Mapa, Studio, Kontakt"), with the active item underlined. No header bar, background
  or pill.
- Two voices: an oversized neo-grotesk for headlines (two short lines, centred or full width, tight
  tracking), and a large text serif for statement paragraphs that reveal line by line through masks
  as they enter.
- Small label/value data columns: a grey label above or beside an ink value, like a drawing title block.
- Hairline tables (offices, awards, publications) with grey columns and a small arrow at the end.
- Hand-drawn sketches and line drawings as an image type, alongside the photography.
- Selected projects in an asymmetric, scattered grid: images of different sizes on a loose 12-column
  grid, with the name and area (m²) in small type under each one.
- The page turns from white to ink on scroll for the studio and people part, and stays dark down to a
  giant footer.
- One kinetic diagram moment: hairline curves radiating from a centred headline, drawn on scroll.
Secondary references, for details only: telhaclarke.com.au (loader, overlay menu, Work / Process /
Studio structure) and kaanarchitecten.com (restrained project list: title, city and country code,
full-width image). Do NOT take their numbered sections (01-04). Numbering stays banned (SL-17).

## Brief
- What: portfolio and enquiry site for an architecture studio working on [residential / cultural /
  commercial / interiors] projects across the Czech Republic.
- For: private clients, developers and public bodies deciding who to talk to about a building.
- Mode: Experience on Home, Projects and Map. Read on project pages and Studio. Persuade on Contact.
- One main action: "Start a project" (Začít projekt). It goes to an enquiry form on the Contact page. The
  secondary action is browsing the work and the map.
- Feel: Kononenko's quiet monochrome precision, a brutalist edge (raw data labels, hard crops, exposed
  grid), and one electric lime signal. Calm, slow, confident.
- Language: Czech first (cs). English (/en) is a second phase. Dates, m² and numbers are formatted per
  locale (LO).

## Style
SWISS MINIMAL + MEGA TYPE (from style/STYLES.md), monochrome, CALM, with the lime accent used like a
highlighter. Apply style/MY-STYLE.md wherever this prompt and the reference say nothing.

## Colour (neutral + signal strategy, CL-01; write the contrast table before building, CL-09)
--paper       #FFFFFF   page (60 %)
--paper-2     #F6F6F4   image frames, form fields, cards
--ink         #0A0A0A   text and the dark part of the page (18-20:1)
--label       #757575   small grey labels on paper (4.6:1)
--grey-ink    #5E5E5E   muted body text on paper (6.5:1)
--grey-dark   #9A9A9A   labels on ink (7.4:1)
--line        #E4E4E0   hairlines on paper; #262626 on ink
--lime        #C8FF2E   the signal: map pins, active filter, primary button fill, text highlight, the
                        footer wordmark on ink. Under 5 % of any view.
--on-lime     #0A0A0A   ink on lime (16:1)
Never put lime text on white (1.13:1). No gradients, glow or shadows, except the soft shadow under the map
hover card.

## Type: three faces (self-hosted from npm via @fontsource, WOFF2, swap, TY-19, TY-21)
- Display, for headlines, the wordmark and navigation: Instrument Sans Variable, the closest free match
  to PP Neue Montreal (Kononenko's headline face). Weight 400, tracking -0.04em, line-height 0.9-0.95.
- Serif, for statements and long text: Hedvig Letters Serif Variable (opsz 24), the same serif
  Kononenko uses. Statements at clamp(27px, 3.1vw, 58px), line-height 1.1.
- Small sans, for labels, data, numbers and UI text: Geist Variable with tabular figures.
- Both have full Czech diacritics. No mono font (SL-25). Buttons in normal weight.
- One MEGA TYPE moment per page.

## Stack (chosen for this project)
- Next.js 16 (App Router, static generation, TypeScript strict), React 19.
- Three.js + React Three Fiber + drei for the two 3D scenes, loaded with next/dynamic ssr:false (EF-04).
- GSAP + ScrollTrigger + SplitText (free since 2025) via @gsap/react, for scroll and text motion. Lenis
  for smooth scroll, driven by GSAP's ticker.
- d3-geo + topojson-client for the map projection and the Czech data. Data is pre-baked at build time by a
  script into small JSON files, so no runtime GIS.
- zod validates content at build time. Projects live in content/projects.ts (typed).
- One stylesheet with CSS custom properties for tokens. No Tailwind: the design is few, precise components.
- ESLint, Prettier, Vitest for the projection helper and the content schema. GitHub Actions CI and
  Lighthouse CI. Deploy to Vercel.

## Effects
Level: Immersive 3D. Kit: Studio (GSAP motion recipes), plus two custom R3F scenes on separate pages.
No Aceternity, React Bits or 21st.dev components (EF-21, EF-22). One canvas per page (EF-12).
Home budget (EF-20), 7 effects:
1. Signature, the scroll-built building (R3F hero, described below).
2. Line-mask reveal for the serif statements and the grotesk headlines (once, 900 ms, expo out).
3. Scattered project grid: images clip-reveal on entry (MO-17), with a slight image-only drift
   (never text, MO-27).
4. Ink flip: the page background crossfades from paper to ink as the studio section arrives.
5. Radial hairlines: thin curves drawn on scroll from a centred headline out to the names of the
   studio's disciplines (named, never numbered).
6. Map teaser: a static SVG of Czechia whose pins drop in once.
7. Magnetic button on "Začít projekt" only. Underline sweep on all links.
Lenis lerp around 0.1, no snapping, never lock the scroll (MO-24). Turned off for reduced motion.

## Home (Kononenko order, adapted)
- Hero: a full-viewport canvas with the scroll-built model. Wordmark top left, navigation top right, the
  studio name large bottom left in grotesk, and a stage caption bottom right ("Půdorys" plan, "Řez"
  section, "Hmota" massing, "Materiál" material, "Světlo" light).
- Statement headline: a two-line grotesk MEGA headline, then two small columns of services under it.
- Title block: label/value columns (founded, founder, services) beside a large serif statement.
- Recognition: a hairline table of real awards and publications (placeholder rows are marked).
- Process: serif statements with line drawings ("Od skici ke strategii" from sketch to strategy,
  "Přesnost v provedení" precision in execution).
- Selected projects: the scattered grid with name and m², plus "Všechny projekty" (all projects).
- Where we build: the map teaser with the number of buildings and regions, and "Otevřít mapu" (open the map).
- Ink flip, then the radial hairline headline, then studio facts (real figures only), then the CTA.
- A giant footer on ink: the lime wordmark at full width, navigation, contact, addresses, hours, legal.

## Signature 1: the scroll-built model (Home hero, pinned for about 300 vh)
A real project of the studio as glTF [MODEL FILE]. Until then, a procedural placeholder massing built in
code and marked as a placeholder. ScrollTrigger scrubs it through these stages:
- Plan: lime 1 px plan lines draw on a white ground plane, seen from the top.
- Section: the camera tilts to an axonometric view and the walls extrude as ink hairline edges.
- Massing (hmota): the volumes fill in as white clay with a soft contact shadow.
- Material: concrete and glass tones fade in.
- Light: the sun moves along an arc and the shadows sweep across. A small lime sun marker and the time of
  day show in a caption.
The poster image is the LCP element. dpr [1, 1.75]. Pause off screen. On reduced motion, show a still of
the final stage.

## Signature 2: the 3D map of the Czech Republic (/mapa; also linked from Projects)
A white clay relief model of Czechia on a table, with the studio's work pinned on it.
- Base: the Czech border extruded into a slab with a raw grey cut edge (the plinth). The 14 regions
  as faint hairlines, the main rivers (Vltava, Labe, Morava, Odra, Dyje, Sázava) as thin grey lines,
  and the cities as small HTML labels.
- Relief: displace the top of the slab with real elevation from Copernicus DEM GLO-30 (run the bake script).
  Until that's baked, use a stylised relief of the main ranges (Krkonoše, Šumava, Krušné hory,
  Jeseníky, Beskydy, Vysočina), clearly documented as stylised.
- Projection: d3-geo Mercator fitted to Czechia, with a shared project() helper unit-tested with Prague,
  Brno and Ostrava.
- Pins: an ink stem with a square lime head. Built is solid lime, in progress is a lime outline,
  competition is an ink outline. The legend is in HTML.
- Entrance: the relief rises, then the pins drop in with a 30 ms stagger capped at 600 ms. It plays once,
  with no looping pulse (MO-28).
- Hover or focus card: rises from the pin at 0.95 scale over 180 ms. It shows a drawing or photo, the
  name, architect(s), client, commissioned / completed dates with the duration in months, type,
  municipality and region, area m², a status chip and "Detail projektu" (project detail). Other pins dim to 40 %.
- Click: the camera flies along an arc to the site (1.2 s ease-in-out), the card docks as a side panel,
  and "Detail projektu" opens the project page.
- Controls: orbit within clamped angles, zoom within limits, "Reset" (výchozí pohled, the default view).
  The page scroll is never captured.
- Filters (type, status, region) are shared with Projects and kept in the URL. Filtered-out pins sink.
- Accessibility: next to the map is an HTML list of projects grouped by region, and focusing an item
  highlights its pin. The canvas is aria-hidden. Touch uses a bottom sheet. Reduced motion means no
  flights. Without WebGL, an SVG map is the fallback.

## Content model (content/projects.ts, validated with zod)
name, slug, architects[] (name, role), client, type (bydlení residential | kultura cultural |
komerce commercial | veřejné public | interiér interior | krajina landscape), status (realizace built |
ve výstavbě under construction | soutěž competition), municipality, region (one of the 14 kraje), lat, lng
(WGS84), commissioned (YYYY-MM), completed (YYYY-MM | null), areaM2, summary, placeholder (bool).
A project with no coordinates fails the build. Ship with clearly marked placeholder entries until real
projects arrive. Never invent real clients, architects or awards.

## Sitemap
Index (Home), Projekty (scattered grid / list, filters, map link), Mapa, Projekt detail
(/projekty/[slug]: lead visual, facts table, locator map, narrative, next project), Studio (approach,
people, facts), Kontakt (form, details, map link), 404, Ochrana soukromí (privacy), Impressum (imprint).

## Quality bar
- Breakpoints 360, 390, 768, 1024, 1440 and 1920 px. Keyboard end to end, visible focus, 200 % zoom (AX).
- Core Web Vitals green on a mid-range phone: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 (PF-03).
  Animate only transform and opacity (MO-23).
- SEO: titles, descriptions, one H1 per page, Schema.org Organization + CreativeWork with Place,
  sitemap.xml, robots.txt, OG image.
- Before handoff, run `node scripts/proui-scan.mjs ./src` and go through the final checklist in SKILL.md.
