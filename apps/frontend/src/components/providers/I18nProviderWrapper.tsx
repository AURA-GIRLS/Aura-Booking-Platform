"use client";

import { I18nProvider } from '@/i18n/context/I18nContext';
import LanguageUpdater from '@/components/generalUI/LanguageUpdater';

interface I18nProviderWrapperProps {
  children: React.ReactNode;
}

export default function I18nProviderWrapper({ children }: I18nProviderWrapperProps) {
  return (
    <I18nProvider>
      <LanguageUpdater />
      {children}
    </I18nProvider>
  );
}