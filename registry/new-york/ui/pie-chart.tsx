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
  useState,
  type HTMLAttributes,
} from "react";
import rough from "roughjs";
import { arc as d3Arc, pie as d3Pie, type PieArcDatum } from "d3-shape";
import { cn } from "@/lib/utils";
import {
  CrumbleContext,
  getRoughOptions,
  resolveRoughVars,
  stableSeed,
  type CrumbleColorProps,
  type CrumbleTheme,
} from "@/lib/rough";

export interface PieChartSlice {
  color?: string;
  label: string;
  value: number;
}

export interface PieChartProps
  extends HTMLAttributes<HTMLDivElement>,
    CrumbleColorProps {
  animateOnMount?: boolean;
  data: PieChartSlice[];
  donut?: boolean;
  formatValue?: (v: number, total: number) => string;
  height?: number;
  id?: string;
  showLabels?: boolean;
  showLegend?: boolean;
  theme?: CrumbleTheme;
}

// Default sketch-friendly palette — hand-drawn feel, not too saturated
const DEFAULT_COLORS = [
  "oklch(0.65 0.18 260)",  // blue
  "oklch(0.62 0.16 145)",  // green
  "oklch(0.68 0.18 55)",   // amber
  "oklch(0.63 0.22 25)",   // coral
  "oklch(0.60 0.16 300)",  // purple
  "oklch(0.64 0.14 185)",  // teal
];

