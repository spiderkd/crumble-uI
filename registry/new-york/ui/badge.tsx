"use client";

import { useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import rough from "roughjs";
import { cn } from "@/lib/utils";
import {
  CrumbleContext,
  getRoughOptions,
  randomSeed,
  resolveRoughVars,
  stableSeed,
  type CrumbleColorProps,
  type CrumbleTheme,
} from "@/lib/rough";

export type BadgeVariant = "default" | "success" | "warning" | "destructive" | "outline";

export interface BadgeProps extends CrumbleColorProps {
  animateOnHover?: boolean;
  children: ReactNode;
  className?: string;
  id?: string;
  theme?: CrumbleTheme;
  variant?: BadgeVariant;
}

const variantStroke: Record<BadgeVariant, string> = {
  default:     "currentColor",
  destructive: "var(--cr-stroke-error)",
  outline:     "var(--cr-stroke-muted)",
  success:     "oklch(0.6 0.15 145)",
  warning:     "oklch(0.7 0.15 75)",
};

const variantText: Record<BadgeVariant, string> = {
  default:     "text-foreground",
  destructive: "text-destructive",
  outline:     "text-muted-foreground",
  success:     "text-green-700 dark:text-green-400",
  warning:     "text-amber-700 dark:text-amber-400",
};

export function Badge({
  animateOnHover = true,
  children,
  className,
  fill,
  id,
  stroke,
  strokeMuted,
  theme: themeProp,
  variant = "default",
}: BadgeProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const stableId = id ?? `badge-${variant}`;
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });

  const draw = useCallback(
    (reseed = false) => {
      const container = containerRef.current;
      const svg = svgRef.current;
      if (!container || !svg) return;

      svg.replaceChildren();

      const w = container.offsetWidth;
      const h = container.offsetHeight;
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

      const rc = rough.svg(svg);
      svg.appendChild(
        rc.rectangle(1, 1, w - 2, h - 2, getRoughOptions(theme, "border", {
          fill: "none",
          seed: reseed ? randomSeed() : stableSeed(stableId),
          stroke: variantStroke[variant],
        })),
      );
    },
    [stableId, theme, variant],
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
    <span
      ref={containerRef}
      className={cn(
        "relative inline-flex items-center px-2 py-0.5 text-[11px] font-medium",
        variantText[variant],
        className,
      )}
      style={roughStyle}
      onMouseEnter={() => { if (animateOnHover) draw(true); }}
      onMouseLeave={() => { if (animateOnHover) draw(false); }}
    >
      <svg ref={svgRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible" />
      <span className="relative">{children}</span>
    </span>
  );
}
