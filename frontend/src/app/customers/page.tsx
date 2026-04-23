"use client";

import { useEffect, useState } from "react";
import { AppFrame } from "@/components/ui/AppFrame";
import { catalogApi, remindersApi } from "@/lib/api";
import { type CustomerRecord } from "@/lib/types/api";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    catalogApi
      .listCustomers()
      .then(setCustomers)
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSendReminder = async (customer: CustomerRecord) => {
    setSending(customer.id);
    setFeedback("");
    try {
      const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      await remindersApi.create(
        customer.id,
        `Dear ${customer.name}, your pending due of Rs ${customer.pendingDue} is due. Please pay.`,
        dueDate,
      );
      setFeedback(`Reminder sent to ${customer.name}!`);
    } catch (err) {
      setFeedback((err as Error).message ?? "Failed to send reminder.");
    } finally {
      setSending(null);
    }
  };

  return (
    <AppFrame>
      <section className="rounded-2xl border border-line bg-surface p-4">
        <h1 className="font-display text-xl font-bold">Customers / Credit</h1>
        {feedback ? (
          <p className="mt-2 rounded-lg bg-[#ebf7f2] px-3 py-2 text-xs text-brand-strong">{feedback}</p>
        ) : null}
        {loading ? (
          <div className="mt-3 space-y-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 animate-pulse rounded-xl bg-line" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No customers yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {customers.map((customer) => (
              <li key={customer.id} className="rounded-xl border border-line bg-white p-3">
                <p className="font-semibold">{customer.name}</p>
                <p className="text-sm text-muted">
                  Pending: Rs {customer.pendingDue.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted">
                  Last purchase: {new Date(customer.lastPurchaseDate).toLocaleDateString("en-IN")}
                </p>
                {customer.pendingDue > 0 ? (
                  <button
                    type="button"
                    onClick={() => handleSendReminder(customer)}
                    disabled={sending === customer.id}
                    className="mt-2 h-9 rounded-lg border border-line px-3 text-sm font-semibold disabled:opacity-50"
                  >
                    {sending === customer.id ? "Sending…" : "Send reminder"}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppFrame>
  );
}

