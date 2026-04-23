"use client";

import { useState } from "react";
import Link from "next/link";
import { AppFrame } from "@/components/ui/AppFrame";
import { InvoiceStatusBadge } from "@/components/ui/Status";
import { EmptyState } from "@/components/ui/Cards";
import { useAppStore } from "@/store/useAppStore";
import { billingApi } from "@/lib/api";

export default function InvoicePreviewPage() {
  const draft = useAppStore((state) => state.invoiceDraft);
  const upsertDraft = useAppStore((state) => state.upsertDraft);
  const businessProfile = useAppStore((state) => state.businessProfile);
  const sellerName = businessProfile.businessName || "GST Saathi";

  const [feedback, setFeedback] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSharingWhatsapp, setIsSharingWhatsapp] = useState(false);

  const subtotal = draft?.items.reduce((acc, item) => acc + item.quantity * item.price, 0) ?? 0;
  const gst =
    draft?.items.reduce((acc, item) => acc + (item.quantity * item.price * item.gstRate) / 100, 0) ?? 0;
  const total = subtotal + gst;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!draft) return;
    setIsGeneratingPdf(true);
    setFeedback("");
    try {
      const result = await billingApi.generatePdf(draft.id, crypto.randomUUID());
      // Open the PDF URL in a new tab
      const pdfUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ?? "http://localhost:4000"}${result.pdfUrl}`;
      window.open(pdfUrl, "_blank");
      setFeedback("PDF generated! Opening download…");
      // Update draft status
      upsertDraft({ ...draft, status: "pdf_generated" });
    } catch (err) {
      setFeedback((err as Error).message ?? "Failed to generate PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareWhatsapp = async () => {
    if (!draft) return;
    setIsSharingWhatsapp(true);
    setFeedback("");
    try {
      await billingApi.shareWhatsapp(draft.id, crypto.randomUUID());
      setFeedback("Invoice queued for WhatsApp delivery!");
      upsertDraft({ ...draft, status: "shared" });
    } catch (err) {
      setFeedback((err as Error).message ?? "Failed to share on WhatsApp.");
    } finally {
      setIsSharingWhatsapp(false);
    }
  };

  return (
    <AppFrame>
      <section className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">Invoice Preview</h1>
          <InvoiceStatusBadge status={draft?.status ?? "draft"} />
        </div>
        {feedback ? (
          <p className="mt-2 rounded-lg bg-[#ebf7f2] px-3 py-2 text-xs text-brand-strong">{feedback}</p>
        ) : null}
        {!draft ? (
          <div className="mt-4 space-y-3">
            <EmptyState
              title="No invoice draft found"
              description="Create a bill first and your preview will appear here automatically."
            />
            <Link
              href="/bill"
              className="inline-flex h-11 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white"
            >
              Go to New Bill
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-4 rounded-xl border border-line bg-white p-4 text-sm print:border-none">
              <p className="font-semibold">Invoice #{draft.invoiceNumber}</p>
              <p>Seller: {sellerName}{businessProfile.gstin ? ` (${businessProfile.gstin})` : ""}</p>
              <p>Buyer: {draft.customerName || "Walk-in Customer"}</p>
              <hr className="my-3 border-line" />
              <ul className="space-y-1">
                {draft.items.map((item) => (
                  <li key={item.id}>
                    {item.productName} × {item.quantity} @ Rs {item.price} = Rs{" "}
                    {(item.quantity * item.price).toFixed(2)} (GST {item.gstRate}%)
                  </li>
                ))}
              </ul>
              <hr className="my-3 border-line" />
              <p>Subtotal: Rs {subtotal.toFixed(2)}</p>
              <p>GST: Rs {gst.toFixed(2)}</p>
              <p className="mt-2 font-bold">Total = Rs {total.toFixed(2)}</p>
              <p className="mt-2 text-xs text-muted">IRN status: Pending</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="h-11 rounded-xl border border-line bg-white px-4 font-semibold"
              >
                Print
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="h-11 rounded-xl border border-line bg-white px-4 font-semibold disabled:opacity-50"
              >
                {isGeneratingPdf ? "Generating…" : "Download PDF"}
              </button>
              <button
                type="button"
                onClick={handleShareWhatsapp}
                disabled={isSharingWhatsapp}
                className="h-11 rounded-xl bg-brand px-4 font-semibold text-white disabled:opacity-50"
              >
                {isSharingWhatsapp ? "Sharing…" : "Share WhatsApp"}
              </button>
            </div>
          </>
        )}
      </section>
    </AppFrame>
  );
}

