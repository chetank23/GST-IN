"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppFrame } from "@/components/ui/AppFrame";
import { SectionHeader } from "@/components/ui/Cards";
import { analyticsApi } from "@/lib/api";

type Period = "daily" | "weekly" | "monthly";

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState<Period>("daily");
  const [sales, setSales] = useState<Array<{ label: string; value: number }>>([]);
  const [expenses, setExpenses] = useState<Array<{ name: string; value: number }>>([]);
  const [gstSplit, setGstSplit] = useState<Array<{ name: string; value: number }>>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Fetch all three reports in parallel when period changes
    Promise.allSettled([
      analyticsApi.salesReport(period),
      analyticsApi.expensesReport(period),
      analyticsApi.gstReport(),
    ]).then(([salesRes, expensesRes, gstRes]) => {
      if (salesRes.status === "fulfilled") {
        setSales(salesRes.value.points);
      }
      if (expensesRes.status === "fulfilled") {
        setExpenses(expensesRes.value.points.map((p) => ({ name: p.label, value: p.value })));
      }
      if (gstRes.status === "fulfilled") {
        setGstSplit(gstRes.value);
      }
    });
  }, [period]);

  const periods: Period[] = ["daily", "weekly", "monthly"];

  return (
    <AppFrame>
      <section className="space-y-4">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <SectionHeader title="Reports" />
          <div className="mt-3 flex gap-2">
            {periods.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`h-9 rounded-lg px-3 text-sm font-semibold capitalize ${
                  period === p ? "bg-brand text-white" : "border border-line bg-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface p-4">
            <h3 className="font-semibold">Sales trend</h3>
            <div className="mt-2 h-52">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sales}>
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Line dataKey="value" stroke="#12715b" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4">
            <h3 className="font-semibold">Expenses</h3>
            <div className="mt-2 h-52">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expenses}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ff8f3f" />
                  </BarChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 md:col-span-2">
            <h3 className="font-semibold">GST split</h3>
            <div className="mt-2 h-56">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={gstSplit} dataKey="value" nameKey="name" outerRadius={90} fill="#12715b" label />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </AppFrame>
  );
}

