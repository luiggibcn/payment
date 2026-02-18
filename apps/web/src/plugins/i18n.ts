import { createI18n } from 'vue-i18n'
import { messages, defaultLocale, type Locale } from '@/locales'

export const i18n = createI18n({
  legacy: false,
  locale: (localStorage.getItem('locale') as Locale) || defaultLocale,
  fallbackLocale: defaultLocale,
  messages: messages as any,
  globalInjection: true,
  missingWarn: import.meta.env.DEV,
  fallbackWarn: import.meta.env.DEV
})

/**
 * Cambiar idioma de la aplicación
 */
export const setLocale = (locale: Locale) => {
  // ✅ Forma correcta de cambiar el locale en Composition API
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
  document.documentElement.setAttribute('lang', locale)
  
  // 👇 Forzar actualización (por si acaso)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('localechange'))
  }
}

/**
 * Obtener idioma actual
 */
export const getLocale = (): Locale => {
  return i18n.global.locale.value as Locale
}

/**
 * Detectar idioma del navegador
 */
export const detectBrowserLocale = (): Locale => {
  const browserLang = navigator.language.split('-')[0]
  return (browserLang === 'es' ? 'es' : 'en') as Locale
}
