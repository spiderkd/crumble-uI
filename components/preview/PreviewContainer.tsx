// "use client";

// import { useState, type ReactNode } from "react";
// import { CrumbleProvider } from "@/lib/crumble-context";
// import type { CrumbleTheme } from "@/lib/rough";
// import {
//   Tabs,
//   TabsList,
//   TabsTrigger,
//   TabsContent,
// } from "@/registry/new-york/ui/tabs";
// import { RoughLine } from "@/components/primitives/rough-line";
// import { RefreshCw, Copy, Check } from "lucide-react";
// import { cn } from "@/lib/utils";

// interface PreviewContainerProps {
//   children: ReactNode;
//   code?: string;
//   componentName?: string;
//   defaultTheme?: CrumbleTheme;
// }

// const THEMES: CrumbleTheme[] = ["pencil", "ink", "crayon"];

// export function PreviewContainer({
//   children,
//   code,
//   componentName,
//   defaultTheme = "pencil",
// }: PreviewContainerProps) {
//   const [theme, setTheme] = useState<CrumbleTheme>(defaultTheme);
//   const [copied, setCopied] = useState(false);
//   const [previewKey, setPreviewKey] = useState(0);
//   const [rotation, setRotation] = useState(0);

//   const installCmd = componentName
//     ? `npx shadcn add https://crumble.dev/r/${componentName}.json`
//     : null;

//   const handleRefresh = () => {
//     setPreviewKey((k) => k + 1);
//     setRotation((r) => r + 360);
//   };

//   const handleThemeChange = (t: CrumbleTheme) => {
//     setTheme(t);
//     setPreviewKey((k) => k + 1);
//     setRotation((r) => r + 360);
//   };

//   const handleCopy = () => {
//     if (!code) return;
//     void navigator.clipboard.writeText(code);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   return (
//     <div className="my-6 flex flex-col">
//       <Tabs theme={theme} defaultValue="preview" className="w-full">
//         <div className="flex items-center justify-between border-b border-border pb-0">
//           <TabsList>
//             <TabsTrigger value="preview">Preview</TabsTrigger>
//             {code ? <TabsTrigger value="code">Code</TabsTrigger> : null}
//           </TabsList>

//           <div className="flex items-center gap-1 pb-1">
//             {THEMES.map((t) => (
//               <button
//                 key={t}
//                 onClick={() => handleThemeChange(t)}
//                 className={cn(
//                   "rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors",
//                   theme === t
//                     ? "border-foreground/40 text-foreground"
//                     : "border-transparent text-muted-foreground hover:text-foreground",
//                 )}
//               >
//                 {t}
//               </button>
//             ))}

//             <button
//               onClick={handleRefresh}
//               className="ml-1 rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
//               aria-label="Refresh preview"
//             >
//               <RefreshCw
//                 className="w-3 h-3 transition-transform duration-300"
//                 style={{ transform: `rotate(${rotation}deg)` }}
//               />
//             </button>
//           </div>
//         </div>

//         <TabsContent value="preview">
//           <CrumbleProvider key={previewKey} theme={theme}>
//             <div className="flex min-h-36 items-center justify-center bg-background p-8">
//               {children}
//             </div>
//           </CrumbleProvider>
//         </TabsContent>

//         {code ? (
//           <TabsContent value="code">
//             <div className="relative overflow-x-auto bg-muted/40 p-4">
//               <button
//                 onClick={handleCopy}
//                 className="absolute top-3 right-3 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
//                 aria-label="Copy code"
//               >
//                 {copied ? (
//                   <Check className="w-3.5 h-3.5 text-green-500" />
//                 ) : (
//                   <Copy className="w-3.5 h-3.5" />
//                 )}
//               </button>
//               <pre className="font-mono text-sm leading-relaxed text-foreground pr-8">
//                 <code>{code}</code>
//               </pre>
//             </div>
//           </TabsContent>
//         ) : null}
//       </Tabs>

//       {installCmd ? (
//         <div className="mt-2">
//           <RoughLine orientation="horizontal" className="mb-3" />
//           <div className="flex items-center px-1">
//             <code className="font-mono text-xs text-muted-foreground">
//               {installCmd}
//             </code>
//           </div>
//         </div>
//       ) : null}
//     </div>
//   );
// }

"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CrumbleProvider } from "@/lib/crumble-context";
import type { CrumbleTheme } from "@/lib/rough";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/registry/new-york/ui/tabs";
import { RoughLine } from "@/components/primitives/rough-line";
import { RefreshCw, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRough } from "@/hooks/use-rough";
import { randomSeed } from "@/lib/rough";
import { codeToHtml } from "shiki";

