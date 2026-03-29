import { readFileSync } from "fs";
import { ImageResponse } from "next/og";
import { join } from "path";

export const alt = "bydefaulthuman.fun — Hand-drawn UI for React";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const caveatFont = readFileSync(
  join(process.cwd(), "public/fonts/Caveat-Bold.ttf"),
);

export default async function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        backgroundColor: "#faf9f6", // warm off-white, like paper
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "72px 80px",
        fontFamily: "serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Paper texture dots — top right decorative cluster */}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 60,
          display: "flex",
          gap: "10px",
          opacity: 0.18,
        }}
      >
        {["#e07b4f", "#5b8dd9", "#6abf69"].map((color, i) => (
          <div
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: color,
            }}
          />
        ))}
      </div>

      {/* Hand-drawn border — SVG sketch rectangle */}
      <svg
        width="1200"
        height="630"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Outer sketch border — rough rectangle effect */}
        <rect
          x="24"
          y="24"
          width="1152"
          height="582"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="8 3"
          opacity="0.12"
        />

        {/* Inner accent line — pencil style */}
        <line
          x1="80"
          y1="540"
          x2="560"
          y2="540"
          stroke="#1a1a1a"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.15"
        />

        {/* Crayon-style bottom left blob */}
        <ellipse
          cx="110"
          cy="580"
          rx="80"
          ry="24"
          fill="#f5c842"
          opacity="0.25"
        />

        {/* Ink blot accent top left */}
        <circle cx="56" cy="56" r="8" fill="#1a1a1a" opacity="0.08" />

        {/* Rough underline under the tagline */}
        <path
          d="M 80 408 Q 200 414 340 407 Q 480 402 560 410"
          fill="none"
          stroke="#e07b4f"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* Decorative sketch squiggle — right side */}
        <path
          d="M 900 200 Q 940 240 900 280 Q 860 320 900 360 Q 940 400 900 440"
          fill="none"
          stroke="#5b8dd9"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.2"
        />

        {/* Small x marks */}
        <g
          stroke="#1a1a1a"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.1"
        >
          <line x1="1080" y1="480" x2="1096" y2="496" />
          <line x1="1096" y1="480" x2="1080" y2="496" />
          <line x1="1110" y1="500" x2="1126" y2="516" />
          <line x1="1126" y1="500" x2="1110" y2="516" />
        </g>

        {/* Pencil tick marks — like margin notes */}
        <g stroke="#6abf69" strokeWidth="2" strokeLinecap="round" opacity="0.4">
          <line x1="1060" y1="180" x2="1080" y2="200" />
          <line x1="1055" y1="192" x2="1082" y2="200" />
        </g>

        {/* Component preview sketches — top right */}
        {/* Sketchy button */}
        <rect
          x="920"
          y="260"
          width="180"
          height="44"
          rx="4"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="5 2"
          opacity="0.25"
        />
        {/* Sketchy input */}
        <rect
          x="920"
          y="320"
          width="220"
          height="36"
          rx="3"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="4 3"
          opacity="0.18"
        />
        {/* Sketchy card */}
        <rect
          x="920"
          y="372"
          width="220"
          height="100"
          rx="6"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="6 3"
          opacity="0.15"
        />
        {/* Card lines */}
        <line
          x1="940"
          y1="400"
          x2="1080"
          y2="400"
          stroke="#1a1a1a"
          strokeWidth="1.5"
          opacity="0.1"
          strokeLinecap="round"
        />
        <line
          x1="940"
          y1="418"
          x2="1060"
          y2="418"
          stroke="#1a1a1a"
          strokeWidth="1"
          opacity="0.08"
          strokeLinecap="round"
        />
        <line
          x1="940"
          y1="434"
          x2="1100"
          y2="434"
          stroke="#1a1a1a"
          strokeWidth="1"
          opacity="0.08"
          strokeLinecap="round"
        />
      </svg>

      {/* Domain badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "32px",
          gap: "8px",
        }}
      >
        <div
          style={{
            fontSize: "15px",
            color: "#888",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontFamily: "monospace",
          }}
        >
          bydefaulthuman.fun
        </div>
      </div>

      {/* Main headline */}
      <div
        style={{
          fontSize: "88px",
          fontWeight: 700,
          color: "#1a1a1a",
          lineHeight: 1.0,
          marginBottom: "28px",
          maxWidth: "820px",
          fontFamily: "serif",
          letterSpacing: "-0.02em",
        }}
      >
        UI that looks
        {"\n"}hand-drawn.
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: "26px",
          color: "#555",
          maxWidth: "620px",
          lineHeight: 1.5,
          fontFamily: "sans-serif",
          fontWeight: 400,
        }}
      >
        35+ React components with wobbly, sketchy borders. Built on Rough.js.
        Accessible by default.
      </div>

      {/* Bottom row — theme pills */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "52px",
        }}
      >
        {[
          { label: "pencil", color: "#1a1a1a", bg: "#f0eeea" },
          { label: "ink", color: "#fff", bg: "#1a1a1a" },
          { label: "crayon", color: "#1a1a1a", bg: "#f5c842" },
        ].map(({ label, color, bg }) => (
          <div
            key={label}
            style={{
              padding: "8px 20px",
              backgroundColor: bg,
              color,
              fontSize: "16px",
              fontFamily: "monospace",
              borderRadius: "4px",
              letterSpacing: "0.04em",
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Caveat", data: caveatFont, weight: 700 }],
    },
  );
}
