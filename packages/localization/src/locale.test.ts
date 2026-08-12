import { mapLanguageTag, resolveLocale } from './locale'
import { changeRuntimeLocale, createLocalization } from './runtime'

describe('locale mapping', () => {
  test.each([
    ['zh', 'zh-Hans'],
    ['zh-CN', 'zh-Hans'],
    ['zh-SG', 'zh-Hans'],
    ['zh-MY', 'zh-Hans'],
    ['zh-Hans-US', 'zh-Hans'],
    ['zh-TW', 'zh-Hant'],
    ['zh-HK', 'zh-Hant'],
    ['zh-MO', 'zh-Hant'],
    ['zh-Hant-CN', 'zh-Hant'],
    ['en-US', 'en'],
    ['fr-FR', 'en'],
    ['', 'en'],
  ] as const)('%s maps to %s', (tag, expected) => {
    expect(mapLanguageTag(tag)).toBe(expected)
  })
})

describe('locale priority', () => {
  it('uses manual, then account, then device, then English', () => {
    expect(
      resolveLocale({ manual: 'zh-Hant', account: 'zh-Hans', device: ['en'] }),
    ).toBe('zh-Hant')
    expect(resolveLocale({ account: 'zh-Hant', device: ['zh-CN'] })).toBe(
      'zh-Hant',
    )
    expect(resolveLocale({ device: ['fr-FR', 'zh-TW'] })).toBe('zh-Hant')
    expect(resolveLocale({ device: [] })).toBe('en')
  })

  it('treats system as no manual override', () => {
    expect(
      resolveLocale({
        manual: 'system',
        account: 'zh-Hant',
        device: ['zh-CN'],
      }),
    ).toBe('zh-Hant')
  })
})

describe('runtime', () => {
  it('falls back to English and switches without restarting', async () => {
    const i18n = await createLocalization('unsupported' as never)
    expect(i18n.t('common.languageName')).toBe('English')
    await i18n.changeLanguage('zh-Hans')
    expect(i18n.t('common.languageName')).toBe('简体中文')
    expect(i18n.t('test.englishFallbackOnly')).toBe('英文回退测试')
  })

  it('updates when the same system preference resolves to a new device locale', async () => {
    const i18n = await createLocalization('en')
    const first = resolveLocale({ manual: 'system', device: ['zh-CN'] })
    expect(await changeRuntimeLocale(i18n, first)).toBe('zh-Hans')
    const second = resolveLocale({ manual: 'system', device: ['zh-TW'] })
    expect(await changeRuntimeLocale(i18n, second)).toBe('zh-Hant')
    expect(i18n.language).toBe('zh-Hant')
  })
})
