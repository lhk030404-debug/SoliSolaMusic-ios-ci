import { themes as harmonyThemes } from '@audius/harmony/src/foundations/theme/theme'
import { mapValues } from 'lodash'
import { Platform } from 'react-native'

import { colorTheme } from '../color/color'
import { motion } from '../motion/motion'
import { soliSolaTokens } from '../solisola'
import { shadows } from '../shadows/shadows'

const systemFontByWeight = {
  ultraLight: Platform.select({ ios: 'System', android: 'sans-serif-thin' }),
  thin: Platform.select({ ios: 'System', android: 'sans-serif-thin' }),
  light: Platform.select({ ios: 'System', android: 'sans-serif-light' }),
  regular: Platform.select({ ios: 'System', android: 'sans-serif' }),
  medium: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  demiBold: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  bold: Platform.select({ ios: 'System', android: 'sans-serif' }),
  heavy: Platform.select({ ios: 'System', android: 'sans-serif-black' })
}

const typographyOverrides = {
  fontByWeight: {
    ...systemFontByWeight
  },
  lineHeight: mapValues(harmonyThemes.day.typography.lineHeight, (pxSize) =>
    parseInt(pxSize)
  ),
  shadow: {
    emphasis: {
      textShadowColor: 'rgba(0, 0, 0, 0.20)',
      textShadowOffset: { width: 0, height: 1.34 },
      textShadowRadius: 8,
      padding: 8,
      margin: -8
    }
  }
}

const commonFoundations = {
  shadows,
  typography: {
    ...harmonyThemes.day.typography,
    ...typographyOverrides
  },
  cornerRadius: harmonyThemes.day.cornerRadius,
  spacing: harmonyThemes.day.spacing,
  iconSizes: harmonyThemes.day.iconSizes,
  motion,
  soliSola: soliSolaTokens
}

export const theme = {
  'default-light': {
    type: harmonyThemes['default-light'].type,
    color: colorTheme.defaultLight,
    ...commonFoundations
  },
  'default-dark': {
    type: harmonyThemes['default-dark'].type,
    color: colorTheme.defaultDark,
    ...commonFoundations
  },
  'classic-light': {
    type: harmonyThemes['classic-light'].type,
    color: colorTheme.day,
    ...commonFoundations
  },
  'classic-dark': {
    type: harmonyThemes['classic-dark'].type,
    color: colorTheme.dark,
    ...commonFoundations
  },
  matrix: {
    type: harmonyThemes.matrix.type,
    color: colorTheme.matrix,
    ...commonFoundations
  },
  /** @deprecated Use classic-light */
  day: {
    type: harmonyThemes.day.type,
    color: colorTheme.day,
    ...commonFoundations
  },
  /** @deprecated Use classic-dark */
  dark: {
    type: harmonyThemes.dark.type,
    color: colorTheme.dark,
    ...commonFoundations
  }
}

export type HarmonyNativeTheme = (typeof theme)['dark']
