import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import mr from '../locales/mr.json';

const translations = { en, hi, mr };

const languageOptions = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '�🇧', greeting: 'Hello' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳', greeting: 'नमस्ते' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', flag: '🇮🇳', greeting: 'नमस्कार' },
];

const normalizeLanguage = (value) => {
  if (!value) return languageOptions[0];
  const normalized = `${value}`.trim().toLowerCase();
  const match = languageOptions.find((option) => [option.code, option.label.toLowerCase(), option.nativeLabel.toLowerCase()].includes(normalized));
  return match || languageOptions[0];
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    if (typeof window === 'undefined') return languageOptions[0].code;
    return normalizeLanguage(window.localStorage.getItem('selected_language')).code;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedValue = window.localStorage.getItem('selected_language');
    const current = normalizeLanguage(storedValue);
    if (current.code !== language) {
      setLanguageState(current.code);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentOption = languageOptions.find((option) => option.code === language) || languageOptions[0];
    window.localStorage.setItem('selected_language', currentOption.code);
    document.documentElement.lang = currentOption.code;
  }, [language]);

  const setLanguage = (value) => {
    const next = normalizeLanguage(value);
    setLanguageState(next.code);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('selected_language', next.code);
    }
  };

  const t = (key, fallback = '') => {
    const values = translations[language] || translations.en;
    const fallbackValues = translations.en;
    const segments = key.split('.');
    let result = values;
    let fallbackResult = fallbackValues;

    for (const segment of segments) {
      result = result?.[segment];
      fallbackResult = fallbackResult?.[segment];
      if (result === undefined && fallbackResult === undefined) {
        return fallback;
      }
    }

    return result ?? fallbackResult ?? fallback;
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    languageOptions,
    currentLanguage: languageOptions.find((option) => option.code === language) || languageOptions[0],
  }), [language, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
