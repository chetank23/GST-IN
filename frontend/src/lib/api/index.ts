import { apiDelete, apiGet, apiPatch, apiPost, apiUpload } from "./client";
import type {
  ApiSuccess,
  CustomerRecord,
  DashboardSummary,
  InvoiceRecord,
  OcrJob,
  ProductRecord,
} from "@/lib/types/api";

// ─── Helpers ────────────────────────────────────────────────────────────────

function unwrap<T>(res: ApiSuccess<T>): T {
  return res.data;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (identifier: string) =>
    apiPost<ApiSuccess<{ otpSessionId: string; otpSent: boolean }>>(
      "/auth/login",
      { identifier },
    ).then(unwrap),

  verifyOtp: (otpSessionId: string, otp: string) =>
    apiPost<ApiSuccess<{ accessToken: string; refreshToken: string; user: { id: string; role: string } }>>(
      "/auth/verify-otp",
      { otpSessionId, otp },
    ).then(unwrap),
};

// ─── Billing ─────────────────────────────────────────────────────────────────

export type CreateInvoicePayload = {
  businessId: string;
  placeOfSupplyState: string;
  businessState: string;
  customerName?: string;
  items: Array<{ productName: string; quantity: number; price: number; gstRate: number }>;
};

export const billingApi = {
  createInvoice: (payload: CreateInvoicePayload, idempotencyKey: string) =>
    apiPost<ApiSuccess<InvoiceRecord>>("/invoices", payload, idempotencyKey).then(unwrap),

  listInvoices: () =>
    apiGet<ApiSuccess<InvoiceRecord[]>>("/invoices").then(unwrap),

  getInvoice: (id: string) =>
    apiGet<ApiSuccess<InvoiceRecord>>(`/invoices/${id}`).then(unwrap),

  updateInvoice: (id: string, patch: Partial<CreateInvoicePayload & { status: string }>) =>
    apiPatch<ApiSuccess<InvoiceRecord>>(`/invoices/${id}`, patch).then(unwrap),

  validateInvoice: (id: string) =>
    apiPost<ApiSuccess<InvoiceRecord>>(`/invoices/${id}/validate`, {}).then(unwrap),

  finalizeInvoice: (id: string) =>
    apiPost<ApiSuccess<InvoiceRecord>>(`/invoices/${id}/finalize`, {}).then(unwrap),

  generatePdf: (id: string, idempotencyKey: string) =>
    apiPost<ApiSuccess<{ invoiceId: string; pdfUrl: string }>>(
      `/invoices/${id}/pdf`,
      {},
      idempotencyKey,
    ).then(unwrap),

  shareWhatsapp: (id: string, idempotencyKey: string) =>
    apiPost<ApiSuccess<{ invoiceId: string; deliveryStatus: string }>>(
      `/invoices/${id}/share/whatsapp`,
      {},
      idempotencyKey,
    ).then(unwrap),

  cancelInvoice: (id: string) =>
    apiPost<ApiSuccess<InvoiceRecord>>(`/invoices/${id}/cancel`, {}).then(unwrap),
};

// ─── OCR ─────────────────────────────────────────────────────────────────────

export const ocrApi = {
  /** Upload a file using multipart/form-data */
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    return apiUpload<ApiSuccess<{ jobId: string; status: string }>>("/ocr/upload", formData).then(unwrap);
  },

  /** Fallback: submit just the fileName (used when actual upload is unavailable) */
  uploadByName: (fileName: string, idempotencyKey: string) =>
    apiPost<ApiSuccess<{ jobId: string; status: string }>>(
      "/ocr/upload",
      { fileName },
      idempotencyKey,
    ).then(unwrap),

  getJob: (id: string) =>
    apiGet<ApiSuccess<OcrJob>>(`/ocr/jobs/${id}`).then(unwrap),

  confirmJob: (
    id: string,
    classification: "purchase" | "expense" | "inventory",
    correctedFields?: Array<{ key: string; value: string }>,
  ) =>
    apiPost<ApiSuccess<{ jobId: string; status: string; classification: string }>>(
      `/ocr/jobs/${id}/confirm`,
      { classification, correctedFields },
    ).then(unwrap),

  rejectJob: (id: string) =>
    apiPost<ApiSuccess<{ jobId: string; status: string }>>(`/ocr/jobs/${id}/reject`, {}).then(unwrap),
};

// ─── Catalog ─────────────────────────────────────────────────────────────────

