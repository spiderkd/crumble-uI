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

interface TabsContextValue {
  activeTab: string;
  animateOnHover: boolean;
  setActiveTab: (value: string) => void;
  theme: CrumbleTheme;
}

const TabsContext = createContext<TabsContextValue>({
  activeTab: "",
  animateOnHover: true,
  setActiveTab: () => {},
  theme: "pencil",
});

export interface TabsProps
  extends HTMLAttributes<HTMLDivElement>,
    CrumbleColorProps {
  animateOnHover?: boolean;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  theme?: CrumbleTheme;
  value?: string;
}

export function Tabs({
  animateOnHover = true,
  children,
  className,
  defaultValue = "",
  fill,
  onValueChange,
  stroke,
  strokeMuted,
  theme: themeProp,
  value: controlledValue,
  ...props
}: TabsProps) {
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeTab = controlledValue ?? internalValue;
  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });

  const setActiveTab = (next: string) => {
    setInternalValue(next);
    onValueChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ activeTab, animateOnHover, setActiveTab, theme }}>
      <div className={cn("flex flex-col gap-0", className)} style={roughStyle} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {}

export function TabsList({ children, className, ...props }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn("flex gap-1 border-b border-border pb-0", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  value: string;
}

export function TabsTrigger({
  children,
  className,
  disabled,
  value,
  ...props
}: TabsTriggerProps) {
  const { activeTab, animateOnHover, setActiveTab, theme } = useContext(TabsContext);
  const active = activeTab === value;
  const btnRef = useRef<HTMLButtonElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const draw = useCallback(
    (reseed = false) => {
      const btn = btnRef.current;
      const svg = svgRef.current;
      if (!btn || !svg) return;

      svg.replaceChildren();

      const w = btn.offsetWidth;
      const h = btn.offsetHeight;
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

      const rc = rough.svg(svg);

      if (active) {
        // Rough underline for active tab
        svg.appendChild(
          rc.line(2, h - 1, w - 2, h - 1, getRoughOptions(theme, "border", {
            seed: reseed ? randomSeed() : stableSeed(`tab-trigger-${value}`),
            stroke: "currentColor",
            strokeWidth: theme === "crayon" ? 3 : theme === "ink" ? 2 : 1.5,
          })),
        );
      }
    },
    [active, theme, value],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(id);
  }, [draw]);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(btn);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <button
      ref={btnRef}
      role="tab"
      aria-selected={active}
      disabled={disabled}
      className={cn(
        "relative pb-2 pt-1 px-3 text-sm outline-none transition-colors select-none",
        active ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
        disabled && "cursor-not-allowed opacity-40",
        className,
      )}
      onClick={() => { if (!disabled) setActiveTab(value); }}
      onMouseEnter={() => { if (!disabled && animateOnHover && active) draw(true); }}
      onMouseLeave={() => { if (!disabled && animateOnHover && active) draw(false); }}
      {...(props as HTMLAttributes<HTMLButtonElement>)}
    >
      <svg ref={svgRef} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible" />
      <span className="relative">{children}</span>
    </button>
  );
}

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ children, className, value, ...props }: TabsContentProps) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn("mt-4 outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}
