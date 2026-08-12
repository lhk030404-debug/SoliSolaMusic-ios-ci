export const launchLocales = ['en', 'zh-Hans', 'zh-Hant'] as const

export type LaunchLocale = (typeof launchLocales)[number]
export type LocalePreference = LaunchLocale | 'system'

export type LocaleInputs = {
  manual?: LocalePreference | null
  account?: string | null
  device?: readonly string[] | null
}
