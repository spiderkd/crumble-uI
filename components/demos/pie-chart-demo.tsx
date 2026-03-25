"use client";

import { PieChart } from "@/registry/new-york/ui/pie-chart";

export function PieChartSourcesDemo() {
  return (
    <div className="w-full max-w-sm">
      <PieChart
        formatValue={(v) => `${v}k`}
        data={[
          { label: "Direct", value: 120 },
          { label: "Organic", value: 85 },
          { label: "Referral", value: 45 },
        ]}
      />
    </div>
  );
}
