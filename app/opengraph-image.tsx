import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const alt = "bydefaulthuman.fun — Hand-drawn UI for React";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const caveatFont = readFileSync(
    join(process.cwd(), "public/fonts/Caveat-Bold.ttf"),
  );

  return new ImageResponse(
    // Root — flex column, Satori requires explicit display on every node
    <div
      style={{
        width: "1200px",
        height: "630px",
        backgroundColor: "#faf9f6",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "72px 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── All decorative SVG in one element — Satori handles SVG children fine ── */}
      <svg
        width="1200"
        height="630"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
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
        <ellipse
          cx="110"
          cy="590"
          rx="80"
          ry="22"
          fill="#f5c842"
          opacity="0.28"
        />
        <circle cx="56" cy="56" r="8" fill="#1a1a1a" opacity="0.08" />
        <path
          d="M 80 408 Q 200 414 340 407 Q 480 402 560 410"
          fill="none"
          stroke="#e07b4f"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M 900 200 Q 940 240 900 280 Q 860 320 900 360 Q 940 400 900 440"
          fill="none"
          stroke="#5b8dd9"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.2"
        />
        <line
          x1="1080"
          y1="480"
          x2="1096"
          y2="496"
          stroke="#1a1a1a"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.1"
        />
        <line
          x1="1096"
          y1="480"
          x2="1080"
          y2="496"
          stroke="#1a1a1a"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.1"
        />
        <line
          x1="1110"
          y1="500"
          x2="1126"
          y2="516"
          stroke="#1a1a1a"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.1"
        />
        <line
          x1="1126"
          y1="500"
          x2="1110"
          y2="516"
          stroke="#1a1a1a"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.1"
        />
        <line
          x1="1060"
          y1="180"
          x2="1080"
          y2="200"
          stroke="#6abf69"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
        <line
          x1="1055"
          y1="192"
          x2="1082"
          y2="200"
          stroke="#6abf69"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
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
        <line
          x1="940"
          y1="400"
          x2="1080"
          y2="400"
          stroke="#1a1a1a"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.1"
        />
        <line
          x1="940"
          y1="418"
          x2="1060"
          y2="418"
          stroke="#1a1a1a"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.08"
        />
        <line
          x1="940"
          y1="434"
          x2="1100"
          y2="434"
          stroke="#1a1a1a"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.08"
        />
      </svg>

      {/* ── Dot cluster top right ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
          position: "absolute",
          top: 40,
          right: 60,
          opacity: 0.18,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: "#e07b4f",
          }}
        />
        <div
          style={{
            display: "flex",
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: "#5b8dd9",
          }}
        />
        <div
          style={{
            display: "flex",
            width: 14,
            height: 14,
            borderRadius: "50%",
            backgroundColor: "#6abf69",
          }}
        />
      </div>

      {/* ── Domain label ── */}
      <div style={{ display: "flex", marginBottom: "32px" }}>
        <div
          style={{
            display: "flex",
            fontSize: "15px",
            color: "#888",
            letterSpacing: "0.06em",
            fontFamily: "monospace",
          }}
        >
          bydefaulthuman.fun
        </div>
      </div>

      {/* ── Headline ── */}
      <div
        style={{
          display: "flex",
          fontSize: "88px",
          fontWeight: 700,
          color: "#1a1a1a",
          lineHeight: 1.05,
          marginBottom: "28px",
          maxWidth: "820px",
          fontFamily: "Caveat",
        }}
      >
        UI that looks hand-drawn.
      </div>

      {/* ── Tagline ── */}
      <div
        style={{
          display: "flex",
          fontSize: "26px",
          color: "#555",
          maxWidth: "620px",
          lineHeight: 1.5,
          fontFamily: "sans-serif",
          fontWeight: 400,
        }}
      >
        35+ React components. Wobbly borders via Rough.js. Accessible by
        default.
      </div>

      {/* ── Theme pills ── */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "12px",
          marginTop: "52px",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "8px 20px",
            backgroundColor: "#f0eeea",
            color: "#1a1a1a",
            fontSize: "16px",
            fontFamily: "monospace",
            borderRadius: "4px",
            letterSpacing: "0.04em",
          }}
        >
          pencil
        </div>
        <div
          style={{
            display: "flex",
            padding: "8px 20px",
            backgroundColor: "#1a1a1a",
            color: "#ffffff",
            fontSize: "16px",
            fontFamily: "monospace",
            borderRadius: "4px",
            letterSpacing: "0.04em",
          }}
        >
          ink
        </div>
        <div
          style={{
            display: "flex",
            padding: "8px 20px",
            backgroundColor: "#f5c842",
            color: "#1a1a1a",
            fontSize: "16px",
            fontFamily: "monospace",
            borderRadius: "4px",
            letterSpacing: "0.04em",
          }}
        >
          crayon
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Caveat",
          data: caveatFont,
          weight: 700,
          style: "normal",
        },
      ],
    },
  );
}
