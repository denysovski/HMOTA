import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap" style={{ minHeight: "80vh", display: "grid", alignContent: "center" }}>
      <p className="label">Chyba 404</p>
      <h1 className="h2" style={{ margin: "14px 0 28px" }}>
        Tady zatím
        <br />
        nic nestojí
      </h1>
      <p className="small">
        <Link href="/" className="u">
          Zpět na úvod
        </Link>{" "}
        ·{" "}
        <Link href="/projekty" className="u">
          Projekty
        </Link>{" "}
        ·{" "}
        <Link href="/mapa" className="u">
          Mapa
        </Link>
      </p>
    </div>
  );
}
