import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Studio",
  description: "Přístup, lidé a způsob práce ateliéru.",
  alternates: { canonical: "/studio" },
};

const approach = [
  ["Místo", "Každý návrh začíná průzkumem pozemku: světlo, terén, sousedé, cesty a paměť místa."],
  ["Hmota", "Hledáme jednoduchý tvar, který drží celek. Detail přichází až potom, ne místo něj."],
  ["Materiál", "Volíme materiály, které stárnou s grácií a dají se opravit. Méně druhů, víc péče."],
  ["Spolupráce", "Klient, stavebník, inženýři i úřady jsou součástí návrhu od první skici."],
];

export default function StudioPage() {
  return (
    <div className="wrap" style={{ paddingBottom: "clamp(96px, 12vw, 200px)" }}>
      <header className="page-head">
        <Reveal as="h1" className="mega" immediate>
          Studio
        </Reveal>
      </header>
      <div className="grid titleblock">
        <dl>
          <dt>Založeno</dt>
          <dd>{site.founded}</dd>
          <dt>Zakladatel</dt>
          <dd>{site.founder}</dd>
          <dt>Sídlo</dt>
          <dd>{site.address.join(", ")}</dd>
        </dl>
        <Reveal className="statement">
          Jsme malý ateliér, který navrhuje domy, veřejné stavby, interiéry a krajinu. Pracujeme v
          celé republice a ke každé zakázce přistupujeme jako k jedinečnému místu.
        </Reveal>
      </div>
      <section className="section-tight">
        <table className="table">
          <caption className="label">Přístup</caption>
          <tbody>
            {approach.map(([k, v]) => (
              <tr key={k}>
                <th scope="row" style={{ width: "22%" }}>
                  {k}
                </th>
                <td className="muted">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="section-tight">
        <p className="label">Lidé</p>
        <p className="statement" style={{ marginTop: 14, maxWidth: "24ch" }}>
          [Tým: jména, role a portréty doplní ateliér.]
        </p>
        <p className="small muted" style={{ marginTop: 24 }}>
          Hledáme kolegy?{" "}
          <Link href="/kontakt" className="u">
            Napište nám
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
