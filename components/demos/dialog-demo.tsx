"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/registry/new-york/ui/dialog";
import { Button } from "@/registry/new-york/ui/button";
import type { CrumbleTheme } from "@/lib/rough";

export function DialogDemo({ theme }: { theme?: CrumbleTheme }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button theme={theme} onClick={() => setOpen(true)}>
        Open dialog
      </Button>
      <Dialog open={open} onOpenChange={setOpen} theme={theme}>
        <DialogContent open={open}>
          <DialogHeader>
            <DialogTitle>Confirm action</DialogTitle>
            <DialogDescription>
              This cannot be undone. Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              theme={theme}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button theme={theme} onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DialogSizesDemo() {
  const [openSize, setOpenSize] = useState<"sm" | "md" | "lg" | "xl" | null>(
    null,
  );
  return (
    <div className="flex flex-wrap gap-3">
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <Button key={size} size="sm" onClick={() => setOpenSize(size)}>
          {size.toUpperCase()}
        </Button>
      ))}
      <Dialog
        open={openSize !== null}
        onOpenChange={(o) => !o && setOpenSize(null)}
      >
        <DialogContent open={openSize !== null} size={openSize ?? "md"}>
          <DialogHeader>
            <DialogTitle>Size: {openSize}</DialogTitle>
            <DialogDescription>
              This dialog uses the <code>{openSize}</code> size preset.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setOpenSize(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
