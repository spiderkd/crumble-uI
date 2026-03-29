
// Server component — no "use client" directive.
// Receives the page tree (server data) and passes it to the client inner.
import type { PageTree } from "fumadocs-core/server";
import { CrumbleSidebarInner } from "./CrumbleSidebarClien";

export function CrumbleSidebar({ tree }: { tree: PageTree.Root }) {
  return <CrumbleSidebarInner tree={tree} />;
}
