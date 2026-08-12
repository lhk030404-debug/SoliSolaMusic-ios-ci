import { describe, expect, test, vi } from 'vitest'

import { FeatureFlags } from './feature-flags'
import { remoteConfig } from './remote-config'

const makeRemoteConfig = async (
  values: Partial<Record<FeatureFlags, boolean | undefined>>
) => {
  const client = {
    getFeatureVariableBoolean: vi.fn(),
    getFeatureVariableDouble: vi.fn(),
    getFeatureVariableInteger: vi.fn(),
    getFeatureVariableString: vi.fn(),
    isFeatureEnabled: vi.fn((flag: FeatureFlags) => values[flag]),
    onReady: vi.fn(async () => ({ success: true }))
  }
  const instance = remoteConfig({
    createOptimizelyClient: async () => client,
    getFeatureFlagSessionId: async () => 123,
    setFeatureFlagSessionId: async () => {},
    setLogLevel: () => {},
    environment: 'production',
    appVersion: 'test',
    platform: 'mobile'
  })

  await instance.init()
  await instance.waitForRemoteConfig()
  return instance
}

describe('remoteConfig feature flags', () => {
  test('a remotely disabled default-on launch kill switch stays disabled', async () => {
    const instance = await makeRemoteConfig({
      [FeatureFlags.FORMAL_UPLOADS]: false
    })

    expect(instance.getFeatureEnabled(FeatureFlags.FORMAL_UPLOADS)).toBe(false)
  })

  test('uses the declared default only while a remote value is unavailable', async () => {
    const instance = await makeRemoteConfig({
      [FeatureFlags.FORMAL_UPLOADS]: undefined
    })

    expect(instance.getFeatureEnabled(FeatureFlags.FORMAL_UPLOADS)).toBe(true)
  })

  test('checks a fallback only after an explicit false primary value', async () => {
    const instance = await makeRemoteConfig({
      [FeatureFlags.FORMAL_UPLOADS]: false,
      [FeatureFlags.MUSIC_FEED]: true
    })

    expect(
      instance.getFeatureEnabled(
        FeatureFlags.FORMAL_UPLOADS,
        FeatureFlags.MUSIC_FEED
      )
    ).toBe(true)
  })

  test('preserves inherited Audius default/fallback semantics', async () => {
    const instance = await makeRemoteConfig({
      [FeatureFlags.USDC_PURCHASES]: false
    })

    expect(instance.getFeatureEnabled(FeatureFlags.USDC_PURCHASES)).toBe(true)
  })
})
