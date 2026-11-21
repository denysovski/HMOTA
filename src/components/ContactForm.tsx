"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { Select } from "./Select";
import { site } from "@/lib/site";
import { Arrow } from "@/components/Arrow";

type Status = "idle" | "sending" | "sent" | "error";
const TYPES = [
  "Rodinný dům",
  "Bytový dům",
  "Veřejná stavba",
  "Komerční stavba",
  "Interiér",
  "Krajina",
  "Jiné",
];
const BUDGETS = [
  "Do 10 mil. Kč",
  "10–30 mil. Kč",
  "30–100 mil. Kč",
  "Nad 100 mil. Kč",
  "Zatím nevím",
];

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    const errs: Record<string, string> = {};
    if (!data.name?.trim()) errs.name = "Napište prosím své jméno.";
    if (!data.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      errs.email = "Zkontrolujte e-mailovou adresu, např. jana@firma.cz.";
    if ((data.message ?? "").trim().length < 20)
      errs.message = "Popište projekt alespoň jednou větou (20 znaků).";
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = form.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`);
      first?.focus();
      return;
    }
    if (data.company) return; // honeypot

    if (!site.formEndpoint) {
      const body = `${data.message}\n\nTyp: ${data.type}\nMísto: ${data.location}\nRozpočet: ${data.budget}\nTermín: ${data.timeline}\n\n${data.name}, ${data.email}, ${data.phone ?? ""}`;
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(`Poptávka: ${data.type}`)}&body=${encodeURIComponent(body)}`;
      setStatus("sent");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(site.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="form-status" role="status">
        Děkujeme. Ozveme se do dvou pracovních dnů. Pokud spěcháte, volejte {site.phone}.
      </div>
    );
  }

  const field = (name: string, label: string, input: React.ReactNode) => (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {input}
      {errors[name] && (
        <p className="error" id={`${name}-error`}>
          {errors[name]}
        </p>
      )}
    </div>
  );
  const aria = (name: string) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <form ref={formRef} className="form" onSubmit={submit} noValidate id="poptavka">
      <div className="grid" style={{ rowGap: 22 }}>
        <div className="span-wide">
          {field(
            "name",
            "Jméno a příjmení *",
            <input id="name" name="name" autoComplete="name" {...aria("name")} />,
          )}
        </div>
        <div className="span-wide">
          {field(
            "email",
            "E-mail *",
            <input id="email" name="email" type="email" autoComplete="email" {...aria("email")} />,
          )}
        </div>
        <div className="span-wide">
          {field(
            "phone",
            "Telefon",
            <input id="phone" name="phone" type="tel" autoComplete="tel" />,
          )}
        </div>
        <div className="span-wide">
          {field(
            "type",
            "Typ projektu",
            <Select id="type" name="type" options={TYPES} defaultValue={TYPES[0]!} />,
          )}
        </div>
        <div className="span-wide">
          {field(
            "location",
            "Místo stavby",
            <input id="location" name="location" placeholder="Obec nebo katastr" />,
          )}
        </div>
        <div className="span-half">
          {field(
            "budget",
            "Rozpočet stavby",
            <Select id="budget" name="budget" options={BUDGETS} defaultValue={BUDGETS[4]!} />,
          )}
        </div>
        <div className="span-half">
          {field(
            "timeline",
            "Kdy chcete začít",
            <input id="timeline" name="timeline" placeholder="Např. jaro 2027" />,
          )}
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          {field(
            "message",
            "O projektu *",
            <textarea
              id="message"
              name="message"
              placeholder="Pozemek, stávající stav, co potřebujete…"
              rows={1}
              onInput={(e) => {
                // grow (and shrink) with the text, one line at a time
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = `${t.scrollHeight}px`;
              }}
              {...aria("message")}
            />,
          )}
        </div>
      </div>
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: -9999 }}
      />
      <p className="label">
        Odesláním souhlasíte se zpracováním údajů pro odpověď na poptávku. Více v{" "}
        <Link className="u" href="/ochrana-soukromi">
          zásadách ochrany soukromí
        </Link>
        .
      </p>
      {status === "error" && (
        <p className="form-status" role="alert">
          Zprávu se nepodařilo odeslat. Zkuste to prosím znovu, nebo napište na {site.email}.
        </p>
      )}
      <div>
        <button type="submit" className="btn btn-lime" disabled={status === "sending"}>
          {status === "sending" ? "Odesíláme…" : "Odeslat poptávku"} <Arrow />
        </button>
      </div>
    </form>
  );
}
