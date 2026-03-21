"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { cn } from "@/lib/utils";
import {
  getRoughOptions,
  stableSeed,
  type CrumbleTheme,
} from "@/lib/rough";
import { useCrumble } from "@/lib/crumble-context";

export interface ToggleProps {
  checked?: boolean;
  className?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  id?: string;
  label?: string;
  onChange?: (checked: boolean) => void;
  theme?: CrumbleTheme;
}

const HEIGHT = 24;
const WIDTH = 44;

export function Toggle({
  checked,
  className,
  defaultChecked = false,
  disabled,
  id,
  label,
  onChange,
  theme: themeProp,
}: ToggleProps) {
  const [internalValue, setInternalValue] = useState(defaultChecked);
  const svgRef = useRef<SVGSVGElement>(null);
  const toggleId =
    id ?? `toggle-${label?.toLowerCase().replace(/\s+/g, "-") ?? "field"}`;
  const currentValue = checked ?? internalValue;
  const { theme: contextTheme } = useCrumble();
  const theme = themeProp ?? contextTheme;

  const draw = useCallback(
    (isOn: boolean) => {
      const svg = svgRef.current;
      if (!svg) return;

      svg.replaceChildren();

      const renderer = rough.svg(svg);
      const options = getRoughOptions(theme, "interactive", {
        seed: stableSeed(toggleId),
        stroke: disabled ? "hsl(var(--muted-foreground))" : "currentColor",
      });

      svg.appendChild(
        renderer.rectangle(1, 1, WIDTH - 2, HEIGHT - 2, {
          ...options,
          fill: isOn ? "currentColor" : "none",
          fillStyle: "solid",
          roughness: 0.8,
        }),
      );

      const thumbX = isOn ? WIDTH - HEIGHT / 2 - 2 : HEIGHT / 2 + 2;
      svg.appendChild(
        renderer.circle(thumbX, HEIGHT / 2, HEIGHT - 6, {
          ...options,
          fill: isOn
            ? "hsl(var(--background))"
            : disabled
              ? "hsl(var(--muted-foreground))"
              : "currentColor",
          fillStyle: "solid",
          seed: stableSeed(`${toggleId}-thumb`),
          stroke: isOn ? "hsl(var(--background))" : "currentColor",
        }),
      );
    },
    [disabled, theme, toggleId],
  );

  useEffect(() => {
    draw(currentValue);
  }, [currentValue, draw]);

  const handleClick = () => {
    if (disabled) return;

    const nextValue = !currentValue;
    setInternalValue(nextValue);
    onChange?.(nextValue);
  };

  return (
    <label
      className={cn(
        "inline-flex cursor-pointer select-none items-center gap-2.5",
        disabled && "cursor-not-allowed opacity-40",
        className,
      )}
      htmlFor={toggleId}
    >
      <div onClick={handleClick} className="relative h-6 w-11 shrink-0">
        <input
          checked={currentValue}
          disabled={disabled}
          id={toggleId}
          onChange={() => {}}
          className="absolute h-0 w-0 opacity-0"
          type="checkbox"
        />
        <svg
          ref={svgRef}
          aria-checked={currentValue}
          aria-hidden="true"
          height={HEIGHT}
          width={WIDTH}
          role="switch"
          className={cn(
            "overflow-visible",
            disabled ? "cursor-not-allowed" : "cursor-pointer",
          )}
        />
      </div>
      {label ? <span className="text-sm text-foreground">{label}</span> : null}
    </label>
  );
}
