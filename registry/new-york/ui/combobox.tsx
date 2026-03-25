"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
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

export interface ComboboxOption {
  disabled?: boolean;
  label: string;
  value: string;
}

export interface ComboboxProps extends CrumbleColorProps {
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  error?: string;
  id?: string;
  label?: string;
  onBlur?: () => void;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  options: ComboboxOption[];
  placeholder?: string;
  theme?: CrumbleTheme;
  value?: string;
}

const TRIGGER_HEIGHT = 40;
const OPTION_HEIGHT = 36;

export function Combobox({
  className,
  defaultValue = "",
  disabled = false,
  error,
  fill,
  id,
  label,
  onBlur,
  onChange,
  onFocus,
  options,
  placeholder = "Search...",
  stroke,
  strokeMuted,
  theme: themeProp,
  value: controlledValue,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [focused, setFocused] = useState(false);

  const value = controlledValue ?? internalValue;
  const selectedOption = options.find((option) => option.value === value);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const optionSvgRefs = useRef<Map<string, SVGSVGElement>>(new Map());
  const dropdownSvgRef = useRef<SVGSVGElement | null>(null);
  const comboId =
    id ?? `combobox-${label?.toLowerCase().replace(/\s+/g, "-") ?? "field"}`;
  const filtered = query.trim()
    ? options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase()),
      )
    : options;
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });

  const drawTrigger = useCallback(
    (reseed = false) => {
      const svg = svgRef.current;
      const wrapper = wrapperRef.current;
      if (!svg || !wrapper) return;

      svg.replaceChildren();
      const width = wrapper.offsetWidth;
      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(TRIGGER_HEIGHT));
      svg.setAttribute("viewBox", `0 0 ${width} ${TRIGGER_HEIGHT}`);

      const renderer = rough.svg(svg);
      const currentStroke = error
        ? "var(--cr-stroke-error)"
        : focused || open
          ? "var(--cr-stroke)"
          : "var(--cr-stroke-muted)";

      svg.appendChild(
        renderer.rectangle(
          1,
          1,
          width - 2,
          TRIGGER_HEIGHT - 2,
          getRoughOptions(theme, "border", {
            fill: "none",
            seed: reseed ? randomSeed() : stableSeed(comboId),
            stroke: currentStroke,
          }),
        ),
      );
    },
    [comboId, error, focused, open, theme],
  );

  const drawDropdown = useCallback(
    (svg: SVGSVGElement, width: number, height: number) => {
      svg.replaceChildren();
      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(height));
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      const renderer = rough.svg(svg);
      svg.appendChild(
        renderer.rectangle(
          1,
          1,
          width - 2,
          height - 2,
          getRoughOptions(theme, "border", {
            fill: "none",
            seed: stableSeed(`${comboId}-dropdown`),
            stroke: "var(--cr-stroke)",
          }),
        ),
      );
    },
    [comboId, theme],
  );

  const drawOption = useCallback(
    (svg: SVGSVGElement, width: number, highlighted: boolean) => {
      svg.replaceChildren();
      svg.setAttribute("width", String(width));
      svg.setAttribute("height", String(OPTION_HEIGHT));
      svg.setAttribute("viewBox", `0 0 ${width} ${OPTION_HEIGHT}`);
      if (!highlighted) return;

      const renderer = rough.svg(svg);
      svg.appendChild(
        renderer.rectangle(
          2,
          2,
          width - 4,
          OPTION_HEIGHT - 4,
          getRoughOptions(theme, "fill", {
            fill: "currentColor",
            fillStyle: "hachure",
            seed: stableSeed("opt-hl"),
            stroke: "none",
            strokeWidth: 0,
          }),
        ),
      );
    },
    [theme],
  );

  useEffect(() => {
    drawTrigger();
  }, [drawTrigger]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const observer = new ResizeObserver(() => drawTrigger());
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [drawTrigger]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setFocused(false);
        setQuery("");
        onBlur?.();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onBlur, open]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleSelect = (option: ComboboxOption) => {
    if (option.disabled) return;
    setInternalValue(option.value);
    onChange?.(option.value);
    setOpen(false);
    setQuery("");
    setFocused(false);
    onBlur?.();
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    if (!open) setOpen(true);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)} style={roughStyle}>
      {label ? (
        <label
          htmlFor={comboId}
          className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
        >
          {label}
        </label>
      ) : null}

      <div ref={wrapperRef} className="relative">
        <div className="relative" style={{ height: TRIGGER_HEIGHT }}>
          <svg
            ref={svgRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-visible"
          />
          <input
            ref={inputRef}
            id={comboId}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            disabled={disabled}
            placeholder={open ? placeholder : selectedOption?.label ?? placeholder}
            value={open ? query : selectedOption?.label ?? ""}
            onFocus={() => {
              setFocused(true);
              setOpen(true);
              onFocus?.();
            }}
            onBlur={() => {
              if (!open) {
                setFocused(false);
                onBlur?.();
              }
            }}
            onChange={handleInputChange}
            className={cn(
              "absolute inset-0 h-full w-full border-none bg-transparent px-3 pr-9 text-sm text-foreground outline-none",
              disabled && "cursor-not-allowed opacity-40",
            )}
          />
          <svg
            aria-hidden="true"
            width="16"
            height="14"
            viewBox="0 0 16 14"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <line
              x1="2"
              y1={open ? 10 : 4}
              x2="8"
              y2={open ? 4 : 10}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="8"
              y1={open ? 4 : 10}
              x2="14"
              y2={open ? 10 : 4}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {open ? (
          <div
            className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 bg-background"
            style={{ minWidth: "100%" }}
          >
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-visible"
              ref={(element) => {
                dropdownSvgRef.current = element;
                if (element) {
                  const width = element.parentElement?.offsetWidth ?? 200;
                  const height = filtered.length * OPTION_HEIGHT;
                  drawDropdown(element, width, height || OPTION_HEIGHT);
                }
              }}
            />
            {filtered.length === 0 ? (
              <div
                className="flex items-center px-3 text-sm text-muted-foreground"
                style={{ height: OPTION_HEIGHT }}
              >
                No results
              </div>
            ) : (
              filtered.map((option) => {
                const isSelected = option.value === value;
                return (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      "relative flex cursor-pointer items-center px-3 text-sm",
                      "hover:text-background",
                      option.disabled && "cursor-not-allowed opacity-40",
                      isSelected && "font-medium",
                    )}
                    style={{ height: OPTION_HEIGHT }}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={(event) => {
                      const svg = optionSvgRefs.current.get(option.value);
                      if (svg) {
                        drawOption(svg, event.currentTarget.offsetWidth, true);
                      }
                    }}
                    onMouseLeave={(event) => {
                      const svg = optionSvgRefs.current.get(option.value);
                      if (svg) {
                        drawOption(svg, event.currentTarget.offsetWidth, false);
                      }
                    }}
                  >
                    <svg
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 overflow-visible"
                      ref={(element) => {
                        if (element) {
                          optionSvgRefs.current.set(option.value, element);
                        } else {
                          optionSvgRefs.current.delete(option.value);
                        }
                      }}
                    />
                    <span className="relative z-10">{option.label}</span>
                  </div>
                );
              })
            )}
          </div>
        ) : null}
      </div>

      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
