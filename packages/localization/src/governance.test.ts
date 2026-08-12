import en from './locales/en.json'
import zhHans from './locales/zh-Hans.json'
import zhHant from './locales/zh-Hant.json'
import { createLocalization } from './runtime'
import {
  flattenLocale,
  validateLocaleResources,
  type LocaleResourceMap,
} from './governance'

const resources: LocaleResourceMap = { en, 'zh-Hans': zhHans, 'zh-Hant': zhHant }

describe('locale governance', () => {
  test('uses recursive leaf keys and has 100% launch-locale parity', () => {
    const keys = [...flattenLocale(en).keys()]
    expect(keys).toContain('navigation.tabs.discover')
    expect(keys).toContain('settings.languageDescription')
    expect(keys).toContain('licenses.offlineNotice')
    expect(validateLocaleResources(resources)).toEqual([])
  })

  test('rejects missing, extra, empty, and non-string leaves', () => {
    expect(
      validateLocaleResources({
        en: { screen: { title: 'Title', count: 1 } },
        'zh-Hans': { screen: { title: '' } },
        'zh-Hant': { screen: { title: '標題', extra: '額外' } },
      } as unknown as LocaleResourceMap),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ locale: 'en', code: 'non_string_value' }),
        expect.objectContaining({ locale: 'zh-Hans', code: 'empty_value' }),
        expect.objectContaining({ locale: 'zh-Hans', code: 'missing_key' }),
        expect.objectContaining({ locale: 'zh-Hant', code: 'extra_key' }),
      ]),
    )
  })

  test('rejects ICU interpolation and plural-shape drift', () => {
    const issues = validateLocaleResources({
      en: {
        greeting: 'Hello, {name}',
        plays: '{count, plural, one {# play} other {# plays}}',
      },
      'zh-Hans': {
        greeting: '你好，{username}',
        plays: '{count, plural, other {播放 # 次}}',
      },
      'zh-Hant': {
        greeting: '你好，{name}',
        plays: '{count, plural, one {播放 # 次} other {播放 # 次}}',
      },
    })

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          locale: 'zh-Hans',
          key: 'greeting',
          code: 'icu_variable_mismatch',
        }),
        expect.objectContaining({
          locale: 'zh-Hans',
          key: 'plays',
          code: 'icu_plural_mismatch',
        }),
      ]),
    )
  })

  test('rejects invalid ICU syntax', () => {
    const issues = validateLocaleResources({
      en: { broken: '{count, plural, one {item}' },
      'zh-Hans': { broken: '项目' },
      'zh-Hant': { broken: '項目' },
    })
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ locale: 'en', code: 'invalid_icu' }),
      ]),
    )
  })

  test('invalid runtime locale falls back to English', async () => {
    const runtime = await createLocalization('not-a-locale' as never)
    expect(runtime.language).toBe('en')
    expect(runtime.t('common.languageName')).toBe('English')
  })
})
