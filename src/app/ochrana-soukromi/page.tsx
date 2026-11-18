import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ochrana soukromí",
  alternates: { canonical: "/ochrana-soukromi" },
};

export default function Privacy() {
  return (
    <div className="wrap" style={{ paddingBottom: "clamp(96px, 12vw, 200px)" }}>
      <header className="page-head">
        <h1 className="h2">Ochrana soukromí</h1>
      </header>
      <div className="prose">
        <p className="label">Návrh textu. Před spuštěním nechte zkontrolovat právníkem.</p>
        <h2>Správce údajů</h2>
        <p>
          {site.name}, IČO {site.ico}, {site.address.join(", ")}. Kontakt: {site.email}.
        </p>
        <h2>Jaké údaje zpracováváme</h2>
        <p>
          Údaje z poptávkového formuláře (jméno, e-mail, telefon a popis projektu) použijeme jen k
          odpovědi na vaši poptávku a k přípravě nabídky. Uchováváme je nejdéle 3 roky.
        </p>
        <h2>Cookies a měření</h2>
        <p>
          Web nepoužívá reklamní ani analytické cookies. Pokud se to změní, vyžádáme si váš souhlas.
        </p>
        <h2>Vaše práva</h2>
        <p>
          Máte právo na přístup, opravu, výmaz a omezení zpracování a právo podat stížnost u Úřadu
          pro ochranu osobních údajů (uoou.gov.cz).
        </p>
      </div>
    </div>
  );
}
