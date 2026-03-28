// "use client";

// import react, { useEffect, useState, useCallback } from "react";
// import { Check, Copy, ChevronDown, ChevronRight } from "lucide-react";
// import { codeToHtml } from "shiki";

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface FileEntry {
//   target: string;
//   content: string;
// }

// interface RegistryJson {
//   files: FileEntry[];
// }

// interface ManualTabProps {
//   slug: string;
//   peerDeps?: string[];
//   files?: FileEntry[]; // optional override — skips fetch if provided
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function getLanguageFromPath(path: string): string {
//   const ext = path.split(".").pop() ?? "";
//   const map: Record<string, string> = {
//     tsx: "tsx",
//     ts: "typescript",
//     jsx: "jsx",
//     js: "javascript",
//     css: "css",
//     json: "json",
//     md: "markdown",
//     mdx: "mdx",
//   };
//   return map[ext] ?? "plaintext";
// }

// function getFilename(path: string): string {
//   return path.split("/").pop() ?? path;
// }

// function buildInstallCommand(deps: string[]): string {
//   return `npm install ${deps.join(" ")}`;
// }

// // ─── Sub-components ───────────────────────────────────────────────────────────

// function CopyButton({
//   text,
//   className = "",
// }: {
//   text: string;
//   className?: string;
// }) {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = useCallback(() => {
//     void navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   }, [text]);

//   return (
//     <button
//       aria-label="Copy"
//       type="button"
//       onClick={handleCopy}
//       className={`rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${className}`}
//     >
//       {copied ? (
//         <Check className="h-3.5 w-3.5 text-green-500" />
//       ) : (
//         <Copy className="h-3.5 w-3.5" />
//       )}
//     </button>
//   );
// }

// function DepsSection({ peerDeps, slug }: { peerDeps: string[]; slug: string }) {
//   // Always include roughjs as a base dep — it's shared across all Crumble components
//   const allDeps = ["roughjs", ...peerDeps].filter(
//     (dep, idx, arr) => arr.indexOf(dep) === idx, // deduplicate
//   );

//   const installCommand = buildInstallCommand(allDeps);

//   return (
//     <div className="mb-4 rounded-md border border-border p-4">
//       <div className="flex items-center justify-between gap-4">
//         <div className="flex flex-wrap gap-2">
//           {allDeps.map((dep) => (
//             <code
//               key={dep}
//               className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-foreground"
//             >
//               {dep}
//             </code>
//           ))}
//         </div>
//         <CopyButton text={installCommand} />
//       </div>
//       <p className="mt-2 text-xs text-muted-foreground">
//         Copies: <span className="font-mono">{installCommand}</span>
//       </p>
//     </div>
//   );
// }

// function HighlightedCode({
//   content,
//   language,
// }: {
//   content: string;
//   language: string;
// }) {
//   const [html, setHtml] = useState<string | null>(null);

//   useEffect(() => {
//     let cancelled = false;
//     codeToHtml(content, {
//       lang: language,
//       theme: "github",
//     }).then((result) => {
//       if (!cancelled) setHtml(result);
//     });
//     return () => {
//       cancelled = true;
//     };
//   }, [content, language]);

//   if (html === null) {
//     // Fallback while shiki loads — plain monospace, no flash
//     return (
//       <pre className="overflow-x-auto p-4 bg-white font-mono text-sm text-foreground">
//         <code>{content}</code>
//       </pre>
//     );
//   }

//   return (
//     <div
//       className="overflow-x-auto [&>pre]:p-4 [&>pre]:text-sm [&>pre]:font-mono"
//       // shiki inlines styles on the <pre> — this wrapper lets us override padding
//       dangerouslySetInnerHTML={{ __html: html }}
//     />
//   );
// }

// function FileAccordionItem({ file }: { file: FileEntry }) {
//   const [open, setOpen] = useState(false);
//   const filename = getFilename(file.target);
//   const language = getLanguageFromPath(file.target);

//   return (
//     <div className="border border-border rounded-md overflow-hidden">
//       {/* Header — always visible */}
//       <button
//         type="button"
//         onClick={() => setOpen((prev) => !prev)}
//         className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors"
//         aria-expanded={open}
//       >
//         <div className="flex items-center gap-2">
//           {open ? (
//             <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
//           ) : (
//             <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
//           )}
//           <span className="font-mono font-medium text-foreground">
//             {filename}
//           </span>
//           <span className="font-mono text-xs text-muted-foreground truncate hidden sm:block">
//             {file.target}
//           </span>
//         </div>
//       </button>

//       {/* Body — only rendered when open (saves shiki work for closed items) */}
//       {open && (
//         <div className="border-t border-border">
//           {/* Full path label + copy button */}
//           <div className="flex items-center justify-between gap-2 bg-muted/30 px-4 py-2">
//             <code className="font-mono text-xs text-muted-foreground break-all">
//               {file.target}
//             </code>
//             <CopyButton text={file.content} />
//           </div>

//           {/* Code block */}
//           <div className="bg-[#0d1117] max-h-[480px] overflow-y-auto">
//             <HighlightedCode content={file.content} language={language} />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function FilesAccordion({ files }: { files: FileEntry[] }) {
//   if (files.length === 0) {
//     return <p className="text-sm text-muted-foreground">No files found.</p>;
//   }

//   return (
//     <div className="space-y-2">
//       {files.map((file) => (
//         <FileAccordionItem key={file.target} file={file} />
//       ))}
//     </div>
//   );
// }

// function SkeletonLoader() {
//   return (
//     <div className="space-y-2 animate-pulse">
//       {[1, 2].map((i) => (
//         <div
//           key={i}
//           className="h-11 rounded-md border border-border bg-muted/40"
//         />
//       ))}
//     </div>
//   );
// }

// // ─── Main Component ───────────────────────────────────────────────────────────

// export function ManualTab({
//   slug,
//   peerDeps = [],
//   files: filesProp,
// }: ManualTabProps) {
//   const [files, setFiles] = useState<FileEntry[]>(filesProp ?? []);
//   const [loading, setLoading] = useState(!filesProp); // skip loading if prop provided
//   const [error, setError] = useState<string | null>(null);

//   const registryUrl = `http://localhost:3000/r/${slug}.json`;

//   useEffect(() => {
//     // If files were passed as prop, skip fetch entirely
//     if (filesProp) return;

//     let cancelled = false;
//     setLoading(true);
//     setError(null);

//     fetch(registryUrl)
//       .then((res) => {
//         if (!res.ok) throw new Error(`Failed to fetch registry: ${res.status}`);
//         return res.json() as Promise<RegistryJson>;
//       })
//       .then((data) => {
//         if (!cancelled) {
//           setFiles(data.files ?? []);
//           setLoading(false);
//         }
//       })
//       .catch((err: unknown) => {
//         if (!cancelled) {
//           setError(err instanceof Error ? err.message : "Unknown error");
//           setLoading(false);
//         }
//       });

//     return () => {
//       cancelled = true;
//     };
//   }, [slug, filesProp, registryUrl]);

//   return (
//     <div className="mt-2 space-y-4">
//       {/* 1. Dependencies — always shown, no loading dependency */}
//       {peerDeps.length > 0 && (
//         <div>
//           <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
//             Dependencies
//           </p>
//           <DepsSection peerDeps={peerDeps} slug={slug} />
//         </div>
//       )}

//       {/* 2. Files */}
//       <div>
//         <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
//           Files
//         </p>

//         {loading && <SkeletonLoader />}

//         {error && !loading && (
//           <div className="rounded-md border border-border p-4 text-sm text-muted-foreground">
//             <p>Could not load files automatically.</p>
//             <a
//               href={registryUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="mt-1 inline-block text-foreground underline hover:opacity-70"
//             >
//               View registry JSON directly →
//             </a>
//           </div>
//         )}

//         {!loading && !error && <FilesAccordion files={files} />}
//       </div>
//     </div>
//   );
// }

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { codeToHtml } from "shiki";
import { cn } from "@/lib/utils";
import { useRough } from "@/hooks/use-rough";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/new-york/ui/accordion";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FileEntry {
  path: string;
  content: string;
}

interface RegistryJson {
  files: FileEntry[];
}

export interface ManualTabProps {
  slug: string;
  peerDeps?: string[];
  files?: FileEntry[]; // if passed, skips fetch
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLanguageFromPath(path: string): string {
  const ext = path.split(".").pop() ?? "";
  const map: Record<string, string> = {
    tsx: "tsx",
    ts: "typescript",
    jsx: "jsx",
    js: "javascript",
    css: "css",
    json: "json",
    md: "markdown",
    mdx: "mdx",
  };
  return map[ext] ?? "plaintext";
}

function getFilename(path: string): string {
  return path.split("/").pop() ?? path;
}

// ─── CopyButton ───────────────────────────────────────────────────────────────

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      type="button"
      aria-label="Copy"
      onClick={handleCopy}
      className={cn(
        "rounded p-1.5 text-muted-foreground transition-colors",
        "hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

// ─── DepsSection ──────────────────────────────────────────────────────────────
// Rough-bordered pill row with a single combined copy button.
// Uses useRough directly so the deps box feels native to Crumble.

function DepsSection({ peerDeps }: { peerDeps: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { drawRect } = useRough({
    variant: "border",
    stableId: "manual-deps-border",
    svgRef,
  });

  const drawBorder = useCallback(
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

      const pad = 3;
      const rect = drawRect(pad, pad, w - pad * 2, h - pad * 2, {
        stroke: "var(--cr-stroke, currentColor)",
        strokeWidth: 1.2,
        roughness: 1.4,
        fill: "none",
      });
      if (rect) svg.appendChild(rect);
    },
    [drawRect],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => drawBorder());
    return () => cancelAnimationFrame(id);
  }, [drawBorder]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => drawBorder());
    ro.observe(container);
    return () => ro.disconnect();
  }, [drawBorder]);

  // Always include roughjs — deduplicate in case caller passed it
  const allDeps = ["roughjs", ...peerDeps].filter(
    (dep, idx, arr) => arr.indexOf(dep) === idx,
  );

  const installCommand = `npm install ${allDeps.join(" ")}`;

  return (
    <div className="mb-4">
      <p className="mb-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Dependencies
      </p>

      <div
        ref={containerRef}
        className="relative px-4 py-3"
        onMouseEnter={() => drawBorder(true)}
        onMouseLeave={() => drawBorder(false)}
      >
        {/* Rough border SVG behind content */}
        <svg
          ref={svgRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-visible"
        />

        <div className="relative flex items-center justify-between gap-3">
          {/* Dep badges */}
          <div className="flex flex-wrap gap-2">
            {allDeps.map((dep) => (
              <code
                key={dep}
                className="rounded-sm bg-muted px-2 py-0.5 font-mono text-xs text-foreground"
              >
                {dep}
              </code>
            ))}
          </div>

          {/* Combined copy button */}
          <CopyButton text={installCommand} />
        </div>

        {/* Install command preview */}
        <p className="relative mt-2 font-mono text-xs text-muted-foreground">
          {installCommand}
        </p>
      </div>
    </div>
  );
}

// ─── HighlightedCode ──────────────────────────────────────────────────────────
// Runs shiki only when the accordion item is opened (bundle-conditional pattern).
// Colors are forced via CSS custom properties to match the site theme instead
// of shiki's hardcoded github-dark background (#0d1117).

// function HighlightedCode({
//   content,
//   language,
// }: {
//   content: string;
//   language: string;
// }) {
//   const [html, setHtml] = useState<string | null>(null);

//   useEffect(() => {
//     let cancelled = false;

//     codeToHtml(content, {
//       lang: language,
//       // Use a theme that exposes CSS variables so we can remap colors
//       theme: "github-dark",
//       // Strip the background so our container bg shows through
//       transformers: [
//         {
//           pre(node) {
//             // Remove inline background-color that shiki injects on <pre>
//             if (node.properties.style) {
//               node.properties.style = (node.properties.style as string)
//                 .replace(/background-color:[^;]+;?/g, "")
//                 .replace(/background:[^;]+;?/g, "")
//                 .trim();
//             }
//             // Add our own class so we can target it
//             node.properties.class = [
//               node.properties.class,
//               "crumble-code-block",
//             ]
//               .filter(Boolean)
//               .join(" ");
//           },
//         },
//       ],
//     }).then((result) => {
//       if (!cancelled) setHtml(result);
//     });

//     return () => {
//       cancelled = true;
//     };
//   }, [content, language]);

//   if (html === null) {
//     // Plain fallback — no layout shift, matches the code block height roughly
//     return (
//       <pre className="overflow-x-auto bg-white p-4 font-mono text-sm leading-relaxed text-muted-foreground">
//         <code>{content}</code>
//       </pre>
//     );
//   }

//   return (
//     <div
//       // These classes override shiki's injected inline styles so the code
//       // block matches the site's own dark surface rather than github-dark's
//       // #0d1117. The [&_.crumble-code-block] selector patches the <pre>.
//       className={cn(
//         "[&_.crumble-code-block]:!bg-transparent",
//         "[&_.crumble-code-block]:p-4",
//         "[&_.crumble-code-block]:text-sm",
//         "[&_.crumble-code-block]:leading-relaxed",
//         "[&_.crumble-code-block]:font-mono",
//         "[&_.crumble-code-block]:overflow-x-auto",
//         "[&_.crumble-code-block]:block",
//       )}
//       dangerouslySetInnerHTML={{ __html: html }}
//     />
//   );
// }
function HighlightedCode({
  content,
  language,
}: {
  content: string;
  language: string;
}) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Detect dark mode from the document root — matches whatever Tailwind dark class strategy the site uses
    const isDark = document.documentElement.classList.contains("dark");
    const shikiTheme = isDark ? "github-dark" : "github-light";

    codeToHtml(content, {
      lang: language,
      theme: shikiTheme,
    }).then((result) => {
      if (!cancelled) setHtml(result);
    });

    return () => {
      cancelled = true;
    };
  }, [content, language]);

  if (html === null) {
    return (
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed ">
        <code>{content}</code>
      </pre>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-sm [&>pre]:overflow-x-auto [&>pre]:p-4 [&>pre]:font-mono [&>pre]:text-sm [&>pre]:leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
// ─── FileAccordionItem ────────────────────────────────────────────────────────
// Wraps the existing Crumble accordion primitives so each file gets
// the full rough-border + chevron treatment for free.

function FileAccordionItem({
  file,
  index,
}: {
  file: FileEntry;
  index: number;
}) {
  const filename = getFilename(file.path);
  const language = getLanguageFromPath(file.path);
  const value = `file-${index}`;

  return (
    <AccordionItem value={value}>
      <AccordionTrigger value={value}>
        <span className="flex items-baseline gap-2 min-w-0">
          {/* Filename — always visible, bold */}
          <span className="font-mono font-semibold text-foreground shrink-0">
            {filename}
          </span>
          {/* Full path — truncated, muted, hidden on mobile */}
          <span className="hidden truncate font-mono text-xs text-muted-foreground sm:block">
            {file.path}
          </span>
        </span>
      </AccordionTrigger>

      <AccordionContent value={value}>
        {/* Full path label above code */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <code className="break-all font-mono text-xs text-muted-foreground">
            {file.path}
          </code>
          <CopyButton text={file.content} className="shrink-0" />
        </div>

        {/* Code block — dark surface that reads as a "page" inside the sketch */}
        <div className={cn("relative overflow-hidden rounded-sm")}>
          <HighlightedCode content={file.content} language={language} />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonLoader() {
  return (
    <div className="space-y-1 animate-pulse" aria-label="Loading files...">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-12 rounded-sm bg-muted/50"
          style={{ opacity: 1 - i * 0.2 }}
        />
      ))}
    </div>
  );
}

// ─── ManualTab ────────────────────────────────────────────────────────────────

export function ManualTab({
  slug,
  peerDeps = [],
  files: filesProp,
}: ManualTabProps) {
  const [files, setFiles] = useState<FileEntry[]>(filesProp ?? []);
  const [loading, setLoading] = useState(!filesProp);
  const [error, setError] = useState<string | null>(null);

  const registryUrl = `http://localhost:3000/r/${slug}.json`;

  useEffect(() => {
    // Prop override — skip fetch entirely
    if (filesProp) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(registryUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Registry fetch failed: ${res.status}`);
        return res.json() as Promise<RegistryJson>;
      })
      .then((data) => {
        if (!cancelled) {
          setFiles(data.files ?? []);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug, filesProp, registryUrl]);

  return (
    <div className="mt-2 space-y-5">
      {/* 1. Dependencies — no loading dependency, shown immediately */}
      {peerDeps.length > 0 && <DepsSection peerDeps={peerDeps} />}

      {/* 2. Files */}
      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Files
        </p>

        {loading && <SkeletonLoader />}

        {!loading && error && (
          <div className="rounded-sm border border-border px-4 py-3 text-sm text-muted-foreground">
            <p>Could not load files automatically.</p>
            <a
              href={registryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-foreground underline underline-offset-2 hover:opacity-70"
            >
              Open registry JSON →
            </a>
          </div>
        )}

        {!loading && !error && files.length > 0 && (
          // multiple={false} so only one file opens at a time — avoids the
          // user drowning in open code blocks
          <Accordion multiple={false}>
            {files.map((file, index) => (
              <FileAccordionItem key={file.path} file={file} index={index} />
            ))}
          </Accordion>
        )}

        {!loading && !error && files.length === 0 && (
          <p className="text-sm text-muted-foreground">No files found.</p>
        )}
      </div>
    </div>
  );
}
