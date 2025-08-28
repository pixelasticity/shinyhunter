'use client';

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import styles from './language.module.css';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  // Set the initial language from i18next's detected or default language
  const [language, setLanguage] = useState(i18n.language);

  const languageNames: Record<string, string> = {
    en: "English",
    ja: "日本語",
    fr: "Français",
    es: "Español"
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
    i18n.changeLanguage(selectedLanguage); // Update language in i18next
    document.documentElement.lang = i18n.language;
  };

  // Ensure supportedLngs is treated as an array of strings
  const supportedLngs = (i18n.options.supportedLngs || []).filter(
    (lang): lang is string => typeof lang === 'string' && lang !== 'cimode'
  );

  return (
    <div className={styles.switcher}>
      <label htmlFor="language" className="visually-hidden">{t('lang.change')}</label>
      <select
        id="language"
        name="switcher"
        value={i18n.language}
        onChange={handleLanguageChange}
        className={styles.button}
      >
      {supportedLngs.map((code, key) => (
        <option
          key={key}
          value={code}
        >
          {languageNames[code] || code}
        </option>
      ))}
      </select>
    </div>
  );
}
