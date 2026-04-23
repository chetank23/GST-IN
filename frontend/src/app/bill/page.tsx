"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppFrame } from "@/components/ui/AppFrame";
import { BottomActionBar } from "@/components/ui/BottomActionBar";
import { GSTRateChip, ProductAutocomplete, QuantityInput, CurrencyInput, VoiceInputButton } from "@/components/ui/Inputs";
import { SectionHeader } from "@/components/ui/Cards";
import { db } from "@/store/db";
import { useAppStore } from "@/store/useAppStore";
import { type InvoiceItem } from "@/lib/types/api";
import { billingApi } from "@/lib/api";


const itemSchema = z.object({
  customerName: z.string().optional(),
  productName: z.string().min(1, "Product name is required"),
  quantity: z.number().min(0.01),
  price: z.number().min(0.01),
  gstRate: z.number().min(0),
});

type BillForm = z.infer<typeof itemSchema>;

export default function BillPage() {
  const router = useRouter();
  const draftFromStore = useAppStore((state) => state.invoiceDraft);
  const upsertDraft = useAppStore((state) => state.upsertDraft);
  const clearDraft = useAppStore((state) => state.clearDraft);
  const businessProfile = useAppStore((state) => state.businessProfile);

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    watch,
    setValue,
    formState,
    handleSubmit,
    reset,
  } = useForm<BillForm>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      customerName: "",
      productName: "",
      quantity: 1,
      price: 0,
      gstRate: 5,
    },
  });

  const quantity = watch("quantity");
  const price = watch("price");
  const gstRate = watch("gstRate");

  const { subtotal, gst, total } = useMemo(() => {
    const sub = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const gstValue = items.reduce((acc, item) => acc + (item.quantity * item.price * item.gstRate) / 100, 0);
    return { subtotal: sub, gst: gstValue, total: sub + gstValue };
  }, [items]);

  useEffect(() => {
    if (!draftFromStore) {
      return;
    }

    if (draftFromStore.items.length > 0) {
      setItems(draftFromStore.items);
      setCustomerName(draftFromStore.customerName ?? "");
      setFeedback("Recovered your last draft.");
    }
  }, [draftFromStore]);

  const addItem = handleSubmit((values) => {
    const nextItem: InvoiceItem = {
      id: crypto.randomUUID(),
      productName: values.productName,
      quantity: values.quantity,
      price: values.price,
      gstRate: values.gstRate,
    };

    setItems((prev) => [...prev, nextItem]);
    reset({
      customerName,
      productName: "",
      quantity: 1,
      price: 0,
      gstRate,
    });
    setFeedback("Item added. You can add another or generate bill.");
  });

  const removeItem = (id: string) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      // If all items removed, wipe the draft from store + DB too
      if (updated.length === 0) {
        clearDraft();
        if (draftFromStore?.id) {
          db.invoiceDrafts.delete(draftFromStore.id).catch(() => undefined);
        }
        setFeedback("Draft cleared.");
      }
      return updated;
    });
  };

  const discardDraft = async () => {
    clearDraft();
    if (draftFromStore?.id) {
      await db.invoiceDrafts.delete(draftFromStore.id).catch(() => undefined);
    }
    setItems([]);
    setCustomerName("");
    setFeedback("Draft discarded.");
  };

  const saveDraft = async (nextStatus: "draft" | "validated") => {
    if (items.length === 0) {
      setFeedback("Add at least one item before saving.");
      return null;
    }

    const now = new Date().toISOString();
    const draftId = draftFromStore?.id ?? crypto.randomUUID();
    const draft = {
      id: draftId,
      invoiceNumber: draftFromStore?.invoiceNumber ?? `INV-${Date.now()}`,
      customerName,
      items,
      status: nextStatus,
      createdAt: draftFromStore?.createdAt ?? now,
      updatedAt: now,
    };

    upsertDraft(draft);
    await db.invoiceDrafts.put(draft);
    return draft;
  };

  const onSaveDraft = async () => {
    setIsSaving(true);
    try {
      const draft = await saveDraft("draft");
      if (draft) {
        setFeedback("Draft saved locally. You can continue offline.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const onGenerate = async () => {
    setIsGenerating(true);
    try {
      const draft = await saveDraft("validated");
      if (!draft) return;

      // Try to submit to backend; if offline, navigate with local draft
      try {
        const invoice = await billingApi.createInvoice(
          {
            businessId: businessProfile.businessId || "owner-1",
            placeOfSupplyState: businessProfile.state || "KA",
            businessState: businessProfile.state || "KA",
            customerName: draft.customerName,
            items: draft.items.map((item) => ({
              productName: item.productName,
              quantity: item.quantity,
              price: item.price,
              gstRate: item.gstRate,
            })),
          },
          crypto.randomUUID(),
        );

        // Update local draft with backend invoice id & number
        const updatedDraft = {
          ...draft,
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          status: invoice.status,
        };
        upsertDraft(updatedDraft);
        await db.invoiceDrafts.put(updatedDraft);
        setFeedback("Invoice created! Redirecting to preview…");
      } catch {
        // Backend unavailable — still navigate with local draft
        setFeedback("Offline: showing local preview.");
      }

      router.push("/invoice-preview");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppFrame>
      <section className="space-y-4 pb-24 md:pb-4">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <SectionHeader title="New Bill" />
          <p className="mt-1 text-sm text-muted">Finish your bill in three steps: product, quantity, generate.</p>
          {feedback ? (
            <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-[#ebf7f2] px-3 py-2">
              <p className="text-xs text-brand-strong">{feedback}</p>
              {feedback.includes("draft") && items.length > 0 ? (
                <button
                  type="button"
                  onClick={discardDraft}
                  className="shrink-0 rounded-lg border border-line bg-white px-2 py-1 text-xs font-semibold text-danger hover:bg-red-50"
                >
                  Discard
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="mt-3 grid gap-3">
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Customer name (optional)"
              className="h-12 w-full rounded-xl border border-line bg-white px-3"
            />
            <ProductAutocomplete {...register("productName")} placeholder="Product name" />
            {formState.errors.productName ? (
              <p className="text-xs text-danger">{formState.errors.productName.message}</p>
            ) : null}
            <div className="grid grid-cols-2 gap-2">
              <QuantityInput {...register("quantity", { valueAsNumber: true })} placeholder="Quantity" />
              <CurrencyInput {...register("price", { valueAsNumber: true })} placeholder="Price" />
            </div>
            <div className="flex flex-wrap gap-2">
              {[0, 5, 12, 18].map((rate) => (
                <button key={rate} type="button" onClick={() => setValue("gstRate", rate)}>
                  <GSTRateChip rate={rate} selected={rate === gstRate} />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {["Rice", "Oil", "Sugar", "Milk"].map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setValue("productName", name)}
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold"
                >
                  {name}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="h-11 rounded-xl border border-line bg-white text-sm font-semibold"
            >
              Add another item
            </button>
            <VoiceInputButton
              onResult={({ productName, quantity, price }) => {
                setValue("productName", productName);
                setValue("quantity", quantity);
                setValue("price", price);
                setFeedback(`Voice: "${productName}" ${quantity}× ₹${price} — tap Add item to confirm.`);
              }}
            />

          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <SectionHeader title="Items Added" />
          {items.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No items yet. Add your first product above.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-xl border border-line bg-white p-3 text-sm">
                  <div>
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-xs text-muted">
                      {item.quantity} x Rs {item.price} • GST {item.gstRate}%
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="rounded-lg border border-line px-2 py-1 text-xs font-semibold"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 rounded-xl bg-[#eef7f2] p-3 text-sm">
            <p>Subtotal: Rs {subtotal.toFixed(2)}</p>
            <p>GST: Rs {gst.toFixed(2)}</p>
            <p className="font-semibold">Total: Rs {total.toFixed(2)}</p>
          </div>
        </div>
      </section>
      <BottomActionBar
        total={total}
        onSaveDraft={onSaveDraft}
        onGenerate={onGenerate}
        isSaving={isSaving}
        isGenerating={isGenerating}
      />
    </AppFrame>
  );
}
