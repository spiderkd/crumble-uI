import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { baseOptions } from "@/app/layout.config";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions}
      nav={{
        title: (
          <span className="font-[family-name:var(--font-display)] text-xl font-bold">
            byDefaultHuman
          </span>
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
