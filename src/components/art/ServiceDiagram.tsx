import { useId } from "react";
import type { Service } from "@/lib/content";
function Cabinet({ transform = "" }: { transform?: string }) {
  return (
    <g transform={transform}>
      <path className="nex-product-metal-side" d="M0 0 36-20 36 86 0 107Z" />
      <path className="nex-product-metal-front" d="M-52-24 0 0 0 107-52 83Z" />
      <path className="nex-product-metal-top" d="m-52-24 36-20 52 24L0 0Z" />
      {[0, 1, 2, 3].map((row) => (
        <g key={row} transform={`translate(0 ${row * 21})`}>
          <path className="nex-product-metal-slot" d="m-44-9 36 17v14L-44 5Z" />
          <path className="nex-product-slot-line" d="m-38-1 18 8" />
          <path className="nex-product-signal" d="m-14 10 2 1" />
        </g>
      ))}
      <path className="nex-product-fine" d="m6 10 23-13v75L6 85" />
      <path className="nex-product-signal" d="M0 107V0" />
    </g>
  );
}

function Monitor({ transform = "" }: { transform?: string }) {
  return (
    <g transform={transform}>
      <path className="nex-product-metal-front" d="M-58-42Q-58-48-52-48H52Q58-48 58-42V30Q58 36 52 36H-52Q-58 36-58 30Z" />
      <path className="nex-product-metal-slot" d="M-51-40H51V24H-51Z" />
      <path className="nex-product-fine" d="M-15 46H15M0 36V45" />
      <path className="nex-product-screen-content" d="M-45 14-11-21 9-3 22-14 45 14Z" />
      <path className="nex-product-signal" d="M-51 24H51" />
      <circle className="nex-product-screen-light" cx="28" cy="-23" r="5" />
    </g>
  );
}


