"use client";

import { usePathname } from "next/navigation";
import { translations, Language } from "../constants/translations";

export function useLanguage() {
  const pathname = usePathname();

  // Determine language from pathname
  const language: Language = pathname.startsWith("/fr") ? "fr" : "en";

  // Get translation function
  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || translations.en[key];
  };

  return { language, t };
}
