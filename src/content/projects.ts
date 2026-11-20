import { ProjectSchema, type Project, type ProjectInput } from "./schema";

/**
 * DEMO CONTENT. The projects, architects and clients below are invented for this demo site
 * (the footer says so on every page). Replace them with real projects for a real studio.
 */
const JH = { name: "Jan Husták", role: "Hlavní architekt" };
const KV = { name: "Klára Veselá", role: "Vedoucí projektu" };
const TM = { name: "Tereza Mlynářová", role: "Interiér" };
const OK = { name: "Ondřej Kubeš", role: "Architekt" };
const AS = { name: "Anna Šťastná", role: "Krajina" };
const PD = { name: "Petr Doležal", role: "Dokumentace" };

const raw: ProjectInput[] = [
  {
    slug: "kancelarsky-dum-holesovice",
    name: "Kancelářský dům Holešovice",
    architects: [JH, KV, PD],
    client: "Port Sedm Development a.s.",
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
    text: [
      "Dům stojí na místě bývalých skladů u holešovického přístavu. Hlavní hmota je zvednutá nad parter, takže přízemí patří kavárnám a průchodu k vodě.",
      "Betonový skelet s rastrem 8,1 metru umožňuje dělit podlaží na malé i velké kanceláře. Hluboké lodžie stíní jižní fasádu a v létě snižují potřebu chlazení.",
    ],
    massing: [
      { x: 0, z: 0, w: 40, d: 18, h: 24, label: "Hlavní hmota · 7 NP" },
      { x: 4, z: 18, w: 22, d: 12, h: 8, glass: true, label: "Přístavba · parter" },
    ],
    featured: true,
    placeholder: false,
  },
  {
    slug: "bytovy-dum-smichov",
    name: "Bytový dům Smíchov",
    architects: [KV, OK, PD],
    client: "Bytové družstvo Smíchovská zahrada",
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
    text: [
      "Nárožní dům dotváří rozpadlý blok a vrací ulici jasnou uliční čáru. Kamenný sokl navazuje na sousední činžáky, horní podlaží ustupují a uvolňují terasy.",
      "Ve vnitrobloku vzniká společná zahrada pro všech 46 bytů. Na střeše je pergola a záhony, které obyvatelé spravují sami.",
    ],
    massing: [
      { x: 0, z: 0, w: 30, d: 14, h: 21 },
      { x: 0, z: 14, w: 14, d: 16, h: 21 },
      { x: 2, z: 2, w: 24, d: 10, h: 4, y: 21, glass: true },
    ],
    featured: true,
    placeholder: false,
  },
  {
    slug: "knihovna-zabrdovice",
    name: "Knihovna Zábrdovice",
    architects: [KV, JH, TM],
    client: "Městská knihovna Brno-sever (zadavatel)",
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
    text: [
      "Knihovna je navržená jako krytá ulice, která propojuje náměstí s parkem. Přízemí je celé prosklené a slouží jako čítárna a místo pro setkávání.",
      "Studovny v patře mají horní světlo a výhled do korun stromů. Dřevěné regály jsou zároveň nosnou konstrukcí galerie.",
    ],
    massing: [
      { x: 0, z: 0, w: 34, d: 20, h: 9, glass: true },
      { x: 3, z: 3, w: 28, d: 14, h: 8, y: 9 },
    ],
    featured: true,
    placeholder: false,
  },
  {
    slug: "konverze-haly-vitkovice",
    name: "Konverze haly Vítkovice",
    architects: [JH, OK, PD],
    client: "Industriální spolek Vítkovice",
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
    text: [
      "Původní ocelová hala z roku 1912 zůstává přiznaná. Do ní je vložený betonový sál pro 600 lidí, foyer a zázemí pro umělce.",
      "Komín vedle haly slouží jako rozhledna a orientační bod nové čtvrti. Stávající jeřábová dráha nese osvětlení a scénickou techniku.",
    ],
    massing: [
      { x: 0, z: 0, w: 60, d: 22, h: 18 },
      { x: 60, z: 6, w: 8, d: 8, h: 40 },
    ],
    featured: true,
    placeholder: false,
  },
  {
    slug: "horska-chata-pec",
    name: "Horská chata Pec",
    architects: [OK, TM],
    client: "Soukromý investor",
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
    text: [
      "Chata je zapuštěná do svahu, takže ze silnice je vidět jen nízká kamenná zeď. Horní patro je dřevěné a otevírá se jedním velkým oknem ke Sněžce.",
      "Konstrukce počítá se sněhovou zátěží přes pět kilopascalů. Střecha je pochozí a slouží v zimě jako terasa nad sněhem.",
    ],
    massing: [
      { x: 0, z: 0, w: 18, d: 10, h: 4 },
      { x: 2, z: 1, w: 14, d: 8, h: 5, y: 4 },
    ],
    featured: true,
    placeholder: false,
  },
  {
    slug: "navstevnicke-centrum-kvilda",
    name: "Návštěvnické centrum Kvilda",
    architects: [KV, AS],
    client: "Soutěž pro obec Kvilda (fiktivní zadání)",
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
    text: [
      "Soutěžní návrh dlouhého nízkého domu na okraji rašelinišť. Krytý průchod vede návštěvníky přímo ze zastávky na naučnou stezku.",
      "Dům je ze dřeva místních pil a stojí na pilotách, aby nenarušil vodní režim slatě.",
    ],
    massing: [
      { x: 0, z: 0, w: 48, d: 9, h: 5 },
      { x: 30, z: 9, w: 9, d: 12, h: 5, glass: true },
    ],
    placeholder: false,
  },
  {
    slug: "dum-na-jestedske",
    name: "Dům na Ještědské",
    architects: [JH, TM],
    client: "Soukromý investor",
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
    text: [
      "Rodinný dům pod Ještědem tvoří dva posunuté hranoly. Spodní z pohledového betonu drží svah, horní lehký se otevírá k výhledu na hřeben.",
      "Mezi hranoly vzniká krytá terasa, která funguje jako letní obývací pokoj.",
    ],
    massing: [
      { x: 0, z: 0, w: 16, d: 9, h: 3.4 },
      { x: 4, z: -2, w: 14, d: 8, h: 3.4, y: 3.4 },
    ],
    placeholder: false,
  },
  {
    slug: "galerie-ve-dvore-olomouc",
    name: "Galerie ve dvoře",
    architects: [TM, OK],
    client: "Spolek Galerie ve dvoře",
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
    text: [
      "Výstavní sál je vložený do dvora měšťanského domu v historickém centru. Pilový světlík přivádí rovnoměrné severní světlo vhodné pro obrazy.",
      "Nová stavba se nedotýká historických zdí. Mezi nimi a sálem zůstává úzká mezera se schodištěm.",
    ],
    massing: [
      { x: 0, z: 0, w: 24, d: 16, h: 8 },
      { x: 0, z: 0, w: 24, d: 4, h: 3, y: 8, glass: true },
    ],
    placeholder: false,
  },
  {
    slug: "tovarni-byty-zlin",
    name: "Tovární byty Zlín",
    architects: [PD, KV],
    client: "Zlínské bydlení s.r.o.",
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
    text: [
      "Obnova funkcionalistické tovární budovy na 92 bytů. Typický rastr 6,15 × 6,15 metru zůstává čitelný v každém bytě.",
      "Původní okna byla nahrazena repasovanými kopiemi s izolačním sklem. Ve dvoře vzniklo hřiště a dílny pro obyvatele.",
    ],
    massing: [{ x: 0, z: 0, w: 80, d: 20, h: 22 }],
    placeholder: false,
  },
  {
    slug: "skolni-kampus-budejovice",
    name: "Školní kampus Budějovice",
    architects: [KV, OK, AS],
    client: "Soutěž pro statutární město (fiktivní zadání)",
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
    text: [
      "Soutěžní návrh kampusu tří škol kolem společného dvora. Tělocvičny jsou zapuštěné do terénu, aby dvůr zůstal otevřený a slunný.",
      "Návrh získal 2. místo. Porota ocenila hlavně jasné oddělení vstupů pro menší a větší děti.",
    ],
    massing: [
      { x: 0, z: 0, w: 46, d: 14, h: 12 },
      { x: 0, z: 14, w: 14, d: 30, h: 12 },
      { x: 32, z: 26, w: 14, d: 18, h: 9, glass: true },
    ],
    placeholder: false,
  },
  {
    slug: "interier-pivovarske-haly",
    name: "Interiér pivovarské haly",
    architects: [TM],
    client: "Pivovarská hala Plzeň s.r.o.",
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
    text: [
      "Restaurace a sál v klenuté hale bývalé spilky. Nový nábytek a světla stojí volně, aby se historické zdivo ničeho nedotýkalo.",
      "Dlouhý dubový bar je vyrobený z trámů původního krovu.",
    ],
    massing: [{ x: 0, z: 0, w: 36, d: 14, h: 10 }],
    placeholder: false,
  },
  {
    slug: "krajina-u-rybnika-telc",
    name: "Krajina u rybníka",
    architects: [AS, JH],
    client: "Město Telč (fiktivní zadání)",
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
    text: [
      "Úprava břehů rybníka a mlýnské strouhy. Dřevěná lávka propojuje oba břehy a mola zvou k vodě.",
      "Na břehu stojí malý přístřešek pro rybáře a výletníky z modřínu, který stárne do stříbrné.",
    ],
    massing: [
      { x: 0, z: 0, w: 60, d: 3, h: 0.6 },
      { x: 24, z: 3, w: 6, d: 4, h: 3 },
    ],
    placeholder: false,
  },
  {
    slug: "kolonada-karlovy-vary",
    name: "Nová kolonáda",
    architects: [JH, OK],
    client: "Soutěž lázeňského města (fiktivní zadání)",
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
    text: [
      "Soutěžní návrh lehké kolonády nad řekou Teplou. Tenká betonová střecha leží na řadě štíhlých sloupů.",
      "Pod střechou jsou pítka s vřídelní vodou a lavice z tmavého kamene.",
    ],
    massing: [
      { x: 0, z: 0, w: 70, d: 10, h: 0.5, y: 6 },
      { x: 0, z: 0, w: 70, d: 10, h: 6, glass: true },
    ],
    placeholder: false,
  },
  {
    slug: "atelierovy-dum-hradec",
    name: "Ateliérový dům Hradec",
    architects: [TM, JH],
    client: "Soukromý investor",
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
    text: [
      "Dům a ateliér pod jednou pultovou střechou. Severní světlo míří do ateliéru, jižní zahrada patří bydlení.",
      "Fasáda je z vláknocementových desek s viditelným kotvením.",
    ],
    massing: [
      { x: 0, z: 0, w: 14, d: 10, h: 7 },
      { x: 14, z: 2, w: 6, d: 8, h: 4, glass: true },
    ],
    placeholder: false,
  },
  {
    slug: "vinarstvi-na-svahu-mikulov",
    name: "Vinařství na svahu",
    architects: [OK, AS, PD],
    client: "Vinařství Pod Kopcem s.r.o.",
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
    text: [
      "Výrobna a degustace jsou zasunuté do vinice. Ze silnice je vidět jen dlouhá kamenná zeď a střecha porostlá trávou.",
      "Sklep využívá stálou teplotu země, takže víno zraje bez chlazení.",
    ],
    massing: [
      { x: 0, z: 0, w: 52, d: 16, h: 6 },
      { x: 10, z: 16, w: 20, d: 6, h: 4, glass: true },
    ],
    placeholder: false,
  },
  {
    slug: "lazensky-pavilon-jesenik",
    name: "Lázeňský pavilon",
    architects: [KV, PD],
    client: "Lázně pod Jeseníky a.s.",
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
    text: [
      "Pavilon s bazény na okraji lázeňského lesa. Lepená dřevěná konstrukce nese střechu bez vnitřních sloupů.",
      "Velká prosklená stěna se otevírá do údolí. V létě se dá částečně posunout a bazén se tak spojí s terasou.",
    ],
    massing: [
      { x: 0, z: 0, w: 38, d: 18, h: 7, glass: true },
      { x: 0, z: 18, w: 38, d: 8, h: 10 },
    ],
    placeholder: false,
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
