import { parse } from '@formatjs/icu-messageformat-parser'

import type { LaunchLocale } from './types'

type LocaleTree = { readonly [key: string]: string | LocaleTree }

export type LocaleResourceMap = Record<LaunchLocale, LocaleTree>

export type LocaleGovernanceIssue = {
  locale: LaunchLocale
  key: string
  code:
    | 'missing_key'
    | 'extra_key'
    | 'empty_value'
    | 'non_string_value'
    | 'invalid_icu'
    | 'icu_variable_mismatch'
    | 'icu_plural_mismatch'
  detail: string
}

type IcuSignature = {
  variables: string[]
  plurals: Record<string, string[]>
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

export const flattenLocale = (
  locale: unknown,
  prefix = ''
): Map<string, unknown> => {
  const result = new Map<string, unknown>()

  if (!isRecord(locale)) {
    if (prefix) result.set(prefix, locale)
    return result
  }

  for (const key of Object.keys(locale).sort()) {
    const path = prefix ? `${prefix}.${key}` : key
    const value = locale[key]
    if (isRecord(value)) {
      const nested = flattenLocale(value, path)
      for (const [nestedKey, nestedValue] of nested) {
        result.set(nestedKey, nestedValue)
      }
    } else {
      result.set(path, value)
    }
  }

  return result
}

const readIcuSignature = (message: string): IcuSignature => {
  const variables = new Set<string>()
  const plurals = new Map<string, Set<string>>()
  const elements = parse(message, { captureLocation: false }) as unknown[]

  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit)
      return
    }
    if (!isRecord(value)) return

    const type = value.type
    const argument = value.value
    if (
      typeof argument === 'string' &&
      typeof type === 'number' &&
      [1, 2, 3, 4, 5, 6].includes(type)
    ) {
      variables.add(argument)
    }
    if (type === 6 && typeof argument === 'string' && isRecord(value.options)) {
      plurals.set(argument, new Set(Object.keys(value.options).sort()))
    }

    for (const [key, child] of Object.entries(value)) {
      if (key !== 'location') visit(child)
    }
  }

  visit(elements)
  return {
    variables: [...variables].sort(),
    plurals: Object.fromEntries(
      [...plurals.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, selectors]) => [key, [...selectors].sort()])
    )
  }
}

const sameStringArray = (left: string[], right: string[]) =>
  left.length === right.length &&
  left.every((value, index) => value === right[index])

const samePluralShape = (
  left: Record<string, string[]>,
  right: Record<string, string[]>
) => {
  const leftKeys = Object.keys(left).sort()
  const rightKeys = Object.keys(right).sort()
  return (
    sameStringArray(leftKeys, rightKeys) &&
    leftKeys.every((key) => sameStringArray(left[key] ?? [], right[key] ?? []))
  )
}

export const validateLocaleResources = (
  resources: LocaleResourceMap
): LocaleGovernanceIssue[] => {
  const locales: LaunchLocale[] = ['en', 'zh-Hans', 'zh-Hant']
  const flattened = Object.fromEntries(
    locales.map((locale) => [locale, flattenLocale(resources[locale])])
  ) as Record<LaunchLocale, Map<string, unknown>>
  const canonicalKeys = [...flattened.en.keys()].sort()
  const canonicalKeySet = new Set(canonicalKeys)
  const issues: LocaleGovernanceIssue[] = []
  const signatures = new Map<string, IcuSignature>()

  for (const locale of locales) {
    const entries = flattened[locale]
    for (const key of canonicalKeys) {
      if (!entries.has(key)) {
        issues.push({
          locale,
          key,
          code: 'missing_key',
          detail: `missing key present in en: ${key}`
        })
      }
    }
    for (const key of [...entries.keys()].sort()) {
      if (locale !== 'en' && !canonicalKeySet.has(key)) {
        issues.push({
          locale,
          key,
          code: 'extra_key',
          detail: `key is not present in en: ${key}`
        })
      }

      const value = entries.get(key)
      if (typeof value !== 'string') {
        issues.push({
          locale,
          key,
          code: 'non_string_value',
          detail: `leaf value must be a string, received ${typeof value}`
        })
        continue
      }
      if (value.trim() === '') {
        issues.push({
          locale,
          key,
          code: 'empty_value',
          detail: 'translation must not be empty or whitespace'
        })
        continue
      }

      try {
        signatures.set(`${locale}:${key}`, readIcuSignature(value))
      } catch (error) {
        issues.push({
          locale,
          key,
          code: 'invalid_icu',
          detail: error instanceof Error ? error.message : String(error)
        })
      }
    }
  }

  for (const key of canonicalKeys) {
    const canonical = signatures.get(`en:${key}`)
    if (!canonical) continue
    for (const locale of locales.slice(1)) {
      const candidate = signatures.get(`${locale}:${key}`)
      if (!candidate) continue
      if (!sameStringArray(canonical.variables, candidate.variables)) {
        issues.push({
          locale,
          key,
          code: 'icu_variable_mismatch',
          detail: `expected [${canonical.variables.join(', ')}], received [${candidate.variables.join(', ')}]`
        })
      }
      if (!samePluralShape(canonical.plurals, candidate.plurals)) {
        issues.push({
          locale,
          key,
          code: 'icu_plural_mismatch',
          detail: `expected ${JSON.stringify(canonical.plurals)}, received ${JSON.stringify(candidate.plurals)}`
        })
      }
    }
  }

  return issues.sort((left, right) =>
    `${left.locale}:${left.key}:${left.code}`.localeCompare(
      `${right.locale}:${right.key}:${right.code}`
    )
  )
}
