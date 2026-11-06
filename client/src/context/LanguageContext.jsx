import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext({
  isKannada: false,
  toggleLanguage: () => {},
  t: (en, kn) => en
});

const STORAGE_KEY = 'arivunet_preferred_lang';

export function LanguageProvider({ children }) {
  const [isKannada, setIsKannada] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(STORAGE_KEY) === 'kn';
      }
    } catch {
      // Fallback
    }
    return false;
  });

  const toggleLanguage = () => {
    setIsKannada((prev) => {
      const next = !prev;
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY, next ? 'kn' : 'en');
        }
      } catch {
        // Fallback
      }
      return next;
    });
  };

  /**
   * Helper function to return English or Kannada string based on active language
   */
  const t = (enText, knText) => {
    return isKannada && knText ? knText : enText;
  };

  return (
    <LanguageContext.Provider value={{ isKannada, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
