/**
 * Studio details. Everything in [brackets] is a placeholder: replace it with real information
 * before launch (ProUI hard rule: no placeholder business info goes live).
 */
export const site = {
  name: "Hmota",
  wordmark: ["Hmota", "Architektonický", "Ateliér"],
  description:
    "Architektonický ateliér. Navrhujeme domy, veřejné stavby, interiéry a krajinu po celé České republice.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://denysovski.github.io/HMOTA",
  founded: "[rok založení]",
  founder: "[Jméno zakladatele]",
  email: "[studio@email.cz]",
  phone: "[+420 000 000 000]",
  address: ["[Ulice a číslo]", "[PSČ] Praha", "Česká republika"],
  hours: [
    ["Po–Pá", "9:00–18:00"],
    ["So–Ne", "zavřeno"],
  ] as const,
  ico: "[IČO]",
  social: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "LinkedIn", href: "https://linkedin.com/" },
  ],
  formEndpoint: process.env.NEXT_PUBLIC_FORM_ENDPOINT ?? "",
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
