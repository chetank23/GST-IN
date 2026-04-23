"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { analyticsApi } from "@/lib/api";

const SAMPLE = [
  { day: "Mon", value: 1200 },
  { day: "Tue", value: 1800 },
  { day: "Wed", value: 1500 },
  { day: "Thu", value: 2200 },
  { day: "Fri", value: 2100 },
];

export function MiniTrendChart() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<Array<{ day: string; value: number }>>(SAMPLE);

  useEffect(() => {
    setMounted(true);
    analyticsApi
      .dashboardTrends()
      .then((trends) => {
        if (trends.length > 0) {
          setData(trends.map((t) => ({ day: t.date.slice(5), value: t.sales })));
        }
      })
      .catch(() => {
        // Keep sample data on error
      });
  }, []);

  if (!mounted) {
    return <div className="h-28 w-full rounded-2xl border border-line bg-surface p-2" />;
  }

  return (
    <div className="h-28 w-full rounded-2xl border border-line bg-surface p-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke="#12715b" fill="#b9e9d4" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

