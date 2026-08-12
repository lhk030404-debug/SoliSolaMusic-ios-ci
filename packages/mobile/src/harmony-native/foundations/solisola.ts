import designTokenContract from '../../../../../config/DESIGN_TOKENS.json'
import { Easing } from 'react-native-reanimated'

const contract = designTokenContract.tokens

const nativeEasing = Easing.bezier(0.2, 0, 0, 1)

const nativeElevation = Object.fromEntries(
  Object.entries(contract.elevation).map(([key, value]) => [
    key,
    {
      elevation: value.native.elevation,
      shadowColor: '#172033',
      shadowOpacity: value.native.shadow_opacity,
      shadowRadius: value.native.shadow_radius,
      shadowOffset: { width: 0, height: value.native.offset_y }
    }
  ])
)

/** React Native adapter over the same contract consumed by Web Harmony. */
export const soliSolaTokens = {
  ...contract,
  typography: {
    ...contract.typography,
    fontFamily: {
      ios: contract.typography.font_family.ios,
      android: contract.typography.font_family.android
    }
  },
  elevation: nativeElevation
}

export const getSoliSolaMotion = (reduceMotionEnabled = false) => {
  const duration = reduceMotionEnabled
    ? contract.motion.reduced_duration_ms
    : contract.motion.duration_ms
  return Object.fromEntries(
    Object.entries(duration).map(([key, value]) => [
      key,
      { duration: value, easing: nativeEasing }
    ])
  )
}
