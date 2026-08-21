'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { en, hi } from '../lib/translations';

type LanguageContextType = {
  locale: 'en' | 'hi';
  setLocale: (loc: 'en' | 'hi') => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocale] = useState<'en' | 'hi'>('en');

  useEffect(() => {
    const stored = localStorage.getItem('shramsetu_locale');
    if (stored === 'hi' || stored === 'en') {
      setLocale(stored);
    }
  }, []);

  const changeLocale = (loc: 'en' | 'hi') => {
    setLocale(loc);
    localStorage.setItem('shramsetu_locale', loc);
  };

  const t = (key: string): string => {
    const dictionary = locale === 'hi' ? hi : en;
    const keys = key.split('.');
    let value: any = dictionary;
    
    for (const k of keys) {
      if (value[k] === undefined) {
        // Fallback to English if key missing in Hindi
        let fallbackValue: any = en;
        for (const fb of keys) {
          if (fallbackValue[fb] === undefined) return key;
          fallbackValue = fallbackValue[fb];
        }
        return fallbackValue as string;
      }
      value = value[k];
    }
    
    return value as string;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale: changeLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
