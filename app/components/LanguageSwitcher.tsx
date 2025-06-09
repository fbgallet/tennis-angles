"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "./LanguageSwitcher.module.css";

interface LanguageSwitcherProps {
  currentLang: "en" | "fr";
}

export default function LanguageSwitcher({
  currentLang,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const switchLocale = (newLocale: string) => {
    // Replace the current locale in the pathname
    const newPath = pathname.replace(/^\/(en|fr)/, `/${newLocale}`);
    router.push(newPath);
    setIsOpen(false);
  };

  const getCurrentLanguageLabel = () => {
    return currentLang === "en" ? "English" : "Français";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.languageSwitcher}>
      <div
        ref={dropdownRef}
        className={`${styles.dropdown} ${isOpen ? styles.open : ""}`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={styles.dropdownButton}
          aria-label="Select language"
          aria-expanded={isOpen}
        >
          <span>🌐</span>
          <span>{getCurrentLanguageLabel()}</span>
          <span className={styles.dropdownArrow}>▼</span>
        </button>

        <div className={styles.dropdownMenu}>
          <button
            onClick={() => switchLocale("en")}
            className={`${styles.languageOption} ${
              currentLang === "en" ? styles.active : ""
            }`}
            aria-label="Switch to English"
          >
            English
          </button>
          <button
            onClick={() => switchLocale("fr")}
            className={`${styles.languageOption} ${
              currentLang === "fr" ? styles.active : ""
            }`}
            aria-label="Passer au français"
          >
            Français
          </button>
        </div>
      </div>
    </div>
  );
}
