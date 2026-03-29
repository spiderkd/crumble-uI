"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import rough from "roughjs";
import type { PageTree } from "fumadocs-core/server";
import { getRoughOptions, stableSeed, randomSeed } from "@/lib/rough";
import { useCrumble } from "@/lib/crumble-context";
import { cn } from "@/lib/utils";

// ─── Rough right border ───────────────────────────────────────────────────────

function SidebarBorder() {
  const { theme } = useCrumble();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const draw = useCallback(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;
    const h = container.offsetHeight;
    svg.replaceChildren();
    svg.setAttribute("width", "8");
    svg.setAttribute("height", String(h));
    svg.setAttribute("viewBox", `0 0 8 ${h}`);
    const rc = rough.svg(svg);
    svg.appendChild(
      rc.line(
        4,
        0,
        4,
        h,
        getRoughOptions(theme, "border", {
          seed: stableSeed("sidebar-border"),
          stroke: "currentColor",
          strokeWidth: theme === "crayon" ? 1.8 : theme === "ink" ? 1.2 : 0.9,
        }),
      ),
    );
  }, [theme]);

  useEffect(() => {
    const id = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(id);
  }, [draw]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(el);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <div ref={containerRef} className="absolute right-0 top-0 bottom-0 w-2">
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-visible opacity-20"
      />
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ label }: { label: string }) {
  const { theme } = useCrumble();
  const svgRef = useRef<SVGSVGElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  const draw = useCallback(() => {
    const svg = svgRef.current;
    const span = spanRef.current;
    if (!svg || !span) return;
    const w = span.offsetWidth + 8;
    svg.replaceChildren();
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", "6");
    svg.setAttribute("viewBox", `0 0 ${w} 6`);
    const rc = rough.svg(svg);
    svg.appendChild(
      rc.line(
        0,
        3,
        w,
        3,
        getRoughOptions(theme, "border", {
          seed: stableSeed(`section-${label}`),
          stroke: "currentColor",
          strokeWidth: 0.7,
        }),
      ),
    );
  }, [label, theme]);

  useEffect(() => {
    const id = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(id);
  }, [draw]);

  return (
    <div className="mb-2 mt-6 flex flex-col gap-0.5 px-3 first:mt-2">
      <span
        ref={spanRef}
        className="text-[10.5px] font-semibold uppercase tracking-[0.11em] text-muted-foreground"
      >
        {label}
      </span>
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="overflow-visible opacity-40"
      />
    </div>
  );
}

// ─── Nav item ─────────────────────────────────────────────────────────────────

