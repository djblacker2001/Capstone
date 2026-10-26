import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import vi from './locales/vi.json';
import en from './locales/en.json';

const LANGUAGE_KEY = 'user_language';

const resources = {
  vi: { translation: vi },
  en: { translation: en },
};

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  
  if (!savedLanguage) {
    const deviceLanguage = Localization.getLocales()[0]?.languageCode;
    savedLanguage = deviceLanguage === 'vi' ? 'vi' : 'en';
  }

  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    resources,
    lng: savedLanguage,
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false,
    },
  });
};

initI18n();

export const changeAppLanguage = async (lang: 'vi' | 'en') => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  await i18n.changeLanguage(lang);
};

export default i18n;