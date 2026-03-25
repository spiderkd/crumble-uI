"use client";

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
  randomSeed,
  resolveRoughVars,
  stableSeed,
  type CrumbleColorProps,
  type CrumbleTheme,
} from "@/lib/rough";

export type StickyNoteColor = "yellow" | "pink" | "blue" | "green" | "orange";

export interface StickyNoteProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">,
    CrumbleColorProps {
  animateOnHover?: boolean;
  color?: StickyNoteColor;
  id?: string;
  rotate?: number;
  theme?: CrumbleTheme;
  title?: ReactNode;
}

const noteColors: Record<StickyNoteColor, { bg: string; border: string }> = {
  blue:   { bg: "oklch(0.95 0.05 240)", border: "oklch(0.65 0.12 240)" },
  green:  { bg: "oklch(0.95 0.06 145)", border: "oklch(0.60 0.14 145)" },
  orange: { bg: "oklch(0.95 0.08 55)",  border: "oklch(0.65 0.16 55)"  },
  pink:   { bg: "oklch(0.95 0.06 340)", border: "oklch(0.65 0.14 340)" },
  yellow: { bg: "oklch(0.97 0.09 90)",  border: "oklch(0.75 0.16 90)"  },
};

export function StickyNote({
  animateOnHover = true,
  children,
  className,
  color = "yellow",
  fill,
  id,
  rotate = 0,
  stroke,
  strokeMuted,
  style,
  theme: themeProp,
  title,
  ...props
}: StickyNoteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef       = useRef<SVGSVGElement>(null);
  const foldSvgRef   = useRef<SVGSVGElement>(null);
  const noteId = id ?? "sticky-note";
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });

  const { bg, border: borderColor } = noteColors[color];
  const FOLD = 20; // fold triangle size

  const draw = useCallback((reseed = false) => {
    const container = containerRef.current;
    const svg = svgRef.current;
    const foldSvg = foldSvgRef.current;
    if (!container || !svg || !foldSvg) return;

    const w = container.offsetWidth;
    const h = container.offsetHeight;

    // Main border — rough rectangle with bg fill
    svg.replaceChildren();
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

    const rc = rough.svg(svg);

    svg.appendChild(
      rc.rectangle(1, 1, w - 2, h - 2, getRoughOptions(theme, "border", {
        fill: bg,
        fillStyle: "solid",
        seed: reseed ? randomSeed() : stableSeed(noteId),
        stroke: borderColor,
        strokeWidth: theme === "crayon" ? 2.5 : theme === "ink" ? 1.5 : 1,
      })),
    );

    // Fold triangle — bottom-right corner
    const foldSize = FOLD + (theme === "crayon" ? 4 : theme === "ink" ? 2 : 0);
    foldSvg.replaceChildren();
    foldSvg.setAttribute("width", String(foldSize + 4));
    foldSvg.setAttribute("height", String(foldSize + 4));
    foldSvg.setAttribute("viewBox", `0 0 ${foldSize + 4} ${foldSize + 4}`);

    const foldRc = rough.svg(foldSvg);

    // Folded corner triangle (the turned-back part — lighter shade)
    foldSvg.appendChild(
      foldRc.polygon(
        [[2, foldSize], [foldSize, 2], [foldSize, foldSize]],
        getRoughOptions(theme, "fill", {
          fill: "oklch(0.88 0.08 90 / 60%)",
          fillStyle: "solid",
          seed: stableSeed(`${noteId}-fold`),
          stroke: borderColor,
          strokeWidth: theme === "crayon" ? 2 : 1,
        }),
      ),
    );

    // Shadow hint on the fold (a rough line)
    foldSvg.appendChild(
      foldRc.line(2, foldSize, foldSize, 2, getRoughOptions(theme, "border", {
        seed: stableSeed(`${noteId}-fold-line`),
        stroke: borderColor,
        strokeWidth: theme === "crayon" ? 2 : 1,
      })),
    );
  }, [bg, borderColor, noteId, theme]);

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

  const rotateStyle: CSSProperties = rotate !== 0
    ? { transform: `rotate(${rotate}deg)`, transformOrigin: "center center" }
    : {};

  return (
    <div
      style={{ ...roughStyle, ...rotateStyle, ...style }}
      className={cn("relative inline-block", className)}
      onMouseEnter={() => { if (animateOnHover) draw(true); }}
      onMouseLeave={() => { if (animateOnHover) draw(false); }}
      {...props}
    >
      <div ref={containerRef} className="relative min-w-[160px] min-h-[120px] p-4 pb-6">
        <svg ref={svgRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" />

        {/* Fold svg — bottom right */}
        <svg
          ref={foldSvgRef}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-0 overflow-visible"
          style={{ width: FOLD + 4, height: FOLD + 4 }}
        />

        <div className="relative">
          {title ? (
            <p className="mb-2 text-sm font-semibold" style={{ color: borderColor }}>
              {title}
            </p>
          ) : null}
          <div className="text-sm text-foreground/80">{children}</div>
        </div>
      </div>
    </div>
  );
}
