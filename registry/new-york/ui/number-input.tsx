"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
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

export interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange">,
    CrumbleColorProps {
  className?: string;
  defaultValue?: number;
  disabled?: boolean;
  error?: string;
  id?: string;
  label?: string;
  max?: number;
  min?: number;
  onChange?: (value: number) => void;
  step?: number;
  theme?: CrumbleTheme;
  value?: number;
}

const BTN_W = 32;
const HEIGHT = 40;

function StepButton({
  disabled,
  label,
  onClick,
  side,
  theme,
  btnId,
}: {
  disabled: boolean;
  label: "+" | "−";
  onClick: () => void;
  side: "left" | "right";
  theme: CrumbleTheme;
  btnId: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  const draw = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.replaceChildren();
    svg.setAttribute("width", String(BTN_W));
    svg.setAttribute("height", String(HEIGHT));
    svg.setAttribute("viewBox", `0 0 ${BTN_W} ${HEIGHT}`);

    const rc = rough.svg(svg);
    const opts = getRoughOptions(theme, "interactive", {
      fill: "none",
      seed: stableSeed(btnId),
      stroke: disabled ? "var(--cr-stroke-muted)" : "var(--cr-stroke)",
    });

    // Only draw the relevant sides of the border
    if (side === "left") {
      // Left, top, bottom edges + right edge shared with input
      svg.appendChild(rc.line(1, 1, 1, HEIGHT - 1, opts));
      svg.appendChild(rc.line(1, 1, BTN_W, 1, opts));
      svg.appendChild(rc.line(1, HEIGHT - 1, BTN_W, HEIGHT - 1, opts));
    } else {
      svg.appendChild(rc.line(0, 1, BTN_W - 1, 1, opts));
      svg.appendChild(rc.line(BTN_W - 1, 1, BTN_W - 1, HEIGHT - 1, opts));
      svg.appendChild(rc.line(0, HEIGHT - 1, BTN_W - 1, HEIGHT - 1, opts));
    }

    // Symbol
    const cx = BTN_W / 2;
    const cy = HEIGHT / 2;
    const symOpts = { ...opts, strokeWidth: (opts.strokeWidth ?? 1) * 1.2 };
    svg.appendChild(rc.line(cx - 5, cy, cx + 5, cy, symOpts)); // horizontal bar (both + and −)
    if (label === "+") {
      svg.appendChild(rc.line(cx, cy - 5, cx, cy + 5, symOpts)); // vertical bar
    }
  }, [btnId, disabled, label, side, theme]);

  useEffect(() => {
    const id = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(id);
  }, [draw]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => draw()}
      className={cn(
        "relative shrink-0 outline-none",
        disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer",
      )}
      style={{ width: BTN_W, height: HEIGHT }}
      aria-label={label === "+" ? "increment" : "decrement"}
    >
      <svg ref={svgRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible" />
    </button>
  );
}

export function NumberInput({
  className,
  defaultValue = 0,
  disabled = false,
  error,
  fill,
  id,
  label,
  max,
  min,
  onChange,
  step = 1,
  stroke,
  strokeMuted,
  theme: themeProp,
  value: controlledValue,
  ...props
}: NumberInputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [focused, setFocused] = useState(false);

  const value = controlledValue ?? internalValue;
  const inputId = id ?? `number-${label?.toLowerCase().replace(/\s+/g, "-") ?? "input"}`;
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });

  const drawBorder = useCallback(() => {
    const svg = svgRef.current;
    const wrapper = wrapperRef.current;
    if (!svg || !wrapper) return;

    svg.replaceChildren();
    const w = wrapper.offsetWidth - BTN_W * 2;
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(HEIGHT));
    svg.setAttribute("viewBox", `0 0 ${w} ${HEIGHT}`);

    const rc = rough.svg(svg);
    // Only top and bottom lines — left/right are handled by StepButton borders
    const opts = getRoughOptions(theme, "border", {
      seed: stableSeed(inputId),
      stroke: error ? "var(--cr-stroke-error)" : focused ? "var(--cr-stroke)" : "var(--cr-stroke-muted)",
    });
    svg.appendChild(rc.line(0, 1, w, 1, opts));
    svg.appendChild(rc.line(0, HEIGHT - 1, w, HEIGHT - 1, opts));
  }, [error, focused, inputId, theme]);

  useEffect(() => {
    drawBorder();
  }, [drawBorder]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const ro = new ResizeObserver(() => drawBorder());
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [drawBorder]);

  const clamp = (v: number) => {
    let result = v;
    if (min !== undefined) result = Math.max(min, result);
    if (max !== undefined) result = Math.min(max, result);
    return result;
  };

  const update = (next: number) => {
    const clamped = clamp(next);
    setInternalValue(clamped);
    onChange?.(clamped);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)} style={roughStyle}>
      {label ? (
        <label htmlFor={inputId} className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
      ) : null}
      <div ref={wrapperRef} className="flex">
        <StepButton
          side="left"
          label="−"
          disabled={disabled || (min !== undefined && value <= min)}
          onClick={() => update(value - step)}
          theme={theme}
          btnId={`${inputId}-dec`}
        />
        <div className="relative flex-1" style={{ height: HEIGHT }}>
          <svg ref={svgRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible" />
          <input
            id={inputId}
            type="number"
            disabled={disabled}
            value={value}
            min={min}
            max={max}
            step={step}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => update(Number(e.target.value))}
            className="absolute inset-0 h-full w-full border-none bg-transparent text-center text-sm text-foreground outline-none tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            {...props}
          />
        </div>
        <StepButton
          side="right"
          label="+"
          disabled={disabled || (max !== undefined && value >= max)}
          onClick={() => update(value + step)}
          theme={theme}
          btnId={`${inputId}-inc`}
        />
      </div>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
