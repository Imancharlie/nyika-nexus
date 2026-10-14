import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { landingT, type LandingKey } from "./landing";
import { strings, type StringKey } from "./strings";

export type Lang = "sw" | "en";

const STORAGE_KEY = "agrimika-lang";

type LanguageValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: StringKey) => string;
  lt: (key: LandingKey) => string;
};

const LanguageContext = createContext<LanguageValue | null>(null);

const initialLang = (): Lang => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "sw" || saved === "en") return saved;
  } catch {
    /* storage unavailable */
  }
  return "sw";
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      setLang,
      t: (key) => strings[lang][key] ?? strings.sw[key] ?? key,
      lt: (key) => landingT[lang][key] ?? landingT.sw[key] ?? key,
    }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
};
