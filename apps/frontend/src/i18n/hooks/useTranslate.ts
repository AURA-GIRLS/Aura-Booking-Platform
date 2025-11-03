"use client";

import { useState, useEffect } from 'react';
import { useI18n } from '../context/I18nContext';

// Interface cho translations
interface Translations {
  [key: string]: any;
}

// Hook useTranslate để lấy translations
export function useTranslate(namespace: string) {
  const { locale, t } = useI18n();
  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(true);

  // Load translations khi namespace hoặc locale thay đổi
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setLoading(true);
        const result = await t(namespace);
        setTranslations(result);
      } catch (error) {
        console.error(`Error loading translations for namespace ${namespace}:`, error);
        setTranslations({});
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [namespace, locale, t]);

  // Hàm translate với key path
  const translate = (key: string, fallback?: string) => {
    if (loading) return fallback || key;
    
    // Get nested value từ translations object
    const value = getNestedValue(translations, key);
    
    // Nếu không tìm thấy, trả về fallback hoặc key
    if (value === key || value === undefined) {
      return fallback || key;
    }
    
    return value;
  };

  // Helper function để lấy nested value
  const getNestedValue = (obj: Translations, path: string): string => {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return path; // Return path if key not found
      }
    }
    
    return typeof current === 'string' ? current : path;
  };

  return {
    t: translate,
    locale,
    loading,
    translations
  };
}

// Hook để lấy tất cả translations (không cần namespace)
export function useAllTranslations() {
  const { locale, setLocale } = useI18n();
  
  return {
    locale,
    setLocale
  };
}