"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import rough from "roughjs";
import { cn } from "@/lib/utils";
import {
  getRoughOptions,
  randomSeed,
  stableSeed,
  type CrumbleTheme,
} from "@/lib/rough";
import { useCrumble } from "@/lib/crumble-context";

export interface RadioOption {
  disabled?: boolean;
  label: string;
  value: string;
}

export interface RadioGroupProps {
  className?: string;
  defaultValue?: string;
  name: string;
  onChange?: (value: string) => void;
  options: RadioOption[];
  orientation?: "vertical" | "horizontal";
  theme?: CrumbleTheme;
  value?: string;
}

const SIZE = 20;

function RadioItem({
  checked,
  name,
  onChange,
  option,
  theme: themeProp,
}: {
  checked: boolean;
  name: string;
  onChange: (value: string) => void;
  option: RadioOption;
  theme?: CrumbleTheme;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const id = `radio-${name}-${option.value}`;
  const { animateOnHover, theme: contextTheme } = useCrumble();
  const theme = themeProp ?? contextTheme;

  const draw = useCallback(
    (isOn: boolean, reseed = false) => {
      const svg = svgRef.current;
      if (!svg) return;

      svg.replaceChildren();

      const rc = rough.svg(svg);
      const seed = reseed ? randomSeed() : stableSeed(id);
      const options = getRoughOptions(theme, "interactive", {
        fill: "none",
        seed,
        stroke: option.disabled
          ? "hsl(var(--muted-foreground))"
          : "currentColor",
      });

      svg.appendChild(rc.circle(SIZE / 2, SIZE / 2, SIZE - 2, options));

      if (isOn) {
        svg.appendChild(
          rc.circle(SIZE / 2, SIZE / 2, SIZE / 2, {
            ...options,
            fill: option.disabled
              ? "hsl(var(--muted-foreground))"
              : "currentColor",
            fillStyle: "solid",
            stroke: "none",
          }),
        );
      }
    },
    [id, option.disabled, theme],
  );

  useEffect(() => {
    draw(checked);
  }, [checked, draw]);

  return (
    <label
      className={cn(
        "inline-flex cursor-pointer select-none items-center gap-2.5",
        option.disabled && "cursor-not-allowed opacity-40",
      )}
      onMouseEnter={() => {
        if (!option.disabled && animateOnHover) draw(checked, true);
      }}
      onMouseLeave={() => {
        if (!option.disabled && animateOnHover) draw(checked, false);
      }}
    >
      <div className="relative h-5 w-5 shrink-0">
        <input
          checked={checked}
          disabled={option.disabled}
          id={id}
          name={name}
          onChange={() => onChange(option.value)}
          className={cn(
            "absolute inset-0 m-0 h-full w-full cursor-pointer opacity-0",
            option.disabled && "cursor-not-allowed",
          )}
          type="radio"
          value={option.value}
        />
        <svg
          ref={svgRef}
          aria-hidden="true"
          height={SIZE}
          width={SIZE}
          className="pointer-events-none overflow-visible"
        />
      </div>
      <span className="text-sm text-foreground">{option.label}</span>
    </label>
  );
}

export function RadioGroup({
  className,
  defaultValue,
  name,
  onChange,
  options,
  orientation = "vertical",
  theme,
  value,
}: RadioGroupProps) {
  const [selected, setSelected] = useState(defaultValue ?? value ?? "");

  const handleChange = (nextValue: string) => {
    setSelected(nextValue);
    onChange?.(nextValue);
  };

  return (
    <div
      className={cn(
        "flex",
        orientation === "vertical" ? "flex-col gap-3" : "flex-row gap-5",
        className,
      )}
      role="radiogroup"
    >
      {options.map((option) => (
        <RadioItem
          key={option.value}
          checked={(value ?? selected) === option.value}
          name={name}
          onChange={handleChange}
          option={option}
          theme={theme}
        />
      ))}
    </div>
  );
}
