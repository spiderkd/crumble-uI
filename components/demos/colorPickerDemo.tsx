"use client";
import { ColorPicker } from "@/registry/new-york/ui/color-picker";

export default function ColorPickerDemo() {
  return (
    <ColorPicker
      label="Stroke Color"
      defaultValue="#ef4444"
      onChange={(color) => console.log("Selected:", color)}
    />
  );
}
