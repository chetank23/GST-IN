"use client";

import { useEffect, useState } from "react";
import { AppFrame } from "@/components/ui/AppFrame";
import { analyticsApi, catalogApi } from "@/lib/api";

type InventoryItem = { id: string; name: string; stock: number; status: string };

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restocking, setRestocking] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    analyticsApi
      .inventoryReport()
      .then(setInventory)
      .catch(() => setInventory([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRestock = async (item: InventoryItem) => {
    setRestocking(item.id);
    setFeedback("");
    try {
      await catalogApi.updateProduct(item.id, { addStock: 10 });
      setInventory((prev) =>
        prev.map((p) =>
          p.id === item.id
            ? { ...p, stock: p.stock + 10, status: p.stock + 10 > 10 ? "Healthy" : "Low stock" }
            : p,
        ),
      );
      setFeedback(`Added 10 units to ${item.name}.`);
    } catch (err) {
      setFeedback((err as Error).message ?? "Restock failed.");
    } finally {
      setRestocking(null);
    }
  };

  return (
    <AppFrame>
      <section className="rounded-2xl border border-line bg-surface p-4">
        <h1 className="font-display text-xl font-bold">Inventory</h1>
        {feedback ? (
          <p className="mt-2 rounded-lg bg-[#ebf7f2] px-3 py-2 text-xs text-brand-strong">{feedback}</p>
        ) : null}
        {loading ? (
          <div className="mt-3 space-y-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 animate-pulse rounded-xl bg-line" />
            ))}
          </div>
        ) : inventory.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No inventory data.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {inventory.map((item) => (
              <li key={item.id} className="rounded-xl border border-line bg-white p-3">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-muted">Stock on hand: {item.stock}</p>
                <p className={`text-xs ${item.status === "Low stock" ? "text-danger" : "text-ok"}`}>
                  {item.status}
                </p>
                <button
                  type="button"
                  onClick={() => handleRestock(item)}
                  disabled={restocking === item.id}
                  className="mt-2 h-9 rounded-lg border border-line px-3 text-sm font-semibold disabled:opacity-50"
                >
                  {restocking === item.id ? "Restocking…" : "Restock (+10)"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppFrame>
  );
}

