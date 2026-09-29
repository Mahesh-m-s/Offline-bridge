import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import kn from './locales/kn.json';

i18n.use(initReactI18next).init({ resources: { en: { translation: en }, kn: { translation: kn } },
  lng: localStorage.getItem('offlinebridge_language') || 'en', fallbackLng: 'en', interpolation: { escapeValue: false } });
i18n.on('languageChanged', (language) => localStorage.setItem('offlinebridge_language', language));
export default i18n;
