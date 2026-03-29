"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import rough from "roughjs";
import { getRoughOptions, stableSeed, randomSeed } from "@/lib/rough";
import { useCrumble } from "@/lib/crumble-context";
import { cn } from "@/lib/utils";

// ─── 4-sided rough rectangle frame + shadow ───────────────────────────────────
//
// Drawn on an SVG that sits AROUND the bar (not inside it).
// The bar itself is the html element; the SVG overflows it so the
// shadow offset lines can appear below/right without clipping.

function NavBarFrame({
  barRef,
}: {
  barRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { theme } = useCrumble();
  const svgRef = useRef<SVGSVGElement>(null);

  const draw = useCallback(() => {
    const svg = svgRef.current;
    const bar = barRef.current;
    if (!svg || !bar) return;

    const w = bar.offsetWidth;
    const h = bar.offsetHeight;

    // Extra space for the shadow offset lines that bleed outside
    const shadow = 5;
    const total = w + shadow + 4;
    const totalH = h + shadow + 4;

    svg.replaceChildren();
    svg.setAttribute("width", String(total));
    svg.setAttribute("height", String(totalH));
    svg.setAttribute("viewBox", `0 0 ${total} ${totalH}`);

    const rc = rough.svg(svg);

    const sw = theme === "crayon" ? 1.8 : theme === "ink" ? 1.3 : 1;
    const rough_ = theme === "crayon" ? 2 : theme === "ink" ? 0.5 : 1.2;

    const base = getRoughOptions(theme, "border", {
      stroke: "currentColor",
      strokeWidth: sw,
      fill: "none",
      roughness: rough_,
    });

    // Shadow — two offset lines (bottom + right), very low opacity
    const shadowOpts = {
      ...base,
      strokeWidth: sw * 0.9,
      seed: stableSeed("nav-shadow"),
    };
    svg.appendChild(
      rc.line(shadow + 2, h + shadow, w + shadow, h + shadow, {
        ...shadowOpts,
        seed: stableSeed("nav-shadow-b"),
      }),
    );
    svg.appendChild(
      rc.line(w + shadow, shadow + 2, w + shadow, h + shadow, {
        ...shadowOpts,
        seed: stableSeed("nav-shadow-r"),
      }),
    );

    // Main border rect — inset 1px so strokes aren't clipped
    svg.appendChild(
      rc.rectangle(1, 1, w - 2, h - 2, {
        ...base,
        seed: stableSeed("nav-frame"),
      }),
    );
  }, [barRef, theme]);

  useEffect(() => {
    const id = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(id);
  }, [draw]);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(bar);
    return () => ro.disconnect();
  }, [draw, barRef]);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      // Positioned so top-left of SVG aligns with top-left of bar
      className="pointer-events-none absolute left-0 top-0 overflow-visible"
      style={{ opacity: 0.55 }}
    />
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function NavLogo() {
  return (
    <Link href="/" className="no-underline" aria-label="crumble home">
      <span className="font-[family-name:var(--font-display)] text-[1.2rem] font-bold italic leading-none tracking-tight text-foreground">
        byDefaultHuman
      </span>
    </Link>
  );
}

