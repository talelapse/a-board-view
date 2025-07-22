import { useState, useEffect, ReactNode } from 'react';
import { I18nContext, Language, getLanguage, setLanguage as setLangStorage, translations } from '@/lib/i18n';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => getLanguage());

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setLangStorage(lang);
    // Force re-render of components using the t() function
    window.dispatchEvent(new CustomEvent('languageChanged'));
  };

  useEffect(() => {
    // Initialize language from localStorage on mount
    const storedLang = getLanguage();
    if (storedLang !== language) {
      setLanguageState(storedLang);
    }
  }, []);

  const contextValue = {
    language,
    setLanguage,
    t: (key: string) => {
      const keys = key.split('.');
      let value: any = translations[language];
      
      for (const k of keys) {
        value = value?.[k];
      }
      
      return value || key;
    }
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}