export function ServiceDiagram({ service }: { service: Service }) {
  const id = useId();
  const titleId = `${id}-title`;
  const floorId = `${id}-floor`;
  const haloId = `${id}-halo`;
  return (
    <svg
      viewBox="0 0 480 270"
      className={`nex-product-art nex-product-art-${service.id}`}
      role="img"
      aria-labelledby={titleId}
    >

      <title id={titleId}>{`Ilustrasi layanan ${service.title}`}</title>
      <defs>
        <radialGradient id={floorId}>
          <stop stopColor="var(--color-accent)" stopOpacity=".2" />
          <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={haloId}>
          <stop stopColor="var(--color-metal-light)" stopOpacity=".1" />
          <stop offset="1" stopColor="var(--color-metal-light)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="240" cy="118" rx="175" ry="115" fill={`url(#${haloId})`} />
      <ellipse cx="240" cy="220" rx="200" ry="44" fill={`url(#${floorId})`} />

      {service.id === "internet-dedicated" && (
        <g>
          <path className="nex-product-ground" d="M60 214 222 129 427 220 265 264Z" />
          <path className="nex-product-circuit" d="m70 203 61-32 57 25m84-46 81 36 58-30M187 243l68-36 114 52" />
          <path className="nex-product-circuit-glow" d="m81 219 105-55 127 57 75-40" />
          <Cabinet transform="translate(308 99) scale(.8)" />
          <Cabinet transform="translate(236 104) scale(1.12)" />
          <path className="nex-product-metal-top" d="m86 173 40-21 72 33-40 22Z" />
          <path className="nex-product-metal-front" d="m86 173 72 34v16l-72-34Z" />
          <path className="nex-product-metal-side" d="m158 207 40-22v16l-40 22Z" />
          <path className="nex-product-signal" d="m98 185 8 4m5 3 8 4m5 2 8 4m5 2 8 4" />
          <circle className="nex-product-node" cx="388" cy="181" r="4" />
          <circle className="nex-product-node" cx="81" cy="219" r="4" />
        </g>
      )}

      {service.id === "metro-e" && (
        <g>
          <path className="nex-product-ground" d="m39 205 113-58 103 48-113 59Zm206-22 99-52 99 46-99 53Z" />
          <path className="nex-product-circuit" d="m115 225 72 34 97-50 64 29" />
          <path className="nex-product-circuit-glow" d="m126 208 74 35 95-50 49 22" />
          <Cabinet transform="translate(147 104) scale(.88)" />
          <Cabinet transform="translate(344 88) scale(.88)" />
          <circle className="nex-product-node" cx="234" cy="225" r="4" />
          <path className="nex-product-signal" d="m221 211 14-7 14 7m-28 26 14 7 14-7" />
        </g>
      )}

      {service.id === "vsat" && (
        <g>
          <path className="nex-product-ground" d="m90 227 103-53 112 51-105 39Z" />
          <path className="nex-product-metal-front" d="m183 170 18 3 24 57-59-2Z" />
          <path className="nex-product-metal-top" d="m169 223 34-15 37 18-33 17Z" />
          <path className="nex-product-metal-side" d="m131 137 13-13 105 37-9 14c-33 20-87 0-109-38Z" />
          <ellipse className="nex-product-dish" cx="191" cy="144" rx="61" ry="23" transform="rotate(22 191 144)" />
          <path className="nex-product-fine" d="m145 128 59-34 33 64m-46-14 13-50" />
          <circle className="nex-product-node" cx="204" cy="94" r="4" />
          <path className="nex-product-circuit" d="m215 83 75-51m-53 67 69-47" strokeDasharray="3 8" />
          <g transform="translate(325 46) rotate(-34)">
            <path className="nex-product-metal-front" d="M-13-14H13V14H-13Z" />
            <path className="nex-product-metal-top" d="M-59-15H-23V15H-59Zm82 0h36v30H23Z" />
            <path className="nex-product-fine" d="M-59-5H-23M-59 5H-23M-47-15V15M-35-15V15M23-5H59M23 5H59M35-15V15M47-15V15M-23 0H-13M13 0H23" />
            <path className="nex-product-signal" d="M-59 15H-23M23 15H59" />
            <circle className="nex-product-node" r="3" />
          </g>
        </g>
      )}

      {service.id === "managed-services" && (
        <g>
          <path className="nex-product-circuit" d="M95 94h84l61 53 77-65h67M103 219h63l74-72 82 65h61M240 147V44" />
          <path className="nex-product-circuit-glow" d="M95 105h75l70 62 89-74h55M103 230h70l67-63 72 57h71" />
          <rect className="nex-product-metal-front" x="190" y="99" width="100" height="100" rx="19" />
          <rect className="nex-product-metal-slot" x="199" y="108" width="82" height="82" rx="13" />
          <path className="nex-product-mark" d="M218 166v-33l28 33v-33m7 10h17m-8-8v16" />
          {[[95, 99], [384, 87], [103, 224], [383, 218], [240, 44]].map(([x, y], index) => (
            <g key={index} transform={`translate(${x} ${y})`}>
              <rect className="nex-product-metal-front" x="-20" y="-20" width="40" height="40" rx="10" />
              <rect className="nex-product-metal-slot" x="-12" y="-12" width="24" height="24" rx="5" />
              <circle className="nex-product-node" r="3" />
            </g>
          ))}
          <path className="nex-product-signal" d="M218 199h44" />
        </g>
      )}

      {service.id === "iptv-hospitality" && (
        <g>
          <path className="nex-product-circuit" d="M155 119v82h174v-60M240 201v37" />
          <path className="nex-product-circuit-glow" d="M153 205h176M240 205v30" />
          <Monitor transform="translate(156 105) scale(1.12)" />
          <Monitor transform="translate(334 156) scale(.88)" />
          <path className="nex-product-metal-front" d="M208 229h64v18h-64Z" />
          <path className="nex-product-metal-top" d="m208 229 12-8h64l-12 8Z" />
          <path className="nex-product-metal-side" d="m272 229 12-8v18l-12 8Z" />
          <path className="nex-product-signal" d="M216 238h5m5 0h5" />
        </g>
      )}
    </svg>
  );
}
