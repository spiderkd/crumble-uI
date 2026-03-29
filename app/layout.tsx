import "./global.css";
import { RootProvider } from "fumadocs-ui/provider";
import { Caveat, Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CrumbleProvider } from "@/lib/crumble-context";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "bydefaulthuman.fun",
    template: "%s — bydefaulthuman.fun",
  },
  description:
    "A hand-drawn React component library. Wobbly, sketchy borders powered by Rough.js. Accessible by default.",
  metadataBase: new URL("https://bydefaulthuman.fun"),
  openGraph: {
    title: "bydefaulthuman.fun",
    description:
      "A hand-drawn React component library. Wobbly, sketchy borders powered by Rough.js. Accessible by default.",
    url: "https://bydefaulthuman.fun",
    siteName: "bydefaulthuman.fun",
    locale: "en_US",
    type: "website",
    // og:image is wired up automatically from app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "bydefaulthuman.fun",
    description:
      "A hand-drawn React component library. Wobbly, sketchy borders powered by Rough.js.",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute h-0 w-0 overflow-hidden"
        >
          <defs>
            <filter id="crumble-wobble-pencil">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.035"
                numOctaves="3"
                result="noise"
                seed="2"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="2"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            <filter id="crumble-wobble-ink">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.02"
                numOctaves="2"
                result="noise"
                seed="5"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="1.5"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            <filter id="crumble-wobble-crayon">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.05"
                numOctaves="4"
                result="noise"
                seed="8"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="4"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
        <RootProvider>
          <CrumbleProvider theme="pencil">{children}</CrumbleProvider>
        </RootProvider>
      </body>
    </html>
  );
}
