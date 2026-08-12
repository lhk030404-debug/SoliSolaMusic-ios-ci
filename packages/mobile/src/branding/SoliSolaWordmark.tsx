import type { StyleProp, ViewStyle } from 'react-native'
import { StyleSheet, Text, View } from 'react-native'

import brand from '../../../../config/BRAND.json'

import { SoliSolaMark } from './SoliSolaMark'

type SoliSolaWordmarkProps = {
  height?: number
  style?: StyleProp<ViewStyle>
}

/** System-font wordmark paired with the original SoliSola vector mark. */
export const SoliSolaWordmark = ({
  height = 32,
  style
}: SoliSolaWordmarkProps) => (
  <View
    accessible
    accessibilityRole='image'
    accessibilityLabel={brand.localized.en.logo_accessibility_label}
    style={[styles.root, style]}
  >
    <SoliSolaMark size={height} accessible={false} />
    <Text
      allowFontScaling
      numberOfLines={1}
      style={[styles.label, { fontSize: height * 0.56 }]}
    >
      {brand.short_name}
    </Text>
  </View>
)

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  label: {
    color: '#5B4AE8',
    fontFamily: undefined,
    fontWeight: '700',
    letterSpacing: 0.2
  }
})
