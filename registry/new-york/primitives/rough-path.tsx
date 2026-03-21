"use client";

import { useCallback, useEffect } from "react";
import type { Options } from "roughjs/bin/core";
import { randomSeed, type CrumbleTheme } from "@/lib/rough";
import { useRough } from "@/hooks/use-rough";
import { useCrumble } from "@/lib/crumble-context";

export interface RoughPathProps {
  className?: string;
  d: string;
  fill?: string;
  height: number;
  id?: string;
  options?: Partial<Options>;
  stroke?: string;
  theme?: CrumbleTheme;
  width: number;
}

export function RoughPath({
  className,
  d,
  fill,
  height,
  id,
  options,
  stroke,
  theme: themeProp,
  width,
}: RoughPathProps) {
  const { animateOnHover } = useCrumble();
  const { drawPath, svgRef, theme } = useRough({
    options,
    stableId: id,
    theme: themeProp,
    variant: "border",
  });

  const draw = useCallback(
    (reseed = false) => {
      const svg = svgRef.current;
      if (!svg) return;

      svg.replaceChildren();

      const node = drawPath(d, {
        fill: fill ?? "none",
        seed: reseed ? randomSeed() : undefined,
        stroke: stroke ?? "currentColor",
      });

      if (node) {
        svg.appendChild(node);
      }
    },
    [d, drawPath, fill, stroke, svgRef],
  );

  useEffect(() => {
    draw();
  }, [draw, theme]);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className={className}
      height={height}
      onMouseEnter={() => {
        if (animateOnHover) draw(true);
      }}
      onMouseLeave={() => {
        if (animateOnHover) draw(false);
      }}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    />
  );
}
