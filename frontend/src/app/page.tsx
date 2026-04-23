"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppFrame } from "@/components/ui/AppFrame";
import { MiniTrendChart } from "@/components/charts/MiniTrendChart";
import { QuickActionCard, SectionHeader, StatCard } from "@/components/ui/Cards";
import { useAppStore } from "@/store/useAppStore";
import { analyticsApi } from "@/lib/api";
import { type DashboardSummary } from "@/lib/types/api";

function fmt(n: number) {
  return `Rs ${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default function HomePage() {
  const draft = useAppStore((state) => state.invoiceDraft);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    analyticsApi
      .dashboardSummary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoadingSummary(false));
  }, []);

  return (
    <AppFrame>
      <section className="space-y-4">
        {draft ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-line bg-[#e8f5ef] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">You have a saved draft</p>
                <p className="text-sm text-muted">
                  {draft.items.length} item(s) • Updated {new Date(draft.updatedAt).toLocaleTimeString()}
                </p>
              </div>
              <Link href="/bill" className="rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-white">
                Resume
              </Link>
            </div>
          </motion.div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-line bg-surface p-4"
        >
          <SectionHeader title="Today's Snapshot" action="Full reports" actionHref="/reports" />
          <div className="mt-3 grid grid-cols-2 gap-3">
            {loadingSummary ? (
              <>
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-20 animate-pulse rounded-2xl bg-line" />
                ))}
              </>
            ) : (
              <>
                <StatCard title="Sales" value={fmt(summary?.salesToday ?? 0)} trend="+Today" />
                <StatCard title="Expenses" value={fmt(summary?.expensesToday ?? 0)} />
                <StatCard title="Profit" value={fmt(summary?.profitToday ?? 0)} />
                <StatCard title="GST Payable" value={fmt(summary?.gstPayable ?? 0)} />
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="rounded-2xl border border-line bg-surface p-4"
        >
          <SectionHeader title="Quick Actions" />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Link href="/bill"><QuickActionCard title="New Bill" subtitle="Create in under 30 sec" /></Link>
            <Link href="/scan"><QuickActionCard title="Scan Bill" subtitle="Capture purchase bill" /></Link>
            <Link href="/whatsapp"><QuickActionCard title="WhatsApp Bill" subtitle="Chat to create invoice" /></Link>
            <Link href="/voice-bill"><QuickActionCard title="Voice Bill" subtitle="Speak items and amount" /></Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <SectionHeader title="Sales Trend" />
          <MiniTrendChart />
        </motion.div>
      </section>
    </AppFrame>
  );
}

