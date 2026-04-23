"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { BottomNav } from "@/components/ui/BottomNav";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { OfflineBanner } from "@/components/ui/Status";
import { SyncStatusDot } from "@/components/ui/Cards";
import { useAppStore } from "@/store/useAppStore";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const canGoBack = pathname !== "/";

  const offline = useAppStore((state) => !state.notificationStatus.isOnline);
  const syncing = useAppStore((state) => state.offlineQueue.syncing);
  const businessProfile = useAppStore((state) => state.businessProfile);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <div className="app-shell flex min-h-screen flex-col px-3 pb-20 pt-3 md:px-6 md:pb-8">
      <header className="mb-3 rounded-2xl border border-line bg-surface p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-xl font-bold">
              {businessProfile.businessName || "GST Saathi"}
            </p>
            <p className="text-xs text-muted">
              {businessProfile.businessName ? businessProfile.gstin || "Fast billing for MSMEs" : "Fast billing for MSMEs"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SyncStatusDot syncing={syncing} />
            <LanguageToggle />
          </div>
        </div>
        {canGoBack ? (
          <div className="mt-3">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>
        ) : null}
        <div className="mt-3">
          <OfflineBanner offline={offline} />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
