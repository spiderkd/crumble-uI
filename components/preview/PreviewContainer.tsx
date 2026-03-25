"use client";

import { useState, type ReactNode } from "react";
import { CrumbleProvider } from "@/lib/crumble-context";
import type { CrumbleTheme } from "@/lib/rough";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/registry/new-york/ui/tabs";
import { Button } from "@/registry/new-york/ui/button";
import { RoughLine } from "@/components/primitives/rough-line";
import { cn } from "@/lib/utils";

interface PreviewContainerProps {
  children: ReactNode;
  code?: string;
  componentName?: string;
  defaultTheme?: CrumbleTheme;
}

const THEMES: CrumbleTheme[] = ["pencil", "ink", "crayon"];

export function PreviewContainer({
  children,
  code,
  componentName,
  defaultTheme = "pencil",
}: PreviewContainerProps) {
  const [theme, setTheme] = useState<CrumbleTheme>(defaultTheme);
  const [copied, setCopied] = useState(false);

  const installCmd = componentName
    ? `npx shadcn add https://crumble.dev/r/${componentName}.json`
    : null;

  const handleCopyInstall = () => {
    if (!installCmd) return;
    void navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 flex flex-col gap-0">
      <Tabs theme={theme} defaultValue="preview" className="w-full">
        <div className="flex items-center justify-between border-b border-border pb-0">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            {code ? <TabsTrigger value="code">Code</TabsTrigger> : null}
          </TabsList>

          {/* Theme switcher */}
          <div className="flex items-center gap-1 pb-1">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors",
                  theme === t
                    ? "border-foreground/40 text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <TabsContent value="preview">
          <CrumbleProvider theme={theme}>
            <div className="flex min-h-36 items-center justify-center bg-background p-8">
              {children}
            </div>
          </CrumbleProvider>
        </TabsContent>

        {code ? (
          <TabsContent value="code">
            <div className="overflow-x-auto bg-muted/40 p-4">
              <pre className="font-mono text-sm leading-relaxed text-foreground">
                <code>{code}</code>
              </pre>
            </div>
          </TabsContent>
        ) : null}
      </Tabs>

      {installCmd ? (
        <div className="mt-2">
          <RoughLine orientation="horizontal" className="mb-3" />
          <div className="flex items-center justify-between gap-3 px-1">
            <code className="font-mono text-xs text-muted-foreground">
              {installCmd}
            </code>
            <Button
              size="sm"
              variant="ghost"
              theme={theme}
              onClick={handleCopyInstall}
            >
              {copied ? "copied!" : "copy"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
