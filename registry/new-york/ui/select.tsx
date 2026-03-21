"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import { type CrumbleTheme } from "@/lib/rough";
import { useRough } from "@/hooks/use-rough";

export interface SelectOption {
  disabled?: boolean;
  label: string;
  value: string;
}

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> {
  error?: string;
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  theme?: CrumbleTheme;
}

const HEIGHT = 40;

export function Select({
  className,
  error,
  id,
  label,
  onBlur,
  onFocus,
  options,
  placeholder,
  theme: themeProp,
  ...props
}: SelectProps) {
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const selectId =
    id ?? `select-${label?.toLowerCase().replace(/\s+/g, "-") ?? "field"}`;
  const { drawLine, drawRect, theme } = useRough({
    stableId: selectId,
    svgRef,
    theme: themeProp,
    variant: "border",
  });

  const draw = useCallback(() => {
    const arrow = arrowRef.current;
    const svg = svgRef.current;
    const wrapper = wrapperRef.current;

    if (!svg || !wrapper) return;

    svg.replaceChildren();

    const width = wrapper.offsetWidth;
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(HEIGHT));
    svg.setAttribute("viewBox", `0 0 ${width} ${HEIGHT}`);

    const stroke = error
      ? "hsl(var(--destructive))"
      : focused
        ? "hsl(var(--foreground))"
        : "hsl(var(--border))";

    const box = drawRect(1, 1, width - 2, HEIGHT - 2, {
      fill: "none",
      stroke,
    });

    if (box) {
      svg.appendChild(box);
    }

    if (!arrow) return;

    arrow.replaceChildren();

    const leftLine = drawLine(2, 4, 8, 10, { stroke, strokeWidth: 1.5 });
    const rightLine = drawLine(8, 10, 14, 4, { stroke, strokeWidth: 1.5 });

    if (leftLine) {
      arrow.appendChild(leftLine);
    }

    if (rightLine) {
      arrow.appendChild(rightLine);
    }
  }, [drawLine, drawRect, error, focused]);

  useEffect(() => {
    draw();
  }, [draw, focused, theme]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new ResizeObserver(() => draw());
    observer.observe(wrapper);

    return () => observer.disconnect();
  }, [draw]);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label
          htmlFor={selectId}
          className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
        >
          {label}
        </label>
      ) : null}
      <div ref={wrapperRef} className="relative h-10">
        <svg
          ref={svgRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-visible"
        />
        <svg
          ref={arrowRef}
          aria-hidden="true"
          height={14}
          width={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 overflow-visible"
        />
        <select
          id={selectId}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none border-none bg-transparent py-0 pl-3 pr-9 text-sm text-foreground outline-none"
          {...props}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option
              key={option.value}
              disabled={option.disabled}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
