import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <span className="font-[family-name:var(--font-display)] text-xl font-bold">
        crumble
      </span>
    ),
  },
  links: [
    { text: "Docs", url: "/docs", active: "nested-url" },
    { text: "Components", url: "/docs/components/button", active: "nested-url" },
  ],
};
