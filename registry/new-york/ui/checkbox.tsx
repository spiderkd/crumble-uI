"use client";

import { useCallback, useEffect, useRef, type ChangeEvent } from "react";
import rough from "roughjs";
import { cn } from "@/lib/utils";
import {
  getRoughOptions,
  randomSeed,
  stableSeed,
  type CrumbleTheme,
} from "@/lib/rough";
import { useCrumble } from "@/lib/crumble-context";

export interface CheckboxProps {
  checked?: boolean;
  className?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  id?: string;
  label?: string;
  onChange?: (checked: boolean) => void;
  theme?: CrumbleTheme;
}

const SIZE = 20;

export function Checkbox({
  checked,
  className,
  defaultChecked,
  disabled,
  id,
  label,
  onChange,
  theme: themeProp,
}: CheckboxProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const internalChecked = useRef(defaultChecked ?? false);
  const inputId =
    id ?? `checkbox-${label?.toLowerCase().replace(/\s+/g, "-") ?? "field"}`;
  const { animateOnHover, theme: contextTheme } = useCrumble();
  const theme = themeProp ?? contextTheme;

  const draw = useCallback(
    (isOn: boolean, reseed = false) => {
      const svg = svgRef.current;
      if (!svg) return;

      svg.replaceChildren();

      const rc = rough.svg(svg);
      const seed = reseed ? randomSeed() : stableSeed(inputId);
      const options = getRoughOptions(theme, "interactive", {
        fill: "none",
        seed,
        stroke: disabled ? "hsl(var(--muted-foreground))" : "currentColor",
      });

      svg.appendChild(rc.rectangle(1, 1, SIZE - 2, SIZE - 2, options));

      if (isOn) {
        const tickOptions = {
          ...options,
          strokeWidth: (options.strokeWidth ?? 1) * 1.5,
        };
        svg.appendChild(
          rc.line(3, SIZE / 2 + 1, SIZE / 2 - 1, SIZE - 4, tickOptions),
        );
        svg.appendChild(
          rc.line(SIZE / 2 - 1, SIZE - 4, SIZE - 3, 3, tickOptions),
        );
      }
    },
    [disabled, inputId, theme],
  );

  useEffect(() => {
    draw(checked ?? internalChecked.current);
  }, [checked, draw]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    internalChecked.current = event.target.checked;
    draw(event.target.checked);
    onChange?.(event.target.checked);
  };

  return (
    <label
      className={cn(
        "inline-flex cursor-pointer select-none items-center gap-2.5",
        disabled && "cursor-not-allowed opacity-40",
        className,
      )}
      onMouseEnter={() => {
        if (!disabled && animateOnHover)
          draw(checked ?? internalChecked.current, true);
      }}
      onMouseLeave={() => {
        if (!disabled && animateOnHover)
          draw(checked ?? internalChecked.current, false);
      }}
    >
      <div className="relative h-5 w-5 shrink-0">
        <input
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          id={inputId}
          onChange={handleChange}
          className={cn(
            "absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0",
            disabled && "cursor-not-allowed",
          )}
          type="checkbox"
        />
        <svg
          ref={svgRef}
          aria-hidden="true"
          height={SIZE}
          width={SIZE}
          className="pointer-events-none overflow-visible"
        />
      </div>
      {label ? <span className="text-sm text-foreground">{label}</span> : null}
    </label>
  );
}
