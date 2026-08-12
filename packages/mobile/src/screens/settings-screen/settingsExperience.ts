import type { LocalePreference } from '@solisola/localization'

export const LANGUAGE_OPTIONS = [
  'system',
  'en',
  'zh-Hans',
  'zh-Hant'
] as const satisfies readonly LocalePreference[]

export const OFFLINE_SETTINGS_ROUTES = [
  'LanguageSettingsScreen',
  'LicensesScreen',
  'AboutScreen'
] as const

export const selectSettingsLanguage = (
  setLocalePreference: (preference: LocalePreference) => Promise<void>,
  preference: LocalePreference
) => setLocalePreference(preference)
