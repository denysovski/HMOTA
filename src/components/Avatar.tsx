import type { Person } from "@/lib/site";

/**
 * Abstract portraits: a head, shoulders and one defining feature (hair, beard, glasses),
 * drawn in the site's ink line with a lime disc behind. Not likenesses of anyone.
 */
export function Avatar({ kind, title }: { kind: Person["avatar"]; title: string }) {
  const ink = "#0a0a0a";
  const skin = "#f6f6f4";
  return (
    <svg viewBox="0 0 200 240" role="img" aria-label={title} className="avatar">
      <rect width="200" height="240" fill="#ffffff" />
      <circle
        cx={kind === "beard" || kind === "glasses" ? 128 : 74}
        cy="82"
        r="46"
        fill="#c8ff2e"
      />
      {/* hair behind the head */}
      {kind === "long" && (
        <path d="M58 96 C52 52 76 34 100 34 C126 34 150 52 142 98 L148 176 L52 176 Z" fill={ink} />
      )}
      {kind === "bun" && <circle cx="100" cy="40" r="17" fill={ink} />}
      {/* shoulders */}
      <path
        d="M34 240 C34 188 62 168 100 168 C138 168 166 188 166 240"
        fill={kind === "beard" ? "#dcdcd8" : skin}
        stroke={ink}
        strokeWidth="2"
      />
      {kind === "beard" && (
        <path d="M86 170 L100 192 L114 170" fill="none" stroke={ink} strokeWidth="2" />
      )}
      {/* neck and head */}
      <path d="M90 140 L90 168 L110 168 L110 140" fill={skin} stroke={ink} strokeWidth="2" />
      <ellipse cx="100" cy="104" rx="34" ry="42" fill={skin} stroke={ink} strokeWidth="2" />
      {/* hair and features in front */}
      {kind === "long" && (
        <path
          d="M66 98 C68 70 84 60 100 60 C118 60 132 72 134 98 C120 86 104 78 84 82 C76 86 70 92 66 98 Z"
          fill={ink}
        />
      )}
      {kind === "short" && (
        <path
          d="M64 102 C60 70 80 58 102 58 C124 58 140 72 136 104 C132 84 118 74 100 76 C86 78 74 84 70 108 Z"
          fill={ink}
        />
      )}
      {kind === "bun" && (
        <path
          d="M66 98 C68 70 84 60 100 60 C118 60 132 70 134 98 C126 80 112 72 100 72 C88 72 74 80 66 98 Z"
          fill={ink}
        />
      )}
      {kind === "curly" && (
        <g fill={ink}>
          {[
            [70, 80],
            [82, 66],
            [98, 60],
            [114, 64],
            [128, 76],
            [134, 92],
            [66, 96],
          ].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r="12" />
          ))}
        </g>
      )}
      {kind === "glasses" && (
        <>
          <path
            d="M66 96 C66 70 82 60 100 60 C120 60 134 70 134 96 C126 78 74 78 66 96 Z"
            fill={ink}
          />
          <g fill="none" stroke={ink} strokeWidth="2.5">
            <circle cx="86" cy="106" r="11" />
            <circle cx="114" cy="106" r="11" />
            <path d="M97 106 L103 106" />
          </g>
        </>
      )}
      {kind === "beard" && (
        <>
          {/* receding grey hair and a full beard */}
          <path
            d="M66 100 C64 82 70 72 78 68 L80 86 Z M134 100 C136 82 130 72 122 68 L120 86 Z"
            fill="#9a9a9a"
          />
          <path
            d="M68 112 C70 140 84 150 100 150 C116 150 130 140 132 112 C124 124 112 128 100 128 C88 128 76 124 68 112 Z"
            fill="#9a9a9a"
            stroke={ink}
            strokeWidth="2"
          />
          <path d="M90 126 C96 122 104 122 110 126" fill="none" stroke={ink} strokeWidth="2" />
        </>
      )}
      {/* eyes for everyone without glasses */}
      {kind !== "glasses" && (
        <g fill={ink}>
          <circle cx="88" cy="106" r="2.6" />
          <circle cx="112" cy="106" r="2.6" />
        </g>
      )}
    </svg>
  );
}
