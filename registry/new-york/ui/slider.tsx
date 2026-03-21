"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
} from "react";
import rough from "roughjs";
import { cn } from "@/lib/utils";
import {
  getRoughOptions,
  stableSeed,
  type CrumbleTheme,
} from "@/lib/rough";
import { useCrumble } from "@/lib/crumble-context";

export interface SliderProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  formatValue?: (value: number) => string;
  label?: string;
  showValue?: boolean;
  theme?: CrumbleTheme;
}

const TRACK_HEIGHT = 6;
const THUMB_SIZE = 20;

export function Slider({
  className,
  defaultValue,
  formatValue,
  id,
  label,
  max = 100,
  min = 0,
  onChange,
  showValue = true,
  theme: themeProp,
  value,
  ...props
}: SliderProps) {
  const [current, setCurrent] = useState(Number(value ?? defaultValue ?? min));
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<SVGSVGElement>(null);
  const thumbRef = useRef<SVGSVGElement>(null);
  const sliderId =
    id ?? `slider-${label?.toLowerCase().replace(/\s+/g, "-") ?? "field"}`;
  const pct = (current - Number(min)) / (Number(max) - Number(min));
  const { theme: contextTheme } = useCrumble();
  const theme = themeProp ?? contextTheme;

  const drawAll = useCallback(() => {
    const thumbSvg = thumbRef.current;
    const trackSvg = trackRef.current;
    const wrapper = wrapperRef.current;

    if (!thumbSvg || !trackSvg || !wrapper) return;

    const width = wrapper.offsetWidth;
    const trackHeight = TRACK_HEIGHT + 4;

    trackSvg.replaceChildren();
    trackSvg.setAttribute("width", String(width));
    trackSvg.setAttribute("height", String(trackHeight));
    trackSvg.setAttribute("viewBox", `0 0 ${width} ${trackHeight}`);

    const trackRenderer = rough.svg(trackSvg);
    const baseOptions = getRoughOptions(theme, "border", {
      seed: stableSeed(sliderId),
    });

    trackSvg.appendChild(
      trackRenderer.line(0, TRACK_HEIGHT / 2 + 2, width, TRACK_HEIGHT / 2 + 2, {
        ...baseOptions,
        stroke: "hsl(var(--border))",
        strokeWidth: TRACK_HEIGHT,
      }),
    );

    if (pct > 0) {
      trackSvg.appendChild(
        trackRenderer.line(
          0,
          TRACK_HEIGHT / 2 + 2,
          width * pct,
          TRACK_HEIGHT / 2 + 2,
          {
            ...baseOptions,
            seed: stableSeed(`${sliderId}-fill`),
            stroke: "currentColor",
            strokeWidth: TRACK_HEIGHT,
          },
        ),
      );
    }

    thumbSvg.replaceChildren();
    const thumbRenderer = rough.svg(thumbSvg);
    thumbSvg.appendChild(
      thumbRenderer.circle(
        THUMB_SIZE / 2,
        THUMB_SIZE / 2,
        THUMB_SIZE - 2,
        getRoughOptions(theme, "interactive", {
          fill: "hsl(var(--background))",
          fillStyle: "solid",
          seed: stableSeed(`${sliderId}-thumb`),
          stroke: "currentColor",
        }),
      ),
    );
  }, [pct, sliderId, theme]);

  useEffect(() => {
    drawAll();
  }, [drawAll]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const observer = new ResizeObserver(() => drawAll());
    observer.observe(wrapper);

    return () => observer.disconnect();
  }, [drawAll]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCurrent(Number(event.target.value));
    onChange?.(event);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label || showValue ? (
        <div className="flex justify-between">
          {label ? (
            <label
              htmlFor={sliderId}
              className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              {label}
            </label>
          ) : null}
          {showValue ? (
            <span className="text-[13px] tabular-nums text-muted-foreground">
              {formatValue ? formatValue(current) : String(current)}
            </span>
          ) : null}
        </div>
      ) : null}
      <div ref={wrapperRef} className="relative flex h-6 items-center">
        <svg
          ref={trackRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 overflow-visible"
        />
        <svg
          ref={thumbRef}
          aria-hidden="true"
          height={THUMB_SIZE}
          width={THUMB_SIZE}
          className="pointer-events-none absolute overflow-visible"
          style={{ left: `calc(${pct * 100}% - ${THUMB_SIZE / 2}px)` }}
        />
        <input
          id={sliderId}
          max={max}
          min={min}
          onChange={handleChange}
          className="absolute inset-0 m-0 w-full cursor-pointer opacity-0"
          type="range"
          value={current}
          {...props}
        />
      </div>
    </div>
  );
}
