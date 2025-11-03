"use client";

import { useEffect } from 'react';
import { useI18n } from '@/i18n/context/I18nContext';

export default function LanguageUpdater() {
  const { locale } = useI18n();

  useEffect(() => {
    // Update HTML lang attribute when locale changes
    if (typeof window !== 'undefined' && window.document) {
      window.document.documentElement.lang = locale;
      
      // Add Vietnamese-specific class if locale is Vietnamese
      if (locale === 'vi') {
        window.document.body.classList.add('vietnamese-text');
      } else {
        window.document.body.classList.remove('vietnamese-text');
      }
    }
  }, [locale]);

  // This component doesn't render anything visible
  return null;
}