export function PieChart({
  animateOnMount = true,
  className,
  data,
  donut = false,
  fill,
  formatValue = (v, t) => `${Math.round((v / t) * 100)}%`,
  height = 260,
  id,
  showLabels = true,
  showLegend = true,
  stroke,
  strokeMuted,
  theme: themeProp,
  ...props
}: PieChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chartId = id ?? "pie-chart";
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });

  const total = data.reduce((s, d) => s + d.value, 0);

  const draw = useCallback(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg || data.length === 0 || total === 0) return;

    svg.replaceChildren();

    const W = container.offsetWidth;
    const legendH = showLegend ? Math.ceil(data.length / 3) * 24 + 8 : 0;
    const chartH = height - legendH;
    const cx = W / 2;
    const cy = chartH / 2;
    const outerR = Math.min(cx, cy) - 16;
    const innerR = donut ? outerR * 0.5 : 0;

    svg.setAttribute("width", String(W));
    svg.setAttribute("height", String(height));
    svg.setAttribute("viewBox", `0 0 ${W} ${height}`);

    // d3 pie layout — computes start/end angles from values
    const pieLayout = d3Pie<PieChartSlice>()
      .value((d) => d.value)
      .sort(null)
      .padAngle(theme === "crayon" ? 0.04 : theme === "ink" ? 0.02 : 0.03);

    const arcs = pieLayout(data);

    // d3 arc path generator
    const arcGen = d3Arc<PieArcDatum<PieChartSlice>>()
      .innerRadius(innerR)
      .outerRadius(outerR);

    // Label arc — slightly outside the pie
    const labelArc = d3Arc<PieArcDatum<PieChartSlice>>()
      .innerRadius(outerR * 0.75)
      .outerRadius(outerR * 0.75);

    const rc = rough.svg(svg);

    arcs.forEach((arcDatum, i) => {
      const color = arcDatum.data.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
      const isHovered = hoveredIndex === i;

      // Slightly explode hovered slice
      const offset = isHovered ? 6 : 0;
      const midAngle = (arcDatum.startAngle + arcDatum.endAngle) / 2;
      const dx = Math.sin(midAngle) * offset;
      const dy = -Math.cos(midAngle) * offset;

      // d3 generates the path string — roughjs wobbles it
      const pathD = arcGen(arcDatum);
      if (!pathD) return;

      const sliceOpts = getRoughOptions(theme, "fill", {
        fill: color,
        fillStyle: theme === "ink" ? "solid" : "hachure",
        fillWeight: theme === "pencil" ? 0.9 : 1.2,
        hachureAngle: -41 + i * 15, // different hachure angle per slice
        hachureGap: theme === "crayon" ? 4 : 6,
        seed: stableSeed(`${chartId}-slice-${i}`),
        stroke: color,
        strokeWidth: theme === "crayon" ? 2 : theme === "ink" ? 1.5 : 1,
      });

      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("transform", `translate(${cx + dx}, ${cy + dy})`);

      const sliceNode = rc.path(pathD, sliceOpts) as SVGGElement;

      // Animate on mount: fade + scale in staggered
      if (animateOnMount) {
        group.style.opacity = "0";
        group.style.transform = `translate(${cx + dx}px, ${cy + dy}px) scale(0.85)`;
        group.style.transformOrigin = `${cx + dx}px ${cy + dy}px`;
        group.style.transition = `opacity 350ms ease ${i * 60}ms, transform 350ms cubic-bezier(0.16,1,0.3,1) ${i * 60}ms`;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          group.style.opacity = "1";
          group.style.transform = `translate(${cx + dx}px, ${cy + dy}px) scale(1)`;
        }));
      }

      group.appendChild(sliceNode);

      // Hit area for hover
      const hitPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      hitPath.setAttribute("d", pathD);
      hitPath.setAttribute("fill", "transparent");
      hitPath.setAttribute("stroke", "none");
      hitPath.style.cursor = "pointer";
      hitPath.addEventListener("mouseenter", () => setHoveredIndex(i));
      hitPath.addEventListener("mouseleave", () => setHoveredIndex(null));
      group.appendChild(hitPath);

      svg.appendChild(group);

      // Slice label
      if (showLabels && arcDatum.endAngle - arcDatum.startAngle > 0.4) {
        const [lx, ly] = labelArc.centroid(arcDatum);
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
        t.setAttribute("x", String(cx + lx));
        t.setAttribute("y", String(cy + ly));
        t.setAttribute("text-anchor", "middle");
        t.setAttribute("dominant-baseline", "central");
        t.setAttribute("fill", "white");
        t.setAttribute("font-size", "11");
        t.setAttribute("font-weight", "500");
        t.setAttribute("pointer-events", "none");
        t.textContent = formatValue(arcDatum.data.value, total);
        svg.appendChild(t);
      }
    });

    // Center label for donut
    if (donut) {
      const ct = document.createElementNS("http://www.w3.org/2000/svg", "text");
      ct.setAttribute("x", String(cx));
      ct.setAttribute("y", String(cy - 6));
      ct.setAttribute("text-anchor", "middle");
      ct.setAttribute("fill", "currentColor");
      ct.setAttribute("font-size", "22");
      ct.setAttribute("font-weight", "600");
      ct.textContent = String(total);
      svg.appendChild(ct);

      const cl = document.createElementNS("http://www.w3.org/2000/svg", "text");
      cl.setAttribute("x", String(cx));
      cl.setAttribute("y", String(cy + 14));
      cl.setAttribute("text-anchor", "middle");
      cl.setAttribute("fill", "currentColor");
      cl.setAttribute("font-size", "11");
      cl.setAttribute("opacity", "0.5");
      cl.textContent = "total";
      svg.appendChild(cl);
    }

    // Legend
    if (showLegend) {
      const perRow = 3;
      const cellW = W / perRow;
      data.forEach((d, i) => {
        const col = i % perRow;
        const row = Math.floor(i / perRow);
        const lx = col * cellW + 12;
        const ly = chartH + row * 24 + 12;
        const color = d.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];

        // Color dot
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("cx", String(lx + 5));
        dot.setAttribute("cy", String(ly + 5));
        dot.setAttribute("r", "5");
        dot.setAttribute("fill", color);
        dot.setAttribute("opacity", "0.85");
        svg.appendChild(dot);

        const lt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        lt.setAttribute("x", String(lx + 14));
        lt.setAttribute("y", String(ly + 9));
        lt.setAttribute("fill", "currentColor");
        lt.setAttribute("font-size", "11");
        lt.setAttribute("opacity", "0.65");
        lt.textContent = d.label;
        svg.appendChild(lt);
      });
    }
  }, [animateOnMount, chartId, data, donut, formatValue, height, hoveredIndex, showLabels, showLegend, theme, total]);

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

  return (
    <div
      ref={containerRef}
      className={cn("w-full", className)}
      style={{ ...roughStyle, height }}
      {...props}
    >
      <svg
        ref={svgRef}
        aria-label={donut ? "Donut chart" : "Pie chart"}
        role="img"
        className="overflow-visible"
      />
    </div>
  );
}
