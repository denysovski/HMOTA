import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Impressum", alternates: { canonical: "/impressum" } };

export default function Impressum() {
  return (
    <div className="wrap" style={{ paddingBottom: "clamp(96px, 12vw, 200px)" }}>
      <header className="page-head">
        <h1 className="h2">Impressum</h1>
      </header>
      <div className="prose">
        <p>
          {site.name} · IČO {site.ico}
          <br />
          {site.address.join(", ")}
          <br />
          {site.email} · {site.phone}
        </p>
        <h2>Autorizace</h2>
        <p>[Číslo autorizace ČKA odpovědného architekta]</p>
        <h2>Podklady</h2>
        <p>
          Mapové podklady: Natural Earth (public domain). Reliéf na 3D mapě je stylizovaný, nejde o
          měřená výšková data.
        </p>
      </div>
    </div>
  );
}
