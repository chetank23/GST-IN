"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { AppFrame } from "@/components/ui/AppFrame";
import { SectionHeader } from "@/components/ui/Cards";
import { ocrApi } from "@/lib/api";
import { type OcrField, type OcrJob } from "@/lib/types/api";

type Classification = "purchase" | "expense" | "inventory";

export default function ScanPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [job, setJob] = useState<OcrJob | null>(null);
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});
  const [classification, setClassification] = useState<Classification>("purchase");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError("");
    setFeedback("");
    setJob(null);

    try {
      // Try real multipart upload first; backend falls back to fileName JSON
      const result = await ocrApi.upload(file);
      // Poll once to get full job with extracted fields
      const fullJob = await ocrApi.getJob(result.jobId);
      setJob(fullJob);
      setFeedback(`File uploaded: ${file.name}. Review extracted fields below.`);
    } catch {
      // Backend might only accept JSON body (no multer). Fall back to fileName approach.
      try {
        const result2 = await ocrApi.uploadByName(file.name, crypto.randomUUID());
        const fullJob2 = await ocrApi.getJob(result2.jobId);
        setJob(fullJob2);
        setFeedback(`File accepted: ${file.name}. Review extracted fields below.`);
      } catch (err2) {
        setError((err2 as Error).message ?? "Upload failed. Please try again.");
      }
    } finally {
      setIsUploading(false);
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFieldEdit = (key: string, value: string) => {
    setEditedFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirm = async () => {
    if (!job) return;
    setFeedback("");
    setError("");

    const correctedFields = Object.entries(editedFields)
      .filter(([key, value]) => {
        const original = job.fields.find((f) => f.key === key);
        return original && original.value !== value;
      })
      .map(([key, value]) => ({ key, value }));

    try {
      await ocrApi.confirmJob(job.id, classification, correctedFields.length > 0 ? correctedFields : undefined);
      setFeedback(`✓ Saved as ${classification}. OCR job confirmed.`);
      setJob(null);
      setEditedFields({});
    } catch (err) {
      setError((err as Error).message ?? "Confirmation failed.");
    }
  };

  const handleReject = async () => {
    if (!job) return;
    setError("");
    try {
      await ocrApi.rejectJob(job.id);
      setFeedback("OCR job rejected. You can upload a different file.");
      setJob(null);
      setEditedFields({});
    } catch (err) {
      setError((err as Error).message ?? "Rejection failed.");
    }
  };

  const getFieldValue = (field: OcrField) => editedFields[field.key] ?? field.value;
  const isLowConfidence = (field: OcrField) => field.confidence < 0.8;

  return (
    <AppFrame>
      <section className="space-y-4">
        {/* Upload card */}
        <div className="rounded-2xl border border-line bg-surface p-4">
          <SectionHeader title="Scan Bill" />
          <p className="mt-1 text-sm text-muted">Upload, review, then save as purchase or expense.</p>
          {feedback ? (
            <p className="mt-2 rounded-lg bg-[#ebf7f2] px-3 py-2 text-xs text-brand-strong">{feedback}</p>
          ) : null}
          {error ? (
            <p className="mt-2 rounded-lg bg-[#fde8e8] px-3 py-2 text-xs text-danger">{error}</p>
          ) : null}
          <div className="mt-4">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface p-10 text-center hover:border-brand/50 hover:bg-[#f4fbf8] transition">
              <Upload className={`h-6 w-6 ${isUploading ? "text-muted animate-pulse" : "text-brand"}`} />
              <span className="mt-2 font-semibold">
                {isUploading ? "Uploading…" : "Upload or Capture Bill"}
              </span>
              <span className="mt-1 text-sm text-muted">JPG, PNG or PDF</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="sr-only"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>

        {/* OCR Review card — shown only when a job exists */}
        {job ? (
          <div className="rounded-2xl border border-line bg-surface p-4">
            <h3 className="font-semibold">OCR Review</h3>
            <p className="text-sm text-muted">
              Uncertain fields are highlighted in red. Edit and confirm below.
            </p>

            <ul className="mt-3 space-y-2 text-sm">
              {job.fields.map((field) => {
                const low = isLowConfidence(field);
                return (
                  <li
                    key={field.key}
                    className={`rounded-lg border p-2 ${
                      low ? "border-[#f8caca] bg-[#fff0f0]" : "border-line bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="shrink-0 font-medium capitalize text-muted">{field.key}:</span>
                      <input
                        value={getFieldValue(field)}
                        onChange={(e) => handleFieldEdit(field.key, e.target.value)}
                        className="min-w-0 flex-1 rounded border border-line bg-white px-2 py-1 text-right text-sm"
                      />
                    </div>
                    <p className={`mt-1 text-xs ${low ? "text-danger" : "text-ok"}`}>
                      Confidence: {Math.round(field.confidence * 100)}%{low ? " — Needs review" : ""}
                    </p>
                  </li>
                );
              })}
            </ul>

            {/* Classification selector */}
            <div className="mt-4">
              <p className="text-sm font-semibold">Save as:</p>
              <div className="mt-2 flex gap-2">
                {(["purchase", "expense", "inventory"] as Classification[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setClassification(c)}
                    className={`h-9 rounded-lg px-3 text-sm font-semibold capitalize ${
                      classification === c
                        ? "bg-brand text-white"
                        : "border border-line bg-white"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleReject}
                className="h-11 rounded-xl border border-line bg-white px-4 font-semibold"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="h-11 rounded-xl bg-brand px-4 font-semibold text-white"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </AppFrame>
  );
}

