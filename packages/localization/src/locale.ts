import type { LaunchLocale, LocaleInputs } from './types'

const SIMPLIFIED_REGIONS = new Set(['CN', 'SG', 'MY'])
const TRADITIONAL_REGIONS = new Set(['TW', 'HK', 'MO'])

export const mapLanguageTag = (languageTag?: string | null): LaunchLocale => {
  if (!languageTag) return 'en'

  const parts = languageTag.replace(/_/g, '-').split('-')
  if (parts[0]?.toLowerCase() === 'en') return 'en'
  if (parts[0]?.toLowerCase() !== 'zh') return 'en'

  const subtags = parts.slice(1).map((part) => part.toUpperCase())
  if (subtags.includes('HANT')) return 'zh-Hant'
  if (subtags.includes('HANS')) return 'zh-Hans'
  if (subtags.some((part) => TRADITIONAL_REGIONS.has(part))) return 'zh-Hant'
  if (subtags.some((part) => SIMPLIFIED_REGIONS.has(part))) return 'zh-Hans'
  return 'zh-Hans'
}

const firstSupported = (tags: readonly string[] = []): LaunchLocale => {
  for (const tag of tags) {
    const mapped = mapLanguageTag(tag)
    if (mapped !== 'en' || tag.toLowerCase().startsWith('en')) return mapped
  }
  return 'en'
}

export const resolveLocale = ({
  manual,
  account,
  device
}: LocaleInputs): LaunchLocale => {
  if (manual && manual !== 'system') return manual
  if (account) return mapLanguageTag(account)
  return firstSupported(device ?? [])
}
