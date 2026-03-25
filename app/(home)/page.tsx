import Link from "next/link";
import { Button } from "@/registry/new-york/ui/button";
import { Card } from "@/registry/new-york/ui/card";
import { Badge } from "@/registry/new-york/ui/badge";
import { RoughHighlight } from "@/components/primitives/rough-highlight";
import { RoughLine } from "@/components/primitives/rough-line";
import { BentoGrid } from "@/components/BentoGrid/BentoGrid";

// ─── Static data ──────────────────────────────────────────────────────────────

const THEMES = [
  {
    name: "pencil" as const,
    label: "Pencil",
    desc: "Light, delicate, 1px strokes",
    weight: "1px",
    color: "#6b7280",
  },
  {
    name: "ink" as const,
    label: "Ink",
    desc: "Bold, confident, 2px strokes",
    weight: "2px",
    color: "#111827",
  },
  {
    name: "crayon" as const,
    label: "Crayon",
    desc: "Thick, waxy, 3.5px strokes",
    weight: "3.5px",
    color: "#7c3aed",
  },
] as const;

const FEATURES = [
  {
    title: "Rough.js powered",
    desc: "Every border, line, and shape is generated at runtime by Rough.js — no PNGs, no SVG assets, no icon fonts.",
    icon: "✦",
  },
  {
    title: "You own the code",
    desc: "shadcn-style install: one command copies the component source into your repo. Update it however you like.",
    icon: "◈",
  },
  {
    title: "Three sketch themes",
    desc: "Switch between pencil, ink, and crayon globally or per-component with a single prop.",
    icon: "◇",
  },
  {
    title: "Animates on mount",
    desc: "Paths draw themselves into existence on first render. No configuration needed — it just works.",
    icon: "◎",
  },
] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ── Hero ── */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        {/* Faint grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,currentColor 0,currentColor 1px,transparent 1px,transparent 40px)," +
              "repeating-linear-gradient(90deg,currentColor 0,currentColor 1px,transparent 1px,transparent 40px)",
          }}
        />

        <div className="relative z-10 flex max-w-3xl flex-col items-center gap-6">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <span className="h-px w-6 bg-current opacity-40" />
            open-source · shadcn-style · rough.js
            <span className="h-px w-6 bg-current opacity-40" />
          </span>

          {/* Headline */}
          <h1 className="text-[clamp(42px,8vw,80px)] font-medium leading-[1.05] tracking-tight">
            React UI that looks{" "}
            <span className="font-[family-name:var(--font-display)] italic">
              <RoughHighlight
                type="highlight"
                color="#fbbf24"
                opacity={0.3}
                animate
                id="hero-highlight"
              >
                hand-drawn
              </RoughHighlight>
            </span>
          </h1>

          {/* Sub */}
          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
            Wobbly, sketchy components built on Rough.js. Install with one
            command, own the source, customise everything.
          </p>

          {/* CTA row */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/docs/getting-started/introduction">
              <Button size="lg">Get started</Button>
            </Link>
            <Link href="/docs/components/button">
              <Button size="lg" variant="ghost">
                Browse components →
              </Button>
            </Link>
          </div>

          {/* Install snippet */}
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/60 px-5 py-2.5 backdrop-blur-sm">
            <code className="font-mono text-[13px] text-muted-foreground">
              npx shadcn add https://crumble.dev/r/button.json
            </code>
          </div>
        </div>

        {/* Bottom fade */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"
        />
      </section>

      {/* ── Divider ── */}
      <div className="mx-auto max-w-3xl px-6">
        <RoughLine orientation="horizontal" id="divider-1" />
      </div>

      {/* ── Theme showcase ── */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            three themes
          </p>
          <h2 className="text-3xl font-medium">One prop. Three aesthetics.</h2>
          <p className="mt-3 text-base text-muted-foreground">
            Set{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[13px]">
              theme
            </code>{" "}
            globally via{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[13px]">
              CrumbleProvider
            </code>{" "}
            or override per-component.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {THEMES.map((t) => (
            <Card
              key={t.name}
              theme={t.name}
              padding={24}
              className="flex flex-col gap-4"
            >
              <div className="flex items-start justify-between">
                <span className="font-[family-name:var(--font-display)] text-xl italic">
                  {t.label}
                </span>
                <Badge theme={t.name} variant="outline">
                  {t.weight} stroke
                </Badge>
              </div>

              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {t.desc}
              </p>

              <div className="mt-auto flex gap-2">
                <Button theme={t.name} size="sm">
                  Primary
                </Button>
                <Button theme={t.name} size="sm" variant="ghost">
                  Ghost
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="mx-auto max-w-3xl px-6">
        <RoughLine orientation="horizontal" id="divider-2" />
      </div>

      {/* ── Bento component grid ── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            what ships
          </p>
          <h2 className="text-3xl font-medium">
            <RoughHighlight
              type="underline"
              color="currentColor"
              opacity={0.35}
              animate
              id="bento-heading"
            >
              Everything you need. All interactive.
            </RoughHighlight>
          </h2>
          <p className="max-w-sm text-base text-muted-foreground">
            Every card below is a live component — click, drag, and type for
            real. Hover any card to jump to its docs.
          </p>
        </div>

        <BentoGrid />
      </section>

      {/* ── Divider ── */}
      <div className="mx-auto max-w-3xl px-6">
        <RoughLine orientation="horizontal" id="divider-3" />
      </div>

      {/* ── Features ── */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            why crumble
          </p>
          <h2 className="text-3xl font-medium">
            <RoughHighlight
              type="underline"
              color="currentColor"
              opacity={0.4}
              animate
              id="features-heading"
            >
              Designed to be different
            </RoughHighlight>
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Card key={f.title} padding={24} className="flex gap-4">
              <span className="mt-0.5 shrink-0 text-xl text-muted-foreground">
                {f.icon}
              </span>
              <div>
                <p className="mb-1.5 text-[14px] font-medium">{f.title}</p>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="bg-secondary/40 px-6 py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="mb-4 text-3xl font-medium">
            Ready to get{" "}
            <span className="font-[family-name:var(--font-display)] italic">
              <RoughHighlight
                type="box"
                color="currentColor"
                opacity={0.15}
                animate
                id="cta-box"
              >
                sketchy?
              </RoughHighlight>
            </span>
          </h2>
          <p className="mb-8 text-base leading-relaxed text-muted-foreground">
            Copy a component in one command. No lock-in, no magic, just source
            you own.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/docs/getting-started/introduction">
              <Button size="lg">Read the docs</Button>
            </Link>
            <Link
              href="https://github.com/your-org/crumble"
              target="_blank"
              rel="noreferrer"
            >
              <Button size="lg" variant="ghost">
                GitHub ↗
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/30 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 text-[12px] text-muted-foreground">
          <span className="font-[family-name:var(--font-display)] italic text-[15px] text-foreground">
            crumble
          </span>
          <span>hand-drawn components for React · MIT license</span>
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
              href="https://github.com/your-org/crumble"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
