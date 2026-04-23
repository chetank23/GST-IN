import en from "@/i18n/messages/en.json";
import hi from "@/i18n/messages/hi.json";
import ta from "@/i18n/messages/ta.json";

export const dictionaries = {
  en,
  hi,
  ta,
};

export type DictionaryKey = keyof typeof dictionaries;
