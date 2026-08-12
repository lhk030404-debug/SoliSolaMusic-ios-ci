import i18next, { type i18n } from 'i18next'
import ICU from 'i18next-icu'

import en from './locales/en.json'
import zhHans from './locales/zh-Hans.json'
import zhHant from './locales/zh-Hant.json'
import type { LaunchLocale } from './types'

export type LocalizationRuntime = i18n

export const changeRuntimeLocale = async (
  runtime: LocalizationRuntime,
  locale: LaunchLocale,
): Promise<LaunchLocale> => {
  await runtime.changeLanguage(locale)
  return locale
}

export const resources = {
  en: { translation: en },
  'zh-Hans': { translation: zhHans },
  'zh-Hant': { translation: zhHant },
} as const

export const createLocalization = async (
  locale: LaunchLocale,
): Promise<i18n> => {
  const instance = i18next.createInstance()
  await instance.use(ICU).init({
    compatibilityJSON: 'v4',
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh-Hans', 'zh-Hant'],
    nonExplicitSupportedLngs: false,
    load: 'currentOnly',
    lng: locale,
    interpolation: { escapeValue: false },
    resources,
    returnNull: false,
  })
  return instance
}
