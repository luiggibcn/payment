import en from './en.json'
import es from './es.json'

export const messages = {
  en,
  es
}

export const availableLocales = ['en', 'es'] as const

export type Locale = (typeof availableLocales)[number]

export const defaultLocale: Locale = 'en'
