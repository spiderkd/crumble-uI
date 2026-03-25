"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
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

export type TooltipSide = "top" | "bottom" | "left" | "right";

export interface TooltipProps extends CrumbleColorProps {
  children: ReactNode;
  className?: string;
  content: ReactNode;
  delayMs?: number;
  id?: string;
  side?: TooltipSide;
  theme?: CrumbleTheme;
}

const ARROW = 8;
const PAD = 8;

export function Tooltip({
  children,
  className,
  content,
  delayMs = 400,
  fill,
  id,
  side = "top",
  stroke,
  strokeMuted,
  theme: themeProp,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipId = id ?? "tooltip";
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });

  const draw = useCallback(() => {
    const tooltip = tooltipRef.current;
    const svg = svgRef.current;
    if (!tooltip || !svg) return;

    svg.replaceChildren();

    const w = tooltip.offsetWidth;
    const h = tooltip.offsetHeight;

    // SVG is sized to include space for the arrow
    const svgW = side === "left" || side === "right" ? w + ARROW : w;
    const svgH = side === "top" || side === "bottom" ? h + ARROW : h;

    svg.setAttribute("width", String(svgW));
    svg.setAttribute("height", String(svgH));
    svg.setAttribute("viewBox", `0 0 ${svgW} ${svgH}`);

    const rc = rough.svg(svg);
    const opts = getRoughOptions(theme, "border", {
      fill: "hsl(var(--popover))",
      fillStyle: "solid",
      seed: stableSeed(tooltipId),
      stroke: "var(--cr-stroke)",
    });

    // Box (offset to leave room for arrow)
    const bx = side === "right" ? ARROW : 0;
    const by = side === "bottom" ? ARROW : 0;
    svg.appendChild(rc.rectangle(bx + 1, by + 1, w - 2, h - 2, opts));

    // Arrow triangle
    const arrowOpts = { ...opts, roughness: 0.8, stroke: "var(--cr-stroke)", fill: "hsl(var(--popover))", fillStyle: "solid" as const };
    let arrowPath = "";
    if (side === "top") {
      const mx = w / 2;
      arrowPath = `M ${mx - ARROW} ${h - 1} L ${mx} ${h + ARROW - 1} L ${mx + ARROW} ${h - 1}`;
    } else if (side === "bottom") {
      const mx = w / 2;
      arrowPath = `M ${mx - ARROW} ${ARROW + 1} L ${mx} 1 L ${mx + ARROW} ${ARROW + 1}`;
    } else if (side === "left") {
      const my = h / 2;
      arrowPath = `M ${w - 1} ${my - ARROW} L ${w + ARROW - 1} ${my} L ${w - 1} ${my + ARROW}`;
    } else {
      const my = h / 2;
      arrowPath = `M ${ARROW + 1} ${my - ARROW} L 1 ${my} L ${ARROW + 1} ${my + ARROW}`;
    }
    svg.appendChild(rc.path(arrowPath, arrowOpts));
  }, [side, theme, tooltipId]);

  useEffect(() => {
    if (visible) {
      const id = requestAnimationFrame(() => draw());
      return () => cancelAnimationFrame(id);
    }
  }, [visible, draw]);

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), delayMs);
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };

  const sideClasses: Record<TooltipSide, string> = {
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left:   "right-full top-1/2 -translate-y-1/2 mr-2",
    right:  "left-full top-1/2 -translate-y-1/2 ml-2",
    top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible ? (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 pointer-events-none",
            sideClasses[side],
          )}
        >
          <div ref={tooltipRef} className="relative">
            <svg ref={svgRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible" />
            <div className={cn(
              "relative px-3 py-1.5 text-xs text-popover-foreground",
              className,
            )} style={roughStyle}>
              {content}
            </div>
          </div>
        </div>
      ) : null}
    </span>
  );
}
