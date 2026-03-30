import { CrumbleNavbar } from "@/components/nav/CrumbleNavbar";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const baseOptions: BaseLayoutProps = {
  nav: {
    component: <CrumbleNavbar />,
  },
  links: [
    {
      text: "Documentation",
      url: "/docs/getting-started/introduction",
      active: "nested-url",
    },
    {
      text: "Components",
      url: "/docs/components/button",
      active: "nested-url",
    },
    {
      text: "Blocks",
      url: "/docs/blocks/kanban",
      active: "nested-url",
    },
  ],
};
