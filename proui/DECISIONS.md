# Decisions

The running record of the ProUI workflow for HMOTA. A later session continues from here with
`ProUI continue`. The full brief is in `docs/PROMPT.md`.

## Status

- Current stage: first build done (design system, home, 3D hero, 3D map, projects, project pages,
  studio, contact, legal, CI).
- Waiting for the user: real content (studio name, contact details, projects, photos, team), the
  English version, and the Copernicus DEM bake for real relief.

## Intake

- Kind of site: portfolio and enquiry site for an architectural studio, Czech Republic.
- Feel: Kononenko Architectural Bureau (kononenkogroup.com) is the lead reference. Monochrome,
  Swiss, a brutalist edge, calm.
- Effect level: Immersive 3D.
- Light, dark or colourful: light (paper), turning to ink for the studio part and the footer.
- Main action: Začít projekt (start a project), the enquiry form.
- Technology: Next.js 16 + React Three Fiber + GSAP + Lenis (chosen by the agent, see below).
- Content available: none yet. Every project is a marked placeholder.
- Languages and size: Czech, several pages. English is phase two.
- Answered by: the user (colours, type mood, 3D hero, stack, map, reference site) and the agent
  (the rest).

## Effects

- Kit: Studio (GSAP motion recipes) plus two custom R3F scenes, one per page.
- Budget: Home 7 (scroll-built model, line-mask reveals, scattered grid clip reveal, ink flip,
  radial hairlines, map teaser pin drop, magnetic CTA). Map page: the 3D map. Others: reveals only.
- No Aceternity, React Bits or 21st.dev components.

## Type and colour

- Display and UI: Hanken Grotesk Variable (self-hosted via @fontsource).
- Statements and long text: Source Serif 4 Variable with optical sizes.
- Mono: none (SL-25).
- Colour strategy: neutral + one signal. Paper #ffffff, paper-2 #f6f6f4, ink #0a0a0a, label #757575
  (4.6:1), grey-ink #5e5e5e (6.5:1), lime #c8ff2e used as a fill only (ink on lime 16.8:1).
- Why light: architecture photography and drawings read best on paper. The ink part gives the page a
  second register, as on the reference site.

## Outline

- Sitemap: Index, Projekty (grid / list / link to the map, URL filters), Mapa, project detail,
  Studio, Kontakt, 404, Ochrana soukromí, Impressum, sitemap.xml, robots.txt.
- Signature moment per page: Home = scroll-built model; Mapa = 3D relief map; project = clip reveal
  and locator; others = mega type.

## Stack (and why)

- Next.js 16 App Router with static generation: every page is prerendered, fast and SEO-friendly on
  Vercel.
- React Three Fiber + drei: the two 3D scenes as components, lazy-loaded (`ssr: false`) behind SVG
  posters, so the LCP stays HTML.
- GSAP 3.15 (ScrollTrigger, SplitText, free since 2025) + Lenis: studio-grade scroll motion.
- d3-geo + a bake script: Natural Earth data turned into a 41 KB JSON at build time.
- zod: content is validated at build time. A project with bad dates or no coordinates fails the build.
- Vitest for the projection, relief and formatting helpers. ESLint (Next config), TypeScript strict.

## Open items

- Replace every `[bracket]` in `src/lib/site.ts` and the placeholder projects in
  `src/content/projects.ts`.
- Add real photography per project (AVIF/WebP, with photographer credit). Drawings stay as a second
  image type.
- Bake real elevation (Copernicus DEM GLO-30) into a heightmap and swap `reliefAt()`.
- English version (/en).
- Hero: replace the procedural massing with the featured project's glTF (Draco/Meshopt, KTX2).
- Clustering of pins once there are many projects in Prague or Brno.
