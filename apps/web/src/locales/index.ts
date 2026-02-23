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

export interface Language {
  code: string
  name: string
  flag: string
  available: boolean
}
export const defaultLocale: Locale = 'en'

export const mainLanguages:Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧', available: true },
  { code: 'es', name: 'Español', flag: '🇪🇸', available: true },
  { code: 'ca', name: 'Català', flag: '🏴', available: true },
  { code: 'fr', name: 'Français', flag: '🇫🇷', available: false },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', available: false },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', available: false },
]
