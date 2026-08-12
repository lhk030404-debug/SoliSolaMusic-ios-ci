const fs = require('fs')
const path = require('path')
const ts = require('typescript')
const vm = require('vm')

const contractPath = path.join(__dirname, 'navigationContract.ts')
const transpiled = ts.transpileModule(fs.readFileSync(contractPath, 'utf8'), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020
  }
}).outputText
const contractModule = { exports: {} }
const context = {
  exports: contractModule.exports,
  module: contractModule,
  require
}
vm.runInNewContext(transpiled, context, { filename: contractPath })

const {
  createSoliSolaTabMap,
  DEFAULT_SOLISOLA_TAB,
  getCenterMusicAction,
  isSoliSolaTabRoute,
  SOLISOLA_TAB_LABEL_KEYS,
  SOLISOLA_TAB_ROUTES
} = contractModule.exports

describe('SoliSola five-tab navigation contract', () => {
  it('freezes exact route order with Music in the center and as default', () => {
    expect(SOLISOLA_TAB_ROUTES).toEqual([
      'discover',
      'sing',
      'music',
      'feed',
      'me'
    ])
    expect(SOLISOLA_TAB_ROUTES[2]).toBe('music')
    expect(DEFAULT_SOLISOLA_TAB).toBe('music')
  })

  it('maps every route to exactly one shared localization key', () => {
    expect(Object.keys(SOLISOLA_TAB_LABEL_KEYS)).toEqual(SOLISOLA_TAB_ROUTES)
    expect(Object.values(SOLISOLA_TAB_LABEL_KEYS)).toEqual([
      'navigation.tabs.discover',
      'navigation.tabs.sing',
      'navigation.tabs.music',
      'navigation.tabs.feed',
      'navigation.tabs.me'
    ])
  })

  it('builds a complete route-to-button map', () => {
    const map = createSoliSolaTabMap({
      discover: 'discover-button',
      sing: 'sing-button',
      music: 'music-button',
      feed: 'feed-button',
      me: 'me-button'
    })
    expect(Object.keys(map)).toEqual(SOLISOLA_TAB_ROUTES)
    expect(new Set(Object.values(map)).size).toBe(5)
  })

  it('rejects unknown runtime routes before a button is rendered', () => {
    expect(isSoliSolaTabRoute('music')).toBe(true)
    expect(isSoliSolaTabRoute('notifications')).toBe(false)
    expect(isSoliSolaTabRoute('unknown')).toBe(false)
  })

  it('adapts the center Music action without creating another player', () => {
    expect(getCenterMusicAction('discover', true)).toBe('navigate')
    expect(getCenterMusicAction('music', false)).toBe('play')
    expect(getCenterMusicAction('music', true)).toBe('pause')
  })
})
