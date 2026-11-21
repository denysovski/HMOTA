import Link from "next/link";
import { HeroModel } from "@/components/hero/HeroModel";
import { Axo } from "@/components/Axo";
import { Reveal } from "@/components/Reveal";
import { ScatterGrid } from "@/components/ScatterGrid";
import { MapTeaser } from "@/components/MapTeaser";
import { InkZone } from "@/components/InkZone";
import { RadialLines } from "@/components/RadialLines";
import { Magnetic } from "@/components/Magnetic";
import { featured, projects } from "@/content/projects";
import { disciplines, recognition, site } from "@/lib/site";
import { Arrow } from "@/components/Arrow";
import { Deco } from "@/components/Deco";

export default function Home() {
  const hero = featured[0] ?? projects[0]!;
  const regions = new Set(projects.map((p) => p.region)).size;
  const built = projects.filter((p) => p.status === "realizace").length;

  return (
    <>
      <HeroModel
        massing={hero.massing}
        projectName={hero.name}
        poster={<Axo massing={hero.massing} aspect={16 / 9} pad={0.35} />}
        title={
          <>
            <span>{site.wordmark[0]}</span>
            <span>{site.wordmark[1]}</span>
            <span>{site.wordmark[2]}</span>
          </>
        }
      />

      <section className="wrap section has-deco" aria-labelledby="intro-title">
        <Deco kind="arcs" className="deco-tr" />
        <div className="intro-head">
          <Reveal as="h2" className="h2" id="intro-title">
            Klidná forma,
            <br />
            přesná hmota
          </Reveal>
        </div>
        <div className="grid intro-services small muted">
          <p>
            Koncepce, architektonická studie, dokumentace pro povolení i provedení stavby, autorský
            dozor.
          </p>
          <p>
            Bydlení, veřejné a kulturní stavby, interiéry a krajina, nové stavby i práce s
            existujícími.
          </p>
        </div>
      </section>

      <section className="wrap section-tight" aria-label="O ateliéru">
        <div className="grid titleblock">
          <dl>
            <dt>Založeno</dt>
            <dd>{site.founded}</dd>
            <dt>Zakladatel</dt>
            <dd>{site.founder}</dd>
            <dt>Služby</dt>
            <dd>Od prvních skic po prováděcí dokumentaci a dozor na stavbě.</dd>
            <dt>Působnost</dt>
            <dd>Celá Česká republika</dd>
          </dl>
          <Reveal className="statement">
            Navrhujeme stavby, které vycházejí z místa, z jeho světla, terénu a paměti. Hledáme
            jednoduchou hmotu, poctivý materiál a detail, který vydrží. Každý projekt začíná
            otázkou, co už na místě je.
          </Reveal>
        </div>
      </section>

      <section className="wrap section-tight" aria-labelledby="recognition">
        <div className="grid">
          <div style={{ gridColumn: "3 / span 8" }}>
            <table className="table">
              <caption className="label" id="recognition">
                Ocenění a publikace
              </caption>
              <tbody>
                {recognition.map((r) => (
                  <tr key={r.title}>
                    <th scope="row">{r.title}</th>
                    <td className="muted">{r.detail}</td>
                    <td className="muted num">{r.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="wrap section has-deco" aria-label="Jak pracujeme">
        <Deco kind="grid" className="deco-bl" />
        <div className="grid process">
          <div className="process-drawing">
            <Axo
              massing={projects[2]!.massing}
              variant="line"
              aspect={21 / 9}
              pad={0.3}
              plan={false}
              notes={[
                { vol: 0, text: "Prosklená čítárna v přízemí · 9 m", dx: -0.19, dy: 0.17 },
                { vol: 1, text: "Studovny · horní světlo, 8 m", dx: 0.16, dy: -0.2 },
              ]}
              caption="Skica z první fáze, Knihovna Zábrdovice. Prověřujeme, jak se dvě hmoty skládají na sebe, kudy se vchází a kam dopadá světlo."
            />
          </div>
          <Reveal className="statement process-text">
            Od skici ke strategii. Prvotní nápady prověřujeme v rychlých kresbách a modelech, dokud
            nemají jasnou logiku prostoru, pohybu a světla.
          </Reveal>
          <p className="serif-text process-note">
            Začínáme od podstatného: skici, schémata, hmotové studie. Tady testujeme, jak se dům
            postaví do terénu, kudy do něj vstoupíte a kam se otevře. Teprve když tahle logika drží,
            přidáváme materiál a detail.
          </p>
          <div className="process-drawing">
            <Axo
              massing={projects[1]!.massing}
              variant="line"
              aspect={21 / 9}
              pad={0.3}
              notes={[
                { vol: 0, text: "Nárožní hmota · 6 NP, 21 m", dx: -0.15, dy: -0.2 },
                { vol: 1, text: "Křídlo do ulice · 46 bytů", dx: -0.1, dy: 0.24 },
                { vol: 2, text: "Ustupující podlaží · terasy", dx: 0.17, dy: -0.04 },
              ]}
              caption="Bytový dům Smíchov ve fázi pro stavební povolení. Hmota se ustálila, řešíme konstrukční raster 6 m, výšku podlaží 3,4 m a napojení na sousední domy. Limetkové linky jsou hranice pozemku."
            />
          </div>
          <Reveal className="statement process-text">
            Přesnost v provedení. Dispozice, konstrukce a fasáda dostávají řád, výkresy připravené
            pro povolení i pro stavbu.
          </Reveal>
        </div>
      </section>

      <section className="wrap section-tight" aria-labelledby="work-title">
        <div className="intro-head" style={{ marginBottom: "clamp(56px, 7vw, 120px)" }}>
          <Reveal as="h2" className="h2" id="work-title">
            Vybrané
            <br />
            projekty
          </Reveal>
        </div>
        <ScatterGrid items={featured} />
        <p style={{ textAlign: "center", marginTop: "clamp(64px, 8vw, 140px)" }}>
          <Link href="/projekty" className="u">
            Všechny projekty <Arrow />
          </Link>
        </p>
      </section>

      <section className="wrap section" aria-labelledby="where">
        <div className="grid teaser">
          <MapTeaser projects={projects} />
          <div className="teaser-copy">
            <p className="label">Kde stavíme</p>
            <h2 id="where" className="statement" style={{ margin: "12px 0 20px" }}>
              {projects.length} staveb v {regions} krajích, od Krkonoš po Pálavu.
            </h2>
            <p className="small muted" style={{ marginBottom: 24 }}>
              Prozkoumejte trojrozměrný model republiky s naší prací. Najetím na špendlík uvidíte
              autory, klienta a dobu zakázky.
            </p>
            <Link href="/mapa" className="btn btn-ghost">
              Otevřít mapu <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <InkZone>
        <section className="wrap" aria-label="Disciplíny">
          <RadialLines labels={disciplines} title={["Jednoduše", "a do hloubky"]} />
        </section>
        <section className="wrap section-tight" aria-label="Ateliér v číslech">
          <div className="grid facts">
            <div>
              <strong className="num">{projects.length}</strong>
              <span className="label">projektů na mapě</span>
            </div>
            <div>
              <strong className="num">{built}</strong>
              <span className="label">realizovaných staveb</span>
            </div>
            <div>
              <strong className="num">{regions}</strong>
              <span className="label">krajů</span>
            </div>
            <div>
              <strong className="num">{site.people}</strong>
              <span className="label">lidí v ateliéru</span>
            </div>
          </div>
        </section>
        <section className="wrap section cta has-deco" aria-labelledby="cta">
          <Deco kind="steps" className="deco-br" />
          <h2 className="h2" id="cta">
            Máte pozemek,
            <br />
            dům nebo nápad?
          </h2>
          <Magnetic>
            <Link href="/kontakt#poptavka" className="btn btn-lime">
              Začít projekt <Arrow />
            </Link>
          </Magnetic>
        </section>
      </InkZone>
    </>
  );
}
