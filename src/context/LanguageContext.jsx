"use client";
import { createContext, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { translations } from "../utils/translations";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState("en");

  // Load language from localStorage after mount to prevent hydration mismatch
  useEffect(() => {
    const savedLang = localStorage.getItem("fastbooking_lang");
    if (savedLang === "ar" || savedLang === "en") {
      setLanguageState(savedLang);
    }
  }, []);

  // Function to set language and persist to localStorage
  const setLanguage = useCallback((lang) => {
    if (lang === "en" || lang === "ar") {
      setLanguageState(lang);
      localStorage.setItem("fastbooking_lang", lang);
    }
  }, []);

  // Function to toggle between English and Arabic
  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "ar" : "en");
  }, [language, setLanguage]);

  // Set the lang attribute on HTML element when language changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  // Translation helper function t("login.email_address")
  const t = useCallback((key) => {
    const keys = key.split(".");
    
    // 1. Try to resolve key in selected language
    let value = translations[language];
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        value = null;
        break;
      }
    }

    if (value !== null && value !== undefined) {
      return value;
    }

    // 2. Fallback: Try to resolve key in English
    let fallback = translations["en"];
    for (const k of keys) {
      if (fallback && fallback[k] !== undefined) {
        fallback = fallback[k];
      } else {
        fallback = key; // Return raw key if not found at all
        break;
      }
    }

    return fallback;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    toggleLanguage,
    t
  }), [language, setLanguage, toggleLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
