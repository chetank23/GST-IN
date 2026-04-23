"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic } from "lucide-react";
import { AppFrame } from "@/components/ui/AppFrame";
import { useAppStore } from "@/store/useAppStore";
import { db } from "@/store/db";
import { billingApi } from "@/lib/api";
import { type InvoiceItem } from "@/lib/types/api";

type ParsedItem = { productName: string; quantity: number; price: number; gstRate: number };

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionAPI {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
interface SpeechRecognitionConstructor { new(): SpeechRecognitionAPI; }
type WindowWithSpeech = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

function parseVoice(text: string): ParsedItem | null {
  const cleaned = text.toLowerCase().replace(/[^\w\s.]/g, "").trim();
  const parts = cleaned.split(/\s+/);
  const numbers = parts
    .map((p) => parseFloat(p.replace(/[^0-9.]/g, "")))
    .filter((n) => !isNaN(n) && n > 0);
  const firstNumIdx = parts.findIndex((p) => /\d/.test(p));
  const productName = (firstNumIdx > 0 ? parts.slice(0, firstNumIdx) : parts.slice(0, 1))
    .join(" ")
    .replace(/[^a-z\s]/g, "")
    .trim();

  if (!productName || numbers.length === 0) return null;

  return {
    productName,
    quantity: numbers[0] ?? 1,
    price: numbers[1] ?? 0,
    gstRate: 5,
  };
}

export default function VoiceBillPage() {
  const router = useRouter();
  const upsertDraft = useAppStore((state) => state.upsertDraft);
  const draftFromStore = useAppStore((state) => state.invoiceDraft);
  const businessProfile = useAppStore((state) => state.businessProfile);

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastParsed, setLastParsed] = useState<ParsedItem | null>(null);
  const [feedback, setFeedback] = useState("Tap the mic and say an item. E.g. 'Rice 2 hundred'");
  const [isGenerating, setIsGenerating] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionAPI | null>(null);

  // Restore draft items
  useEffect(() => {
    if (draftFromStore?.items.length) {
      setItems(draftFromStore.items);
      setFeedback(`Loaded ${draftFromStore.items.length} item(s) from draft.`);
    }
  }, [draftFromStore]);

  const startListening = () => {
    const win = window as unknown as WindowWithSpeech;
    const SR = win.SpeechRecognition ?? win.webkitSpeechRecognition;

    if (!SR) {
      setFeedback("❌ Voice not supported. Use Chrome or Edge.");
      return;
    }

    const recognition = new SR();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setListening(true);
      setTranscript("");
      setLastParsed(null);
      setFeedback("🎤 Listening… say the item, quantity and price.");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const said = event.results[0][0].transcript;
      setTranscript(said);
      const parsed = parseVoice(said);
      if (parsed) {
        setLastParsed(parsed);
        setFeedback(`Heard: "${said}" → ${parsed.productName} × ${parsed.quantity} @ ₹${parsed.price}`);
      } else {
        setFeedback(`Heard: "${said}" — couldn't parse. Try: "Rice 2 100"`);
      }
    };

    recognition.onerror = (e: { error: string }) => {
      setFeedback(`Error: ${e.error}. Tap mic to retry.`);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const confirmItem = () => {
    if (!lastParsed) return;
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      ...lastParsed,
    };
    setItems((prev) => {
      const updated = [...prev, newItem];
      setFeedback(`✅ Added "${newItem.productName}". Tap mic for next item or Generate Invoice.`);
      return updated;
    });
    setLastParsed(null);
    setTranscript("");
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const generateInvoice = async () => {
    if (items.length === 0) {
      setFeedback("Add at least one item first.");
      return;
    }
    setIsGenerating(true);
    const now = new Date().toISOString();
    const draft = {
      id: draftFromStore?.id ?? crypto.randomUUID(),
      invoiceNumber: draftFromStore?.invoiceNumber ?? `INV-${Date.now()}`,
      customerName: undefined,
      items,
      status: "validated" as const,
      createdAt: draftFromStore?.createdAt ?? now,
      updatedAt: now,
    };

    upsertDraft(draft);
    await db.invoiceDrafts.put(draft);

    try {
      const invoice = await billingApi.createInvoice(
        {
          businessId: businessProfile.businessId || "owner-1",
          placeOfSupplyState: businessProfile.state || "KA",
          businessState: businessProfile.state || "KA",
          items: items.map((i) => ({
            productName: i.productName,
            quantity: i.quantity,
            price: i.price,
            gstRate: i.gstRate,
          })),
        },
        crypto.randomUUID(),
      );
      upsertDraft({ ...draft, id: invoice.id, invoiceNumber: invoice.invoiceNumber, status: invoice.status });
    } catch {
      // offline — local draft is enough
    }

    router.push("/invoice-preview");
    setIsGenerating(false);
  };

  const subtotal = items.reduce((a, i) => a + i.quantity * i.price, 0);
  const gst = items.reduce((a, i) => a + (i.quantity * i.price * i.gstRate) / 100, 0);
  const total = subtotal + gst;

  return (
    <AppFrame>
      <section className="space-y-4">
        {/* Mic card */}
        <div className="rounded-2xl border border-line bg-surface p-4 text-center">
          <h1 className="font-display text-xl font-bold">Voice Bill</h1>
          <p className="mt-1 text-sm text-muted">Speak item name, quantity & price. E.g. "Rice 2 100"</p>

          <button
            type="button"
            onClick={listening ? stopListening : startListening}
            className={`mx-auto mt-6 flex h-24 w-24 items-center justify-center rounded-full shadow-lg transition-all ${
              listening
                ? "animate-pulse bg-red-500 text-white shadow-red-200"
                : "bg-brand text-white hover:bg-brand/90"
            }`}
          >
            <Mic className="h-10 w-10" />
          </button>
          <p className="mt-3 text-xs font-semibold text-muted">{listening ? "Tap to stop" : "Tap to speak"}</p>

          {transcript ? (
            <p className="mt-2 rounded-lg bg-[#eef7f2] px-3 py-2 text-sm text-ink">
              &ldquo;{transcript}&rdquo;
            </p>
          ) : null}

          <p
            className={`mt-2 text-sm ${feedback.startsWith("❌") || feedback.startsWith("Error") ? "text-danger" : "text-muted"}`}
          >
            {feedback}
          </p>

          {lastParsed ? (
            <div className="mt-4 rounded-xl border border-brand/30 bg-[#eef7f2] p-3 text-sm">
              <p className="font-semibold text-brand">Confirm this item?</p>
              <p className="mt-1">
                {lastParsed.productName} × {lastParsed.quantity} @ ₹{lastParsed.price} (GST {lastParsed.gstRate}%)
              </p>
              <div className="mt-3 flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => { setLastParsed(null); setTranscript(""); setFeedback("Cancelled. Tap mic to try again."); }}
                  className="h-9 rounded-lg border border-line bg-white px-4 text-sm font-semibold"
                >
                  Retry
                </button>
                <button
                  type="button"
                  onClick={confirmItem}
                  className="h-9 rounded-lg bg-brand px-4 text-sm font-semibold text-white"
                >
                  Add Item ✓
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Items list */}
        {items.length > 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-semibold">Items Added ({items.length})</p>
            <ul className="mt-2 space-y-2">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-xl border border-line bg-white p-3 text-sm">
                  <div>
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-xs text-muted">{item.quantity} × ₹{item.price} • GST {item.gstRate}%</p>
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
            <div className="mt-3 rounded-xl bg-[#eef7f2] p-3 text-sm">
              <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
              <p>GST: ₹{gst.toFixed(2)}</p>
              <p className="font-bold">Total: ₹{total.toFixed(2)}</p>
            </div>
            <button
              type="button"
              onClick={generateInvoice}
              disabled={isGenerating}
              className="mt-3 w-full h-12 rounded-xl bg-brand text-white font-semibold disabled:opacity-50"
            >
              {isGenerating ? "Creating Invoice…" : "Generate Invoice →"}
            </button>
          </div>
        ) : null}
      </section>
    </AppFrame>
  );
}
