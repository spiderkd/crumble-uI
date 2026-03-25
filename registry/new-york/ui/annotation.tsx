"use client";

/**
 * Pure roughjs — no d3 needed.
 * Wraps any child with a rough callout annotation.
 */

import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
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

export type AnnotationType = "box" | "circle" | "underline" | "bracket" | "arrow-label";
export type AnnotationSide = "top" | "bottom" | "left" | "right";

export interface AnnotationProps
  extends HTMLAttributes<HTMLSpanElement>,
    CrumbleColorProps {
  animate?: boolean;
  animationDuration?: number;
  color?: string;
  id?: string;
  label?: ReactNode;
  labelSide?: AnnotationSide;
  padding?: number;
  theme?: CrumbleTheme;
  type?: AnnotationType;
}

function animatePaths(svg: SVGSVGElement, duration: number) {
  svg.querySelectorAll("path").forEach((path) => {
    const len = path.getTotalLength();
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);
    path.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.16,1,0.3,1)`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      path.style.strokeDashoffset = "0";
    }));
  });
}

export function Annotation({
  animate = true,
  animationDuration,
  children,
  className,
  color = "currentColor",
  fill,
  id,
  label,
  labelSide = "top",
  padding = 5,
  stroke,
  strokeMuted,
  style,
  theme: themeProp,
  type = "box",
  ...props
}: AnnotationProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const svgRef       = useRef<SVGSVGElement>(null);
  const annoId = id ?? "annotation";
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });
  const duration = animationDuration ?? (theme === "ink" ? 350 : theme === "crayon" ? 700 : 550);

  const draw = useCallback(() => {
    const container = containerRef.current;
    const svg       = svgRef.current;
    if (!container || !svg) return;

    svg.replaceChildren();

    const w = container.offsetWidth;
    const h = container.offsetHeight;
    const pad = padding;

    // SVG slightly larger than content to avoid clipping the rough overscroll
    const svgW = w + pad * 2 + 12;
    const svgH = h + pad * 2 + 12;
    svg.setAttribute("width", String(svgW));
    svg.setAttribute("height", String(svgH));
    svg.setAttribute("viewBox", `0 0 ${svgW} ${svgH}`);

    const rc = rough.svg(svg);
    const strokeW = theme === "crayon" ? 2.5 : theme === "ink" ? 1.8 : 1.2;

    const opts = getRoughOptions(theme, "border", {
      seed: stableSeed(annoId),
      stroke: color,
      strokeWidth: strokeW,
    });

    // Content sits at (pad+4, pad+4) in the SVG coordinate space
    const cx = pad + 4; // content x-start in SVG coords
    const cy = pad + 4; // content y-start
    const cw = w;
    const ch = h;

    let node: SVGGElement | null = null;

    switch (type) {
      case "box":
        node = rc.rectangle(-pad + cx, -pad + cy, cw + pad * 2, ch + pad * 2, {
          ...opts,
          fill: "none",
        }) as SVGGElement;
        break;

      case "circle":
        node = rc.ellipse(
          cx + cw / 2,
          cy + ch / 2,
          cw + pad * 3,
          ch + pad * 3,
          { ...opts, fill: "none" },
        ) as SVGGElement;
        break;

      case "underline":
        node = rc.line(
          cx - pad,
          cy + ch + 3,
          cx + cw + pad,
          cy + ch + 3,
          opts,
        ) as SVGGElement;
        break;

      case "bracket": {
        const left  = rc.line(cx - pad, cy - pad, cx - pad, cy + ch + pad, opts) as SVGGElement;
        const right = rc.line(cx + cw + pad, cy - pad, cx + cw + pad, cy + ch + pad, {
          ...opts, seed: stableSeed(`${annoId}-r`),
        }) as SVGGElement;
        svg.append(left, right);
        if (animate) { animatePaths(svg, duration); }
        return;
      }

      case "arrow-label": {
        // Draw a rough arrow pointing at the content from the label side
        const arrowLen = 24;
        let x1: number, y1: number, x2: number, y2: number;

        if (labelSide === "top") {
          x1 = cx + cw / 2; y1 = cy - pad - arrowLen;
          x2 = cx + cw / 2; y2 = cy - pad - 2;
        } else if (labelSide === "bottom") {
          x1 = cx + cw / 2; y1 = cy + ch + pad + arrowLen;
          x2 = cx + cw / 2; y2 = cy + ch + pad + 2;
        } else if (labelSide === "left") {
          x1 = cx - pad - arrowLen; y1 = cy + ch / 2;
          x2 = cx - pad - 2;       y2 = cy + ch / 2;
        } else {
          x1 = cx + cw + pad + arrowLen; y1 = cy + ch / 2;
          x2 = cx + cw + pad + 2;       y2 = cy + ch / 2;
        }

        const arrowNode = rc.line(x1, y1, x2, y2, opts) as SVGGElement;
        svg.appendChild(arrowNode);

        // Arrowhead — two short lines at x2,y2
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const hs = 7;
        svg.appendChild(rc.line(x2, y2,
          x2 - Math.cos(angle - 0.5) * hs,
          y2 - Math.sin(angle - 0.5) * hs,
          { ...opts, seed: stableSeed(`${annoId}-ah1`) }) as SVGGElement);
        svg.appendChild(rc.line(x2, y2,
          x2 - Math.cos(angle + 0.5) * hs,
          y2 - Math.sin(angle + 0.5) * hs,
          { ...opts, seed: stableSeed(`${annoId}-ah2`) }) as SVGGElement);

        if (animate) animatePaths(svg, duration);
        return;
      }
    }

    if (node) {
      svg.appendChild(node);
      if (animate) animatePaths(svg, duration);
    }
  }, [animate, annoId, color, duration, labelSide, padding, theme, type]);

  useEffect(() => {
    const rid = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(rid);
  }, [draw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(container);
    return () => ro.disconnect();
  }, [draw]);

  const labelPositionStyle: Record<AnnotationSide, CSSProperties> = {
    bottom: { bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: 4 },
    left:   { right: "100%", top: "50%",  transform: "translateY(-50%)", marginRight: 8 },
    right:  { left: "100%",  top: "50%",  transform: "translateY(-50%)", marginLeft: 8 },
    top:    { bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: 4 },
  };

  return (
    <span
      ref={containerRef}
      className={cn("relative inline-block", className)}
      style={{ ...roughStyle, ...style }}
      {...props}
    >
      {children}
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute overflow-visible"
        style={{
          top:  -(padding + 4),
          left: -(padding + 4),
        }}
      />
      {label ? (
        <span
          className="absolute pointer-events-none whitespace-nowrap text-xs font-medium"
          style={{ ...labelPositionStyle[labelSide], color }}
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}
