"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
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

interface DialogContextValue {
  onClose: () => void;
  theme: CrumbleTheme;
}

const DialogContext = createContext<DialogContextValue>({
  onClose: () => {},
  theme: "pencil",
});

// ---------- root ----------

export interface DialogProps extends CrumbleColorProps {
  children: ReactNode;
  onOpenChange?: (open: boolean) => void;
  open: boolean;
  theme?: CrumbleTheme;
}

export function Dialog({
  children,
  fill,
  onOpenChange,
  open,
  stroke,
  strokeMuted,
  theme: themeProp,
}: DialogProps) {
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const onClose = () => onOpenChange?.(false);
  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });
  return (
    <DialogContext.Provider value={{ onClose, theme }}>
      <div style={roughStyle}>{children}</div>
    </DialogContext.Provider>
  );
}

// ---------- trigger ----------

export function DialogTrigger({ children, className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("inline-flex", className)} {...props}>
      {children}
    </span>
  );
}

// ---------- content (uses native <dialog>) ----------

export type DialogSize = "sm" | "md" | "lg" | "xl";

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  showClose?: boolean;
  size?: DialogSize;
}

const sizeMap: Record<DialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function DialogContent({
  children,
  className,
  open,
  showClose = true,
  size = "md",
  ...props
}: DialogContentProps) {
  const { onClose, theme } = useContext(DialogContext);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef  = useRef<HTMLDivElement>(null);
  const svgRef    = useRef<SVGSVGElement>(null);

  // Sync open state with native dialog
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else {
      if (el.open) el.close();
    }
  }, [open]);

  // Native Escape key via dialog cancel event
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = (e: Event) => { e.preventDefault(); onClose(); };
    el.addEventListener("cancel", handler);
    return () => el.removeEventListener("cancel", handler);
  }, [onClose]);

  // Click backdrop to close (click on <dialog> itself = backdrop)
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  // Draw rough border — fresh seed each open so it redraws with new wobble
  const draw = useCallback(() => {
    const panel = panelRef.current;
    const svg   = svgRef.current;
    if (!panel || !svg) return;

    svg.replaceChildren();
    const w = panel.offsetWidth;
    const h = panel.offsetHeight;
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

    const rc = rough.svg(svg);
    svg.appendChild(
      rc.rectangle(1, 1, w - 2, h - 2, getRoughOptions(theme, "border", {
        fill: "none",
        seed: randomSeed(), // fresh every open — new wobble each time
        stroke: "var(--cr-stroke)",
        strokeWidth: theme === "crayon" ? 2.5 : theme === "ink" ? 1.5 : 1,
      })),
    );
  }, [theme]);

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => draw());
      return () => cancelAnimationFrame(id);
    }
  }, [draw, open]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(panel);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <>
      {/* Keyframes injected once */}
      <style>{`
        @keyframes crumble-dialog-in {
          from { opacity: 0; transform: scale(0.96) translateY(6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        dialog.crumble-dialog::backdrop {
          background: rgba(0,0,0,0.45);
          animation: crumble-backdrop-in 150ms ease forwards;
        }
        @keyframes crumble-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <dialog
        ref={dialogRef}
        className={cn(
          "crumble-dialog m-auto w-full bg-transparent p-0 outline-none",
          "backdrop:bg-transparent",
          sizeMap[size],
        )}
        onClick={handleDialogClick}
      >
        <div
          ref={panelRef}
          className={cn(
            "relative bg-background p-6",
            className,
          )}
          style={{ animation: open ? "crumble-dialog-in 200ms cubic-bezier(0.16,1,0.3,1) forwards" : undefined }}
          {...props}
        >
          <svg ref={svgRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" />
          <div className="relative">
            {showClose ? (
              <button
                type="button"
                aria-label="Close dialog"
                onClick={onClose}
                className="absolute -top-1 right-0 text-muted-foreground hover:text-foreground outline-none transition-colors"
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
                  <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="13" y1="3" x2="3"  y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            ) : null}
            {children}
          </div>
        </div>
      </dialog>
    </>
  );
}

// ---------- slots ----------

export function DialogHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 flex flex-col gap-1", className)} {...props}>{children}</div>;
}

export function DialogTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-base font-semibold leading-none text-foreground", className)} {...(props as object)}>{children}</h2>;
}

export function DialogDescription({ children, className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...(props as object)}>{children}</p>;
}

export function DialogFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-6 flex justify-end gap-2", className)} {...props}>{children}</div>;
}
