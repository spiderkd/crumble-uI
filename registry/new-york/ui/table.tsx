"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
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

// ---------- context ----------

import { createContext } from "react";

interface TableContextValue {
  rowIndex: number;
  theme: CrumbleTheme;
}
const TableContext = createContext<TableContextValue>({ rowIndex: 0, theme: "pencil" });

// ---------- Table root ----------

export interface TableProps
  extends HTMLAttributes<HTMLDivElement>,
    CrumbleColorProps {
  theme?: CrumbleTheme;
}

export function Table({
  children,
  className,
  fill,
  stroke,
  strokeMuted,
  theme: themeProp,
  ...props
}: TableProps) {
  const { theme: contextTheme } = useContext(CrumbleContext);
  const theme = themeProp ?? contextTheme;
  const roughStyle = resolveRoughVars({ stroke, strokeMuted, fill });
  return (
    <div className={cn("w-full overflow-auto", className)} style={roughStyle} {...props}>
      <table className="w-full border-collapse">
        <TableContext.Provider value={{ rowIndex: 0, theme }}>
          {children}
        </TableContext.Provider>
      </table>
    </div>
  );
}

// ---------- Header ----------

export function TableHeader({ children, className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("", className)} {...(props as object)}>
      {children}
    </thead>
  );
}

// ---------- Body ----------

export function TableBody({ children, className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("", className)} {...(props as object)}>
      {children}
    </tbody>
  );
}

// ---------- Row ----------

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  index?: number;
}

export function TableRow({ children, className, index = 0, ...props }: TableRowProps) {
  const { theme } = useContext(TableContext);
  const rowRef = useRef<HTMLTableRowElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const draw = useCallback(() => {
    const row = rowRef.current;
    const svg = svgRef.current;
    if (!row || !svg) return;

    const w = row.offsetWidth;
    svg.replaceChildren();
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", "6");
    svg.setAttribute("viewBox", `0 0 ${w} 6`);

    const rc = rough.svg(svg);
    svg.appendChild(
      rc.line(0, 3, w, 3, getRoughOptions(theme, "border", {
        seed: stableSeed(`table-row-${index}`),
        stroke: "var(--cr-stroke-muted)",
        strokeWidth: theme === "crayon" ? 1.5 : 0.8,
      })),
    );
  }, [index, theme]);

  useEffect(() => {
    const id = requestAnimationFrame(() => draw());
    return () => cancelAnimationFrame(id);
  }, [draw]);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(row);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <TableContext.Provider value={{ rowIndex: index, theme }}>
      <tr
        ref={rowRef}
        className={cn("relative group", className)}
        {...(props as object)}
      >
        {children}
        {/* Rough separator line at row bottom */}
        <td
          className="p-0 absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: 6 }}
          aria-hidden="true"
        >
          <svg ref={svgRef} aria-hidden="true" className="overflow-visible absolute inset-0" />
        </td>
      </tr>
    </TableContext.Provider>
  );
}

// ---------- Head cell ----------

export function TableHead({ children, className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
        className,
      )}
      {...(props as object)}
    >
      {children}
    </th>
  );
}

// ---------- Data cell ----------

export function TableCell({ children, className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-3 py-3 text-sm text-foreground", className)}
      {...(props as object)}
    >
      {children}
    </td>
  );
}

// ---------- Caption ----------

export function TableCaption({ children, className, ...props }: HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={cn("mt-2 text-xs text-muted-foreground text-center", className)}
      {...(props as object)}
    >
      {children}
    </caption>
  );
}