interface PreviewContainerProps {
  children: ReactNode;
  code?: string;
  componentName?: string;
  defaultTheme?: CrumbleTheme;
}

const THEMES: CrumbleTheme[] = ["pencil", "ink", "crayon"];

// ─── CopyButton ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label="Copy code"
      onClick={() => {
        void navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="absolute top-3 right-3 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

// ─── RoughThemeButton ─────────────────────────────────────────────────────────
// Active theme pill gets a rough enclosing rect. Inactive ones are plain text.

function RoughThemeButton({
  active,
  label,
  onClick,
  stableId,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  stableId: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { drawRect } = useRough({ variant: "border", stableId, svgRef });

  const draw = useCallback(
    (reseed = false) => {
      const container = containerRef.current;
      const svg = svgRef.current;
      if (!container || !svg) return;

      const w = container.offsetWidth;
      const h = container.offsetHeight;
      if (w === 0 || h === 0) return;

      svg.replaceChildren();
      svg.setAttribute("width", String(w));
      svg.setAttribute("height", String(h));
      svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

      // Only draw anything when active or hovered
      if (!active && !reseed) return;

      const pad = 2;
      const rect = drawRect(pad, pad, w - pad * 2, h - pad * 2, {
        stroke: active
          ? "var(--cr-stroke, currentColor)"
          : "var(--cr-stroke-muted, currentColor)",
        strokeWidth: active ? 1.4 : 0.9,
        roughness: 1.6,
        fill: "none",
        ...(reseed ? { seed: randomSeed() } : {}),
      });
      if (rect) svg.appendChild(rect);
    },
    [active, drawRect],
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
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => draw(true)}
      onMouseLeave={() => draw(false)}
    >
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-visible"
      />
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "relative rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors",
          active
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {label}
      </button>
    </div>
  );
}

// ─── HighlightedCode ──────────────────────────────────────────────────────────

function HighlightedCode({ code }: { code: string }) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const isDark = document.documentElement.classList.contains("dark");
    const shikiTheme = isDark ? "github-dark" : "github-light";

    codeToHtml(code, { lang: "tsx", theme: shikiTheme }).then((result) => {
      if (!cancelled) setHtml(result);
    });

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (html === null) {
    return (
      <pre className="font-mono text-sm leading-relaxed text-foreground pr-8">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      className="[&>pre]:font-mono [&>pre]:text-sm [&>pre]:leading-relaxed [&>pre]:pr-8 [&>pre]:overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ─── PreviewContainer ─────────────────────────────────────────────────────────

export function PreviewContainer({
  children,
  code,
  componentName,
  defaultTheme = "pencil",
}: PreviewContainerProps) {
  const [theme, setTheme] = useState<CrumbleTheme>(defaultTheme);
  const [copied, setCopied] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [rotation, setRotation] = useState(0);

  const installCmd = componentName
    ? `npx shadcn add https://crumble.dev/r/${componentName}.json`
    : null;

  const handleRefresh = () => {
    setPreviewKey((k) => k + 1);
    setRotation((r) => r + 360);
  };

  const handleThemeChange = (t: CrumbleTheme) => {
    setTheme(t);
    setPreviewKey((k) => k + 1);
    setRotation((r) => r + 360);
  };

  const handleCopy = () => {
    if (!code) return;
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 flex flex-col">
      <Tabs theme={theme} defaultValue="preview" className="w-full">
        <div className="flex items-center justify-between border-b border-border pb-0">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            {code ? <TabsTrigger value="code">Code</TabsTrigger> : null}
          </TabsList>

          <div className="flex items-center gap-1 pb-1">
            {THEMES.map((t) => (
              <RoughThemeButton
                key={t}
                label={t}
                active={theme === t}
                onClick={() => handleThemeChange(t)}
                stableId={`preview-theme-btn-${t}`}
              />
            ))}

            <button
              type="button"
              onClick={handleRefresh}
              className="ml-1 rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Refresh preview"
            >
              <RefreshCw
                className="w-3 h-3 transition-transform duration-300"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
            </button>
          </div>
        </div>

        <TabsContent value="preview">
          <CrumbleProvider key={previewKey} theme={theme}>
            <div className="flex min-h-36 items-center justify-center bg-background p-8">
              {children}
            </div>
          </CrumbleProvider>
        </TabsContent>

        {code ? (
          <TabsContent value="code">
            <div className="relative overflow-x-auto bg-muted/40 p-4">
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Copy code"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <HighlightedCode code={code} />
            </div>
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
