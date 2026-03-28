// interface PropRow {
//   default?: string;
//   description: string;
//   prop: string;
//   required?: boolean;
//   type: string;
// }

// interface PropsTableProps {
//   rows: PropRow[];
// }

// export function PropsTable({ rows }: PropsTableProps) {
//   return (
//     <div className="my-4 w-full overflow-x-auto">
//       <table className="w-full border-collapse text-sm">
//         <thead>
//           <tr className="border-b border-border text-left">
//             <th className="py-2 pr-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
//               Prop
//             </th>
//             <th className="py-2 pr-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
//               Type
//             </th>
//             <th className="py-2 pr-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
//               Default
//             </th>
//             <th className="py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
//               Description
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {rows.map((row) => (
//             <tr key={row.prop} className="border-b border-border/40">
//               <td className="py-2 pr-4">
//                 <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
//                   {row.prop}
//                   {row.required ? (
//                     <span className="ml-0.5 text-destructive">*</span>
//                   ) : null}
//                 </code>
//               </td>
//               <td className="py-2 pr-4">
//                 <code className="font-mono text-xs text-muted-foreground">
//                   {row.type}
//                 </code>
//               </td>
//               <td className="py-2 pr-4">
//                 {row.default ? (
//                   <code className="font-mono text-xs text-muted-foreground">
//                     {row.default}
//                   </code>
//                 ) : (
//                   <span className="text-xs text-muted-foreground/40">-</span>
//                 )}
//               </td>
//               <td className="py-2 text-xs text-muted-foreground">
//                 {row.description}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useRough } from "@/hooks/use-rough";
import { randomSeed } from "@/lib/rough";

interface PropRow {
  default?: string;
  description: string;
  prop: string;
  required?: boolean;
  type: string;
}

interface PropsTableProps {
  rows: PropRow[];
}

// ─── RoughRowBorder ───────────────────────────────────────────────────────────
// Draws a rough horizontal line under each table row.
// Sits absolutely positioned at the bottom of the row container.

function RoughRowDivider({
  stableId,
  muted = false,
}: {
  stableId: string;
  muted?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { drawLine } = useRough({
    variant: "border",
    stableId,
    svgRef,
  });

  const draw = useCallback(
    (reseed = false) => {
      const container = containerRef.current;
      const svg = svgRef.current;
      if (!container || !svg) return;

      const w = container.offsetWidth;
      if (w === 0) return;

      svg.replaceChildren();
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", "6");
      svg.setAttribute("viewBox", `0 0 ${w} 6`);

      const line = drawLine(0, 3, w, 3, {
        stroke: muted
          ? "var(--cr-stroke-muted, currentColor)"
          : "var(--cr-stroke, currentColor)",
        strokeWidth: muted ? 0.8 : 1.2,
        roughness: muted ? 1.0 : 1.4,
        ...(reseed ? { seed: randomSeed() } : {}),
      });
      if (line) svg.appendChild(line);
    },
    [drawLine, muted],
  );

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
    <div ref={containerRef} className="relative h-[6px] w-full">
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-visible"
      />
    </div>
  );
}

// ─── RoughTableRow ────────────────────────────────────────────────────────────
// Each data row re-sketches its divider on hover.

function RoughTableRow({ row, isLast }: { row: PropRow; isLast: boolean }) {
  const dividerRef = useRef<{
    redraw: (reseed: boolean) => void;
  } | null>(null);

  return (
    <div
      className="group"
      onMouseEnter={() => dividerRef.current?.redraw(true)}
      onMouseLeave={() => dividerRef.current?.redraw(false)}
    >
      {/* Row content as CSS grid — matches header columns */}
      <div className="grid grid-cols-[minmax(120px,1fr)_minmax(140px,1.2fr)_minmax(80px,0.8fr)_minmax(160px,2fr)] gap-x-4 py-2.5 transition-colors group-hover:bg-muted/20">
        {/* Prop */}
        <div className="flex items-center">
          <code className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
            {row.prop}
            {row.required ? (
              <span className="ml-0.5 text-destructive">*</span>
            ) : null}
          </code>
        </div>

        {/* Type */}
        <div className="flex items-center">
          <code className="font-mono text-xs text-muted-foreground">
            {row.type}
          </code>
        </div>

        {/* Default */}
        <div className="flex items-center">
          {row.default ? (
            <code className="font-mono text-xs text-muted-foreground">
              {row.default}
            </code>
          ) : (
            <span className="text-xs text-muted-foreground/30">—</span>
          )}
        </div>

        {/* Description */}
        <div className="flex items-center">
          <span className="text-xs text-muted-foreground">
            {row.description}
          </span>
        </div>
      </div>

      {/* Rough divider — not shown after last row */}
      {!isLast && (
        <RoughRowDividerWithRef
          stableId={`props-row-divider-${row.prop}`}
          muted
          ref={dividerRef}
        />
      )}
    </div>
  );
}

// Forwardref wrapper so RoughTableRow can trigger redraw imperatively
import { forwardRef, useImperativeHandle } from "react";

const RoughRowDividerWithRef = forwardRef<
  { redraw: (reseed: boolean) => void },
  { stableId: string; muted?: boolean }
>(function RoughRowDividerWithRef({ stableId, muted }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { drawLine } = useRough({
    variant: "border",
    stableId,
    svgRef,
  });

  const draw = useCallback(
    (reseed = false) => {
      const container = containerRef.current;
      const svg = svgRef.current;
      if (!container || !svg) return;

      const w = container.offsetWidth;
      if (w === 0) return;

      svg.replaceChildren();
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", "6");
      svg.setAttribute("viewBox", `0 0 ${w} 6`);

      const line = drawLine(0, 3, w, 3, {
        stroke: muted
          ? "var(--cr-stroke-muted, currentColor)"
          : "var(--cr-stroke, currentColor)",
        strokeWidth: muted ? 0.8 : 1.2,
        roughness: muted ? 1.0 : 1.6,
        ...(reseed ? { seed: randomSeed() } : {}),
      });
      if (line) svg.appendChild(line);
    },
    [drawLine, muted],
  );

  useImperativeHandle(ref, () => ({ redraw: draw }), [draw]);

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
    <div ref={containerRef} className="relative h-[6px] w-full">
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-visible"
      />
    </div>
  );
});

// ─── PropsTable ───────────────────────────────────────────────────────────────

export function PropsTable({ rows }: PropsTableProps) {
  return (
    <div className="my-4 w-full overflow-x-auto">
      <div className="min-w-[560px]">
        {/* Header */}
        <div className="grid grid-cols-[minmax(120px,1fr)_minmax(140px,1.2fr)_minmax(80px,0.8fr)_minmax(160px,2fr)] gap-x-4 pb-2">
          {["Prop", "Type", "Default", "Description"].map((label) => (
            <span
              key={label}
              className="text-xs font-medium uppercase tracking-widest text-muted-foreground"
            >
              {label}
            </span>
          ))}
        </div>

        {/* Rough header underline — full weight */}
        <RoughRowDivider stableId="props-table-header-divider" muted={false} />

        {/* Rows */}
        <div className="mt-1">
          {rows.map((row, index) => (
            <RoughTableRow
              key={row.prop}
              row={row}
              isLast={index === rows.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
