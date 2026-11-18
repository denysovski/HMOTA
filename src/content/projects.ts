import { ProjectSchema, type Project, type ProjectInput } from "./schema";

/**
 * PLACEHOLDER CONTENT.
 * Every entry below is a stand-in so the site, the map and the hover cards can be built and
 * reviewed. Names describe a building type and place; architects and clients are left as
 * [brackets]. Replace each entry with a real project and set `placeholder: false`.
 * Never publish invented projects, clients, architects or awards as real.
 */
const ARCHITECTS = [
  { name: "[Jméno architekta]", role: "Vedoucí projektu" },
  { name: "[Jméno architektky]", role: "Architektka" },
];

const raw: ProjectInput[] = [
  {
    slug: "kancelarsky-dum-holesovice",
    name: "Kancelářský dům Holešovice",
    architects: ARCHITECTS,
    client: "[Klient]",
    type: "komerce",
    status: "realizace",
    municipality: "Praha 7",
    region: "Praha",
    lat: 50.1035,
    lng: 14.4465,
    commissioned: "2019-03",
    completed: "2022-09",
    areaM2: 8400,
    summary:
      "Kancelářská budova v bývalém přístavním areálu. Betonový skelet, hluboké lodžie a parter otevřený nábřeží.",
    massing: [
      { x: 0, z: 0, w: 40, d: 18, h: 24 },
      { x: 4, z: 18, w: 22, d: 12, h: 12, glass: true },
    ],
    featured: true,
    placeholder: true,
  },
  {
    slug: "bytovy-dum-smichov",
    name: "Bytový dům Smíchov",
    architects: ARCHITECTS,
    client: "[Klient]",
    type: "bydleni",
    status: "vystavba",
    municipality: "Praha 5",
    region: "Praha",
    lat: 50.0712,
    lng: 14.4035,
    commissioned: "2023-01",
    completed: null,
    areaM2: 6200,
    summary:
      "Nárožní bytový dům, který dotváří blokovou zástavbu. Kamenný sokl, ustupující podlaží a společná střešní zahrada.",
    massing: [
      { x: 0, z: 0, w: 30, d: 14, h: 21 },
      { x: 0, z: 14, w: 14, d: 16, h: 21 },
      { x: 2, z: 2, w: 24, d: 10, h: 4, y: 21, glass: true },
    ],
    featured: true,
    placeholder: true,
  },
  {
    slug: "knihovna-zabrdovice",
    name: "Knihovna Zábrdovice",
    architects: ARCHITECTS,
    client: "[Klient]",
    type: "kultura",
    status: "realizace",
    municipality: "Brno",
    region: "Jihomoravský",
    lat: 49.1975,
    lng: 16.6295,
    commissioned: "2018-05",
    completed: "2021-11",
    areaM2: 3100,
    summary:
      "Čtvrťová knihovna jako krytá ulice. Studovny v horních patrech, dole čítárna propojená s náměstím.",
    massing: [
      { x: 0, z: 0, w: 34, d: 20, h: 9, glass: true },
      { x: 3, z: 3, w: 28, d: 14, h: 8, y: 9 },
    ],
    featured: true,
    placeholder: true,
  },
  {
    slug: "konverze-haly-vitkovice",
    name: "Konverze haly Vítkovice",
    architects: ARCHITECTS,
    client: "[Klient]",
    type: "kultura",
    status: "realizace",
    municipality: "Ostrava",
    region: "Moravskoslezský",
    lat: 49.8165,
    lng: 18.2665,
    commissioned: "2017-02",
    completed: "2020-06",
    areaM2: 5600,
    summary:
      "Přestavba průmyslové haly na multifunkční sál. Původní ocelová konstrukce zůstává přiznaná, nové vestavby jsou z betonu.",
    massing: [
      { x: 0, z: 0, w: 60, d: 22, h: 18 },
      { x: 60, z: 6, w: 8, d: 8, h: 40 },
    ],
    featured: true,
    placeholder: true,
  },
  {
    slug: "horska-chata-pec",
    name: "Horská chata Pec",
    architects: ARCHITECTS,
    client: "[Klient]",
    type: "bydleni",
    status: "realizace",
    municipality: "Pec pod Sněžkou",
    region: "Královéhradecký",
    lat: 50.692,
    lng: 15.733,
    commissioned: "2020-04",
    completed: "2022-12",
    areaM2: 640,
    summary:
      "Chata zapuštěná do svahu. Kamenná podnož, dřevěné patro a jedno velké okno směrem ke Sněžce.",
    massing: [
      { x: 0, z: 0, w: 18, d: 10, h: 4 },
      { x: 2, z: 1, w: 14, d: 8, h: 5, y: 4 },
    ],
    featured: true,
    placeholder: true,
  },
  {
    slug: "navstevnicke-centrum-kvilda",
    name: "Návštěvnické centrum Kvilda",
    architects: ARCHITECTS,
    client: "[Klient]",
    type: "verejne",
    status: "soutez",
    municipality: "Kvilda",
    region: "Jihočeský",
    lat: 49.0195,
    lng: 13.5795,
    commissioned: "2024-02",
    completed: "2024-06",
    areaM2: 1200,
    summary:
      "Soutěžní návrh. Dlouhý nízký dům na okraji rašelinišť, krytý průchod vede návštěvníky přímo na stezku.",
    massing: [
      { x: 0, z: 0, w: 48, d: 9, h: 5 },
      { x: 30, z: 9, w: 9, d: 12, h: 5, glass: true },
    ],
    placeholder: true,
  },
  {
    slug: "dum-na-jestedske",
    name: "Dům na Ještědské",
    architects: ARCHITECTS,
    client: "[Klient]",
    type: "bydleni",
    status: "realizace",
    municipality: "Liberec",
    region: "Liberecký",
    lat: 50.7505,
    lng: 15.031,
    commissioned: "2019-09",
    completed: "2021-08",
    areaM2: 410,
    summary:
      "Rodinný dům jako dvojice posunutých hranolů. Spodní je z pohledového betonu, horní obložený cementovláknitými deskami.",
    massing: [
      { x: 0, z: 0, w: 16, d: 9, h: 3.4 },
      { x: 4, z: -2, w: 14, d: 8, h: 3.4, y: 3.4 },
    ],
    placeholder: true,
  },
  {
    slug: "galerie-ve-dvore-olomouc",
    name: "Galerie ve dvoře",
    architects: ARCHITECTS,
    client: "[Klient]",
    type: "kultura",
    status: "vystavba",
    municipality: "Olomouc",
    region: "Olomoucký",
    lat: 49.5945,
    lng: 17.2515,
    commissioned: "2022-06",
    completed: null,
    areaM2: 1450,
    summary:
      "Výstavní sál vložený do dvora historického domu. Světlo přichází shora přes pilový světlík.",
    massing: [
      { x: 0, z: 0, w: 24, d: 16, h: 8 },
      { x: 0, z: 0, w: 24, d: 4, h: 3, y: 8, glass: true },
    ],
    placeholder: true,
  },
  {
    slug: "tovarni-byty-zlin",
    name: "Tovární byty Zlín",
    architects: ARCHITECTS,
    client: "[Klient]",
    type: "bydleni",
    status: "realizace",
    municipality: "Zlín",
    region: "Zlínský",
    lat: 49.2215,
    lng: 17.6575,
    commissioned: "2018-01",
    completed: "2021-04",
    areaM2: 7800,
    summary:
      "Obnova funkcionalistické tovární budovy na byty. Raster 6,15 × 6,15 metru zůstává čitelný v každém bytě.",
    massing: [{ x: 0, z: 0, w: 80, d: 20, h: 22 }],
    placeholder: true,
  },
  {
    slug: "skolni-kampus-budejovice",
    name: "Školní kampus Budějovice",
    architects: ARCHITECTS,
    client: "[Klient]",
    type: "verejne",
    status: "soutez",
    municipality: "České Budějovice",
    region: "Jihočeský",
    lat: 48.9885,
    lng: 14.4635,
    commissioned: "2023-09",
    completed: "2024-01",
    areaM2: 9300,
    summary:
      "Soutěžní návrh kampusu tří škol kolem společného dvora. Tělocvičny jsou zapuštěné, aby dvůr zůstal otevřený.",
    massing: [
      { x: 0, z: 0, w: 46, d: 14, h: 12 },
      { x: 0, z: 14, w: 14, d: 30, h: 12 },
      { x: 32, z: 26, w: 14, d: 18, h: 9, glass: true },
    ],
    placeholder: true,
  },
  {
    slug: "interier-pivovarske-haly",
    name: "Interiér pivovarské haly",
    architects: ARCHITECTS,
    client: "[Klient]",
    type: "interier",
    status: "realizace",
    municipality: "Plzeň",
    region: "Plzeňský",
    lat: 49.7475,
    lng: 13.3935,
    commissioned: "2021-02",
    completed: "2022-05",
    areaM2: 820,
    summary:
      "Restaurace a sál v klenuté hale. Nový nábytek a světla stojí volně, aby se historické zdivo ničeho nedotýkalo.",
    massing: [{ x: 0, z: 0, w: 36, d: 14, h: 10 }],
    placeholder: true,
  },
  {
    slug: "krajina-u-rybnika-telc",
    name: "Krajina u rybníka",
    architects: ARCHITECTS,
    client: "[Klient]",
    type: "krajina",
    status: "realizace",
    municipality: "Telč",
    region: "Vysočina",
    lat: 49.1825,
    lng: 15.4465,
    commissioned: "2020-03",
    completed: "2022-10",
    areaM2: 12000,
    summary:
      "Úprava břehů a mlýnské strouhy. Dřevěná lávka, mola a jeden malý přístřešek pro rybáře.",
    massing: [
      { x: 0, z: 0, w: 60, d: 3, h: 0.6 },
      { x: 24, z: 3, w: 6, d: 4, h: 3 },
    ],
    placeholder: true,
  },
  {
    slug: "kolonada-karlovy-vary",
    name: "Nová kolonáda",
    architects: ARCHITECTS,
    client: "[Klient]",
    type: "verejne",
    status: "soutez",
    municipality: "Karlovy Vary",
    region: "Karlovarský",
    lat: 50.2245,
    lng: 12.8805,
    commissioned: "2024-05",
    completed: "2024-09",
    areaM2: 2100,
    summary:
      "Soutěžní návrh lehké kolonády nad Teplou. Tenká betonová střecha na řadě štíhlých sloupů.",
    massing: [
      { x: 0, z: 0, w: 70, d: 10, h: 0.5, y: 6 },
      { x: 0, z: 0, w: 70, d: 10, h: 6, glass: true },
    ],
    placeholder: true,
  },
  {
    slug: "atelierovy-dum-hradec",
    name: "Ateliérový dům Hradec",
    architects: ARCHITECTS,
    client: "[Klient]",
    type: "bydleni",
    status: "realizace",
    municipality: "Hradec Králové",
    region: "Královéhradecký",
    lat: 50.2095,
    lng: 15.8325,
    commissioned: "2021-06",
    completed: "2023-03",
    areaM2: 380,
    summary:
      "Dům a ateliér pod jednou pultovou střechou. Severní světlo do ateliéru, jižní zahrada pro bydlení.",
    massing: [
      { x: 0, z: 0, w: 14, d: 10, h: 7 },
      { x: 14, z: 2, w: 6, d: 8, h: 4, glass: true },
    ],
    placeholder: true,
  },
  {
    slug: "vinarstvi-na-svahu-mikulov",
    name: "Vinařství na svahu",
    architects: ARCHITECTS,
    client: "[Klient]",
    type: "komerce",
    status: "realizace",
    municipality: "Mikulov",
    region: "Jihomoravský",
    lat: 48.8125,
    lng: 16.6195,
    commissioned: "2019-10",
    completed: "2022-08",
    areaM2: 1900,
    summary:
      "Výrobna a degustace zasunuté do vinice. Ze silnice je vidět jen dlouhá kamenná zeď a střecha porostlá trávou.",
    massing: [
      { x: 0, z: 0, w: 52, d: 16, h: 6 },
      { x: 10, z: 16, w: 20, d: 6, h: 4, glass: true },
    ],
    placeholder: true,
  },
  {
    slug: "lazensky-pavilon-jesenik",
    name: "Lázeňský pavilon",
    architects: ARCHITECTS,
    client: "[Klient]",
    type: "verejne",
    status: "vystavba",
    municipality: "Jeseník",
    region: "Olomoucký",
    lat: 50.2335,
    lng: 17.1995,
    commissioned: "2023-04",
    completed: null,
    areaM2: 2600,
    summary:
      "Pavilon s bazény na okraji lázeňského lesa. Dřevěná konstrukce, velká prosklená stěna směrem do údolí.",
    massing: [
      { x: 0, z: 0, w: 38, d: 18, h: 7, glass: true },
      { x: 0, z: 18, w: 38, d: 8, h: 10 },
    ],
    placeholder: true,
  },
];

export const projects: Project[] = raw.map((p) => {
  const r = ProjectSchema.safeParse(p);
  if (!r.success) {
    throw new Error(`Invalid project "${p.slug}": ${r.error.message}`);
  }
  return r.data;
});

const slugs = new Set<string>();
for (const p of projects) {
  if (slugs.has(p.slug)) throw new Error(`Duplicate project slug "${p.slug}"`);
  slugs.add(p.slug);
}

export const featured = projects.filter((p) => p.featured);
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
export const hasPlaceholders = projects.some((p) => p.placeholder);
