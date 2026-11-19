import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Začněte s námi projekt. Odpovídáme do dvou pracovních dnů.",
  alternates: { canonical: "/kontakt" },
};

export default function ContactPage() {
  return (
    <div className="wrap" style={{ paddingBottom: "clamp(96px, 12vw, 200px)" }}>
      <header className="page-head">
        <Reveal as="h1" className="mega" immediate>
          Začít projekt
        </Reveal>
      </header>
      <div className="grid" style={{ rowGap: 56 }}>
        <div className="small contact-details">
          <p className="label">E-mail</p>
          <p style={{ marginBottom: 18 }}>
            <a className="u" href={`mailto:${site.email}`}>
              {site.email}
            </a>
          </p>
          <p className="label">Telefon</p>
          <p style={{ marginBottom: 18 }}>
            <a className="u" href={`tel:${site.phone.replace(/\s/g, "")}`}>
              {site.phone}
            </a>
          </p>
          <p className="label">Ateliér</p>
          <address style={{ fontStyle: "normal", marginBottom: 18 }}>
            {site.address.map((a) => (
              <span key={a} style={{ display: "block" }}>
                {a}
              </span>
            ))}
          </address>
          <p className="label">Odpovídáme</p>
          <p>do dvou pracovních dnů</p>
        </div>
        <div className="contact-form">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
