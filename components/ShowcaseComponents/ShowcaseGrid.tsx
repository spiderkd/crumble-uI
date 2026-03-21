import type { ReactNode } from "react";
import { ComponentCard } from "@/components/ShowcaseComponents/ComponentCard";
import type { CrumbleTheme } from "@/lib/rough";

interface ShowcaseItem {
  category: "primitives" | "ui" | "charts" | "motion";
  description: string;
  name: string;
  preview?: ReactNode;
  slug: string;
  themes?: CrumbleTheme[];
}

interface ShowcaseGridProps {
  filter?: ShowcaseItem["category"] | "all";
  items: ShowcaseItem[];
}

export function ShowcaseGrid({ filter = "all", items }: ShowcaseGridProps) {
  const filtered =
    filter === "all" ? items : items.filter((item) => item.category === filter);

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
      {filtered.map((item) => (
        <ComponentCard key={item.slug} {...item} />
      ))}
    </div>
  );
}
