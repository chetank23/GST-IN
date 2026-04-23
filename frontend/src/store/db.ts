import Dexie, { type EntityTable } from "dexie";
import { type InvoiceDraft } from "@/lib/types/api";

const db = new Dexie("gstSaarthiDb") as Dexie & {
  invoiceDrafts: EntityTable<InvoiceDraft, "id">;
};

db.version(1).stores({
  invoiceDrafts: "id, updatedAt, status",
});

export { db };
