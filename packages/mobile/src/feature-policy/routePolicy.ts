import {
  SOLISOLA_FEATURE_POLICY,
  type RuntimeKillSwitch,
  type SoliSolaFeature
} from './featurePolicy.generated'

export type RouteEntryPoint = 'drawer' | 'direct' | 'deeplink'

export type FeatureOverride = {
  localOverride?: boolean
  remoteOverride?: boolean
}

export type RuntimeKillSwitchOverrides = Partial<
  Record<RuntimeKillSwitch, FeatureOverride>
>

export type FeaturePolicyDecision = {
  isAllowed: boolean
  immutable: boolean
  reason:
    | 'launch_required'
    | 'runtime_enabled'
    | 'runtime_disabled'
    | 'removed'
    | 'phase_2'
    | 'unknown_feature'
}

export type RoutePolicyDecision = FeaturePolicyDecision & {
  routeName: string
  entryPoint: RouteEntryPoint
  feature?: SoliSolaFeature
}

const hasOwn = (object: object, key: PropertyKey) =>
  Object.prototype.hasOwnProperty.call(object, key)

/**
 * Evaluates the immutable launch policy before any local or remote value.
 * Removed and Phase 2 features can therefore never be opened by an override.
 * Runtime kill switches are default-on but fail closed when either source says
 * false; a local `true` cannot undo a remote shutdown.
 */
export const evaluateFeaturePolicy = (
  feature: string,
  overrides: FeatureOverride = {}
): FeaturePolicyDecision => {
  if (hasOwn(SOLISOLA_FEATURE_POLICY.removed, feature)) {
    return { isAllowed: false, immutable: true, reason: 'removed' }
  }

  if (hasOwn(SOLISOLA_FEATURE_POLICY.phase2, feature)) {
    return { isAllowed: false, immutable: true, reason: 'phase_2' }
  }

  if (
    (SOLISOLA_FEATURE_POLICY.runtimeKillSwitches as readonly string[]).includes(
      feature
    )
  ) {
    const isAllowed =
      overrides.localOverride !== false && overrides.remoteOverride !== false
    return {
      isAllowed,
      immutable: false,
      reason: isAllowed ? 'runtime_enabled' : 'runtime_disabled'
    }
  }

  if (hasOwn(SOLISOLA_FEATURE_POLICY.launchRequired, feature)) {
    return { isAllowed: true, immutable: true, reason: 'launch_required' }
  }

  return { isAllowed: false, immutable: true, reason: 'unknown_feature' }
}

type RouteRequirement = readonly SoliSolaFeature[]

/**
 * Central inventory for routes controlled by the frozen feature policy.
 * Inherited Audius token/fan-club screens remain in source for later staged
 * removal, but are unreachable because the closest frozen product category
 * (`membership` or automatic revenue split) is permanently unavailable.
 */
export const ROUTE_FEATURE_REQUIREMENTS = {
  AboutScreen: ['profile_and_library'],
  LanguageSettingsScreen: ['profile_and_library'],
  LicensesScreen: ['profile_and_library'],
  Upload: ['formal_music_upload', 'formal_uploads'],
  DownloadSettingsScreen: ['compressed_offline_download', 'offline_downloads'],

  AudioScreen: ['membership'],
  BuySell: ['membership'],
  ExternalWallets: ['membership'],
  wallet: ['membership'],
  CashScreen: ['membership'],
  FanClubsExplore: ['membership'],
  FanClubSort: ['membership'],
  CoinDetailsScreen: ['membership'],
  CoinRedeemScreen: ['membership'],
  CoinLeaderboard: ['membership'],
  EditCoinDetailsScreen: ['membership'],
  RewardsScreen: ['automatic_creator_revenue_split'],
  SendTokensUserSelection: ['automatic_creator_revenue_split'],

  LiveStreaming: ['live_streaming'],
  RealtimeGroupSinging: ['realtime_group_singing'],
  AsynchronousDuet: ['asynchronous_duet'],
  RealtimeAutotune: ['realtime_autotune'],
  AiVoiceCloning: ['ai_voice_cloning'],
  Membership: ['membership'],
  Advertising: ['advertising'],
  AutomaticCreatorRevenueSplit: ['automatic_creator_revenue_split'],

  DesktopApp: ['desktop_app'],
  CreatorAnalyticsCenter: ['creator_analytics_center'],
  LosslessStreaming: ['user_visible_lossless_streaming'],
  LosslessDownloads: ['user_visible_lossless_download'],
  CarPlay: ['carplay'],
  AndroidAuto: ['android_auto'],
  PostRecordingPitchCorrection: ['post_recording_pitch_correction']
} as const satisfies Record<string, RouteRequirement>

