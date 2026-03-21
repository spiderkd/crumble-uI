"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import { type CrumbleTheme } from "@/lib/rough";
import { useRough } from "@/hooks/use-rough";

export type InputStyle = "box" | "underline";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  inputStyle?: InputStyle;
  label?: string;
  theme?: CrumbleTheme;
}

const HEIGHT = 40;

export function Input({
  className,
  error,
  id,
  inputStyle = "box",
  label,
  onBlur,
  onFocus,
  theme: themeProp,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const inputId =
    id ?? `input-${label?.toLowerCase().replace(/\s+/g, "-") ?? "field"}`;
  const { drawLine, drawRect, theme } = useRough({
    stableId: inputId,
    svgRef,
    theme: themeProp,
    variant: "border",
  });

  const draw = useCallback(() => {
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

    if (inputStyle === "box") {
      const node = drawRect(1, 1, width - 2, HEIGHT - 2, {
        fill: "none",
        stroke,
      });

      if (node) {
        svg.appendChild(node);
      }

      return;
    }

    const node = drawLine(0, HEIGHT - 2, width, HEIGHT - 2, {
      stroke,
      strokeWidth: focused ? 2 : 1,
    });

    if (node) {
      svg.appendChild(node);
    }
  }, [drawLine, drawRect, error, focused, inputStyle]);

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
          htmlFor={inputId}
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
        <input
          id={inputId}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          className={cn(
            "absolute inset-0 h-full w-full border-none bg-transparent text-sm text-foreground outline-none",
            inputStyle === "box" ? "px-3" : "px-0.5",
          )}
          {...props}
        />
      </div>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
