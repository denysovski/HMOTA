import Link from "next/link";
import type { Project } from "@/content/schema";
import { Axo } from "../Axo";
import { area, duration, monthYear, regionLabel, statusLabel, typeLabel } from "@/lib/format";
import { Arrow } from "@/components/Arrow";

/** The content of the map card: drawing, name, architects, client, commission dates, facts. */
export function CardBody({ p, onClose }: { p: Project; onClose?: () => void }) {
  return (
    <>
      <div className="media">
        <Axo massing={p.massing} aspect={3 / 2} pad={0.22} />
      </div>
      <div className="body">
        <span className="status-chip" data-status={p.status}>
          {statusLabel(p)}
        </span>
        <h3>{p.name}</h3>
        <dl>
          <dt>Architekti</dt>
          <dd>{p.architects.map((a) => a.name).join(", ")}</dd>
          <dt>Klient</dt>
          <dd>{p.client}</dd>
          <dt>Zakázka</dt>
          <dd className="num">
            {monthYear(p.commissioned)} – {p.completed ? monthYear(p.completed) : "dosud"}
          </dd>
          <dt>Doba</dt>
          <dd className="num">{duration(p)}</dd>
          <dt>Typ</dt>
          <dd>{typeLabel(p)}</dd>
          <dt>Místo</dt>
          <dd>
            {p.municipality}, {regionLabel(p.region)}
          </dd>
          <dt>Plocha</dt>
          <dd className="num">{area(p.areaM2)}</dd>
        </dl>
        <div className="actions">
          <Link href={`/projekty/${p.slug}`} className="card-link">
            Detail projektu <Arrow />
          </Link>
          {onClose && (
            <button type="button" className="close u" onClick={onClose}>
              Zavřít
            </button>
          )}
        </div>
      </div>
    </>
  );
}
