"use client";

import { BarChart } from "@/registry/new-york/ui/bar-chart";

export function BarChartRevenueDemo() {
  return (
    <div className="w-full">
      <BarChart
        data={[
          { label: "Q1", value: 120, color: "oklch(0.6 0.18 260)" },
          { label: "Q2", value: 180, color: "oklch(0.6 0.16 145)" },
          { label: "Q3", value: 150, color: "oklch(0.65 0.18 55)" },
          { label: "Q4", value: 210, color: "oklch(0.62 0.22 25)" },
        ]}
        formatValue={(v) => `$${v}k`}
        axisLabel="Quarterly revenue"
      />
    </div>
  );
}
