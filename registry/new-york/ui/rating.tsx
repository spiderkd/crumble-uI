"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
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

export interface RatingProps extends CrumbleColorProps {
  className?: string;
  defaultValue?: number;
  disabled?: boolean;
  id?: string;
  label?: string;
  max?: number;
  onChange?: (value: number) => void;
  size?: number;
  theme?: CrumbleTheme;
  value?: number;
}

// Star path centred in a `size × size` box
function starPath(size: number): string {
  const cx = size / 2;
  const cy = size / 2;
  const outer = size * 0.44;
  const inner = size * 0.18;
  const points = 5;
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return d + " Z";
}

function Star({
  active,
  disabled,
  hovered,
  index,
  onClick,
  onHover,
  onLeave,
  ratingId,
  size,
  theme,
}: {
  active: boolean;
  disabled: boolean;
  hovered: boolean;
  index: number;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
  ratingId: string;
  size: number;
  theme: CrumbleTheme;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const path = starPath(size);

  const draw = useCallback(
    (reseed = false) => {
      const svg = svgRef.current;
      if (!svg) return;

      svg.replaceChildren();
      svg.setAttribute("width", String(size));
      svg.setAttribute("height", String(size));
      svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

      const rc = rough.svg(svg);
      const filled = active || hovered;

      svg.appendChild(
        rc.path(path, getRoughOptions(theme, "interactive", {
          fill: filled ? "currentColor" : "none",
          fillStyle: theme === "ink" ? "solid" : "hachure",
          seed: reseed ? randomSeed() : stableSeed(`${ratingId}-star-${index}`),
          stroke: filled ? "currentColor" : "var(--cr-stroke-muted)",
        })),
      );
    },
    [active, hovered, index, path, ratingId, size, theme],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(id);
  }, [draw]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => { onHover(); draw(true); }}
      onMouseLeave={() => { onLeave(); draw(false); }}
      className={cn(
        "relative p-0.5 outline-none",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
      )}
      style={{ width: size + 4, height: size + 4 }}
    >
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none overflow-visible"
        style={{ width: size, height: size }}
      />
    </button>
  );
}

export function Rating({
  className,
  defaultValue = 0,
  disabled = false,
  fill,
  id,
  label,
  max = 5,
  onChange,
  size = 24,
  stroke,
  strokeMuted,
  theme: themeProp,
  value: controlledValue,
}: RatingProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [hoverIndex, setHoverIndex] = useState(-1);

  const value = controlledValue ?? internalValue;
  const ratingId = id ?? `rating-${label ?? "stars"}`;
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });

  const handleClick = (index: number) => {
    if (disabled) return;
    const next = index + 1;
    setInternalValue(next);
    onChange?.(next);
  };

  return (
    <div className={cn("flex flex-col gap-1", className)} style={roughStyle}>
      {label ? (
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      ) : null}
      <div
        className="flex items-center"
        role="radiogroup"
        aria-label={label ?? "rating"}
        onMouseLeave={() => setHoverIndex(-1)}
      >
        {Array.from({ length: max }, (_, i) => (
          <Star
            key={i}
            index={i}
            active={i < value}
            hovered={hoverIndex >= 0 && i <= hoverIndex}
            disabled={disabled}
            ratingId={ratingId}
            size={size}
            theme={theme}
            onClick={() => handleClick(i)}
            onHover={() => setHoverIndex(i)}
            onLeave={() => setHoverIndex(-1)}
          />
        ))}
      </div>
    </div>
  );
}
