import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type InvoiceDraft } from "@/lib/types/api";

type Language = "en" | "hi" | "ta";

type AppState = {
  authSession: { userId: string | null; role: "owner" | "staff" | null };
  businessProfile: { businessName: string; gstin: string; state: string; businessId: string; whatsappNumber: string };
  invoiceDraft: InvoiceDraft | null;
  invoiceHistory: InvoiceDraft[];
  scannerResult: { rows: Array<Record<string, string>> };
  ocrConfidence: Record<string, number>;
  languageSettings: { language: Language };
  offlineQueue: { pendingCount: number; syncing: boolean };
  notificationStatus: { isOnline: boolean };
  whatsappDeliveryStatus: { lastStatus: string };
  analyticsFilters: { period: "daily" | "weekly" | "monthly" };
  inventoryCache: { lowStockItems: string[] };
  setLanguage: (language: Language) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  upsertDraft: (draft: InvoiceDraft) => void;
  clearDraft: () => void;
  setBusinessProfile: (profile: Partial<AppState["businessProfile"]>) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      authSession: { userId: null, role: null },
      businessProfile: { businessName: "", gstin: "", state: "", businessId: "owner-1", whatsappNumber: "" },
      invoiceDraft: null,
      invoiceHistory: [],
      scannerResult: { rows: [] },
      ocrConfidence: {},
      languageSettings: { language: "en" },
      offlineQueue: { pendingCount: 0, syncing: false },
      notificationStatus: { isOnline: true },
      whatsappDeliveryStatus: { lastStatus: "idle" },
      analyticsFilters: { period: "daily" },
      inventoryCache: { lowStockItems: [] },
      setLanguage: (language) =>
        set((state) => ({ languageSettings: { ...state.languageSettings, language } })),
      setOnlineStatus: (isOnline) =>
        set((state) => ({ notificationStatus: { ...state.notificationStatus, isOnline } })),
      upsertDraft: (draft) =>
        set((state) => ({
          invoiceDraft: draft,
          invoiceHistory: [...state.invoiceHistory.filter((item) => item.id !== draft.id), draft],
        })),
      clearDraft: () =>
        set(() => ({ invoiceDraft: null })),
      setBusinessProfile: (profile) =>
        set((state) => ({ businessProfile: { ...state.businessProfile, ...profile } })),
    }),
    {
      name: "gst-saathi-store",
      partialize: (state) => ({
        languageSettings: state.languageSettings,
        invoiceDraft: state.invoiceDraft,
        invoiceHistory: state.invoiceHistory,
        businessProfile: state.businessProfile,
      }),
    },
  ),
);
