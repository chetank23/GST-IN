"use client";

import { useAppStore } from "@/store/useAppStore";

const languageLabels: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
};

export function LanguageToggle() {
  const language = useAppStore((state) => state.languageSettings.language);
  const setLanguage = useAppStore((state) => state.setLanguage);

  return (
    <select
      className="h-10 rounded-lg border border-line bg-white px-2 text-sm"
      value={language}
      onChange={(event) => setLanguage(event.target.value as "en" | "hi" | "ta")}
      aria-label="Language"
    >
      {Object.entries(languageLabels).map(([value, label]) => (
        <option value={value} key={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
