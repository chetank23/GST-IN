export type ApiSuccess<T> = {
  success: true;
  data: T;
  message: string;
  meta: Record<string, unknown>;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

// Must match backend InvoiceStatus exactly
export type InvoiceStatus =
  | "draft"
  | "validated"
  | "ready_for_irp"
  | "submitted_to_irp"
  | "irn_generated"
  | "pdf_generated"
  | "shared"
  | "paid"
  | "cancelled"
  | "failed";

export type InvoiceItem = {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  gstRate: number;
};

/** Saved locally (Dexie / Zustand) while offline */
export type InvoiceDraft = {
  id: string;
  customerName?: string;
  invoiceNumber: string;
  items: InvoiceItem[];
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
};

/** Full record returned from the backend */
export type InvoiceRecord = {
  id: string;
  businessId: string;
  invoiceNumber: string;
  customerName?: string;
  placeOfSupplyState: string;
  businessState: string;
  items: InvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  total: number;
  status: InvoiceStatus;
  pdfUrl?: string;
  irn?: string;
  ackNumber?: string;
  qrData?: string;
  createdAt: string;
  updatedAt: string;
  auditLogs: Array<{ at: string; action: string; note?: string }>;
};

export type ProductRecord = {
  id: string;
  name: string;
  gstRate: number;
  defaultPrice: number;
  stock: number;
  updatedAt: string;
};

export type CustomerRecord = {
  id: string;
  name: string;
  phone?: string;
  pendingDue: number;
  lastPurchaseDate: string;
};

export type OcrField = {
  key: string;
  value: string;
  confidence: number;
};

export type OcrJob = {
  id: string;
  sourceFile: string;
  status: "uploading" | "processing" | "extracted" | "review_required" | "saved" | "failed" | "rejected";
  fields: OcrField[];
  classification?: "purchase" | "expense" | "inventory";
  createdAt: string;
  updatedAt: string;
};

export type DashboardSummary = {
  salesToday: number;
  expensesToday: number;
  profitToday: number;
  gstPayable: number;
};

