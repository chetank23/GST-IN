import { AppFrame } from "@/components/ui/AppFrame";

const settingsItems = [
  "Business profile",
  "Language",
  "Voice settings",
  "Offline sync",
  "Backup",
  "Notifications",
  "WhatsApp integration",
  "Printer settings",
  "Tax preferences",
  "User roles",
];

export default function SettingsPage() {
  return (
    <AppFrame>
      <section className="rounded-2xl border border-line bg-surface p-4">
        <h1 className="font-display text-xl font-bold">Settings</h1>
        <ul className="mt-3 space-y-2">
          {settingsItems.map((item) => (
            <li key={item} className="rounded-xl border border-line bg-white p-3 text-sm font-semibold">
              {item}
            </li>
          ))}
        </ul>
      </section>
    </AppFrame>
  );
}
