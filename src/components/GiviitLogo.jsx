/**
 * GiviitLogo — the official mark.
 *
 * Props:
 *   size         — px dimension of the icon square (default 36)
 *   variant      — 'green' | 'dark' | 'white' | 'flat'
 *   showWordmark — append "Giviit" text next to the mark (default false)
 *   wordmarkLight — use white wordmark text instead of dark (default false)
 *   className    — extra classes on the wrapper div
 */
export default function GiviitLogo({
  size = 36,
  variant = 'green',
  showWordmark = false,
  wordmarkLight = false,
  className = '',
}) {
  const BG  = { green: '#1a7a4a', dark: '#0f1f0f', white: '#ffffff', flat: 'none' }[variant];
  const ic  = variant === 'white' ? '#1a7a4a' : variant === 'flat' ? '#1a7a4a' : '#ffffff';
  const FLAT = variant === 'flat';

  /* stroke widths scale with icon size; base values calibrated at size=40 */
  const sw  = (2.8 * size) / 40;
  const sw2 = (2.0 * size) / 40;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Giviit logo"
        role="img"
      >
        {/* Background square */}
        {!FLAT && <rect width="40" height="40" rx="10" fill={BG} />}

        {/*
          G letterform — large arc from (26,15) counterclockwise to (26,27)
          (sweeps left side of circle), notch inward to (19,21).
          Arc circle center ≈ (18, 21), radius 10.
        */}
        <path
          d="M 26 15 A 10 10 0 1 0 26 27 L 26 21 L 19 21"
          stroke={ic}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/*
          Double-i mark — a short stem rises from the G's opening,
          then forks into two branches, each capped with a dot.
          The two dots reference the "ii" in Giviit and echo
          "Together We Rise" (two people rising).
        */}

        {/* Vertical stem up from G's top opening */}
        <line x1="26" y1="15" x2="26" y2="10"
          stroke={ic} strokeWidth={sw2} strokeLinecap="round" />

        {/* Left branch — left "i" stem */}
        <line x1="26" y1="10" x2="22.5" y2="7"
          stroke={ic} strokeWidth={sw2} strokeLinecap="round" />

        {/* Right branch — right "i" stem */}
        <line x1="26" y1="10" x2="30" y2="7"
          stroke={ic} strokeWidth={sw2} strokeLinecap="round" />

        {/* Left "i" dot */}
        <circle cx="22.5" cy="5.5" r="1.8" fill={ic} />

        {/* Right "i" dot */}
        <circle cx="30" cy="5.5" r="1.8" fill={ic} />
      </svg>

      {showWordmark && (
        <span
          style={{ fontSize: Math.round(size * 0.58), lineHeight: 1 }}
          className={`font-black tracking-tight select-none ${wordmarkLight ? 'text-white' : 'text-[#0f1f0f]'}`}
        >
          {wordmarkLight
            ? 'Giviit'
            : <>Giv<span style={{ color: '#f5a623' }}>ii</span>t</>
          }
        </span>
      )}
    </div>
  );
}