export const catalogApi = {
  listProducts: () =>
    apiGet<ApiSuccess<ProductRecord[]>>("/products").then(unwrap),

  createProduct: (data: { name: string; gstRate: number; defaultPrice: number; stock: number }) =>
    apiPost<ApiSuccess<ProductRecord>>("/products", data).then(unwrap),

  updateProduct: (id: string, patch: Partial<{ name: string; gstRate: number; defaultPrice: number; stock: number; addStock: number }>) =>
    apiPatch<ApiSuccess<ProductRecord>>(`/products/${id}`, patch).then(unwrap),

  listCustomers: () =>
    apiGet<ApiSuccess<CustomerRecord[]>>("/customers").then(unwrap),

  createCustomer: (data: { name: string; phone?: string; pendingDue?: number }) =>
    apiPost<ApiSuccess<CustomerRecord>>("/customers", data).then(unwrap),

  updateCustomer: (id: string, patch: Partial<{ name: string; phone: string; pendingDue: number }>) =>
    apiPatch<ApiSuccess<CustomerRecord>>(`/customers/${id}`, patch).then(unwrap),
};

// ─── Reminders ───────────────────────────────────────────────────────────────

export const remindersApi = {
  list: () =>
    apiGet<ApiSuccess<Array<{ id: string; customerId: string; message: string; dueDate: string; status: string }>>>(
      "/reminders",
    ).then(unwrap),

  create: (customerId: string, message: string, dueDate: string) =>
    apiPost<ApiSuccess<{ id: string }>>("/reminders", { customerId, message, dueDate }).then(unwrap),

  update: (id: string, patch: { status?: "pending" | "sent" | "dismissed"; message?: string; dueDate?: string }) =>
    apiPatch<ApiSuccess<{ id: string }>>(`/reminders/${id}`, patch).then(unwrap),

  delete: (id: string) =>
    apiDelete<ApiSuccess<{ deleted: boolean }>>(`/reminders/${id}`).then(unwrap),
};

// ─── Analytics ───────────────────────────────────────────────────────────────

export const analyticsApi = {
  dashboardSummary: () =>
    apiGet<ApiSuccess<DashboardSummary>>("/dashboard/summary").then(unwrap),

  dashboardTrends: () =>
    apiGet<ApiSuccess<Array<{ date: string; sales: number; gst: number }>>>("/dashboard/trends").then(unwrap),

  salesReport: (period: "daily" | "weekly" | "monthly" = "daily") =>
    apiGet<ApiSuccess<{ period: string; points: Array<{ label: string; value: number }> }>>(
      `/reports/sales?period=${period}`,
    ).then(unwrap),

  expensesReport: (period: "daily" | "weekly" | "monthly" = "daily") =>
    apiGet<ApiSuccess<{ period: string; points: Array<{ label: string; value: number }> }>>(
      `/reports/expenses?period=${period}`,
    ).then(unwrap),

  gstReport: () =>
    apiGet<ApiSuccess<Array<{ name: string; value: number }>>>("/reports/gst").then(unwrap),

  inventoryReport: () =>
    apiGet<ApiSuccess<Array<{ id: string; name: string; stock: number; status: string }>>>(
      "/reports/inventory",
    ).then(unwrap),
};

// ─── IRP ─────────────────────────────────────────────────────────────────────

export const irpApi = {
  prepareJson: (invoiceId: string) =>
    apiPost<ApiSuccess<{ invoiceId: string; payload: unknown }>>("/irp/prepare-json", { invoiceId }).then(unwrap),

  submit: (invoiceId: string, idempotencyKey: string) =>
    apiPost<ApiSuccess<{ invoiceId: string; irn: string; ackNumber: string; qrData: string; status: string }>>(
      "/irp/submit",
      { invoiceId },
      idempotencyKey,
    ).then(unwrap),

  cancel: (invoiceId: string) =>
    apiPost<ApiSuccess<{ invoiceId: string; status: string }>>("/irp/cancel", { invoiceId }).then(unwrap),

  status: (invoiceId: string) =>
    apiGet<ApiSuccess<{ invoiceId: string; status: string; irn: string | null; ackNumber: string | null }>>(
      `/irp/status/${invoiceId}`,
    ).then(unwrap),
};

// ─── Sync ─────────────────────────────────────────────────────────────────────

export const syncApi = {
  push: (idempotencyKey: string) =>
    apiPost<ApiSuccess<{ accepted: boolean; deduplicated: boolean; conflicts: unknown[]; eventId: string }>>(
      "/sync/push",
      {},
      idempotencyKey,
    ).then(unwrap),

  pull: () =>
    apiGet<ApiSuccess<{ events: Array<{ id: string; type: string; createdAt: string }> }>>("/sync/pull").then(unwrap),
};
