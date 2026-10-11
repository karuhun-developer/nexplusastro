type NetworkArtVariant = 'data-center' | 'regional-center' | 'business';

export function NetworkArt({
  variant,
  className = '',
}: {
  variant: NetworkArtVariant;
  className?: string;
}) {
  return (
    <svg
      className={`nex-network-art ${className}`}
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse className="nex-art-halo" cx="100" cy="145" rx="70" ry="26" />
      <path className="nex-art-base" d="m12 145 87-45 89 45v9l-89 45-87-45Z" />
      <path className="nex-art-top" d="m12 145 87-45 89 45-89 45Z" />
      <path className="nex-art-edge" d="m12 150 87 45 89-45" />

      {variant === 'data-center' && (
        <>
          <NetworkRack x={23} y={29} width={101} height={149} />
          <NetworkRack x={74} y={7} width={96} height={142} />
          <path className="nex-art-fine" d="m126 158 25-13m-19 18 25-13m-19 18 25-13" />
        </>
      )}

      {variant === 'regional-center' && (
        <>
          <NetworkRack x={47} y={8} width={115} height={158} />
          <path className="nex-art-front" d="m24 138 46 24v13l-46-24Z" />
          <path className="nex-art-side" d="m70 162 38-20v13l-38 20Z" />
          <path className="nex-art-top" d="m24 138 38-20 46 24-38 20Z" />
          <path
            className="nex-art-red"
            d="m31 144 5 2.5v3l-5-2.5Zm9 4.5 5 2.5v3l-5-2.5Zm9 4.5 5 2.5v3l-5-2.5Z"
          />
        </>
      )}

      {variant === 'business' && <BusinessBlock />}
    </svg>
  );
}

function NetworkRack({
  x,
  y,
  width,
  height,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${width / 110} ${height / 160})`}>
      <path className="nex-art-front" d="M12 34 62 58V150L12 126Z" />
      <path className="nex-art-side" d="M62 58 100 38V130L62 150Z" />
      <path className="nex-art-top" d="M12 34 50 14 100 38 62 58Z" />
      <path className="nex-art-fine" d="m22 34 29-15 37 18-28 15zM20 28l41 20 30-16" />
      {[0, 1, 2, 3].map((row) => (
        <g key={row} transform={`translate(0 ${row * 21})`}>
          <path className="nex-art-slot" d="m19 49 36 18v13L19 62Z" />
          <path className="nex-art-fine" d="m33 58 17 8" />
          <path className="nex-art-red" d="m23 55 5 2.5v3L23 58Z" />
        </g>
      ))}
      <path
        className="nex-art-fine"
        d="m71 68 21-11m-21 16 21-11m-21 16 21-11m-21 16 21-11m-21 16 21-11m-21 16 21-11m-21 16 21-11"
      />
      <path className="nex-art-edge" d="M62 58v92" opacity=".7" />
    </g>
  );
}

function BusinessBlock() {
  return (
    <>
      <path className="nex-art-front" d="M48 49 113 82v87l-65-33Z" />
      <path className="nex-art-side" d="m113 82 43-22v87l-43 22Z" />
      <path className="nex-art-top" d="m48 49 43-22 65 33-43 22Z" />
      <path className="nex-art-fine" d="m60 50 31-16 53 26-31 16Z" />
      <path
        className="nex-art-light"
        d="m59 69 11 5.5v13L59 82Zm20 10 11 5.5v13L79 92Zm20 10 7 3.5v13l-7-3.5ZM59 95l11 5.5v13L59 108Zm20 10 11 5.5v13L79 118Zm20 10 7 3.5v13l-7-3.5Z"
        opacity=".72"
      />
      <path className="nex-art-slot" d="m77 132 15 7.5v19L77 151Z" />
      <path className="nex-art-red" d="m121 91 10-5v13l-10 5Zm17-9 10-5v13l-10 5Z" />
      <path className="nex-art-fine" d="m121 113 27-14m-27 24 27-14m-27 24 27-14" />
    </>
  );
}
