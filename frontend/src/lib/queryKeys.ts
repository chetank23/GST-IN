export const queryKeys = {
  businessProfile: ["business-profile"] as const,
  invoices: ["invoices"] as const,
  invoiceById: (id: string) => ["invoice", id] as const,
  ocrJob: (id: string) => ["ocr-job", id] as const,
  dashboardSummary: ["dashboard-summary"] as const,
  dashboardTrends: ["dashboard-trends"] as const,
  whatsappStatus: ["whatsapp-status"] as const,
  syncStatus: ["sync-status"] as const,
};
