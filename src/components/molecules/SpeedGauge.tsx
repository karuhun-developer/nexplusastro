export function SpeedGauge({ mbps }: { readonly mbps: number }) {
  const rotation = -120 + Math.min(Math.log10(1 + mbps) / Math.log10(1001), 1) * 240;
  return (
    <svg viewBox="0 0 320 280" className="w-full" aria-hidden="true">
      <path
        d="M56 220 A120 120 0 1 1 264 220"
        fill="none"
        stroke="var(--rule)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {Array.from({ length: 25 }, (_, i) => (
        <line
          key={i}
          x1="160"
          x2="160"
          y1="36"
          y2={i % 4 === 0 ? '48' : '42'}
          transform={'rotate(' + (-120 + i * 10) + ' 160 156)'}
          stroke="var(--muted)"
          strokeWidth="1"
        />
      ))}
      <g
        style={{
          transform: 'rotate(' + rotation + 'deg)',
          transformOrigin: '160px 156px',
          transition: 'transform 160ms ease-out',
        }}
      >
        <path d="M156 156 L160 55 L164 156Z" fill="var(--color-accent)" />
        <circle cx="160" cy="156" r="8" fill="var(--color-accent)" />
      </g>
      <text x="42" y="246" fill="var(--muted)" fontSize="11">
        0
      </text>
      <text x="256" y="246" fill="var(--muted)" fontSize="11">
        1000
      </text>
      <text
        x="160"
        y="208"
        textAnchor="middle"
        fill="var(--ink)"
        fontSize="30"
        fontFamily="General Sans"
      >
        {mbps.toFixed(1)}
      </text>
      <text x="160" y="233" textAnchor="middle" fill="var(--muted)" fontSize="12">
        Mbps unduh
      </text>
    </svg>
  );
}
