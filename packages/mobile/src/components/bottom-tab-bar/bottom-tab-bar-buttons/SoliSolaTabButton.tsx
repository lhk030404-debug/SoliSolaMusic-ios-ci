import { useCallback } from 'react'

import { Pressable, StyleSheet, View } from 'react-native'

import type { IconComponent } from '@audius/harmony-native'
import { Text, useTheme } from '@audius/harmony-native'
import type { SoliSolaTabRoute } from 'app/screens/app-screen/navigationContract'

import { BOTTOM_BAR_BUTTON_HEIGHT } from '../constants'

type SoliSolaTabButtonProps = {
  routeName: SoliSolaTabRoute
  routeKey: string
  label: string
  icon: IconComponent
  isActive: boolean
  isCenter?: boolean
  isPlaying?: boolean
  onPress: (
    isActive: boolean,
    routeName: SoliSolaTabRoute,
    routeKey: string
  ) => void
  onLongPress: () => void
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexBasis: 0,
    minHeight: BOTTOM_BAR_BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    paddingVertical: 4
  },
  pressed: {
    opacity: 0.72
  },
  iconContainer: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22
  },
  label: {
    marginTop: 1,
    maxWidth: '100%',
    flexShrink: 1
  }
})

export const SoliSolaTabButton = ({
  routeName,
  routeKey,
  label,
  icon: Icon,
  isActive,
  isCenter = false,
  isPlaying,
  onPress,
  onLongPress
}: SoliSolaTabButtonProps) => {
  const { soliSola } = useTheme()
  const handlePress = useCallback(
    () => onPress(isActive, routeName, routeKey),
    [isActive, onPress, routeKey, routeName]
  )

  const handleLongPress = useCallback(() => {
    if (isActive) onLongPress()
    else handlePress()
  }, [handlePress, isActive, onLongPress])

  return (
    <Pressable
      accessibilityRole='tab'
      accessibilityLabel={label}
      accessibilityState={{
        selected: isActive,
        ...(isCenter && isActive ? { checked: isPlaying } : {})
      }}
      hitSlop={4}
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [styles.root, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.iconContainer,
          isCenter && {
            backgroundColor: soliSola.color.light.brand_primary
          }
        ]}
      >
        <Icon
          size={isCenter ? 'xl' : 'l'}
          color={isCenter ? 'white' : isActive ? 'active' : 'subdued'}
        />
      </View>
      <Text
        accessibilityElementsHidden
        variant='label'
        size='xs'
        strength={isActive ? 'strong' : 'default'}
        color={isActive ? 'default' : 'subdued'}
        textAlign='center'
        maxFontSizeMultiplier={2}
        numberOfLines={2}
        style={styles.label}
      >
        {label}
      </Text>
    </Pressable>
  )
}
