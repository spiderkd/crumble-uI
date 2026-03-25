// "use client";

// export function CopyPage({ content }: { content: string }) {
//   return (
//     <button
//       className="bg-fd-secondary p-2 inline-flex text-fd-secondary-foreground font-medium text-sm border rounded-lg hover:bg-fd-accent hover:text-fd-accent-foreground"
//       onClick={() => {
//         void navigator.clipboard.writeText(content);
//         console.log("copied content");
//       }}
//     >
//       Copy Page
//     </button>
//   );
// }

"use client";

import { useState } from "react";
import { Button } from "@/registry/new-york/ui/button";
import { useCrumble } from "@/lib/crumble-context";

export function CopyPage({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const { theme } = useCrumble();

  const handleCopy = () => {
    void navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button size="sm" variant="ghost" theme={theme} onClick={handleCopy}>
      {copied ? "copied!" : "copy page"}
    </Button>
  );
}
