import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Avatar } from "@/components/Avatar";
import { site, team } from "@/lib/site";

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
      <section className="section-tight" aria-labelledby="lide">
        <div className="team-head">
          <h2 className="h2" id="lide">
            Lidé
          </h2>
          <p className="small muted">
            Ve studiu nás je {site.people}. Tady je šest z nás, kteří vedou projekty od první skici
            po kolaudaci.
          </p>
        </div>
        <ul className="team">
          {team.map((p) => (
            <li key={p.name} className="person">
              <Avatar kind={p.avatar} title={`Ilustrace: ${p.name}`} />
              <p className="person-name">{p.name}</p>
              <p className="label">
                {p.role} · v ateliéru od {p.since}
              </p>
              <p className="small muted person-bio">{p.bio}</p>
            </li>
          ))}
        </ul>
        <p className="small muted" style={{ marginTop: 40 }}>
          Hledáme architekta nebo architektku do týmu soutěží.{" "}
          <Link href="/kontakt" className="u">
            Napište nám
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
