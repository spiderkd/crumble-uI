"use client";

import { useCallback, useContext, useEffect, useRef } from "react";
import rough from "roughjs";
import { cn } from "@/lib/utils";
import {
  CrumbleContext,
  getRoughOptions,
  resolveRoughVars,
  stableSeed,
  type CrumbleColorProps,
  type CrumbleTheme,
} from "@/lib/rough";

export interface SeparatorProps extends CrumbleColorProps {
  className?: string;
  id?: string;
  label?: string;
  orientation?: "horizontal" | "vertical";
  theme?: CrumbleTheme;
}

export function Separator({
  className,
  fill,
  id,
  label,
  orientation = "horizontal",
  stroke,
  strokeMuted,
  theme: themeProp,
}: SeparatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const sepId = id ?? "separator";
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });

  const draw = useCallback(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    svg.replaceChildren();

    const isH = orientation === "horizontal";
    const w = isH ? container.offsetWidth : 20;
    const h = isH ? 20 : container.offsetHeight;

    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

    const rc = rough.svg(svg);
    const opts = getRoughOptions(theme, "border", {
      seed: stableSeed(sepId),
      stroke: "var(--cr-stroke-muted)",
    });

    if (isH && label) {
      // Label in the middle — draw two line segments
      const mid = w / 2;
      const gap = 8;
      // Rough estimate of label width — draw lines up to roughly the label edges
      const labelW = label.length * 7 + 16;
      svg.appendChild(rc.line(2, 10, mid - labelW / 2 - gap, 10, opts));
      svg.appendChild(rc.line(mid + labelW / 2 + gap, 10, w - 2, 10, opts));
    } else if (isH) {
      svg.appendChild(rc.line(2, 10, w - 2, 10, opts));
    } else {
      svg.appendChild(rc.line(10, 2, 10, h - 2, opts));
    }
  }, [label, orientation, sepId, theme]);

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

  const isH = orientation === "horizontal";

  return (
    <div
      ref={containerRef}
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "relative flex items-center",
        isH ? "w-full" : "h-full flex-col",
        className,
      )}
      style={roughStyle}
    >
      <svg ref={svgRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible" />
      {label ? (
        <span className="relative bg-background px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      ) : null}
    </div>
  );
}
