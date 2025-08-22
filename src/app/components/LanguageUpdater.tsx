'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageUpdater() {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language) {
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language]);

  return null; // This component does not render anything
}
