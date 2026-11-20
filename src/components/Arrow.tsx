/** The site's one arrow: a black arrow in a lime circle. Swaps colours when its link is hovered. */
export function Arrow({ dir = "right" }: { dir?: "right" | "up-right" }) {
  return (
    <span className="arrow" aria-hidden="true" data-dir={dir}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
        <path d="M5 12h13M13 6.5 18.5 12 13 17.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
