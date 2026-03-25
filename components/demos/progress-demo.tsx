"use client";

import { Progress } from "@/registry/new-york/ui/progress";

export function ProgressStorageDemo() {
  return (
    <div className="w-full max-w-sm">
      <Progress
        label="Storage"
        value={3.2}
        max={5}
        showValue
        formatValue={(v) => `${v.toFixed(1)} GB`}
      />
    </div>
  );
}
