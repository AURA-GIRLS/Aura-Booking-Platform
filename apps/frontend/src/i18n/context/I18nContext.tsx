"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Định nghĩa các loại ngôn ngữ hỗ trợ
export type Locale = 'en' | 'vi';

// Định nghĩa interface cho context
interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (namespace: string, key?: string) => any;
}

// Tạo context với giá trị mặc định
const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Props cho I18nProvider
interface I18nProviderProps {
  children: ReactNode;
}

// Cache để lưu translations
const translationsCache: Record<Locale, Record<string, any>> = {
  en: {},
  vi: {}
};

// Pre-load tất cả translations
const loadAllTranslations = async (locale: Locale) => {
  if (Object.keys(translationsCache[locale]).length > 0) {
    return translationsCache[locale];
  }

  try {
    // Import statically các file translation đã biết
    const translations: Record<string, any> = {};
    
    // Import các file translation cho locale cụ thể
    try {
      const booking = await import(`@/i18n/messages/${locale}/booking.json`);
      translations.booking = booking.default;
    } catch (e) {
      console.warn(`Failed to load booking translations for ${locale}`);
    }
    
    try {
      const portfolio = await import(`@/i18n/messages/${locale}/portfolio.json`);
      translations.portfolio = portfolio.default;
    } catch (e) {
      console.warn(`Failed to load portfolio translations for ${locale}`);
    }
    
    try {
      const common = await import(`@/i18n/messages/${locale}/common.json`);
      translations.common = common.default;
    } catch (e) {
      console.warn(`Failed to load common translations for ${locale}`);
    }
    
    try {
      const artists = await import(`@/i18n/messages/${locale}/artists.json`);
      translations.artists = artists.default;
    } catch (e) {
      console.warn(`Failed to load artists translations for ${locale}`);
    }
    
    try {
      const auth = await import(`@/i18n/messages/${locale}/auth.json`);
      translations.auth = auth.default;
    } catch (e) {
      console.warn(`Failed to load auth translations for ${locale}`);
    }
    
    try {
      const community = await import(`@/i18n/messages/${locale}/community.json`);
      translations.community = community.default;
    } catch (e) {
      console.warn(`Failed to load community translations for ${locale}`);
    }
    
    try {
      const feedback = await import(`@/i18n/messages/${locale}/feedback.json`);
      translations.feedback = feedback.default;
    } catch (e) {
      console.warn(`Failed to load feedback translations for ${locale}`);
    }
    
    try {
      const generalUI = await import(`@/i18n/messages/${locale}/generalUI.json`);
      translations.generalUI = generalUI.default;
    } catch (e) {
      console.warn(`Failed to load generalUI translations for ${locale}`);
    }
    
    try {
      const profile = await import(`@/i18n/messages/${locale}/profile.json`);
      translations.profile = profile.default;
    } catch (e) {
      console.warn(`Failed to load profile translations for ${locale}`);
    }
    
    try {
      const sections = await import(`@/i18n/messages/${locale}/sections.json`);
      translations.sections = sections.default;
    } catch (e) {
      console.warn(`Failed to load sections translations for ${locale}`);
    }

    translationsCache[locale] = translations;
    return translations;
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);
    return {};
  }
};

// I18nProvider component
export function I18nProvider({ children }: I18nProviderProps) {
  // Lấy ngôn ngữ từ localStorage hoặc default là 'en'
  const [locale, setLocaleState] = useState<Locale>('en');
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Load locale và translations khi component mount
  useEffect(() => {
    const initializeI18n = async () => {
      const savedLocale = localStorage.getItem('locale') as Locale;
      const initialLocale = (savedLocale && (savedLocale === 'en' || savedLocale === 'vi')) ? savedLocale : 'en';
      
      setLocaleState(initialLocale);
      
      // Pre-load translations
      const loadedTranslations = await loadAllTranslations(initialLocale);
      setTranslations(loadedTranslations);
      setLoading(false);
    };

    initializeI18n();
  }, []);

  // Update HTML lang attribute khi locale thay đổi
  useEffect(() => {
    if (typeof window !== 'undefined' && window.document) {
      window.document.documentElement.lang = locale;
    }
  }, [locale]);

  // Hàm thay đổi ngôn ngữ và lưu vào localStorage
  const setLocale = async (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
    }
    
    // Load translations cho locale mới
    const loadedTranslations = await loadAllTranslations(newLocale);
    setTranslations(loadedTranslations);
  };

  // Hàm translate - sync version
  const t = (namespace: string, key?: string) => {
    if (loading) return key || namespace;
    
    const namespaceTranslations = translations[namespace];
    if (!namespaceTranslations) {
      console.warn(`Translation namespace '${namespace}' not found for locale '${locale}'`);
      return key || namespace;
    }
    
    if (key) {
      // Trả về giá trị cụ thể theo key
      return getNestedValue(namespaceTranslations, key);
    }
    
    // Trả về toàn bộ namespace
    return namespaceTranslations;
  };

  // Helper function để lấy nested value từ object
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : path;
    }, obj);
  };

  const value: I18nContextType = {
    locale,
    setLocale,
    t,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook để sử dụng I18nContext
export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}