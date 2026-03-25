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

export interface ProgressProps extends CrumbleColorProps {
  className?: string;
  id?: string;
  label?: string;
  max?: number;
  showValue?: boolean;
  theme?: CrumbleTheme;
  value?: number;
}

const TRACK_H = 16;

export function Progress({
  className,
  fill,
  id,
  label,
  max = 100,
  showValue = false,
  stroke,
  strokeMuted,
  theme: themeProp,
  value = 0,
}: ProgressProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });
  const progressId = id ?? `progress-${label?.toLowerCase().replace(/\s+/g, "-") ?? "bar"}`;

  const pct = Math.min(Math.max(value / max, 0), 1);

  const draw = useCallback(() => {
    const svg = svgRef.current;
    const wrapper = wrapperRef.current;
    if (!svg || !wrapper) return;

    svg.replaceChildren();
    const w = wrapper.offsetWidth;
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(TRACK_H));
    svg.setAttribute("viewBox", `0 0 ${w} ${TRACK_H}`);

    const rc = rough.svg(svg);

    // Track (empty background)
    svg.appendChild(
      rc.rectangle(1, 1, w - 2, TRACK_H - 2, getRoughOptions(theme, "border", {
        fill: "none",
        seed: stableSeed(`${progressId}-track`),
        stroke: "var(--cr-stroke-muted)",
      })),
    );

    // Fill (progress)
    if (pct > 0) {
      const fillW = Math.max((w - 4) * pct, 4);
      svg.appendChild(
        rc.rectangle(2, 2, fillW, TRACK_H - 4, getRoughOptions(theme, "fill", {
          fill: "currentColor",
          fillStyle: theme === "ink" ? "solid" : "hachure",
          seed: stableSeed(`${progressId}-fill`),
          stroke: "none",
        })),
      );
    }
  }, [pct, progressId, theme]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <div className={cn("flex flex-col gap-1.5", className)} style={roughStyle}>
      {label || showValue ? (
        <div className="flex justify-between">
          {label ? (
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
          ) : null}
          {showValue ? (
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {Math.round(pct * 100)}%
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        ref={wrapperRef}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="relative"
        style={{ height: TRACK_H }}
      >
        <svg ref={svgRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible" />
      </div>
    </div>
  );
}
