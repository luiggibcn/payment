import { createI18n } from 'vue-i18n'
import { messages, defaultLocale, type Locale } from '@/locales'

// ✅ Guardar safe access a localStorage
const getSavedLocale = (): Locale => {
  try {
    return (localStorage.getItem('locale') as Locale) || defaultLocale
  } catch {
    return defaultLocale
  }
}

export const i18n = createI18n({
  legacy: false,
  locale: getSavedLocale(),
  fallbackLocale: defaultLocale,
  messages: messages as any,
  globalInjection: true,
  missingWarn: import.meta.env.DEV,
  fallbackWarn: import.meta.env.DEV
})

export const setLocale = (locale: Locale) => {
  i18n.global.locale.value = locale
  try {
    localStorage.setItem('locale', locale)
  } catch {}
  document.documentElement.setAttribute('lang', locale)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('localechange'))
  }
}

export const getLocale = (): Locale => {
  return i18n.global.locale.value as Locale
}

export const detectBrowserLocale = (): Locale => {
  const browserLang = navigator.language.split('-')[0]
  return (browserLang === 'ca' ? 'ca' : browserLang === 'ca' ? 'ca' : 'en') as Locale
}
