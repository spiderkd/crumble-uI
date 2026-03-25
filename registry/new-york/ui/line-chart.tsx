"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  type HTMLAttributes,
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

export interface LineChartSeries {
  color?: string;
  data: number[];
  id: string;
  label: string;
}

export interface LineChartProps
  extends HTMLAttributes<HTMLDivElement>,
    CrumbleColorProps {
  animateOnMount?: boolean;
  formatValue?: (v: number) => string;
  formatX?: (i: number) => string;
  height?: number;
  id?: string;
  labels?: string[];
  series: LineChartSeries[];
  showDots?: boolean;
  showGrid?: boolean;
  theme?: CrumbleTheme;
}

const PAD = { top: 20, right: 20, bottom: 40, left: 48 };
const GRID_LINES = 4;

// Catmull-Rom to cubic bezier for smooth rough lines
function catmullRomPath(points: [number, number][]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

export function LineChart({
  animateOnMount = true,
  className,
  fill,
  formatValue = (v) => String(v),
  formatX,
  height = 240,
  id,
  labels,
  series,
  showDots = true,
  showGrid = true,
  stroke,
  strokeMuted,
  theme: themeProp,
  ...props
}: LineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const chartId = id ?? "line-chart";
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });

  const scale = (v: number, dMin: number, dMax: number, rMin: number, rMax: number) =>
    dMax === dMin ? rMin : rMin + ((v - dMin) / (dMax - dMin)) * (rMax - rMin);

  const draw = useCallback(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg || series.length === 0) return;

    svg.replaceChildren();

    const W = container.offsetWidth;
    const H = height;
    svg.setAttribute("width", String(W));
    svg.setAttribute("height", String(H));
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

    const allValues = series.flatMap((s) => s.data);
    const maxVal = Math.max(...allValues, 0);
    const minVal = Math.min(...allValues, 0);
    const niceMax = Math.ceil(maxVal / GRID_LINES) * GRID_LINES || 1;
    const niceMin = minVal < 0 ? Math.floor(minVal / GRID_LINES) * GRID_LINES : 0;

    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;
    const maxLen = Math.max(...series.map((s) => s.data.length));

    const rc = rough.svg(svg);
    const borderOpts = getRoughOptions(theme, "border", {
      stroke: "var(--cr-stroke-muted)",
      strokeWidth: theme === "crayon" ? 1.5 : 0.8,
    });

    // Grid + Y labels
    if (showGrid) {
      for (let i = 0; i <= GRID_LINES; i++) {
        const val = niceMin + ((niceMax - niceMin) / GRID_LINES) * i;
        const y = PAD.top + plotH - scale(val, niceMin, niceMax, 0, plotH);
        svg.appendChild(rc.line(PAD.left, y, PAD.left + plotW, y, { ...borderOpts, seed: stableSeed(`${chartId}-grid-${i}`) }));
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("x", String(PAD.left - 8));
        t.setAttribute("y", String(y + 4));
        t.setAttribute("text-anchor", "end");
        t.setAttribute("fill", "currentColor");
        t.setAttribute("font-size", "11");
        t.setAttribute("opacity", "0.5");
        t.textContent = formatValue(val);
        svg.appendChild(t);
      }
    }

    // Axes
    svg.appendChild(rc.line(PAD.left, PAD.top, PAD.left, PAD.top + plotH, { ...borderOpts, seed: stableSeed(`${chartId}-yaxis`) }));
    svg.appendChild(rc.line(PAD.left, PAD.top + plotH, PAD.left + plotW, PAD.top + plotH, { ...borderOpts, seed: stableSeed(`${chartId}-xaxis`) }));

    // X labels
    for (let i = 0; i < maxLen; i++) {
      const x = PAD.left + scale(i, 0, maxLen - 1, 0, plotW);
      const lbl = formatX ? formatX(i) : labels?.[i] ?? String(i + 1);
      const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t.setAttribute("x", String(x));
      t.setAttribute("y", String(PAD.top + plotH + 16));
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("fill", "currentColor");
      t.setAttribute("font-size", "11");
      t.setAttribute("opacity", "0.5");
      t.textContent = lbl;
      svg.appendChild(t);
    }

    // Series lines
    series.forEach((s, si) => {
      const color = s.color ?? "currentColor";
      const pts: [number, number][] = s.data.map((v, i) => [
        PAD.left + scale(i, 0, maxLen - 1, 0, plotW),
        PAD.top + plotH - scale(v, niceMin, niceMax, 0, plotH),
      ]);

      const pathD = catmullRomPath(pts);

      const lineOpts = getRoughOptions(theme, "chart", {
        fill: "none",
        seed: stableSeed(`${chartId}-line-${si}`),
        stroke: color,
        strokeWidth: theme === "crayon" ? 2.5 : theme === "ink" ? 2 : 1.5,
      });

      const lineNode = rc.path(pathD, lineOpts) as SVGGElement;

      if (animateOnMount) {
        lineNode.querySelectorAll("path").forEach((p) => {
          const len = p.getTotalLength();
          p.style.strokeDasharray = String(len);
          p.style.strokeDashoffset = String(len);
          const dur = theme === "crayon" ? 900 : theme === "ink" ? 500 : 700;
          p.style.transition = `stroke-dashoffset ${dur}ms cubic-bezier(0.16,1,0.3,1) ${si * 100}ms`;
          requestAnimationFrame(() => requestAnimationFrame(() => { p.style.strokeDashoffset = "0"; }));
        });
      }

      svg.appendChild(lineNode);

      // Dots at data points
      if (showDots) {
        pts.forEach((pt, i) => {
          const dotNode = rc.circle(pt[0], pt[1], 7, getRoughOptions(theme, "interactive", {
            fill: color,
            fillStyle: "solid",
            seed: stableSeed(`${chartId}-dot-${si}-${i}`),
            stroke: color,
            strokeWidth: 0.5,
          }));
          svg.appendChild(dotNode);
        });
      }
    });

    // Legend
    if (series.length > 1) {
      series.forEach((s, i) => {
        const lx = PAD.left + i * 100;
        const ly = H - 8;
        const color = s.color ?? "currentColor";
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", String(lx)); line.setAttribute("y1", String(ly));
        line.setAttribute("x2", String(lx + 16)); line.setAttribute("y2", String(ly));
        line.setAttribute("stroke", color); line.setAttribute("stroke-width", "2");
        svg.appendChild(line);
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("x", String(lx + 20)); t.setAttribute("y", String(ly + 4));
        t.setAttribute("fill", "currentColor"); t.setAttribute("font-size", "11"); t.setAttribute("opacity", "0.6");
        t.textContent = s.label;
        svg.appendChild(t);
      });
    }
  }, [animateOnMount, chartId, formatValue, formatX, height, labels, series, showDots, showGrid, theme]);

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
      className={cn("w-full", className)}
      style={{ ...roughStyle, height }}
      {...props}
    >
      <svg ref={svgRef} aria-label="Line chart" role="img" className="overflow-visible" />
    </div>
  );
}
