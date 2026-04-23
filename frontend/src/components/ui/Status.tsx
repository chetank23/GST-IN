import { type InvoiceStatus } from "@/lib/types/api";

const statusLabelMap: Record<InvoiceStatus, string> = {
  draft: "Draft",
  validated: "Validated",
  ready_for_irp: "Ready for IRP",
  submitted_to_irp: "Sent to IRP",
  irn_generated: "IRN Generated",
  pdf_generated: "PDF Generated",
  shared: "Shared on WhatsApp",
  paid: "Paid",
  cancelled: "Cancelled",
  failed: "Failed",
};

const statusClassMap: Record<InvoiceStatus, string> = {
  draft: "bg-[#fff4de] text-[#8b5e00]",
  validated: "bg-[#e5f7e9] text-[#0b5a2a]",
  ready_for_irp: "bg-[#e6f5ff] text-[#0e4f7a]",
  submitted_to_irp: "bg-[#e8f4ff] text-[#184f8a]",
  irn_generated: "bg-[#eaf0ff] text-[#1a3c8a]",
  pdf_generated: "bg-[#edf7ea] text-[#165c2f]",
  shared: "bg-[#e5f9ef] text-[#0b5a36]",
  paid: "bg-[#d4edda] text-[#155724]",
  cancelled: "bg-[#f5e5e5] text-[#721c24]",
  failed: "bg-[#fde8e8] text-[#8a1f1f]",
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const label = statusLabelMap[status] ?? status;
  const cls = statusClassMap[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}

export function OfflineBanner({ offline }: { offline: boolean }) {
  if (!offline) return null;
  return (
    <div className="rounded-xl border border-accent bg-[#fff1e5] px-3 py-2 text-sm text-[#7a3f00]">
      No internet. Your draft is saved locally.
    </div>
  );
}

