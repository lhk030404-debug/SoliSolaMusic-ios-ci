import { describe, expect, test } from 'vitest'

import { FeatureFlags } from '../services'

import { resolveFlagWithLocalOverride } from './useFeatureFlag'

describe('SoliSola launch kill-switch local overrides', () => {
  test('a local enabled override cannot reopen a remotely disabled switch', () => {
    expect(
      resolveFlagWithLocalOverride(FeatureFlags.FORMAL_UPLOADS, false, true)
    ).toBe(false)
  })

  test('a local disabled override closes a remotely enabled switch', () => {
    expect(
      resolveFlagWithLocalOverride(FeatureFlags.FORMAL_UPLOADS, true, false)
    ).toBe(false)
  })

  test('unmanaged inherited flags retain their existing local override behavior', () => {
    expect(
      resolveFlagWithLocalOverride(FeatureFlags.USDC_PURCHASES, false, true)
    ).toBe(true)
  })
})
