import fs from 'fs'
import path from 'path'

import { FeatureFlags } from '@audius/common/services'

import {
  SOLISOLA_FEATURE_POLICY,
  type RuntimeKillSwitch
} from './featurePolicy.generated'
import {
  evaluateFeaturePolicy,
  evaluateRoutePolicy,
  getDrawerRouteNames,
  isDeeplinkAllowed
} from './routePolicy'

const entryPoints = ['drawer', 'direct', 'deeplink'] as const

describe('SoliSola feature policy', () => {
  test('generated policy remains synchronized with FEATURE_FLAGS.yaml', () => {
    const configPath = path.resolve(
      __dirname,
      '../../../../config/FEATURE_FLAGS.yaml'
    )
    const config = fs.readFileSync(configPath, 'utf8')

    for (const feature of Object.keys(SOLISOLA_FEATURE_POLICY.launchRequired)) {
      expect(config).toMatch(new RegExp(`^  ${feature}: true$`, 'm'))
    }
    for (const feature of Object.keys(SOLISOLA_FEATURE_POLICY.removed)) {
      expect(config).toMatch(new RegExp(`^  ${feature}: false$`, 'm'))
    }
    for (const feature of Object.keys(SOLISOLA_FEATURE_POLICY.phase2)) {
      expect(config).toMatch(new RegExp(`^  ${feature}: false$`, 'm'))
    }
    for (const feature of SOLISOLA_FEATURE_POLICY.runtimeKillSwitches) {
      expect(config).toMatch(new RegExp(`^  - ${feature}$`, 'm'))
      expect(Object.values(FeatureFlags)).toContain(feature)
    }
  })

  test.each([
    ...Object.keys(SOLISOLA_FEATURE_POLICY.removed),
    ...Object.keys(SOLISOLA_FEATURE_POLICY.phase2)
  ])('%s cannot be enabled by a local or remote override', (feature) => {
    expect(
      evaluateFeaturePolicy(feature, {
        localOverride: true,
        remoteOverride: true
      })
    ).toMatchObject({ isAllowed: false, immutable: true })
  })

  test.each(SOLISOLA_FEATURE_POLICY.runtimeKillSwitches)(
    '%s is enabled by default and either runtime source can close it',
    (feature: RuntimeKillSwitch) => {
      expect(evaluateFeaturePolicy(feature).isAllowed).toBe(true)
      expect(
        evaluateFeaturePolicy(feature, { remoteOverride: false }).isAllowed
      ).toBe(false)
      expect(
        evaluateFeaturePolicy(feature, { localOverride: false }).isAllowed
      ).toBe(false)
      expect(
        evaluateFeaturePolicy(feature, {
          localOverride: true,
          remoteOverride: false
        }).isAllowed
      ).toBe(false)
    }
  )

  test('unknown features fail closed', () => {
    expect(
      evaluateFeaturePolicy('typo_or_unregistered_feature', {
        localOverride: true,
        remoteOverride: true
      })
    ).toMatchObject({ isAllowed: false, reason: 'unknown_feature' })
  })
})

describe('SoliSola route policy', () => {
  test.each(entryPoints)(
    'removed and Phase 2 routes stay blocked through %s entry',
    (entryPoint) => {
      expect(
        evaluateRoutePolicy('FanClubsExplore', entryPoint, {
          localOverride: true,
          remoteOverride: true
        }).isAllowed
      ).toBe(false)
      expect(
        evaluateRoutePolicy('CreatorAnalyticsCenter', entryPoint, {
          localOverride: true,
          remoteOverride: true
        }).isAllowed
      ).toBe(false)
    }
  )

  test('drawer route list omits blocked routes and honors launch kill switches', () => {
    expect(getDrawerRouteNames()).toEqual([
      'Profile',
      'Contests',
      'ChatList',
      'Upload',
      'SettingsScreen',
      'FeatureFlagOverride'
    ])
    expect(
      getDrawerRouteNames({ formal_uploads: { remoteOverride: false } })
    ).not.toContain('Upload')
  })

  test('deeplink policy blocks inherited monetization and disabled launch routes', () => {
    for (const path of [
      '/coins',
      '/wallet',
      '/wallets',
      '/wallet-connect',
      '/wallet-sign-message',
      '/cash',
      '/rewards',
      '/app-redirect/coins',
      '/app-redirect/wallet'
    ]) {
      expect(isDeeplinkAllowed(path)).toBe(false)
    }
    expect(
      isDeeplinkAllowed('/upload', {
        formal_uploads: { remoteOverride: false }
      })
    ).toBe(false)
    expect(isDeeplinkAllowed('/tracks/Nz9yBb4')).toBe(true)
  })
})
