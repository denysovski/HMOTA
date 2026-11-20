/**
 * Studio details. HMOTA is a DEMO: the studio, people, numbers and contact details are invented.
 * The footer says so on every page. Replace everything here for a real studio.
 */
export const site = {
  name: "Hmota",
  legalName: "HMOTA architekti s.r.o.",
  wordmark: ["Hmota", "Architektonický", "Ateliér"],
  description:
    "Architektonický ateliér z pražských Holešovic. Od roku 2009 navrhujeme domy, veřejné stavby, interiéry a krajinu po celé České republice.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://denysovski.github.io/HMOTA",
  founded: "2009",
  founder: "Ing. arch. Jan Husták",
  people: "14",
  email: "studio@hmota.example",
  phone: "+420 123 456 789",
  address: ["Komunardů 1078/34", "170 00 Praha 7 – Holešovice", "Česká republika"],
  hours: [
    ["Po–Čt", "9:00–18:00"],
    ["Pá", "9:00–16:00"],
    ["So–Ne", "zavřeno"],
  ] as const,
  ico: "08415279",
  dic: "CZ08415279",
  register: "Spisová značka C 318204 vedená u Městského soudu v Praze",
  cka: "Ing. arch. Jan Husták, autorizovaný architekt ČKA 03 912",
  social: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "LinkedIn", href: "https://linkedin.com/" },
  ],
  formEndpoint: process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "",
  demoNote:
    "Demo stránka. Ateliér, lidé, projekty a kontaktní údaje jsou smyšlené a nejde o pravdivé informace.",
};

export const nav = [
  { href: "/", label: "Index" },
  { href: "/projekty", label: "Projekty" },
  { href: "/mapa", label: "Mapa" },
  { href: "/studio", label: "Studio" },
  { href: "/kontakt", label: "Kontakt" },
];

export const disciplines = [
  "Architektura",
  "Interiér",
  "Urbanismus",
  "Krajina",
  "Rekonstrukce",
  "Soutěže",
  "Dokumentace",
  "Výzkum",
];

export const recognition = [
  { title: "Cena za veřejný prostor", detail: "Krajina u rybníka, Telč", year: "2023" },
  { title: "Soutěž Školní kampus Budějovice", detail: "2. místo", year: "2024" },
  { title: "Časopis Prostor", detail: "Knihovna Zábrdovice, č. 4", year: "2022" },
  { title: "Výstava Nová česká architektura", detail: "Konverze haly Vítkovice", year: "2021" },
  {
    title: "Cena za obnovu industriálního dědictví",
    detail: "Tovární byty Zlín, nominace",
    year: "2021",
  },
];

export type Person = {
  name: string;
  role: string;
  since: string;
  bio: string;
  avatar: "beard" | "long" | "short" | "bun" | "glasses" | "curly";
};

export const team: Person[] = [
  {
    name: "Ing. arch. Jan Husták",
    role: "Zakladatel, hlavní architekt",
    since: "2009",
    bio: "Vede koncepci všech projektů. Dřív pracoval v Rotterdamu a Vídni, učí ateliérovou tvorbu.",
    avatar: "beard",
  },
  {
    name: "Ing. arch. Klára Veselá",
    role: "Partnerka, vedoucí projektů",
    since: "2012",
    bio: "Má na starosti veřejné stavby a soutěže. Specializuje se na knihovny a školy.",
    avatar: "long",
  },
  {
    name: "Ing. arch. Tereza Mlynářová",
    role: "Architektka, interiéry",
    since: "2016",
    bio: "Navrhuje interiéry a nábytek na míru. Ráda pracuje se dřevem a starým zdivem.",
    avatar: "short",
  },
  {
    name: "MgA. Ondřej Kubeš",
    role: "Architekt, soutěže",
    since: "2018",
    bio: "Kreslí první skici a hmotové studie. Vede práci s fyzickými modely.",
    avatar: "glasses",
  },
  {
    name: "Ing. Anna Šťastná",
    role: "Krajinářská architektka",
    since: "2019",
    bio: "Navrhuje zahrady, nábřeží a veřejná prostranství. Hlídá, aby stavby neztratily kontakt s krajinou.",
    avatar: "bun",
  },
  {
    name: "Ing. Petr Doležal",
    role: "Projektant, technická dokumentace",
    since: "2014",
    bio: "Převádí návrhy do prováděcí dokumentace a dohlíží na stavbách.",
    avatar: "curly",
  },
];