// ─── Nav text link — rough underline when active ──────────────────────────────

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: string;
  active: boolean;
}) {
  const { theme } = useCrumble();
  const svgRef = useRef<SVGSVGElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);

  const draw = useCallback(
    (reseed = false) => {
      const svg = svgRef.current;
      const el = linkRef.current;
      if (!svg || !el) return;
      svg.replaceChildren();
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      if (!active) return;
      const rc = rough.svg(svg);
      svg.appendChild(
        rc.line(
          1,
          h - 1,
          w - 1,
          h - 1,
          getRoughOptions(theme, "border", {
            seed: reseed ? randomSeed() : stableSeed(`nl-${children}`),
            stroke: "currentColor",
            strokeWidth: theme === "crayon" ? 2.2 : theme === "ink" ? 1.8 : 1.4,
          }),
        ),
      );
    },
    [active, children, theme],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(id);
  }, [draw]);

  return (
    <Link
      ref={linkRef}
      href={href}
      className={cn(
        "relative pb-0.5 text-[13px] font-medium no-underline transition-colors duration-150",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
      onMouseEnter={() => {
        if (active) draw(true);
      }}
      onMouseLeave={() => {
        if (active) draw(false);
      }}
    >
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-visible"
      />
      <span className="relative">{children}</span>
    </Link>
  );
}

// ─── Rough search button — looks like the fumadocs one but hand-drawn border ──

function SearchButton() {
  const { theme } = useCrumble();
  const svgRef = useRef<SVGSVGElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const draw = useCallback(
    (reseed = false) => {
      const svg = svgRef.current;
      const btn = btnRef.current;
      if (!svg || !btn) return;
      svg.replaceChildren();
      const w = btn.offsetWidth;
      const h = btn.offsetHeight;
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      const rc = rough.svg(svg);
      svg.appendChild(
        rc.rectangle(
          1,
          1,
          w - 2,
          h - 2,
          getRoughOptions(theme, "border", {
            seed: reseed ? randomSeed() : stableSeed("search-btn"),
            stroke: "currentColor",
            strokeWidth: theme === "crayon" ? 1.6 : theme === "ink" ? 1.1 : 0.8,
            fill: "none",
            roughness: theme === "crayon" ? 2.2 : theme === "ink" ? 0.5 : 1.1,
          }),
        ),
      );
    },
    [theme],
  );

  // Wire to the Fumadocs search dialog via keyboard shortcut trigger
  const openSearch = () => {
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      ctrlKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(id);
  }, [draw]);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(btn);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <button
      ref={btnRef}
      onClick={openSearch}
      onMouseEnter={() => draw(true)}
      onMouseLeave={() => draw(false)}
      aria-label="Search"
      className="relative hidden h-8 items-center gap-2 px-3 text-[12px] text-muted-foreground transition-colors hover:text-foreground md:flex"
    >
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-visible"
      />
      {/* Search icon */}
      <svg
        aria-hidden="true"
        width="13"
        height="13"
        viewBox="0 0 16 16"
        fill="none"
        className="relative shrink-0"
      >
        <circle
          cx="6.5"
          cy="6.5"
          r="4.5"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M10 10L14 14"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      <span className="relative">Search</span>
      <span className="relative ml-1 hidden items-center gap-0.5 font-mono text-[10px] tracking-wider opacity-60 sm:flex">
        <kbd>Ctrl</kbd>
        <kbd>K</kbd>
      </span>
    </button>
  );
}

// ─── Light / dark toggle — clean geometric SVG, hand-drawn stroke weight ──────

function DarkModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { theme } = useCrumble();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  if (!mounted) return <div className="h-8 w-8" />;

  // Stroke width driven by crumble theme
  const sw = theme === "crayon" ? 1.8 : theme === "ink" ? 1.4 : 1.1;

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-8 w-8 items-center justify-center text-foreground/70 transition-colors hover:text-foreground"
    >
      {isDark ? (
        // Moon — geometric crescent: large circle with a smaller circle cutting it
        // Rendered as a proper SVG path so it looks correct in all themes
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="overflow-visible"
        >
          {/* Crescent path: arc of outer circle minus arc of inner offset circle */}
          <path
            d="M13.5 10.5A6 6 0 0 1 5.5 2.5a6 6 0 1 0 8 8z"
            stroke="currentColor"
            strokeWidth={sw}
            strokeLinejoin="round"
            fill="currentColor"
            fillOpacity="0.15"
          />
        </svg>
      ) : (
        // Sun — circle + 8 rays, slightly wobbly via strokeLinecap round
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className="overflow-visible"
        >
          <circle
            cx="8"
            cy="8"
            r="3.2"
            stroke="currentColor"
            strokeWidth={sw}
            fill="currentColor"
            fillOpacity="0.12"
          />
          {/* 8 rays at 45° intervals */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = 8 + 4.8 * Math.cos(rad);
            const y1 = 8 + 4.8 * Math.sin(rad);
            const x2 = 8 + 6.4 * Math.cos(rad);
            const y2 = 8 + 6.4 * Math.sin(rad);
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={sw}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      )}
    </button>
  );
}

// ─── Vertical divider ─────────────────────────────────────────────────────────

function NavDivider() {
  const { theme } = useCrumble();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.replaceChildren();
    const rc = rough.svg(svg);
    svg.appendChild(
      rc.line(
        4,
        3,
        4,
        17,
        getRoughOptions(theme, "border", {
          seed: stableSeed("nav-div"),
          stroke: "currentColor",
          strokeWidth: 0.7,
        }),
      ),
    );
  }, [theme]);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      width="8"
      height="20"
      className="hidden overflow-visible opacity-15 md:block"
    />
  );
}

