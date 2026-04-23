"use client";

import { useState } from "react";
import { Mic, Upload } from "lucide-react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

// Web Speech API types (not in TypeScript's default lib)
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionAPI {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionAPI;
}
type WindowWithSpeech = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export function CurrencyInput(props: InputProps) {
  return <input {...props} inputMode="decimal" className="h-12 w-full rounded-xl border border-line bg-white px-3" />;
}

export function QuantityInput(props: InputProps) {
  return <input {...props} inputMode="decimal" className="h-12 w-full rounded-xl border border-line bg-white px-3" />;
}

export function ProductAutocomplete(props: InputProps) {
  return <input {...props} className="h-12 w-full rounded-xl border border-line bg-white px-3" />;
}

export function GSTRateChip({ rate, selected = false }: { rate: number; selected?: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${
        selected ? "border-brand bg-brand text-white" : "border-line bg-white text-ink"
      }`}
    >
      GST {rate}%
    </span>
  );
}

export function VoiceInputButton({
  onResult,
}: {
  onResult?: (parsed: { productName: string; quantity: number; price: number }) => void;
}) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const handleClick = () => {
    const win = window as unknown as WindowWithSpeech;
    const SR = win.SpeechRecognition ?? win.webkitSpeechRecognition;

    if (!SR) {
      alert("Voice input is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    const recognition = new SR();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setTranscript("");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const said = event.results[0][0].transcript.trim().toLowerCase();
      setTranscript(said);

      const parts = said.replace(/[^\w\s.]/g, "").split(/\s+/);
      const numbers = parts
        .map((p: string) => parseFloat(p.replace(/[^0-9.]/g, "")))
        .filter((n: number) => !isNaN(n) && n > 0);
      const firstNumIdx = parts.findIndex((p: string) => /\d/.test(p));
      const productName = (firstNumIdx > 0 ? parts.slice(0, firstNumIdx) : parts.slice(0, 1))
        .join(" ")
        .replace(/[^a-z\s]/g, "")
        .trim();

      const quantity = numbers[0] ?? 1;
      const price = numbers[1] ?? 0;

      if (productName && onResult) {
        onResult({ productName, quantity, price });
      }
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognition.start();
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex h-12 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
          listening
            ? "border-red-400 bg-red-50 text-red-600"
            : "border-line bg-surface text-ink hover:border-brand/40"
        }`}
      >
        <Mic className={`h-4 w-4 ${listening ? "animate-pulse text-red-500" : ""}`} />
        {listening ? "Listening…" : "Voice Input"}
      </button>
      {transcript ? (
        <p className="text-xs text-muted">Heard: &quot;{transcript}&quot;</p>
      ) : null}
    </div>
  );
}

export function ScanUploadCard() {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
      <Upload className="h-6 w-6 text-brand" />
      <span className="mt-2 font-semibold">Upload or Capture Bill</span>
      <span className="mt-1 text-sm text-muted">JPG, PNG or PDF</span>
      <input type="file" className="sr-only" />
    </label>
  );
}

export function WhatsAppCommandCard({ command }: { command: string }) {
  return (
    <div className="rounded-xl bg-[#e4f5ec] p-3 text-sm text-ink">
      <p className="font-semibold">Try:</p>
      <p>{command}</p>
    </div>
  );
}
