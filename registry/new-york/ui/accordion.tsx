"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
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

interface AccordionContextValue {
  animateOnHover: boolean;
  multiple: boolean;
  openItems: Set<string>;
  theme: CrumbleTheme;
  toggle: (value: string) => void;
}

const AccordionContext = createContext<AccordionContextValue>({
  animateOnHover: true,
  multiple: false,
  openItems: new Set(),
  theme: "pencil",
  toggle: () => {},
});

export interface AccordionProps
  extends HTMLAttributes<HTMLDivElement>,
    CrumbleColorProps {
  animateOnHover?: boolean;
  defaultValue?: string | string[];
  multiple?: boolean;
  onValueChange?: (value: string | string[]) => void;
  theme?: CrumbleTheme;
}

export function Accordion({
  animateOnHover = true,
  children,
  className,
  defaultValue,
  fill,
  multiple = false,
  onValueChange,
  stroke,
  strokeMuted,
  theme: themeProp,
  ...props
}: AccordionProps) {
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const [openItems, setOpenItems] = useState<Set<string>>(() => {
    if (!defaultValue) return new Set();
    return new Set(Array.isArray(defaultValue) ? defaultValue : [defaultValue]);
  });

  const toggle = (value: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        if (!multiple) next.clear();
        next.add(value);
      }
      onValueChange?.(multiple ? Array.from(next) : Array.from(next)[0] ?? "");
      return next;
    });
  };

  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });

  return (
    <AccordionContext.Provider value={{ animateOnHover, multiple, openItems, theme, toggle }}>
      <div className={cn("flex flex-col", className)} style={roughStyle} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function AccordionItem({ children, className, value, ...props }: AccordionItemProps) {
  const { openItems, theme } = useContext(AccordionContext);
  const isOpen = openItems.has(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const draw = useCallback(() => {
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    const w = container.offsetWidth;
    svg.replaceChildren();
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", "8");
    svg.setAttribute("viewBox", `0 0 ${w} 8`);

    const rc = rough.svg(svg);
    svg.appendChild(
      rc.line(0, 4, w, 4, getRoughOptions(theme, "border", {
        seed: stableSeed(`accordion-sep-${value}`),
        stroke: "var(--cr-stroke-muted)",
        strokeWidth: theme === "crayon" ? 1.8 : 1,
      })),
    );
  }, [theme, value]);

  useEffect(() => {
    const id = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(id);
  }, [draw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(container);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <div ref={containerRef} className={cn("relative", className)} {...props}>
      {children}
      {/* Separator line at bottom */}
      <svg ref={svgRef} aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 right-0 overflow-visible" />
    </div>
  );
}

export interface AccordionTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function AccordionTrigger({ children, className, value, ...props }: AccordionTriggerProps) {
  const { animateOnHover, openItems, theme, toggle } = useContext(AccordionContext);
  const isOpen = openItems.has(value);
  const chevronSvgRef = useRef<SVGSVGElement>(null);

  const drawChevron = useCallback(
    (reseed = false) => {
      const svg = chevronSvgRef.current;
      if (!svg) return;

      svg.replaceChildren();
      svg.setAttribute("width", "16");
      svg.setAttribute("height", "16");
      svg.setAttribute("viewBox", "0 0 16 16");

      const rc = rough.svg(svg);
      const opts = getRoughOptions(theme, "border", {
        seed: reseed ? randomSeed() : stableSeed(`chevron-${value}`),
        stroke: "currentColor",
        strokeWidth: theme === "crayon" ? 2 : 1.2,
      });

      if (isOpen) {
        // Up chevron
        svg.appendChild(rc.line(3, 11, 8, 5, opts));
        svg.appendChild(rc.line(8, 5, 13, 11, { ...opts, seed: stableSeed(`chevron-r-${value}`) }));
      } else {
        // Down chevron
        svg.appendChild(rc.line(3, 5, 8, 11, opts));
        svg.appendChild(rc.line(8, 11, 13, 5, { ...opts, seed: stableSeed(`chevron-r-${value}`) }));
      }
    },
    [isOpen, theme, value],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => drawChevron());
    return () => cancelAnimationFrame(id);
  }, [drawChevron]);

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      className={cn(
        "flex w-full items-center justify-between py-4 text-sm font-medium text-left outline-none transition-colors hover:text-foreground",
        className,
      )}
      onClick={() => toggle(value)}
      onMouseEnter={() => { if (animateOnHover) drawChevron(true); }}
      onMouseLeave={() => { if (animateOnHover) drawChevron(false); }}
      {...(props as HTMLAttributes<HTMLButtonElement>)}
    >
      <span>{children}</span>
      <svg
        ref={chevronSvgRef}
        aria-hidden="true"
        width="16"
        height="16"
        className="flex-shrink-0 overflow-visible ml-2"
      />
    </button>
  );
}

export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function AccordionContent({ children, className, value, ...props }: AccordionContentProps) {
  const { openItems } = useContext(AccordionContext);
  const isOpen = openItems.has(value);

  if (!isOpen) return null;

  return (
    <div
      className={cn("pb-4 text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  );
}
