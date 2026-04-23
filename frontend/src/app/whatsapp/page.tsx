"use client";

import { useState } from "react";
import { AppFrame } from "@/components/ui/AppFrame";
import { WhatsAppCommandCard } from "@/components/ui/Inputs";
import { apiPost } from "@/lib/api/client";
import { type ApiSuccess } from "@/lib/types/api";
import { useAppStore } from "@/store/useAppStore";

const commands = [
  "Rice 2kg 100",
  "Add expense 500 electricity",
  "Show today sales",
  "GST report",
  "Send bill to Ramesh",
];

export default function WhatsAppPage() {
  const businessProfile = useAppStore((state) => state.businessProfile);
  const connectedNumber = businessProfile.whatsappNumber || "+91 73378 34158";
  const [lastCommand, setLastCommand] = useState("");
  const [parseResult, setParseResult] = useState<Record<string, unknown> | null>(null);
  const [sendStatus, setSendStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleTryCommand = async (command: string) => {
    setLastCommand(command);
    setParseResult(null);
    try {
      const result = await apiPost<ApiSuccess<Record<string, unknown>>, { text: string }>(
        "/whatsapp/parse",
        { text: command },
      );
      setParseResult(result.data);
    } catch {
      setParseResult({ error: "Could not parse command" });
    }
  };

  const handleSend = async () => {
    if (!lastCommand) return;
    setIsSending(true);
    setSendStatus("");
    try {
      await apiPost("/whatsapp/send", { to: connectedNumber.replace(/\s/g, ""), message: lastCommand });
      setSendStatus("Message queued for delivery ✓");
    } catch (err) {
      setSendStatus((err as Error).message ?? "Send failed.");
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = () => {
    if (!lastCommand) return;
    navigator.clipboard.writeText(lastCommand).catch(() => undefined);
    setSendStatus("Copied to clipboard!");
  };

  return (
    <AppFrame>
      <section className="space-y-4">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <h1 className="font-display text-xl font-bold">WhatsApp Assist</h1>
          <p className="mt-1 text-sm text-muted">Tap a command to parse it, then send or copy.</p>
          <div className="mt-3 rounded-2xl bg-white p-3">
            <p className="text-xs text-muted">Connected number</p>
            <p className="font-semibold">{connectedNumber}</p>
          </div>
        </div>

        <div className="grid gap-2">
          {commands.map((command) => (
            <button
              key={command}
              type="button"
              onClick={() => handleTryCommand(command)}
              className="text-left"
            >
              <WhatsAppCommandCard command={command} />
            </button>
          ))}
        </div>

        {parseResult ? (
          <div className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-semibold">Parsed: <span className="text-brand">{lastCommand}</span></p>
            <pre className="mt-2 overflow-auto rounded-xl bg-white p-3 text-xs text-muted">
              {JSON.stringify(parseResult, null, 2)}
            </pre>
          </div>
        ) : null}

        <div className="rounded-2xl border border-line bg-surface p-4">
          <p className="font-semibold">Delivery status</p>
          <p className="text-sm text-muted">
            {sendStatus || (lastCommand ? `Ready to send: "${lastCommand}"` : "Select a command above.")}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!lastCommand}
              className="h-11 rounded-xl border border-line bg-white px-4 font-semibold disabled:opacity-50"
            >
              Copy Message
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={isSending || !lastCommand}
              className="h-11 rounded-xl bg-brand px-4 font-semibold text-white disabled:opacity-50"
            >
              {isSending ? "Sending…" : "Send via WhatsApp"}
            </button>
          </div>
        </div>
      </section>
    </AppFrame>
  );
}

