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

const SWATCHES = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  "#ffffff", "#d1d5db", "#6b7280", "#111827",
];

export interface ColorPickerProps extends CrumbleColorProps {
  className?: string;
  defaultValue?: string;
  id?: string;
  label?: string;
  onChange?: (color: string) => void;
  swatches?: string[];
  theme?: CrumbleTheme;
  value?: string;
}

function Swatch({
  color,
  isSelected,
  onClick,
  swatchId,
  theme,
}: {
  color: string;
  isSelected: boolean;
  onClick: () => void;
  swatchId: string;
  theme: CrumbleTheme;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const SIZE = 28;

  const draw = useCallback(
    (hover = false) => {
      const svg = svgRef.current;
      if (!svg) return;

      svg.replaceChildren();
      svg.setAttribute("width", String(SIZE));
      svg.setAttribute("height", String(SIZE));
      svg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);

      if (!isSelected && !hover) return;

      const rc = rough.svg(svg);
      svg.appendChild(
        rc.circle(SIZE / 2, SIZE / 2, SIZE - 3, getRoughOptions(theme, isSelected ? "interactive" : "border", {
          fill: "none",
          seed: stableSeed(swatchId),
          stroke: color === "#ffffff" ? "#d1d5db" : color,
          strokeWidth: isSelected ? 2 : 1,
        })),
      );
    },
    [color, isSelected, swatchId, theme],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(id);
  }, [draw]);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => draw(true)}
      onMouseLeave={() => draw(false)}
      className="relative rounded-full outline-none"
      style={{ width: SIZE, height: SIZE }}
      aria-label={`Select color ${color}`}
      aria-pressed={isSelected}
    >
      <div
        className="absolute inset-1 rounded-full border border-black/10"
        style={{ background: color }}
      />
      <svg ref={svgRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible" />
    </button>
  );
}

export function ColorPicker({
  className,
  defaultValue = "#3b82f6",
  fill,
  id,
  label,
  onChange,
  stroke,
  strokeMuted,
  swatches = SWATCHES,
  theme: themeProp,
  value: controlledValue,
}: ColorPickerProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [hexInput, setHexInput] = useState(defaultValue);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputSvgRef = useRef<SVGSVGElement>(null);
  const pickerId = id ?? "color-picker";
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });

  const value = controlledValue ?? internalValue;

  const drawInput = useCallback(() => {
    const svg = inputSvgRef.current;
    const wrapper = wrapperRef.current;
    if (!svg || !wrapper) return;

    svg.replaceChildren();
    const w = wrapper.offsetWidth;
    const H = 36;
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(H));
    svg.setAttribute("viewBox", `0 0 ${w} ${H}`);

    const rc = rough.svg(svg);
    svg.appendChild(rc.rectangle(1, 1, w - 2, H - 2, getRoughOptions(theme, "border", {
      fill: "none",
      seed: stableSeed(`${pickerId}-input`),
      stroke: "var(--cr-stroke-muted)",
    })));
  }, [pickerId, theme]);

  useEffect(() => { drawInput(); }, [drawInput]);
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const ro = new ResizeObserver(() => drawInput());
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [drawInput]);

  const handleSelect = (color: string) => {
    setInternalValue(color);
    setHexInput(color);
    onChange?.(color);
  };

  const handleHexChange = (raw: string) => {
    setHexInput(raw);
    const cleaned = raw.startsWith("#") ? raw : `#${raw}`;
    if (/^#[0-9a-f]{6}$/i.test(cleaned)) {
      setInternalValue(cleaned);
      onChange?.(cleaned);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)} style={roughStyle}>
      {label ? (
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      ) : null}

      {/* Swatch grid */}
      <div className="grid grid-cols-6 gap-1.5">
        {swatches.map((color) => (
          <Swatch
            key={color}
            color={color}
            isSelected={value.toLowerCase() === color.toLowerCase()}
            onClick={() => handleSelect(color)}
            swatchId={`${pickerId}-swatch-${color}`}
            theme={theme}
          />
        ))}
      </div>

      {/* Hex input */}
      <div ref={wrapperRef} className="relative" style={{ height: 36 }}>
        <svg ref={inputSvgRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible" />
        <div className="absolute inset-0 flex items-center gap-2 px-2">
          <div className="h-5 w-5 shrink-0 rounded-full border border-black/10" style={{ background: value }} />
          <input
            type="text"
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
            className="flex-1 border-none bg-transparent font-mono text-sm text-foreground outline-none"
            aria-label="hex color value"
            maxLength={7}
          />
        </div>
      </div>
    </div>
  );
}
