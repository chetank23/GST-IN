"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export function OfflineSyncBoot() {
  const setOnline = useAppStore((state) => state.setOnlineStatus);

  useEffect(() => {
    const setStatus = () => setOnline(navigator.onLine);
    setStatus();

    window.addEventListener("online", setStatus);
    window.addEventListener("offline", setStatus);

    // Dynamically import workbox-window to avoid crashing if SW is not available
    if ("serviceWorker" in navigator) {
      import("workbox-window")
        .then(({ Workbox }) => {
          const wb = new Workbox("/sw.js");
          wb.register().catch(() => {
            // Ignore SW registration failures in dev environments
          });
        })
        .catch(() => {
          // Ignore if workbox-window fails to load
        });
    }

    return () => {
      window.removeEventListener("online", setStatus);
      window.removeEventListener("offline", setStatus);
    };
  }, [setOnline]);

  return null;
}

