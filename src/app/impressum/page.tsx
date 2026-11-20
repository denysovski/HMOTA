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
        <p className="footer-demo" style={{ borderTop: 0, paddingTop: 0 }}>
          <span className="footer-demo-dot" aria-hidden="true" />
          {site.demoNote}
        </p>
        <h2>Provozovatel</h2>
        <p>
          {site.legalName}
          <br />
          {site.address.join(", ")}
          <br />
          IČO {site.ico} · DIČ {site.dic}
          <br />
          {site.register}
        </p>
        <h2>Kontakt</h2>
        <p>
          E-mail: {site.email}
          <br />
          Telefon: {site.phone}
        </p>
        <h2>Autorizace</h2>
        <p>
          {site.cka}. Ateliér je členem České komory architektů a řídí se jejím profesním a etickým
          řádem.
        </p>
        <h2>Pojištění</h2>
        <p>Profesní pojištění odpovědnosti architekta s limitem plnění 20 mil. Kč.</p>
        <h2>Autorská práva</h2>
        <p>
          Texty, výkresy a vizualizace na tomto webu jsou autorským dílem ateliéru. Bez písemného
          souhlasu je nelze dále šířit.
        </p>
        <h2>Podklady</h2>
        <p>
          Mapové podklady: Natural Earth (public domain). Reliéf na 3D mapě je stylizovaný, nejde o
          měřená výšková data. Písma Instrument Sans, Hedvig Letters Serif a Geist jsou licencovaná
          pod SIL Open Font License.
        </p>
      </div>
    </div>
  );
}