// ─── Mobile hamburger ──────────────────────────────────────────────────────────

function Hamburger({ open, onClick }: { open: boolean; onClick: () => void }) {
  const { theme } = useCrumble();
  const svgRef = useRef<SVGSVGElement>(null);

  const draw = useCallback(
    (reseed = false) => {
      const svg = svgRef.current;
      if (!svg) return;
      svg.replaceChildren();
      const rc = rough.svg(svg);
      const opts = getRoughOptions(theme, "border", {
        seed: reseed ? randomSeed() : stableSeed(`hb-${open}`),
        stroke: "currentColor",
        strokeWidth: theme === "crayon" ? 2 : 1.4,
      });
      if (open) {
        svg.appendChild(rc.line(4, 4, 20, 20, opts));
        svg.appendChild(
          rc.line(20, 4, 4, 20, { ...opts, seed: stableSeed("hb-x2") }),
        );
      } else {
        svg.appendChild(rc.line(3, 6, 21, 6, opts));
        svg.appendChild(
          rc.line(3, 12, 21, 12, { ...opts, seed: stableSeed("hb-m") }),
        );
        svg.appendChild(
          rc.line(3, 18, 21, 18, { ...opts, seed: stableSeed("hb-b") }),
        );
      }
    },
    [open, theme],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(id);
  }, [draw]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => draw(true)}
      onMouseLeave={() => draw(false)}
      aria-label={open ? "Close menu" : "Open menu"}
      className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground md:hidden"
    >
      <svg
        ref={svgRef}
        aria-hidden="true"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className="overflow-visible"
      />
    </button>
  );
}

// ─── Mobile dropdown — child of the bar so top:100% = bottom of bar ──────────

function MobileMenu({ open, pathname }: { open: boolean; pathname: string }) {
  if (!open) return null;

  return (
    <div
      className="absolute left-0 right-0 top-[120%] z-50 bg-background px-4 py-3 md:hidden"
      style={{ boxShadow: "0 4px 12px oklch(0 0 0 / 8%)" }}
    >
      {/* Rough bottom + side borders on the dropdown itself */}
      <nav className="flex flex-col gap-0.5">
        {[
          { href: "/docs", label: "Docs" },
          { href: "/docs/components/button", label: "Components" },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "rounded-sm px-2 py-2 text-sm font-medium no-underline transition-colors",
              pathname.startsWith(href)
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

// ─── CrumbleNavbar ────────────────────────────────────────────────────────────

export function CrumbleNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) => pathname.startsWith(href);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    // Outer nav — provides the Fumadocs height slot; transparent background
    <nav
      className="relative w-full"
      style={{
        height: "var(--fd-nav-height, 68px)",
        background: "transparent",
      }}
    >
      {/* Padded wrapper so the bar floats with margin from edges */}
      <div className="mx-auto flex h-full max-w-[97rem] items-center px-4 sm:px-6">
        {/* The actual bar — mobile menu is a child here so top:100% = bottom of bar */}
        <div
          ref={barRef}
          className="relative flex h-10 w-full items-center gap-6 bg-background px-4 sm:px-5"
        >
          {/* Frame drawn around this element */}
          <NavBarFrame barRef={barRef} />

          {/* Logo */}
          <NavLogo />

          {/* Nav links */}
          <div className="hidden items-center gap-4 md:flex">
            <NavLink
              href="/docs"
              active={isActive("/docs") && !isActive("/docs/components")}
            >
              Docs
            </NavLink>
            <NavLink
              href="/docs/components/button"
              active={isActive("/docs/components")}
            >
              Components
            </NavLink>
          </div>

          {/* Push right */}
          <div className="flex-1" />

          {/* Search */}
          <SearchButton />

          <NavDivider />

          {/* Light/dark */}
          <DarkModeToggle />

          {/* Mobile toggle */}
          <Hamburger
            open={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          />

          {/* Mobile menu — inside the bar so top:100% = bottom of bar edge */}
          <MobileMenu open={mobileOpen} pathname={pathname} />
        </div>
      </div>
    </nav>
  );
}
