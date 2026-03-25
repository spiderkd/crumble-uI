"use client";

/**
 * Dependencies: roughjs (already installed), d3-shape, d3-scale
 * npm install d3-shape d3-scale
 */

import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  type HTMLAttributes,
} from "react";
import rough from "roughjs";
import { line as d3Line, area as d3Area, curveCatmullRom } from "d3-shape";
import { scaleLinear } from "d3-scale";
import { cn } from "@/lib/utils";
import {
  CrumbleContext,
  getRoughOptions,
  resolveRoughVars,
  stableSeed,
  type CrumbleColorProps,
  type CrumbleTheme,
} from "@/lib/rough";

export type SparklineType = "line" | "area" | "bar";

export interface SparklineProps
  extends HTMLAttributes<HTMLSpanElement>,
    CrumbleColorProps {
  animateOnMount?: boolean;
  color?: string;
  data: number[];
  height?: number;
  id?: string;
  theme?: CrumbleTheme;
  type?: SparklineType;
  width?: number;
}

export function Sparkline({
  animateOnMount = true,
  className,
  color,
  data,
  fill,
  height = 32,
  id,
  stroke,
  strokeMuted,
  theme: themeProp,
  type = "line",
  width = 80,
  ...props
}: SparklineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const sparkId = id ?? "sparkline";
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });

  const draw = useCallback(() => {
    const svg = svgRef.current;
    if (!svg || data.length < 2) return;

    svg.replaceChildren();
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const PAD = { top: 3, bottom: 3, left: 2, right: 2 };
    const plotW = width  - PAD.left - PAD.right;
    const plotH = height - PAD.top  - PAD.bottom;

    // d3 scales — proper domain handling including negative values
    const xScale = scaleLinear()
      .domain([0, data.length - 1])
      .range([PAD.left, PAD.left + plotW]);

    const [dMin, dMax] = [Math.min(...data), Math.max(...data)];
    const yScale = scaleLinear()
      .domain([dMin === dMax ? dMin - 1 : dMin, dMax])
      .range([PAD.top + plotH, PAD.top])
      .nice();

    const rc = rough.svg(svg);
    const strokeColor = color ?? "currentColor";

    if (type === "bar") {
      const barW = Math.max(2, (plotW / data.length) * 0.7);
      const gap  = plotW / data.length;
      const zeroY = yScale(0);

      data.forEach((v, i) => {
        const x = xScale(i) - barW / 2;
        const y = yScale(v);
        const barH = Math.abs(zeroY - y);
        const barY = v >= 0 ? y : zeroY;

        if (barH < 1) return;

        svg.appendChild(
          rc.rectangle(x, barY, barW, barH, getRoughOptions(theme, "fill", {
            fill: strokeColor,
            fillStyle: theme === "ink" ? "solid" : "hachure",
            fillWeight: 0.7,
            hachureGap: 4,
            seed: stableSeed(`${sparkId}-bar-${i}`),
            stroke: strokeColor,
            strokeWidth: 0.5,
          })),
        );
      });
      return;
    }

    if (type === "area") {
      // d3 area generator — fills between line and baseline
      const areaGen = d3Area<number>()
        .x((_, i) => xScale(i))
        .y0(yScale(dMin < 0 ? 0 : dMin))
        .y1((v) => yScale(v))
        .curve(curveCatmullRom.alpha(0.5));

      const areaPath = areaGen(data);
      if (areaPath) {
        const areaNode = document.createElementNS("http://www.w3.org/2000/svg", "path");
        areaNode.setAttribute("d", areaPath);
        areaNode.setAttribute("fill", strokeColor);
        areaNode.setAttribute("opacity", "0.15");
        areaNode.setAttribute("stroke", "none");
        svg.appendChild(areaNode);
      }
    }

    // d3 line generator — Catmull-Rom for smooth curves
    const lineGen = d3Line<number>()
      .x((_, i) => xScale(i))
      .y((v) => yScale(v))
      .curve(curveCatmullRom.alpha(0.5));

    const linePath = lineGen(data);
    if (!linePath) return;

    const lineOpts = getRoughOptions(theme, "chart", {
      fill: "none",
      seed: stableSeed(sparkId),
      stroke: strokeColor,
      strokeWidth: theme === "crayon" ? 2.5 : theme === "ink" ? 2 : 1.5,
    });

    const lineNode = rc.path(linePath, lineOpts) as SVGGElement;

    // Animate on mount: stroke-dashoffset draw-on
    if (animateOnMount) {
      lineNode.querySelectorAll("path").forEach((p) => {
        const len = p.getTotalLength();
        p.style.strokeDasharray = String(len);
        p.style.strokeDashoffset = String(len);
        const dur = theme === "crayon" ? 700 : theme === "ink" ? 400 : 550;
        p.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(0.16,1,0.3,1)`;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          p.style.strokeDashoffset = "0";
        }));
      });
    }

    svg.appendChild(lineNode);

    // End dot — marks current/latest value
    const lastX = xScale(data.length - 1);
    const lastY = yScale(data[data.length - 1]);
    svg.appendChild(
      rc.circle(lastX, lastY, 5, getRoughOptions(theme, "interactive", {
        fill: strokeColor,
        fillStyle: "solid",
        seed: stableSeed(`${sparkId}-dot`),
        stroke: strokeColor,
        strokeWidth: 0.5,
      })),
    );
  }, [animateOnMount, color, data, height, sparkId, theme, type, width]);

  useEffect(() => {
    const rid = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(rid);
  }, [draw]);

  return (
    <span
      className={cn("inline-flex items-center", className)}
      style={roughStyle}
      {...props}
    >
      <svg
        ref={svgRef}
        aria-label="Sparkline"
        role="img"
        className="overflow-visible"
        width={width}
        height={height}
      />
    </span>
  );
}
