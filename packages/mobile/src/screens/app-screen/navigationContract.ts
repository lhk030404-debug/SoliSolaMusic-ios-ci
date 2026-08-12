export const SOLISOLA_TAB_ROUTES = [
  'discover',
  'sing',
  'music',
  'feed',
  'me'
] as const

export type SoliSolaTabRoute = (typeof SOLISOLA_TAB_ROUTES)[number]

export const isSoliSolaTabRoute = (
  routeName: string
): routeName is SoliSolaTabRoute =>
  (SOLISOLA_TAB_ROUTES as readonly string[]).includes(routeName)

export type CenterMusicAction = 'navigate' | 'play' | 'pause'

export const getCenterMusicAction = (
  activeRoute: string | undefined,
  isPlaying: boolean
): CenterMusicAction => {
  if (activeRoute !== 'music') return 'navigate'
  return isPlaying ? 'pause' : 'play'
}

export const DEFAULT_SOLISOLA_TAB: SoliSolaTabRoute = 'music'

export const SOLISOLA_TAB_LABEL_KEYS: Record<SoliSolaTabRoute, string> = {
  discover: 'navigation.tabs.discover',
  sing: 'navigation.tabs.sing',
  music: 'navigation.tabs.music',
  feed: 'navigation.tabs.feed',
  me: 'navigation.tabs.me'
}

export const createSoliSolaTabMap = <Value>(values: {
  [Route in SoliSolaTabRoute]: Value
}) => values
