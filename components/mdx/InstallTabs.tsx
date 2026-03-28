"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRough } from "@/hooks/use-rough";
import { randomSeed } from "@/lib/rough";
import { ManualTab } from "./manual-tab";

// ─── Types ────────────────────────────────────────────────────────────────────

type PackageManager = "npm" | "pnpm" | "bun";

interface InstallTabsProps {
  files?: { path: string; content: string }[];
  peerDeps?: string[];
  slug: string;
}

const PM_PREFIXES: Record<PackageManager, string> = {
  npm: "npx shadcn add",
  pnpm: "pnpm dlx shadcn add",
  bun: "bunx --bun shadcn add",
};

function getInstallPrefix(pm: PackageManager) {
  if (pm === "npm") return "npm install";
  if (pm === "pnpm") return "pnpm add";
  return "bun add";
}

// ─── CopyButton ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      aria-label="Copy"
      type="button"
      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      onClick={() => {
        void navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

// ─── RoughBox ─────────────────────────────────────────────────────────────────

function RoughBox({
  children,
  className,
  stableId,
}: {
  children: React.ReactNode;
  className?: string;
  stableId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { drawRect } = useRough({ variant: "border", stableId, svgRef });

  const draw = useCallback(
    (reseed = false) => {
      const container = containerRef.current;
      const svg = svgRef.current;
      if (!container || !svg) return;

      const w = container.offsetWidth;
      const h = container.offsetHeight;
      if (w === 0 || h === 0) return;

      svg.replaceChildren();
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

      const pad = 3;
      const rect = drawRect(pad, pad, w - pad * 2, h - pad * 2, {
        stroke: "var(--cr-stroke, currentColor)",
        strokeWidth: 1.2,
        roughness: 1.4,
        fill: "none",
        ...(reseed ? { seed: randomSeed() } : {}),
      });
      if (rect) svg.appendChild(rect);
    },
    [drawRect],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(id);
  }, [draw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(container);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onMouseEnter={() => draw(true)}
      onMouseLeave={() => draw(false)}
    >
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-visible"
      />
      {children}
    </div>
  );
}

// ─── RoughTab ─────────────────────────────────────────────────────────────────
// Top-level tab — CLI / Manual. Full size, prominent underline.

function RoughTab({
  active,
  children,
  onClick,
  stableId,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  stableId: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { drawLine } = useRough({ variant: "interactive", stableId, svgRef });

  const drawUnderline = useCallback(
    (reseed = false) => {
      const btn = buttonRef.current;
      const svg = svgRef.current;
      if (!btn || !svg) return;

      const w = btn.offsetWidth;
      svg.replaceChildren();
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", "6");
      svg.setAttribute("viewBox", `0 0 ${w} 6`);

      if (!active && !reseed) return;

      const line = drawLine(2, 3, w - 2, 3, {
        stroke: active
          ? "var(--cr-stroke, currentColor)"
          : "var(--cr-stroke-muted, currentColor)",
        strokeWidth: active ? 2.0 : 1.2,
        roughness: 1.8,
        ...(reseed ? { seed: randomSeed() } : {}),
      });
      if (line) svg.appendChild(line);
    },
    [active, drawLine],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => drawUnderline());
    return () => cancelAnimationFrame(id);
  }, [drawUnderline]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      onMouseEnter={() => drawUnderline(true)}
      onMouseLeave={() => drawUnderline(false)}
      className={cn(
        "relative flex flex-col items-center gap-0.5 pb-1 pt-0.5",
        "font-mono text-sm transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="overflow-visible"
        width="0"
        height="6"
      />
    </button>
  );
}

// ─── RoughPmTab ───────────────────────────────────────────────────────────────
// Sub-level PM tab — npm / pnpm / bun.
// Visually subordinate: smaller text, dot indicator instead of underline,
// muted colors so it reads as a secondary control beneath the main tabs.

function RoughPmTab({
  active,
  children,
  onClick,
  stableId,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  stableId: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLButtonElement>(null);

  const { drawRect } = useRough({ variant: "border", stableId, svgRef });

  const draw = useCallback(
    (reseed = false) => {
      const btn = containerRef.current;
      const svg = svgRef.current;
      if (!btn || !svg) return;

      const w = btn.offsetWidth;
      const h = btn.offsetHeight;
      if (w === 0 || h === 0) return;

      svg.replaceChildren();
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

      // Only render the rough rect when active or on hover
      if (!active && !reseed) return;

      const pad = 2;
      const rect = drawRect(pad, pad, w - pad * 2, h - pad * 2, {
        stroke: active
          ? "var(--cr-stroke, currentColor)"
          : "var(--cr-stroke-muted, currentColor)",
        strokeWidth: active ? 1.2 : 0.8,
        roughness: 1.6,
        fill: "none",
        ...(reseed ? { seed: randomSeed() } : {}),
      });
      if (rect) svg.appendChild(rect);
    },
    [active, drawRect],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(id);
  }, [draw]);

  useEffect(() => {
    const btn = containerRef.current;
    if (!btn) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(btn);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <button
      ref={containerRef}
      type="button"
      onClick={onClick}
      onMouseEnter={() => draw(true)}
      onMouseLeave={() => draw(false)}
      className={cn(
        // Pill shape with relative positioning for the SVG overlay
        "relative px-2.5 py-0.5",
        "font-mono text-xs transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground/60 hover:text-muted-foreground",
      )}
    >
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-visible"
        width="0"
        height="0"
      />
      {children}
    </button>
  );
}

// ─── RoughTabList ─────────────────────────────────────────────────────────────

function RoughTabList({
  children,
  stableId,
}: {
  children: React.ReactNode;
  stableId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { drawLine } = useRough({ variant: "border", stableId, svgRef });

  const drawSeparator = useCallback(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    const w = container.offsetWidth;
    svg.replaceChildren();
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", "6");
    svg.setAttribute("viewBox", `0 0 ${w} 6`);

    const line = drawLine(0, 3, w, 3, {
      stroke: "var(--cr-stroke-muted, currentColor)",
      strokeWidth: 1.0,
      roughness: 1.2,
    });
    if (line) svg.appendChild(line);
  }, [drawLine]);

  useEffect(() => {
    const id = requestAnimationFrame(() => drawSeparator());
    return () => cancelAnimationFrame(id);
  }, [drawSeparator]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => drawSeparator());
    ro.observe(container);
    return () => ro.disconnect();
  }, [drawSeparator]);

  return (
    <div ref={containerRef} className="relative pb-1">
      <div className="flex items-end gap-5">{children}</div>
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 overflow-visible"
      />
    </div>
  );
}

// ─── CommandBlock ─────────────────────────────────────────────────────────────

function CommandBlock({
  command,
  stableId,
}: {
  command: string;
  stableId: string;
}) {
  return (
    <RoughBox stableId={stableId} className="mt-3">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <pre className="overflow-x-auto overflow-y-clip font-mono text-sm text-foreground">
          <code>{command}</code>
        </pre>
        <CopyButton text={command} />
      </div>
    </RoughBox>
  );
}

// ─── InstallTabs ──────────────────────────────────────────────────────────────

export function InstallTabs({ files, peerDeps = [], slug }: InstallTabsProps) {
  const [activeTop, setActiveTop] = useState<"cli" | "manual">("cli");
  const [activePm, setActivePm] = useState<PackageManager>("npm");

  const registryUrl = `https://crumble.dev/r/${slug}.json`;

  return (
    <div className="my-4 w-full space-y-4">
      {/* ── Top-level tabs: CLI / Manual ── */}
      <RoughTabList stableId="install-tabs-top-separator">
        {(["cli", "manual"] as const).map((tab) => (
          <RoughTab
            key={tab}
            active={activeTop === tab}
            onClick={() => setActiveTop(tab)}
            stableId={`install-tab-top-${tab}`}
          >
            {tab === "cli" ? "CLI" : "Manual"}
          </RoughTab>
        ))}
      </RoughTabList>

      {/* ── CLI Panel ── */}
      {activeTop === "cli" && (
        <div className="space-y-1">
          {/* PM sub-tabs — right-aligned, visually subordinate */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground/50 font-mono">
              package manager
            </span>
            <div className="flex items-center gap-1">
              {(["npm", "pnpm", "bun"] as PackageManager[]).map((pm) => (
                <RoughPmTab
                  key={pm}
                  active={activePm === pm}
                  onClick={() => setActivePm(pm)}
                  stableId={`install-tab-pm-${pm}`}
                >
                  {pm}
                </RoughPmTab>
              ))}
            </div>
          </div>

          {/* Install command */}
          <CommandBlock
            command={`${PM_PREFIXES[activePm]} ${registryUrl}`}
            stableId={`install-cmd-${activePm}`}
          />

          {/* Peer deps */}
          {/* {peerDeps.length > 0 && (
            <>
              <p className="pt-1 text-xs text-muted-foreground">
                Also install peer dependencies:
              </p>
              <CommandBlock
                command={`${getInstallPrefix(activePm)} ${peerDeps.join(" ")}`}
                stableId={`peer-cmd-${activePm}`}
              />
            </>
          )} */}
        </div>
      )}

      {/* ── Manual Panel ── */}
      {activeTop === "manual" && (
        <ManualTab slug={slug} peerDeps={peerDeps} files={files} />
      )}
    </div>
  );
}
