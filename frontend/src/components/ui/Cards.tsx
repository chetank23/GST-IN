import { Activity, ArrowUpRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function QuickActionCard({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <article className="w-full rounded-2xl border border-line bg-surface p-4 text-left transition hover:border-brand/40 hover:bg-[#f4fbf8]">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-1 text-xs text-muted">{subtitle}</p>
    </article>
  );
}

export function StatCard({
  title,
  value,
  trend,
}: {
  title: string;
  value: string;
  trend?: string;
}) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">{title}</p>
        <Activity className="h-4 w-4 text-brand" />
      </div>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
      {trend ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-ok">
          <TrendingUp className="h-3 w-3" />
          {trend}
        </p>
      ) : null}
    </article>
  );
}

export function SectionHeader({
  title,
  action,
  actionHref,
}: {
  title: string;
  action?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      {action ? (
        actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            {action}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand"
          >
            {action}
            <ArrowUpRight className="h-4 w-4" />
          </button>
        )
      ) : null}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface p-6 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  );
}

export function SyncStatusDot({ syncing }: { syncing: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-2.5 w-2.5 rounded-full",
        syncing ? "bg-accent animate-pulse" : "bg-ok",
      )}
      aria-label={syncing ? "Syncing" : "Synced"}
    />
  );
}
