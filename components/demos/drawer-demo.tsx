"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/registry/new-york/ui/drawer";
import { Button } from "@/registry/new-york/ui/button";
import type { DrawerSide } from "@/registry/new-york/ui/drawer";
import type { CrumbleTheme } from "@/lib/rough";

export function DrawerDemo({ theme }: { theme?: CrumbleTheme }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button theme={theme} onClick={() => setOpen(true)}>
        Open drawer
      </Button>
      <Drawer open={open} onOpenChange={setOpen} theme={theme}>
        <DrawerContent open={open}>
          <DrawerHeader>
            <DrawerTitle>Settings</DrawerTitle>
            <DrawerDescription>Adjust your preferences.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <p className="text-sm text-muted-foreground">
              Your content goes here. The drawer slides in from the right.
            </p>
          </DrawerBody>
          <DrawerFooter>
            <Button
              variant="ghost"
              theme={theme}
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export function DrawerSidesDemo() {
  const [side, setSide] = useState<DrawerSide | null>(null);
  return (
    <div className="flex flex-wrap gap-3">
      {(["left", "right", "top", "bottom"] as const).map((s) => (
        <Button key={s} size="sm" onClick={() => setSide(s)}>
          {s}
        </Button>
      ))}
      <Drawer
        open={side !== null}
        onOpenChange={(o) => !o && setSide(null)}
        side={side ?? "right"}
      >
        <DrawerContent
          open={side !== null}
          size={side === "top" || side === "bottom" ? "200px" : "320px"}
        >
          <DrawerHeader>
            <DrawerTitle>Side: {side}</DrawerTitle>
            <DrawerDescription>Slides in from the {side}.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <p className="text-sm text-muted-foreground">Content area.</p>
          </DrawerBody>
          <DrawerFooter>
            <Button size="sm" onClick={() => setSide(null)}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
