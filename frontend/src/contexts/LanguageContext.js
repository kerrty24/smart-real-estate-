import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from './translations.json';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];

    for (let k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return value || key;
  };

  const switchLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  const value = {
    language,
    t,
    switchLanguage,
    availableLanguages: Object.keys(translations),
    languages: {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      de: 'Deutsch'
    }
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
