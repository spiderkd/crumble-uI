"use client";

/**
 * Crumble — Hero Section Template
 * Full-page hero with animated rough.js headline highlight, sketchy CTA buttons,
 * a hand-drawn divider, and a floating badge strip.
 *
 * Registry components used:
 *   Button, Badge, RoughHighlight, RoughLine, Card
 */

import Link from "next/link";
import { Button } from "@/registry/new-york/ui/button";
import { Badge } from "@/registry/new-york/ui/badge";
import { Card } from "@/registry/new-york/ui/card";
import { RoughHighlight } from "@/components/primitives/rough-highlight";
import { RoughLine } from "@/components/primitives/rough-line";

const FEATURES = [
  { icon: "◈", label: "Open source", sub: "MIT license" },
  { icon: "◎", label: "Animates on mount", sub: "Paths draw themselves" },
  { icon: "◇", label: "Three themes", sub: "Pencil · Ink · Crayon" },
  { icon: "✦", label: "Rough.js powered", sub: "No PNGs, ever" },
];

export default function HeroSection() {
  return (
    <main
      className="min-h-screen bg-background text-foreground"
      style={{
        fontFamily: "var(--font-sans, Georgia, serif)",
      }}
    >
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 backdrop-blur-sm bg-background/80 border-b border-border/20">
        <span
          className="text-lg font-medium tracking-tight"
          style={{ fontFamily: "var(--font-display, Georgia), italic" }}
        >
          crumble
        </span>
        <div className="flex items-center gap-6 text-[13px] text-muted-foreground">
          <Link
            href="/docs"
            className="hover:text-foreground transition-colors"
          >
            Docs
          </Link>
          <Link
            href="/docs/components/button"
            className="hover:text-foreground transition-colors"
          >
            Components
          </Link>
          <Link
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </Link>
          <Link href="/docs/getting-started/introduction">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-20 text-center">
        {/* Grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,currentColor 0,currentColor 1px,transparent 1px,transparent 48px)," +
              "repeating-linear-gradient(90deg,currentColor 0,currentColor 1px,transparent 1px,transparent 48px)",
          }}
        />

        {/* Floating badge */}
        <div className="relative z-10 mb-8 animate-[fadeInDown_0.6s_ease_both]">
          <Badge variant="outline" id="hero-badge">
            ✦ &nbsp; v1.0 — now with crayon mode
          </Badge>
        </div>

        {/* Headline */}
        <h1
          className="relative z-10 text-[clamp(48px,9vw,96px)] font-medium leading-[1.02] tracking-tight max-w-4xl mx-auto animate-[fadeInUp_0.7s_ease_both]"
          style={{ animationDelay: "0.1s" }}
        >
          UI that looks like{" "}
          <span className="inline-block font-[family-name:var(--font-display)] italic">
            <RoughHighlight
              type="highlight"
              color="#fbbf24"
              opacity={0.35}
              animate
              id="hero-highlight-main"
            >
              you drew it
            </RoughHighlight>
          </span>
        </h1>

        {/* Sub */}
        <p
          className="relative z-10 mt-6 max-w-xl text-[1.125rem] leading-relaxed text-muted-foreground animate-[fadeInUp_0.7s_ease_both]"
          style={{ animationDelay: "0.2s" }}
        >
          Wobbly, sketchy React components built on{" "}
          <RoughHighlight
            type="underline"
            color="currentColor"
            opacity={0.4}
            animate
            id="rough-underline"
          >
            Rough.js
          </RoughHighlight>
          . Install with one command, own the source, customise everything.
        </p>

        {/* CTAs */}
        <div
          className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-4 animate-[fadeInUp_0.7s_ease_both]"
          style={{ animationDelay: "0.3s" }}
        >
          <Link href="/docs/getting-started/introduction">
            <Button size="lg">Get started →</Button>
          </Link>
          <Link href="/docs/components/button">
            <Button size="lg" variant="ghost">
              Browse components
            </Button>
          </Link>
        </div>

        {/* Install snippet */}
        <div
          className="relative z-10 mt-8 inline-flex items-center gap-3 rounded-lg border border-border/40 bg-secondary/50 px-5 py-2.5 backdrop-blur-sm animate-[fadeInUp_0.7s_ease_both]"
          style={{ animationDelay: "0.4s" }}
        >
          <span className="text-muted-foreground text-[12px]">$</span>
          <code className="font-mono text-[13px] text-muted-foreground">
            npx shadcn add https://crumble.dev/r/button.json
          </code>
        </div>

        {/* Bottom fade */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"
        />
      </section>

      {/* ── Divider ── */}
      <div className="mx-auto max-w-4xl px-6">
        <RoughLine orientation="horizontal" id="hero-divider-1" />
      </div>

      {/* ── Feature pills ── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="mb-10 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          why crumble
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Card
              key={f.label}
              id={`feature-card-${i}`}
              padding={24}
              className="flex flex-col gap-3 transition-transform hover:-translate-y-0.5"
            >
              <span className="text-2xl text-muted-foreground">{f.icon}</span>
              <div>
                <p className="text-[14px] font-medium">{f.label}</p>
                <p className="mt-1 text-[12px] text-muted-foreground">
                  {f.sub}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="mx-auto max-w-4xl px-6">
        <RoughLine orientation="horizontal" id="hero-divider-2" />
      </div>

      {/* ── Big CTA ── */}
      <section className="px-6 py-24 text-center">
        <h2 className="text-[clamp(32px,5vw,56px)] font-medium leading-tight">
          Ready to get{" "}
          <span className="font-[family-name:var(--font-display)] italic">
            <RoughHighlight
              type="box"
              color="currentColor"
              opacity={0.12}
              animate
              id="cta-box"
            >
              sketchy?
            </RoughHighlight>
          </span>
        </h2>
        <p className="mt-4 text-base text-muted-foreground max-w-sm mx-auto">
          One command. Zero lock-in. Just source code you own.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/docs/getting-started/introduction">
            <Button size="lg">Read the docs</Button>
          </Link>
          <Link href="https://github.com" target="_blank" rel="noreferrer">
            <Button size="lg" variant="ghost">
              GitHub ↗
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/20 px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-[12px] text-muted-foreground">
          <span className="font-[family-name:var(--font-display)] italic text-sm text-foreground">
            crumble
          </span>
          <span>hand-drawn React UI · MIT license</span>
          <div className="flex gap-4">
            <Link
              href="/docs"
              className="hover:text-foreground transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/docs/components/button"
              className="hover:text-foreground transition-colors"
            >
              Components
            </Link>
            <Link
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
