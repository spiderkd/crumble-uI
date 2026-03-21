
import Link from "next/link";
import { Button } from "@/registry/new-york/ui/button";
import { Card } from "@/registry/new-york/ui/card";
import { RoughHighlight } from "@/registry/new-york/primitives/rough-highlight";
import { RoughLine } from "@/registry/new-york/primitives/rough-line";

const componentPreviews = [
  { name: "Button", slug: "button", desc: "Wobbly border, hover redraw, three variants" },
  { name: "Card", slug: "card", desc: "Stacked paper effect, resizes with content" },
  { name: "Input", slug: "input", desc: "Box or underline style, focus state" },
  { name: "Textarea", slug: "textarea", desc: "Auto-grow, rough border on focus" },
  { name: "Checkbox", slug: "checkbox", desc: "Rough tick mark, hover redraw" },
  { name: "Radio", slug: "radio", desc: "Filled inner circle when selected" },
  { name: "Select", slug: "select", desc: "Hand-drawn chevron indicator" },
  { name: "Slider", slug: "slider", desc: "Sketchy track and circle thumb" },
  { name: "Toggle", slug: "toggle", desc: "Thumb slides inside rough track" },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
        <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          a shadcn-style component library
        </p>

        <h1 className="mb-6 max-w-2xl text-[clamp(40px,7vw,72px)] leading-[1.1] font-medium">
          UI that looks{" "}
          <span className="font-[family-name:var(--font-display)] italic">
            <RoughHighlight type="highlight" color="#fbbf24" opacity={0.35} animate>
              hand-drawn
            </RoughHighlight>
          </span>
        </h1>

        <p className="mb-10 max-w-md text-lg leading-relaxed text-muted-foreground">
          Wobbly, sketchy React components built on Rough.js. One command installs.
          You own the code.
        </p>

        <div className="mb-16 flex flex-wrap items-center justify-center gap-3">
          <Link href="/docs/getting-started/introduction">
            <Button size="lg">Get started</Button>
          </Link>
          <Link href="/docs/components/button">
            <Button size="lg" variant="ghost">Browse components</Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-secondary px-5 py-2.5">
          <code className="font-mono text-[13px] text-muted-foreground">
            npx shadcn add https://crumble.dev/r/button.json
          </code>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6">
        <RoughLine orientation="horizontal" />
      </div>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="mb-10 text-center text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          what ships
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {componentPreviews.map((item) => (
            <Link key={item.slug} href={`/docs/components/${item.slug}`} className="no-underline">
              <Card padding={20} className="h-full cursor-pointer">
                <p className="mb-1 text-[13px] font-medium text-foreground">{item.name}</p>
                <p className="text-[12px] leading-relaxed text-muted-foreground">{item.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary/50 px-6 py-20">
        <div className="mx-auto max-w-xl text-center">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            three themes
          </p>
          <h2 className="mb-3 text-3xl font-medium text-foreground">one prop away</h2>
          <p className="mb-12 text-base leading-relaxed text-muted-foreground">
            Switch between pencil, ink, and crayon, or set it globally once.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {(["pencil", "ink", "crayon"] as const).map((theme) => (
              <div key={theme} className="flex flex-col items-center gap-2">
                <Button theme={theme} size="lg">{theme}</Button>
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {theme}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border/30 px-6 py-8 text-center">
        <p className="text-[13px] text-muted-foreground">
          crumble - hand-drawn components for React
        </p>
      </footer>
    </main>
  );
}
