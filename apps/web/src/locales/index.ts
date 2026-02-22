import en from './en.json'
import es from './es.json'
import ca from './ca.json'

export const messages = {
  en,
  es,
  ca
}

export const availableLocales = ['en','es','ca','fr','de','it'] as const

export type Locale = (typeof availableLocales)[number]

export const defaultLocale: Locale = 'en'
