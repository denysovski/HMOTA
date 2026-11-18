# HMOTA

Website for an architectural studio working across the Czech Republic. *Hmota* is the Czech
architectural word for a building's mass: the solid volume before any detail.

The design follows the monochrome, type-led language of Kononenko Architectural Bureau, with one
electric lime signal. Two 3D moments carry the site:

- **The scroll-built model** (home page). As you scroll, a building is drawn as a lime site plan, rises
  as an ink section, fills in as white clay, takes on concrete and glass, and is lit by a sun moving
  from morning to evening.
- **The 3D map** (`/mapa`). A white clay relief model of Czechia with the 14 regions, rivers, cities
  and the studio's work as pins. Hovering or focusing a pin shows a card with the project name,
  architects, client, commission and completion dates with the duration, type, place and area.
  Clicking flies the camera to the site.

> Every project, name and contact detail in this repository is a **placeholder** (`placeholder: true`
> or `[brackets]`). The site shows a lime "Ukázková data" (sample data) badge until all of them are
> replaced.

## Stack

| Part | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, static generation), React 19, TypeScript strict |
| 3D | three.js, React Three Fiber, drei, loaded after first paint behind SVG posters |
| Motion | GSAP (ScrollTrigger, SplitText) and Lenis smooth scroll; everything respects reduced motion |
| Maps | d3-geo projection, Natural Earth data baked to `src/data/cz-geo.json` |
| Content | typed projects in `src/content/projects.ts`, validated with zod at build time |
| Type | Hanken Grotesk and Source Serif 4, self-hosted via @fontsource |
| Quality | ESLint, Vitest, GitHub Actions CI, Lighthouse CI, Dependabot |

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # lint, typecheck, tests and production build
```

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL`. To receive enquiries as JSON, set
`NEXT_PUBLIC_FORM_ENDPOINT` (for example Formspree or your own API). Without it, the form opens the
visitor's e-mail client with the message prefilled.

## Add a project

Add an entry to `src/content/projects.ts`:

```ts
{
  slug: "dum-v-sadech",
  name: "Dům v sadech",
  architects: [{ name: "Jana Nováková", role: "Vedoucí projektu" }],
  client: "Soukromý investor",
  type: "bydleni",            // bydleni | kultura | komerce | verejne | interier | krajina
  status: "realizace",        // realizace | vystavba | soutez
  municipality: "Litomyšl",
  region: "Pardubický",       // one of the 14 regions
  lat: 49.8706, lng: 16.3106, // WGS84
  commissioned: "2022-03",
  completed: "2024-06",       // or null while ongoing
  areaM2: 240,
  summary: "One or two sentences for the card and the project page.",
  text: ["Paragraphs for the project page."],
  massing: [{ x: 0, z: 0, w: 18, d: 9, h: 6 }], // simplified volumes in metres, used for drawings
  featured: false,
  placeholder: false,
}
```

The build fails if a project has invalid dates, a duplicate slug or coordinates outside Czechia. The
pin, the card, the list, the project page, the sitemap and the structured data all come from this one
entry.

## Structure

```
src/app/            pages (index, projekty, projekty/[slug], mapa, studio, kontakt, legal)
src/components/     header, footer, reveals, scatter grid, radial lines, contact form
  hero/             the scroll-built model (R3F)
  map/              3D map scene, explorer, card and flat SVG map
src/content/        project schema and data
src/lib/            projection, relief, formatting, studio details, motion setup
scripts/bake-geo.mjs  rebuilds src/data/cz-geo.json from Natural Earth
docs/PROMPT.md      the full design brief
proui/DECISIONS.md  decisions record for the ProUI workflow
```

## Data and credits

- Borders, regions, rivers and cities: [Natural Earth](https://www.naturalearthdata.com), public
  domain. Rebuild with `npm run bake:geo`.
- The relief on the 3D map is **stylised** (`src/lib/relief.ts` models the main ranges). To use
  measured elevation, bake Copernicus DEM GLO-30 into a heightmap and replace `reliefAt()`.
- Fonts: Hanken Grotesk and Source Serif 4 (SIL Open Font License).

## Before launch

- Replace every `[bracket]` in `src/lib/site.ts`, and every project with `placeholder: true`.
- Add real photographs (with photographer credit), the team, and real awards and publications.
- Have the privacy text reviewed, and add the architect's ČKA authorisation number to the Impressum.
- Set the production URL in `NEXT_PUBLIC_SITE_URL` and in `public/.well-known/security.txt`.
