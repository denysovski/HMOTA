/**
 * Quiet background drawings for the emptier sections: hairline geometry in the spirit of the
 * site (stepped concrete, arcs, a grid), with one small lime accent. Purely decorative.
 */
export function Deco({
  kind,
  className = "",
}: {
  kind: "steps" | "arcs" | "grid";
  className?: string;
}) {
  return (
    <svg className={`deco deco-${kind} ${className}`} viewBox="0 0 400 400" aria-hidden="true">
      {kind === "steps" && (
        <g fill="none" stroke="currentColor" strokeWidth="1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M${40 + i * 50} ${360 - i * 52} h50 v52`} />
          ))}
          <path d="M40 360 H360 V48" />
          <rect x="300" y="48" width="60" height="60" fill="#c8ff2e" stroke="none" opacity="0.9" />
        </g>
      )}
      {kind === "arcs" && (
        <g fill="none" stroke="currentColor" strokeWidth="1">
          {[60, 110, 160, 210, 260, 310].map((r) => (
            <path key={r} d={`M${400 - r} 400 A${r} ${r} 0 0 1 400 ${400 - r}`} />
          ))}
          <circle cx="400" cy="400" r="34" fill="#c8ff2e" stroke="none" />
        </g>
      )}
      {kind === "grid" && (
        <g fill="none" stroke="currentColor" strokeWidth="1">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <path key={`h${i}`} d={`M0 ${i * 50} H400 M${i * 50} 0 V400`} />
          ))}
          <rect x="250" y="100" width="100" height="50" fill="#c8ff2e" stroke="none" />
          <path d="M0 400 L400 0" />
        </g>
      )}
    </svg>
  );
}