function NavItem({
  href,
  label,
  active,
  depth = 0,
}: {
  href: string;
  label: string;
  active: boolean;
  depth?: number;
}) {
  const { theme } = useCrumble();
  const pillRef = useRef<HTMLAnchorElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const draw = useCallback(
    (reseed = false) => {
      const svg = svgRef.current;
      const pill = pillRef.current;
      if (!svg || !pill) return;
      svg.replaceChildren();
      const w = pill.offsetWidth;
      const h = pill.offsetHeight;
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      if (!active) return;
      const rc = rough.svg(svg);
      svg.appendChild(
        rc.rectangle(
          1,
          1,
          w - 2,
          h - 2,
          getRoughOptions(theme, "border", {
            fill: "currentColor",
            fillStyle: theme === "ink" ? "solid" : "hachure",
            fillWeight: theme === "pencil" ? 0.4 : 0.7,
            hachureGap: theme === "pencil" ? 5 : 3,
            seed: reseed ? randomSeed() : stableSeed(`nav-item-${label}`),
            stroke: "currentColor",
            strokeWidth: theme === "crayon" ? 1.8 : theme === "ink" ? 1.2 : 0.9,
          }),
        ),
      );
    },
    [active, label, theme],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(id);
  }, [draw]);

  useEffect(() => {
    const el = pillRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(el);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <Link
      ref={pillRef}
      href={href}
      className={cn(
        "relative flex items-center rounded-sm px-3 py-1.5 text-[13px] no-underline transition-colors",
        depth > 0 && "ml-3",
        active
          ? "font-medium text-foreground"
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
        className="pointer-events-none absolute inset-0 overflow-visible opacity-[0.07]"
      />
      <span className="relative">{label}</span>
    </Link>
  );
}

// ─── Recursive node ───────────────────────────────────────────────────────────

function SidebarNode({
  node,
  depth = 0,
  pathname,
}: {
  node: PageTree.Node;
  depth?: number;
  pathname: string;
}) {
  if (node.type === "separator") {
    const label =
      typeof node.name === "string" ? node.name : String(node.name ?? "");
    return (
      <div className="px-3 pb-1 pt-4">
        <SectionHeading label={label} />
      </div>
    );
  }

  if (node.type === "folder") {
    const folderName =
      typeof node.name === "string" ? node.name : String(node.name ?? "");
    const hasActiveChild = (n: PageTree.Node): boolean => {
      if (n.type === "page") return pathname === n.url;
      if (n.type === "folder") return n.children?.some(hasActiveChild) ?? false;
      return false;
    };
    return (
      <FolderSection
        name={folderName}
        children={node.children ?? []}
        pathname={pathname}
        defaultOpen={node.children?.some(hasActiveChild) ?? false}
        depth={depth}
      />
    );
  }

  const label =
    typeof node.name === "string" ? node.name : String(node.name ?? "");
  return (
    <NavItem
      href={node.url}
      label={label}
      active={pathname === node.url}
      depth={depth}
    />
  );
}

function FolderSection({
  name,
  children,
  pathname,
  defaultOpen,
  depth,
}: {
  name: string;
  children: PageTree.Node[];
  pathname: string;
  defaultOpen: boolean;
  depth: number;
}) {
  const { theme } = useCrumble();
  const [open, setOpen] = useState(defaultOpen);
  const svgRef = useRef<SVGSVGElement>(null);

  const drawChevron = useCallback(
    (reseed = false) => {
      const svg = svgRef.current;
      if (!svg) return;
      svg.replaceChildren();
      svg.setAttribute("width", "12");
      svg.setAttribute("height", "12");
      svg.setAttribute("viewBox", "0 0 12 12");
      const rc = rough.svg(svg);
      const opts = getRoughOptions(theme, "border", {
        seed: reseed ? randomSeed() : stableSeed(`chevron-${name}`),
        stroke: "currentColor",
        strokeWidth: theme === "crayon" ? 1.8 : 1.1,
      });
      if (open) {
        svg.appendChild(rc.line(2, 4, 6, 8, opts));
        svg.appendChild(
          rc.line(6, 8, 10, 4, {
            ...opts,
            seed: stableSeed(`chevron-r-${name}`),
          }),
        );
      } else {
        svg.appendChild(rc.line(2, 8, 6, 4, opts));
        svg.appendChild(
          rc.line(6, 4, 10, 8, {
            ...opts,
            seed: stableSeed(`chevron-r2-${name}`),
          }),
        );
      }
    },
    [name, open, theme],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => drawChevron());
    return () => cancelAnimationFrame(id);
  }, [drawChevron]);

  return (
    <div className="flex flex-col">
      {name ? (
        <button
          onClick={() => setOpen((v) => !v)}
          onMouseEnter={() => drawChevron(true)}
          onMouseLeave={() => drawChevron(false)}
          className="flex w-full items-center justify-between"
          aria-expanded={open}
        >
          <SectionHeading label={name} />
          <svg
            ref={svgRef}
            aria-hidden="true"
            width="12"
            height="12"
            className="mr-3 mt-4 flex-shrink-0 overflow-visible opacity-50"
          />
        </button>
      ) : null}
      {open && (
        <div className="flex flex-col gap-0.5">
          {children.map((child, i) => (
            <SidebarNode
              key={i}
              node={child}
              depth={depth + 1}
              pathname={pathname}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Inner client component that owns usePathname ─────────────────────────────

export function CrumbleSidebarInner({ tree }: { tree: PageTree.Root }) {
  const pathname = usePathname();

  return (
    <aside
      className="relative flex h-full  flex-col overflow-y-auto px-3 py-4"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "var(--border) transparent",
      }}
    >
      <SidebarBorder />

      <div className="mb-4 px-3">
        <span className="font-[family-name:var(--font-display)] text-base font-semibold text-foreground">
          docs
        </span>
      </div>

      <nav
        aria-label="Documentation navigation"
        className="flex flex-col gap-0.5"
      >
        {tree.children.map((node, i) => (
          <SidebarNode key={i} node={node} pathname={pathname} />
        ))}
      </nav>
    </aside>
  );
}
