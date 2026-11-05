import type { ArtKey, Tone } from "@/lib/products";

type Palette = {
  bg: string;
  plate: string;
  ink: string;
  accent: string;
  soft: string;
};

const palettes: Record<Tone, Palette> = {
  cream: {
    bg: "#f1ede4",
    plate: "#fbf9f4",
    ink: "#201f1c",
    accent: "#697b60",
    soft: "#ded8cb",
  },
  beige: {
    bg: "#e9e1d3",
    plate: "#f4eee4",
    ink: "#201f1c",
    accent: "#697b60",
    soft: "#d5c9b7",
  },
  dark: {
    bg: "#26241f",
    plate: "#35322b",
    ink: "#f7f5f0",
    accent: "#a9b79e",
    soft: "#46423a",
  },
  olive: {
    bg: "#697b60",
    plate: "#7d8e73",
    ink: "#f7f5f0",
    accent: "#e9e1d3",
    soft: "#8b9b81",
  },
};

const stroke = {
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Art({ art, c }: { art: ArtKey; c: Palette }) {
  switch (art) {
    case "earbuds":
      return (
        <g>
          <ellipse cx="200" cy="278" rx="94" ry="10" fill={c.ink} opacity="0.08" />
          <rect
            x="124"
            y="184"
            width="152"
            height="86"
            rx="34"
            fill={c.plate}
            stroke={c.ink}
            strokeWidth="2.5"
          />
          <path
            d="M124 216h152"
            stroke={c.ink}
            strokeWidth="1.4"
            opacity="0.25"
          />
          <circle cx="200" cy="250" r="4" fill={c.accent} />
          <g>
            <circle
              cx="166"
              cy="116"
              r="27"
              fill={c.plate}
              stroke={c.ink}
              strokeWidth="2.5"
            />
            <circle cx="166" cy="116" r="9" fill={c.accent} opacity="0.85" />
            <path
              d="M166 143v30"
              stroke={c.ink}
              strokeWidth="13"
              {...stroke}
            />
            <path
              d="M166 143v30"
              stroke={c.plate}
              strokeWidth="8"
              {...stroke}
            />
            <circle cx="166" cy="174" r="4" fill={c.accent} />
          </g>
          <g>
            <circle
              cx="234"
              cy="116"
              r="27"
              fill={c.plate}
              stroke={c.ink}
              strokeWidth="2.5"
            />
            <circle cx="234" cy="116" r="9" fill={c.accent} opacity="0.85" />
            <path
              d="M234 143v30"
              stroke={c.ink}
              strokeWidth="13"
              {...stroke}
            />
            <path
              d="M234 143v30"
              stroke={c.plate}
              strokeWidth="8"
              {...stroke}
            />
            <circle cx="234" cy="174" r="4" fill={c.accent} />
          </g>
        </g>
      );
    case "speaker":
      return (
        <g>
          <ellipse cx="200" cy="276" rx="66" ry="9" fill={c.ink} opacity="0.08" />
          <rect
            x="150"
            y="60"
            width="100"
            height="200"
            rx="46"
            fill={c.plate}
            stroke={c.ink}
            strokeWidth="2.5"
          />
          <circle
            cx="200"
            cy="90"
            r="9"
            fill="none"
            stroke={c.accent}
            strokeWidth="2.5"
          />
          {[0, 1, 2, 3, 4].map((row) =>
            [0, 1, 2].map((col) => (
              <circle
                key={`${row}-${col}`}
                cx={178 + col * 22}
                cy={132 + row * 22}
                r="2.4"
                fill={c.ink}
                opacity="0.45"
              />
            ))
          )}
          <path
            d="M178 242h44"
            stroke={c.ink}
            strokeWidth="2"
            opacity="0.3"
            {...stroke}
          />
        </g>
      );
    case "watch":
      return (
        <g>
          <ellipse cx="200" cy="288" rx="52" ry="8" fill={c.ink} opacity="0.08" />
          <rect x="174" y="26" width="52" height="268" rx="24" fill={c.accent} opacity="0.35" />
          <path
            d="M174 96h52M174 224h52"
            stroke={c.ink}
            strokeWidth="1.2"
            opacity="0.25"
          />
          <rect
            x="140"
            y="104"
            width="120"
            height="112"
            rx="32"
            fill={c.plate}
            stroke={c.ink}
            strokeWidth="2.5"
          />
          <circle cx="200" cy="160" r="36" fill={c.soft} stroke={c.ink} strokeWidth="1.6" />
          <path
            d="M200 140v20l13 9"
            stroke={c.ink}
            strokeWidth="2.4"
            {...stroke}
          />
          <circle cx="200" cy="160" r="3" fill={c.accent} />
          <path d="M262 144h8v20h-8" fill={c.plate} stroke={c.ink} strokeWidth="2" {...stroke} />
        </g>
      );
    case "hoodie":
      return (
        <g>
          <ellipse cx="200" cy="288" rx="94" ry="8" fill={c.ink} opacity="0.07" />
          <path
            d="M154 94 112 128l-14 68 40 15 4 48h116l4-48 40-15-14-68-42-34c-14-9-28-13-46-13s-32 4-46 13Z"
            fill={c.plate}
            stroke={c.ink}
            strokeWidth="2.5"
          />
          <path
            d="M154 94c6 18 24 30 46 30s40-12 46-30c-13-8-28-12-46-12s-33 4-46 12Z"
            fill={c.bg}
            stroke={c.ink}
            strokeWidth="2"
          />
          <path
            d="M176 122v28M224 122v28"
            stroke={c.accent}
            strokeWidth="3"
            {...stroke}
          />
          <circle cx="176" cy="152" r="3" fill={c.accent} />
          <circle cx="224" cy="152" r="3" fill={c.accent} />
          <path
            d="M144 210h112v36c0 6-5 11-11 11h-90c-6 0-11-5-11-11v-36Z"
            fill={c.bg}
            stroke={c.ink}
            strokeWidth="2"
          />
          <path d="M138 246h124" stroke={c.ink} strokeWidth="1.4" opacity="0.25" />
        </g>
      );
    case "tee":
      return (
        <g>
          <ellipse cx="200" cy="288" rx="84" ry="8" fill={c.ink} opacity="0.07" />
          <path
            d="M152 88 106 118l22 54 26-12v110h92V160l26 12 22-54-46-30c-11-7-23-10-38-10s-27 3-38 10Z"
            fill={c.plate}
            stroke={c.ink}
            strokeWidth="2.5"
          />
          <path
            d="M168 82c4 14 16 22 32 22s28-8 32-22"
            fill="none"
            stroke={c.ink}
            strokeWidth="2.2"
          />
          <path d="M150 158h100" stroke={c.ink} strokeWidth="1.3" opacity="0.2" />
        </g>
      );
    case "cap":
      return (
        <g>
          <ellipse cx="196" cy="252" rx="102" ry="10" fill={c.ink} opacity="0.07" />
          <path
            d="M116 184c0-56 38-94 84-94s84 38 84 94H116Z"
            fill={c.plate}
            stroke={c.ink}
            strokeWidth="2.5"
          />
          <path
            d="M200 90v94"
            stroke={c.ink}
            strokeWidth="1.6"
            opacity="0.3"
          />
          <path
            d="M158 96c-10 26-14 56-14 88M242 96c10 26 14 56 14 88"
            stroke={c.ink}
            strokeWidth="1.4"
            opacity="0.2"
          />
          <circle cx="200" cy="90" r="5" fill={c.accent} />
          <path
            d="M116 184h168c14 0 26 8 30 20-18 10-42 14-76 14h-92c-24 0-38-5-46-14 8-12 12-20 16-20Z"
            fill={c.soft}
            stroke={c.ink}
            strokeWidth="2.4"
          />
          <path
            d="M168 202c22 7 46 7 68 0"
            stroke={c.ink}
            strokeWidth="1.3"
            opacity="0.25"
          />
        </g>
      );
    case "socks":
      return (
        <g>
          <ellipse cx="200" cy="276" rx="92" ry="9" fill={c.ink} opacity="0.07" />
          <g transform="rotate(-8 165 160)">
            <rect x="132" y="70" width="52" height="24" rx="6" fill={c.accent} opacity="0.7" />
            <path
              d="M132 92h52v104c0 24-10 44-32 52-18-10-20-30-20-52V92Z"
              fill={c.plate}
              stroke={c.ink}
              strokeWidth="2.4"
            />
            <path
              d="M132 112h52M138 126h40"
              stroke={c.ink}
              strokeWidth="1.2"
              opacity="0.2"
            />
          </g>
          <g transform="rotate(8 238 180)">
            <rect x="216" y="96" width="52" height="24" rx="6" fill={c.accent} opacity="0.45" />
            <path
              d="M216 118h52v92c0 24-8 40-28 48-18-10-24-28-24-50v-90Z"
              fill={c.plate}
              stroke={c.ink}
              strokeWidth="2.4"
            />
            <path
              d="M216 138h52M222 152h40"
              stroke={c.ink}
              strokeWidth="1.2"
              opacity="0.2"
            />
          </g>
        </g>
      );
    case "case":
      return (
        <g>
          <ellipse cx="200" cy="262" rx="80" ry="9" fill={c.ink} opacity="0.08" />
          <rect
            x="124"
            y="112"
            width="152"
            height="112"
            rx="34"
            fill={c.plate}
            stroke={c.ink}
            strokeWidth="2.5"
          />
          <path
            d="M124 158h152"
            stroke={c.ink}
            strokeWidth="1.6"
            opacity="0.3"
          />
          <path
            d="M140 158h120"
            stroke={c.accent}
            strokeWidth="3"
            strokeDasharray="6 5"
          />
          <circle cx="256" cy="112" r="14" fill={c.bg} stroke={c.ink} strokeWidth="2.4" />
          <path d="M276 128v24" stroke={c.ink} strokeWidth="4" {...stroke} />
          <rect x="270" y="148" width="12" height="20" rx="4" fill={c.ink} opacity="0.5" />
          <circle cx="200" cy="196" r="4" fill={c.accent} />
        </g>
      );
    case "bag":
      return (
        <g>
          <ellipse cx="200" cy="278" rx="84" ry="9" fill={c.ink} opacity="0.07" />
          <path
            d="M138 142c8-52 32-78 62-78s54 26 62 78"
            fill="none"
            stroke={c.ink}
            strokeWidth="6"
            {...stroke}
          />
          <path
            d="M138 142c8-52 32-78 62-78s54 26 62 78"
            fill="none"
            stroke={c.soft}
            strokeWidth="2.5"
            {...stroke}
          />
          <rect
            x="112"
            y="142"
            width="176"
            height="112"
            rx="26"
            fill={c.plate}
            stroke={c.ink}
            strokeWidth="2.5"
          />
          <path
            d="M112 174c28-20 60-30 88-30s60 10 88 30v12H112v-12Z"
            fill={c.soft}
            stroke={c.ink}
            strokeWidth="2"
          />
          <rect x="186" y="186" width="28" height="18" rx="5" fill={c.accent} />
          <path d="M200 250v-8" stroke={c.ink} strokeWidth="1.6" opacity="0.3" />
        </g>
      );
    case "sunglasses":
      return (
        <g>
          <ellipse cx="200" cy="238" rx="106" ry="9" fill={c.ink} opacity="0.07" />
          <path
            d="M92 146c0-20 14-32 34-32h48c10 0 18 6 20 16l6 22c3 12-6 24-18 24h-50c-24 0-40-12-40-30Z"
            fill={c.plate}
            stroke={c.ink}
            strokeWidth="2.6"
          />
          <path
            d="M308 146c0-20-14-32-34-32h-48c-10 0-18 6-20 16l-6 22c-3 12 6 24 18 24h50c24 0 40-12 40-30Z"
            fill={c.plate}
            stroke={c.ink}
            strokeWidth="2.6"
          />
          <path
            d="M158 140h84"
            stroke={c.ink}
            strokeWidth="2.4"
            {...stroke}
          />
          <path
            d="M108 112 78 94M292 112l30-18"
            stroke={c.ink}
            strokeWidth="3"
            {...stroke}
          />
          <path
            d="M120 132c12-8 26-10 38-8"
            stroke={c.ink}
            strokeWidth="1.4"
            opacity="0.25"
          />
          <path
            d="M242 124c12-2 26 0 38 8"
            stroke={c.ink}
            strokeWidth="1.4"
            opacity="0.25"
          />
        </g>
      );
    case "cable":
      return (
        <g>
          <ellipse cx="200" cy="274" rx="96" ry="9" fill={c.ink} opacity="0.07" />
          <path
            d="M122 246c-44-56-24-142 58-162 74-18 134 34 108 92-20 44-78 54-102 22-18-24-4-54 22-58"
            fill="none"
            stroke={c.ink}
            strokeWidth="13"
            {...stroke}
          />
          <path
            d="M122 246c-44-56-24-142 58-162 74-18 134 34 108 92-20 44-78 54-102 22-18-24-4-54 22-58"
            fill="none"
            stroke={c.plate}
            strokeWidth="7"
            {...stroke}
          />
          <path
            d="M122 246c-44-56-24-142 58-162 74-18 134 34 108 92-20 44-78 54-102 22-18-24-4-54 22-58"
            fill="none"
            stroke={c.ink}
            strokeWidth="1.2"
            strokeDasharray="3 7"
            opacity="0.5"
          />
          <rect
            x="100"
            y="236"
            width="34"
            height="26"
            rx="7"
            fill={c.plate}
            stroke={c.ink}
            strokeWidth="2.4"
            transform="rotate(24 117 249)"
          />
          <rect
            x="272"
            y="158"
            width="34"
            height="26"
            rx="7"
            fill={c.plate}
            stroke={c.ink}
            strokeWidth="2.4"
            transform="rotate(-18 289 171)"
          />
        </g>
      );
    case "lamp":
      return (
        <g>
          <ellipse cx="200" cy="278" rx="66" ry="9" fill={c.ink} opacity="0.08" />
          <circle cx="200" cy="120" r="74" fill={c.accent} opacity="0.14" />
          <path
            d="M152 76h96l34 94H118l34-94Z"
            fill={c.plate}
            stroke={c.ink}
            strokeWidth="2.5"
          />
          <path d="M118 170h164" stroke={c.ink} strokeWidth="2.5" {...stroke} />
          <path d="M200 170v74" stroke={c.ink} strokeWidth="4" {...stroke} />
          <ellipse
            cx="200"
            cy="252"
            rx="50"
            ry="13"
            fill={c.plate}
            stroke={c.ink}
            strokeWidth="2.5"
          />
          <path
            d="M166 106c20-8 48-8 68 0"
            stroke={c.ink}
            strokeWidth="1.3"
            opacity="0.25"
          />
          <circle cx="200" cy="238" r="3.5" fill={c.accent} />
        </g>
      );
    case "mug":
      return (
        <g>
          <ellipse cx="196" cy="266" rx="86" ry="9" fill={c.ink} opacity="0.07" />
          <path
            d="M136 116h120v96c0 28-18 46-46 46h-28c-28 0-46-18-46-46v-96Z"
            fill={c.plate}
            stroke={c.ink}
            strokeWidth="2.5"
          />
          <path
            d="M256 142c30 0 46 14 46 36s-16 36-46 36"
            fill="none"
            stroke={c.ink}
            strokeWidth="2.5"
            {...stroke}
          />
          <ellipse cx="196" cy="116" rx="60" ry="11" fill={c.soft} stroke={c.ink} strokeWidth="2.4" />
          <ellipse cx="196" cy="116" rx="50" ry="6" fill={c.accent} opacity="0.35" />
          <path
            d="M172 82c-8-10 8-14 0-28M200 78c-8-10 8-16 0-30M228 82c-8-10 8-14 0-28"
            fill="none"
            stroke={c.accent}
            strokeWidth="2.4"
            {...stroke}
          />
        </g>
      );
    case "candle":
      return (
        <g>
          <ellipse cx="200" cy="264" rx="66" ry="9" fill={c.ink} opacity="0.08" />
          <rect
            x="150"
            y="128"
            width="100"
            height="126"
            rx="16"
            fill={c.plate}
            stroke={c.ink}
            strokeWidth="2.5"
          />
          <path d="M150 160h100" stroke={c.ink} strokeWidth="1.8" opacity="0.3" />
          <rect x="170" y="188" width="60" height="38" rx="4" fill={c.accent} opacity="0.55" />
          <path d="M200 188v-18" stroke={c.ink} strokeWidth="2" />
          <path
            d="M200 140c12 12 12 26 0 34-12-8-12-22 0-34Z"
            fill={c.accent}
            stroke={c.ink}
            strokeWidth="1.6"
          />
          <path
            d="M200 154c5 5 5 11 0 15-5-4-5-10 0-15Z"
            fill={c.plate}
          />
          <path d="M178 208h44" stroke={c.ink} strokeWidth="1.2" opacity="0.3" />
        </g>
      );
    case "throw":
      return (
        <g>
          <ellipse cx="200" cy="276" rx="96" ry="9" fill={c.ink} opacity="0.07" />
          <rect
            x="102"
            y="172"
            width="196"
            height="82"
            rx="16"
            fill={c.plate}
            stroke={c.ink}
            strokeWidth="2.5"
          />
          <path
            d="M102 206h196M102 226h196"
            stroke={c.accent}
            strokeWidth="5"
            opacity="0.45"
          />
          <path
            d="M124 172V112c0-8 6-14 14-14h124c8 0 14 6 14 14v60"
            fill={c.soft}
            stroke={c.ink}
            strokeWidth="2.5"
          />
          <path
            d="M146 98v74M178 98v74M210 98v74M242 98v74"
            stroke={c.ink}
            strokeWidth="1.2"
            opacity="0.18"
          />
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <path
              key={index}
              d={`M${118 + index * 32} 254v14`}
              stroke={c.ink}
              strokeWidth="2"
              opacity="0.35"
              {...stroke}
            />
          ))}
        </g>
      );
    default:
      return null;
  }
}

type ProductArtProps = {
  art: ArtKey;
  tone?: Tone;
  title?: string;
  className?: string;
};

export function ProductArt({
  art,
  tone = "cream",
  title,
  className = "",
}: ProductArtProps) {
  const palette = palettes[tone];

  return (
    <svg
      viewBox="0 0 400 320"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
    >
      {title ? <title>{title}</title> : null}
      <rect width="400" height="320" fill={palette.bg} />
      <circle cx="200" cy="158" r="118" fill={palette.plate} opacity="0.35" />
      <Art art={art} c={palette} />
      <circle cx="32" cy="32" r="2.5" fill={palette.ink} opacity="0.25" />
      <circle cx="368" cy="288" r="2.5" fill={palette.ink} opacity="0.25" />
    </svg>
  );
}