export type PolicyControlledRoute = keyof typeof ROUTE_FEATURE_REQUIREMENTS

const getFeatureOverride = (
  feature: SoliSolaFeature,
  overrides: FeatureOverride | RuntimeKillSwitchOverrides
) => {
  if ('localOverride' in overrides || 'remoteOverride' in overrides) {
    return overrides as FeatureOverride
  }
  return (overrides as RuntimeKillSwitchOverrides)[feature as RuntimeKillSwitch]
}

export const evaluateRoutePolicy = (
  routeName: string,
  entryPoint: RouteEntryPoint,
  overrides: FeatureOverride | RuntimeKillSwitchOverrides = {}
): RoutePolicyDecision => {
  const requirements = ROUTE_FEATURE_REQUIREMENTS[
    routeName as PolicyControlledRoute
  ] as RouteRequirement | undefined

  if (!requirements) {
    return {
      routeName,
      entryPoint,
      isAllowed: true,
      immutable: false,
      reason: 'launch_required'
    }
  }

  for (const feature of requirements) {
    const decision = evaluateFeaturePolicy(
      feature,
      getFeatureOverride(feature, overrides)
    )
    if (!decision.isAllowed) {
      return { routeName, entryPoint, feature, ...decision }
    }
  }

  const feature = requirements[requirements.length - 1]
  return {
    routeName,
    entryPoint,
    feature,
    ...evaluateFeaturePolicy(feature, getFeatureOverride(feature, overrides))
  }
}

export const DRAWER_ROUTE_NAMES = [
  'Profile',
  'Contests',
  'ChatList',
  'wallet',
  'FanClubsExplore',
  'RewardsScreen',
  'Upload',
  'SettingsScreen',
  'FeatureFlagOverride'
] as const

export const getDrawerRouteNames = (
  overrides: RuntimeKillSwitchOverrides = {}
) =>
  DRAWER_ROUTE_NAMES.filter(
    (routeName) =>
      evaluateRoutePolicy(routeName, 'drawer', overrides).isAllowed
  )

const getRouteNameForDeeplink = (path: string) => {
  const normalized = `/${path.replace(/^\/+/, '')}`
    .replace(/^\/app-redirect(?:\/|$)/, '/')
    .toLowerCase()
  if (normalized.match(/^\/wallet-connect(?:\/|\?|$)/)) {
    return 'ExternalWallets'
  }
  if (normalized.match(/^\/wallet-sign-message(?:\/|\?|$)/)) {
    return 'ExternalWallets'
  }
  if (normalized.match(/^\/coins(?:\/|\?|$)/)) return 'FanClubsExplore'
  if (normalized.match(/^\/wallet(?:\/|\?|$)/)) return 'wallet'
  if (normalized.match(/^\/wallets(?:\/|\?|$)/)) return 'ExternalWallets'
  if (normalized.match(/^\/rewards(?:\/|\?|$)/)) return 'RewardsScreen'
  if (normalized.match(/^\/cash(?:\/|\?|$)/)) return 'CashScreen'
  if (normalized.match(/^\/upload(?:\/|\?|$)/)) return 'Upload'
  return undefined
}

export const isDeeplinkAllowed = (
  path: string,
  overrides: RuntimeKillSwitchOverrides = {}
) => {
  const routeName = getRouteNameForDeeplink(path)
  return routeName
    ? evaluateRoutePolicy(routeName, 'deeplink', overrides).isAllowed
    : true
}
