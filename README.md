<div align="center">

# HMOTA — Architektonický ateliér

**A building drawn, raised and lit by your scroll. A whole country as a clay site model.**

A website for an architectural studio working across the Czech Republic: a scroll-built 3D hero, a 3D relief map of Czechia with every project pinned on it, and a quiet, type-led design in paper, ink and one electric lime.

[**Open the live site**](https://denysovski.github.io/HMOTA/) &nbsp;·&nbsp; [3D map](https://denysovski.github.io/HMOTA/mapa/) &nbsp;·&nbsp; [Projects](https://denysovski.github.io/HMOTA/projekty/) &nbsp;·&nbsp; [Project page](https://denysovski.github.io/HMOTA/projekty/konverze-haly-vitkovice/) &nbsp;·&nbsp; [Contact](https://denysovski.github.io/HMOTA/kontakt/)

![Next.js](https://img.shields.io/badge/Next.js%2016-000000?style=flat-square&labelColor=000000&logo=nextdotjs&logoColor=white)
![React Three Fiber](https://img.shields.io/badge/React%20Three%20Fiber-000000?style=flat-square&labelColor=000000&logo=threedotjs&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP%20%2B%20ScrollTrigger-000000?style=flat-square&labelColor=000000&logo=greensock&logoColor=white)
![Lenis](https://img.shields.io/badge/Lenis-smooth%20scroll-000000?style=flat-square&labelColor=000000)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-000000?style=flat-square&labelColor=000000&logo=typescript&logoColor=white)
![Made with XSlop](https://img.shields.io/badge/made%20with-XSlop-c8ff2e?style=flat-square&labelColor=000000)

<br>

![Hero — light stage](docs/screens/05-hero-light.jpg)

</div>

---

## At a glance

| | |
|---|---|
| **The name** | *Hmota* is the Czech architectural word for a building's mass: the solid volume before any detail. The hero literally builds one. |
| **Pages** | Index, Projekty (projects), Mapa (map), project pages, Studio, Kontakt (contact), Ochrana soukromí (privacy), Impressum (imprint) and 404. Everything is prerendered as static HTML. |
| **3D hero** | One building in five scroll stages: *Půdorys* (plan), *Řez* (section), *Hmota* (massing), *Materiál* (material) and *Světlo* (light), with a sun moving from 7:00 to 19:00. |
| **3D map** | A white clay relief of Czechia with the 14 regions, rivers, cities and contour lines, cut out as a plinth. Every project is a pin with a hover card: architects, client, commission dates, duration, type, place and area. |
| **Projects** | Scattered grid or list, filters by type and status kept in the URL, and a project page with a facts table, a locator map and a line drawing. |
| **Motion** | Line-by-line mask reveals, clip-path image reveals, a white-to-ink flip, hairlines drawn from a centred headline, a pin drop on the map teaser and a magnetic call to action. Everything respects *reduced motion*. |
| **Design** | Monochrome paper and ink after Kononenko Architectural Bureau, Hanken Grotesk for headlines and Source Serif 4 for statements, and electric lime **#C8FF2E** used only as a fill. |
| **SEO** | Meta and Open Graph, JSON-LD (ArchitectureFirm, CreativeWork with Place and GeoCoordinates), sitemap, robots and a 404 page. |

---

## Home

The homepage reads like a drawing set: it begins with the plan, ends with the light, then tells who the studio is and where it builds.

| | |
|---|---|
| ![Plan](docs/screens/01-hero-plan.jpg) **Půdorys.** The site plan draws itself in lime on a white ground, with the surrounding blocks as faint footprints. | ![Section](docs/screens/02-hero-section.jpg) **Řez.** The camera tilts into an axonometric view while the walls rise as ink hairlines. |
| ![Massing](docs/screens/03-hero-massing.jpg) **Hmota.** The volumes fill in as white clay and cast their first shadow. | ![Material](docs/screens/04-hero-material.jpg) **Materiál.** Concrete and glass tones fade in, and the context turns into ghost volumes. |
| ![Statement](docs/screens/06-statement.jpg) **Statement.** A two-line grotesk headline that reveals line by line, with the services underneath. | ![Title block](docs/screens/07-titleblock.jpg) **Title block.** Label and value columns, like a drawing's title block, beside a large serif statement and a hairline awards table. |
| ![Process](docs/screens/08-process.jpg) **From sketch to strategy.** Line drawings of the massing between serif statements about how the studio works. | ![Selected work](docs/screens/09-selected-work.jpg) **Vybrané projekty.** Selected work in an asymmetric, scattered grid. Each image is revealed with a clip-path as it enters. |
| ![Scattered grid](docs/screens/10-scatter.jpg) **Scattered grid.** Name, place, area, type and year under each project, set in small type. | ![Map teaser](docs/screens/11-map-teaser.jpg) **Kde stavíme.** A flat map of Czechia whose pins drop in once, with a link to the 3D map. |
| ![Radial](docs/screens/12-radial.jpg) **Ink flip and radial hairlines.** The page turns from white to ink, and hairlines draw out to the studio's disciplines. | ![Call to action](docs/screens/14-cta.jpg) **Začít projekt.** Studio facts and a magnetic lime button. |

![Footer](docs/screens/15-footer.jpg)
**Footer.** Navigation, contact, address and hours above a full-width lime wordmark on ink.

---

## 3D map of Czechia

The studio's work placed on a model of the whole country, like an architectural site model on a table.

| | |
|---|---|
| ![Map](docs/screens/20-map.jpg) **The model.** The relief rises from flat on load, then the pins drop in one after another. Regions are dashed, rivers grey and cities in small caps. | ![Hover card](docs/screens/21-map-card.jpg) **Hover card.** Hover or focus a pin, or its row in the list: drawing, name, architects, client, commission and completion dates, duration in months, type, place and area. |
| ![Fly to](docs/screens/22-map-flyto.jpg) **Fly to.** A click flies the camera along an arc to the site and docks the card. A second click opens the project. | ![Filter](docs/screens/23-map-filter.jpg) **Filters.** Type and status filters stay in the URL. Pins that don't match sink into the terrain. |

- **Pins** have an ink stem and a square head: solid lime for *built*, a lime outline for *in progress*, and an ink outline for *competition*.
- **Controls** let you orbit within clamped angles, zoom with the buttons or the wheel, and go back with *Výchozí pohled* (default view). The page scroll is never captured.
- **Accessibility:** a project list grouped by region sits beside the map and drives the same cards from the keyboard. Touch screens get a bottom sheet, and browsers without WebGL get an SVG map with the same pins.
- **Data:** borders, regions, rivers and cities come from Natural Earth, baked into a 41 KB JSON. The relief models the main ranges (Krkonoše, Šumava, Krušné hory, Jeseníky, Beskydy, Vysočina) and is labelled as stylised.

---

## Projects & project page

| | |
|---|---|
| ![Projects](docs/screens/30-projects.jpg) **Projekty.** Mega title and filter chips for type and status. Active chips turn lime. | ![Grid](docs/screens/31-projects-grid.jpg) **Grid.** The same scattered grid as on the homepage, for all projects. |
| ![List](docs/screens/32-projects-list.jpg) **List.** One row per project: place, type, status, area and year. The other rows dim on hover. | ![Project](docs/screens/33-project.jpg) **Project page.** Name, breadcrumb and a full-width axonometric drawing of the massing. |

![Project facts](docs/screens/34-project-facts.jpg)
**Facts.** Status, architects, client, place, commission and completion dates, duration and area, with a locator map that links to the same pin on the 3D map.

---

## Studio, contact & 404

| | |
|---|---|
| ![Studio](docs/screens/40-studio.jpg) **Studio.** Title block, the studio in one statement, and the approach as a hairline table. | ![Contact](docs/screens/41-contact.jpg) **Začít projekt.** An enquiry form (type, place, budget, timeline and message) with clear errors. It sends to any form endpoint, or falls back to a prefilled e-mail. |

![404](docs/screens/42-404.jpg)
**404.** *Tady zatím nic nestojí* (nothing stands here yet), with links back to the site.

---

## Mobile

| | | |
|:---:|:---:|:---:|
| <img src="docs/screens/m-hero.jpg" width="230" alt="Mobile hero"><br><sub>Hero, plan</sub> | <img src="docs/screens/m-hero-massing.jpg" width="230" alt="Mobile hero massing"><br><sub>Hero, massing</sub> | <img src="docs/screens/m-work.jpg" width="230" alt="Mobile projects"><br><sub>Selected work</sub> |
| <img src="docs/screens/m-map.jpg" width="230" alt="Mobile map"><br><sub>3D map</sub> | <img src="docs/screens/m-map-card.jpg" width="230" alt="Mobile map card"><br><sub>Project card as a bottom sheet</sub> | <img src="docs/screens/m-contact.jpg" width="230" alt="Mobile contact"><br><sub>Contact form</sub> |

---

## How it was made

The site was built with **XSlop**, starting from a researched design brief ([`docs/PROMPT.md`](docs/PROMPT.md)) and the ProUI workflow ([`proui/DECISIONS.md`](proui/DECISIONS.md)).

- **Reference first.** The design language follows Kononenko Architectural Bureau: a monochrome page, a tiny stacked wordmark, comma-separated navigation, giant grotesk headlines, serif statements and a scattered project grid. It takes no copy, images or code from that site, and numbered section labels are banned.
- **One source of truth.** Every project lives once in `src/content/projects.ts` and is validated with zod at build time. The pin, the hover card, the list, the grid, the project page, the sitemap and the JSON-LD all come from that one entry.
- **Drawings instead of fake photos.** Until real photography arrives, each project is shown as an axonometric line drawing generated from its simplified massing. The same massing builds the 3D hero.
- **Real geography.** The map uses a d3-geo Mercator projection fitted to Czechia, tested with Prague, Brno and Ostrava, and Natural Earth data baked by `scripts/bake-geo.mjs`.
- **3D that stays fast.** Both scenes load only after first paint, behind SVG posters, render only while on screen, cap the pixel ratio and step back to a flat map or a still when WebGL or motion is not welcome.
- **Checked in a real browser.** Every page was screenshotted at 1440 px and 390 px in Chrome, with no console errors.

---

## Under the hood

- **Next.js 16** App Router with React 19 and strict TypeScript. Every page is prerendered, and GitHub Pages gets a static export.
- **three.js + React Three Fiber + drei** for the scroll-built model and the relief map, loaded lazily.
- **GSAP** (ScrollTrigger, SplitText) for every scroll animation, and **Lenis** for smooth scrolling.
- **d3-geo** for the projection and **zod** for the content schema.
- **Vitest** for the projection, relief and date helpers. **ESLint**, CI and Lighthouse CI run on every push.
- Fonts: Hanken Grotesk and Source Serif 4, self-hosted.

```
src/app/                 pages: index, projekty, projekty/[slug], mapa, studio, kontakt, legal, 404
src/components/hero/     the scroll-built model (R3F)
src/components/map/      3D map scene, explorer, card, flat SVG map
src/components/          header, footer, reveals, scattered grid, radial lines, contact form
src/content/             project schema and data
src/lib/                 projection, relief, formatting, studio details, motion setup
src/data/cz-geo.json     baked Natural Earth data
scripts/bake-geo.mjs     rebuilds the geodata
docs/                    design brief and README screenshots
```

## Run it locally

```bash
npm install
npm run dev            # dev server on http://localhost:3000
npm run check          # lint, typecheck, tests and production build
npm run build:pages    # static export for GitHub Pages into out/
```

Pushing to `main` builds the static export and deploys it to GitHub Pages automatically.

## Add a project

Add one entry to `src/content/projects.ts`. The build fails on invalid dates, a duplicate slug or coordinates outside Czechia.

```ts
{
  slug: "dum-v-sadech",
  name: "Dům v sadech",
  architects: [{ name: "Jana Nováková", role: "Vedoucí projektu" }],
  client: "Soukromý investor",
  type: "bydleni",              // bydleni | kultura | komerce | verejne | interier | krajina
  status: "realizace",          // realizace | vystavba | soutez
  municipality: "Litomyšl",
  region: "Pardubický",
  lat: 49.8706, lng: 16.3106,   // WGS84
  commissioned: "2022-03",
  completed: "2024-06",         // null while ongoing
  areaM2: 240,
  summary: "One or two sentences for the card and the project page.",
  massing: [{ x: 0, z: 0, w: 18, d: 9, h: 6 }],   // simplified volumes in metres
  placeholder: false,
}
```

## Before launch

- Replace every `[bracket]` in `src/lib/site.ts` and every project marked `placeholder: true`.
- Add real photography with photographer credits, the team, and real awards and publications.
- For measured relief, bake Copernicus DEM GLO-30 into a heightmap and replace `reliefAt()` in `src/lib/relief.ts`.

---

<div align="center"><sub>Demo site. Projects, architects, clients and studio details are sample data, marked as placeholders on the site. Map data © Natural Earth (public domain). Made with XSlop.</sub></div>
