import type { StyleProp, ViewStyle } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'

import brand from '../../../../config/BRAND.json'

type SoliSolaMarkProps = {
  size?: number
  style?: StyleProp<ViewStyle>
  accessible?: boolean
}

/** Original SoliSola sound-path mark. It uses vectors and no bundled font. */
export const SoliSolaMark = ({
  size = 48,
  style,
  accessible = true
}: SoliSolaMarkProps) => (
  <Svg
    width={size}
    height={size}
    viewBox='0 0 64 64'
    style={style}
    accessible={accessible}
    accessibilityRole={accessible ? 'image' : undefined}
    accessibilityLabel={
      accessible ? brand.localized.en.logo_accessibility_label : undefined
    }
  >
    <Path
      d='M13 21c7-10 25-11 35-2 7 7 3 15-7 16l-18 2c-9 1-12 10-5 16 9 8 26 6 33-5'
      fill='none'
      stroke='#5B4AE8'
      strokeLinecap='round'
      strokeWidth={7}
    />
    <Path
      d='M18 14c5-4 12-6 19-4M27 54c7 2 15 0 20-4'
      fill='none'
      stroke='#20B8A6'
      strokeLinecap='round'
      strokeWidth={4}
    />
    <Circle cx={51} cy={46} r={4} fill='#F2B544' />
  </Svg>
)
