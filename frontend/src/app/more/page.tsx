import Link from "next/link";
import { AppFrame } from "@/components/ui/AppFrame";

const links = [
  { href: "/customers", label: "Customers / Udhaar" },
  { href: "/inventory", label: "Inventory" },
  { href: "/settings", label: "Settings" },
  { href: "/invoice-preview", label: "Invoice Preview" },
  { href: "/onboarding", label: "Business Setup" },
  { href: "/whatsapp", label: "WhatsApp Assist" },
];

export default function MorePage() {
  return (
    <AppFrame>
      <section className="rounded-2xl border border-line bg-surface p-4">
        <h1 className="font-display text-xl font-bold">More</h1>
        <div className="mt-3 space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-xl border border-line bg-white px-4 py-3 font-semibold"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </AppFrame>
  );
}
