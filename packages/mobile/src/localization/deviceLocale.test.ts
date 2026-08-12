import { getLanguageTagsFromLocales } from './deviceLocaleTags'

describe('device locale tags', () => {
  it('preserves the native preference order', () => {
    expect(
      getLanguageTagsFromLocales([
        { languageTag: 'zh-Hant-HK' },
        { languageTag: 'en-US' }
      ])
    ).toEqual(['zh-Hant-HK', 'en-US'])
  })

  it('supports an empty native locale list', () => {
    expect(getLanguageTagsFromLocales([])).toEqual([])
  })
})
