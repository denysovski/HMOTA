import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Axo } from "@/components/Axo";
import { Reveal } from "@/components/Reveal";
import { CzMapSvg } from "@/components/map/CzMapSvg";
import { getProject, projects } from "@/content/projects";
import { area, duration, monthYear, regionLabel, statusLabel, typeLabel } from "@/lib/format";
import { site } from "@/lib/site";
import { Arrow } from "@/components/Arrow";

type Params = { slug: string };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.summary,
    alternates: { canonical: `/projekty/${p.slug}` },
  };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();
  const i = projects.indexOf(p);
  const next = projects[(i + 1) % projects.length]!;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.name,
    description: p.summary,
    creator: { "@type": "Organization", name: site.name },
    dateCreated: p.commissioned,
    locationCreated: {
      "@type": "Place",
      name: p.municipality,
      geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng },
    },
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="wrap page-head">
        <p className="label" style={{ marginBottom: 18 }}>
          <Link href="/projekty" className="u">
            Projekty
          </Link>{" "}
          / {typeLabel(p)}
        </p>
        <Reveal as="h1" className="h2" immediate>
          {p.name}
        </Reveal>
      </header>
      <div className="wrap">
        <div className="detail-lead">
          <Axo massing={p.massing} aspect={16 / 8} pad={0.3} title={`Axonometrie: ${p.name}`} />
        </div>
        <p className="label" style={{ marginTop: 10 }}>
          Axonometrie hmoty, měřítko orientační.
        </p>
      </div>
      <section className="wrap section-tight">
        <div className="grid detail-body">
          <div className="detail-facts">
            <dl>
              <dt>Stav</dt>
              <dd>
                <span className="status-chip" data-status={p.status}>
                  {statusLabel(p)}
                </span>
              </dd>
              <dt>Architekti</dt>
              <dd>
                {p.architects.map((a) => (
                  <span key={a.name} style={{ display: "block" }}>
                    {a.name} <span className="muted">· {a.role}</span>
                  </span>
                ))}
              </dd>
              <dt>Klient</dt>
              <dd>{p.client}</dd>
              <dt>Místo</dt>
              <dd>
                {p.municipality}, {regionLabel(p.region)}
              </dd>
              <dt>Zadání</dt>
              <dd className="num">{monthYear(p.commissioned)}</dd>
              <dt>Dokončení</dt>
              <dd className="num">{p.completed ? monthYear(p.completed) : "probíhá"}</dd>
              <dt>Doba zakázky</dt>
              <dd className="num">{duration(p)}</dd>
              <dt>Plocha</dt>
              <dd className="num">{area(p.areaM2)}</dd>
            </dl>
            <div className="locator" style={{ marginTop: 32 }}>
              <CzMapSvg
                pins={[p]}
                highlight={p.slug}
                showCities={false}
                width={600}
                height={372}
                title={`Poloha: ${p.municipality}`}
              />
              <p className="label" style={{ marginTop: 8 }}>
                <Link href={`/mapa?projekt=${p.slug}`} className="arrow-link">
                  Ukázat na 3D mapě <Arrow />
                </Link>
              </p>
            </div>
          </div>
          <div className="detail-text">
            <Reveal className="statement">{p.summary}</Reveal>
            <div style={{ marginTop: 40 }}>
              {p.text.map((t) => (
                <p key={t} className="serif-text">
                  {t}
                </p>
              ))}
            </div>
            <div style={{ marginTop: 56 }}>
              <Axo
                massing={p.massing}
                variant="line"
                aspect={16 / 9}
                pad={0.3}
                title={`Liniová axonometrie: ${p.name}`}
              />
            </div>
          </div>
        </div>
      </section>
      <nav
        className="wrap section-tight"
        aria-label="Další projekt"
        style={{ borderTop: "1px solid var(--line)" }}
      >
        <p className="label">Další projekt</p>
        <Link href={`/projekty/${next.slug}`} className="h2 next-link">
          <span className="next-link-text">{next.name}</span> <Arrow />
        </Link>
      </nav>
    </article>
  );
}
