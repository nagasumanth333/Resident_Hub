import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '@/locales/en'
import es from '@/locales/es'
import fr from '@/locales/fr'
import hi from '@/locales/hi'
import ja from '@/locales/ja'

const LANG_KEY = 'rh_lang'

i18next.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    hi: { translation: hi },
    ja: { translation: ja },
  },
  lng: localStorage.getItem(LANG_KEY) ?? 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

// Persist language choice across sessions
i18next.on('languageChanged', (lng) => {
  localStorage.setItem(LANG_KEY, lng)
})

export default i18next
