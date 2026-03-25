"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import rough from "roughjs";
import { cn } from "@/lib/utils";
import {
  CrumbleContext,
  getRoughOptions,
  randomSeed,
  resolveRoughVars,
  type CrumbleColorProps,
  type CrumbleTheme,
} from "@/lib/rough";

// ---------- context ----------

interface DrawerContextValue {
  onClose: () => void;
  side: DrawerSide;
  theme: CrumbleTheme;
}

const DrawerContext = createContext<DrawerContextValue>({
  onClose: () => {},
  side: "right",
  theme: "pencil",
});

// ---------- types ----------

export type DrawerSide = "left" | "right" | "top" | "bottom";

export interface DrawerProps extends CrumbleColorProps {
  children: ReactNode;
  onOpenChange?: (open: boolean) => void;
  open: boolean;
  side?: DrawerSide;
  theme?: CrumbleTheme;
}

// ---------- root ----------

export function Drawer({
  children,
  fill,
  onOpenChange,
  open,
  side = "right",
  stroke,
  strokeMuted,
  theme: themeProp,
}: DrawerProps) {
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const onClose = () => onOpenChange?.(false);
  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <DrawerContext.Provider value={{ onClose, side, theme }}>
      <div style={roughStyle}>{children}</div>
    </DrawerContext.Provider>
  );
}

// ---------- trigger ----------

export function DrawerTrigger({ children, className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("inline-flex", className)} {...props}>
      {children}
    </span>
  );
}

// ---------- content ----------

export interface DrawerContentProps extends HTMLAttributes<HTMLDivElement> {
  showClose?: boolean;
  size?: string; // CSS width/height value e.g. "320px", "40vw"
}

// Which edge gets the rough border depends on which side the drawer opens from
const roughEdge: Record<DrawerSide, "left" | "right" | "top" | "bottom"> = {
  bottom: "top",
  left:   "right",
  right:  "left",
  top:    "bottom",
};

const slideIn: Record<DrawerSide, string> = {
  bottom: "translate(0, 100%)",
  left:   "translate(-100%, 0)",
  right:  "translate(100%, 0)",
  top:    "translate(0, -100%)",
};

const positionClass: Record<DrawerSide, string> = {
  bottom: "bottom-0 left-0 right-0",
  left:   "left-0 top-0 bottom-0",
  right:  "right-0 top-0 bottom-0",
  top:    "top-0 left-0 right-0",
};

const sizeStyle: Record<DrawerSide, (s: string) => React.CSSProperties> = {
  bottom: (s) => ({ height: s, width: "100%" }),
  left:   (s) => ({ width: s, height: "100%" }),
  right:  (s) => ({ width: s, height: "100%" }),
  top:    (s) => ({ height: s, width: "100%" }),
};

export function DrawerContent({
  children,
  className,
  showClose = true,
  size = "320px",
  ...props
}: DrawerContentProps) {
  const { onClose, side, theme } = useContext(DrawerContext);
  const panelRef = useRef<HTMLDivElement>(null);
  const svgRef   = useRef<SVGSVGElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Draw only the single edge that faces the page (not all four sides)
  const draw = useCallback(() => {
    const panel = panelRef.current;
    const svg   = svgRef.current;
    if (!panel || !svg) return;

    svg.replaceChildren();

    const w = panel.offsetWidth;
    const h = panel.offsetHeight;
    const edge = roughEdge[side];

    // Size SVG to just cover the edge line
    const isVertical = edge === "left" || edge === "right";
    const svgW = isVertical ? 12 : w;
    const svgH = isVertical ? h  : 12;

    svg.setAttribute("width", String(svgW));
    svg.setAttribute("height", String(svgH));
    svg.setAttribute("viewBox", `0 0 ${svgW} ${svgH}`);

    const rc = rough.svg(svg);
    const opts = getRoughOptions(theme, "border", {
      seed: randomSeed(), // fresh each open
      stroke: "var(--cr-stroke)",
      strokeWidth: theme === "crayon" ? 2.5 : theme === "ink" ? 1.5 : 1,
    });

    // Draw one rough line along the open edge
    if (edge === "left")   svg.appendChild(rc.line(6, 0,  6, h,  opts));
    if (edge === "right")  svg.appendChild(rc.line(6, 0,  6, h,  opts));
    if (edge === "top")    svg.appendChild(rc.line(0, 6,  w, 6,  opts));
    if (edge === "bottom") svg.appendChild(rc.line(0, 6,  w, 6,  opts));
  }, [side, theme]);

  useEffect(() => {
    const id = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(id);
  }, [draw]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(panel);
    return () => ro.disconnect();
  }, [draw]);

  if (!mounted) return null;

  const edgeSvgPosition: Record<typeof roughEdge[DrawerSide], React.CSSProperties> = {
    bottom: { bottom: 0, left: 0, right: 0, height: 12 },
    left:   { left: 0,  top: 0,  bottom: 0, width: 12 },
    right:  { right: 0, top: 0,  bottom: 0, width: 12 },
    top:    { top: 0,   left: 0, right: 0,  height: 12 },
  };

  return createPortal(
    <>
      <style>{`
        @keyframes crumble-drawer-in-right  { from { transform: translate(100%,0) } to { transform: translate(0,0) } }
        @keyframes crumble-drawer-in-left   { from { transform: translate(-100%,0) } to { transform: translate(0,0) } }
        @keyframes crumble-drawer-in-bottom { from { transform: translate(0,100%) } to { transform: translate(0,0) } }
        @keyframes crumble-drawer-in-top    { from { transform: translate(0,-100%) } to { transform: translate(0,0) } }
        @keyframes crumble-fade-in          { from { opacity: 0 } to { opacity: 1 } }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{
          backgroundColor: "rgba(0,0,0,0.45)",
          animation: "crumble-fade-in 150ms ease forwards",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed z-50 bg-background overflow-auto",
          positionClass[side],
          className,
        )}
        style={{
          ...sizeStyle[side](size),
          animation: `crumble-drawer-in-${side} 250ms cubic-bezier(0.16,1,0.3,1) forwards`,
        }}
        {...props}
      >
        {/* Rough edge line */}
        <svg
          ref={svgRef}
          aria-hidden="true"
          className="pointer-events-none absolute overflow-visible"
          style={edgeSvgPosition[roughEdge[side]]}
        />

        {showClose ? (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 text-muted-foreground hover:text-foreground outline-none transition-colors"
          >
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
              <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="13" y1="3" x2="3"  y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        ) : null}

        {children}
      </div>
    </>,
    document.body,
  );
}

// ---------- slots ----------

export function DrawerHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pb-0 flex flex-col gap-1", className)} {...props}>{children}</div>;
}

export function DrawerTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-base font-semibold text-foreground", className)} {...(props as object)}>{children}</h2>;
}

export function DrawerDescription({ children, className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...(props as object)}>{children}</p>;
}

export function DrawerBody({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props}>{children}</div>;
}

export function DrawerFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0 flex justify-end gap-2", className)} {...props}>{children}</div>;
}
