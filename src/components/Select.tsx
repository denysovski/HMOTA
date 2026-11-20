"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

interface Props {
  id: string;
  name: string;
  options: string[];
  defaultValue: string;
}

/**
 * Custom dropdown in the site's style (paper, ink, lime). Keyboard: Enter/Space/arrows open it,
 * arrows move, Enter picks, Escape closes, typing a letter jumps. Submits through a hidden input.
 */
export function Select({ id, name, options, defaultValue }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(Math.max(0, options.indexOf(defaultValue)));
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", down);
    return () => window.removeEventListener("pointerdown", down);
  }, [open]);

  // keyboard focus follows the active option while the list is open
  useEffect(() => {
    if (!open) return;
    const el = document.getElementById(`${listId}-${active}`);
    el?.focus({ preventScroll: true });
  }, [open, active, listId]);

  const pick = (i: number) => {
    setValue(options[i]!);
    setActive(i);
    setOpen(false);
    button.current?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    if (!open && ["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      setActive(Math.max(0, options.indexOf(value)));
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "Escape") {
      setOpen(false);
      button.current?.focus();
      return;
    }
    if (e.key === "Tab") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(options.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(active);
    } else if (e.key.length === 1) {
      const i = options.findIndex((o) => o.toLowerCase().startsWith(e.key.toLowerCase()));
      if (i >= 0) setActive(i);
    }
  };

  return (
    <div className="select" ref={root} data-open={open} onKeyDown={onKey}>
      <input type="hidden" name={name} value={value} />
      <button
        ref={button}
        id={id}
        type="button"
        className="select-button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{value}</span>
        <span className="select-chevron" aria-hidden="true" />
      </button>
      <ul className="select-list" id={listId} role="listbox" aria-labelledby={id} tabIndex={-1}>
        {options.map((o, i) => (
          <li
            key={o}
            id={`${listId}-${i}`}
            role="option"
            tabIndex={-1}
            aria-selected={o === value}
            data-active={i === active}
            onPointerEnter={() => setActive(i)}
            onClick={() => pick(i)}
          >
            {o}
          </li>
        ))}
      </ul>
    </div>
  );
}
