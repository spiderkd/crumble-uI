"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CrumbleTheme } from "@/lib/rough";

interface ComponentCardProps {
  category: "primitives" | "ui" | "charts" | "motion";
  description: string;
  name: string;
  preview?: ReactNode;
  slug: string;
  themes?: CrumbleTheme[];
}

const categoryStyles: Record<
  ComponentCardProps["category"],
  { bg: string; text: string }
> = {
  charts: {
    bg: "bg-[var(--color-background-warning)]",
    text: "text-[var(--color-text-warning)]",
  },
  motion: { bg: "bg-secondary", text: "text-secondary-foreground" },
  primitives: {
    bg: "bg-[var(--color-background-info)]",
    text: "text-[var(--color-text-info)]",
  },
  ui: {
    bg: "bg-[var(--color-background-success)]",
    text: "text-[var(--color-text-success)]",
  },
};

export function ComponentCard({
  category,
  description,
  name,
  preview,
  slug,
  themes,
}: ComponentCardProps) {
  const { bg, text } = categoryStyles[category];

  return (
    <Link href={`/docs/components/${slug}`} className="no-underline">
      <div
        className={cn(
          "flex h-full cursor-pointer flex-col gap-3 rounded-xl border border-border/50 bg-background p-5",
          "transition-colors duration-150 hover:border-border",
        )}
      >
        {preview ? (
          <div className="flex h-20 items-center justify-center overflow-hidden rounded-lg bg-muted">
            {preview}
          </div>
        ) : null}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">{name}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              bg,
              text,
            )}
          >
            {category}
          </span>
        </div>
        {themes ? (
          <div className="mt-auto flex gap-1">
            {themes.map((theme) => (
              <span
                key={theme}
                className="rounded-full border border-border/50 px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                {theme}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
