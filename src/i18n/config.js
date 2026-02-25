import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import en from './locales/en.json';

const resources = {
  fr: { translation: fr },
  en: { translation: en }
};

const VALID_LANGUAGES = ['fr', 'en'];

function readSavedLanguage() {
  // Primary: localStorage (fast, synchronous)
  try {
    const stored = localStorage.getItem('language');
    if (VALID_LANGUAGES.includes(stored)) return stored;
  } catch {}

  // Secondary: cookie (survives WebKit storage eviction)
  const match = document.cookie.match(/(?:^|;\s*)language=([^;]+)/);
  if (match && VALID_LANGUAGES.includes(match[1])) return match[1];

  return 'fr';
}

function persistLanguage(lng) {
  try { localStorage.setItem('language', lng); } catch {}
  document.cookie = `language=${lng};max-age=31536000;path=/;SameSite=Lax`;
  document.documentElement.setAttribute('lang', lng);
}

const savedLanguage = readSavedLanguage();
document.documentElement.setAttribute('lang', savedLanguage);

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

i18n.on('languageChanged', persistLanguage);

export default i18n;
