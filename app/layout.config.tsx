import { CrumbleNavbar } from "@/components/nav/CrumbleNavbar";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const baseOptions: BaseLayoutProps = {
  nav: {
    component: <CrumbleNavbar />,
  },
  links: [
    { text: "Docs", url: "/docs", active: "nested-url" },
    {
      text: "Components",
      url: "/docs/components/button",
      active: "nested-url",
    },
    {
      text: "blocks",
      url: "/docs/blocks/kanban",
      active: "nested-url",
    },
  ],
};
