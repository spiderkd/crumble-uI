"use client";

import { useState, type ReactNode } from "react";
import { CrumbleProvider } from "@/lib/crumble-context";
import type { CrumbleTheme } from "@/lib/rough";

interface PreviewContainerProps {
  children: ReactNode;
  code?: string;
  componentName?: string;
  defaultTheme?: CrumbleTheme;
}

type Tab = "preview" | "code";

export function PreviewContainer({
  children,
  code,
  componentName,
  defaultTheme = "pencil",
}: PreviewContainerProps) {
  const [theme, setTheme] = useState<CrumbleTheme>(defaultTheme);
  const [tab, setTab] = useState<Tab>("preview");

  const installCommand = componentName
    ? `npx shadcn add https://crumble.dev/r/${componentName}.json`
    : null;

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-2">
        <div className="flex gap-1">
          {(["preview", "code"] as Tab[]).map((value) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={[
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                tab === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          {(["pencil", "ink", "crayon"] as CrumbleTheme[]).map((value) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={[
                "rounded-full border px-2 py-0.5 text-[11px] transition-colors",
                theme === value
                  ? "border-foreground/40 font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {tab === "preview" ? (
        <CrumbleProvider theme={theme}>
          <div className="flex min-h-[120px] items-center justify-center bg-background p-8">
            {children}
          </div>
        </CrumbleProvider>
      ) : (
        <div className="overflow-x-auto bg-muted/30 p-4">
          <pre className="font-mono text-sm leading-relaxed text-foreground">
            <code>{code ?? "// no code provided"}</code>
          </pre>
        </div>
      )}

      {installCommand ? (
        <div className="flex items-center justify-between gap-2 border-t border-border bg-muted/50 px-3 py-2">
          <code className="font-mono text-xs text-muted-foreground">
            {installCommand}
          </code>
          <button
            onClick={() => navigator.clipboard.writeText(installCommand)}
            className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            copy
          </button>
        </div>
      ) : null}
    </div>
  );
}
