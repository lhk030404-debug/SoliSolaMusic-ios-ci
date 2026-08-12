import { useCallback } from 'react'

import type {
  BottomTabNavigationEventMap,
  BottomTabBarProps as RNBottomTabBarProps
} from '@react-navigation/bottom-tabs'
import type { NavigationHelpers, ParamListBase } from '@react-navigation/native'
import { playbackActions, playbackSelectors } from '@audius/common/store'
import { Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'

import {
  Flex,
  IconExplore,
  IconFeed,
  IconNote,
  IconPause,
  IconPlay,
  IconUser
} from '@audius/harmony-native'
import type { IconComponent } from '@audius/harmony-native'
import { useTranslation } from '@solisola/localization'
import { FULL_DRAWER_HEIGHT } from 'app/components/drawer'
import { PLAY_BAR_HEIGHT } from 'app/components/now-playing-drawer'
import {
  SOLISOLA_TAB_LABEL_KEYS,
  createSoliSolaTabMap,
  getCenterMusicAction,
  isSoliSolaTabRoute,
  type SoliSolaTabRoute
} from 'app/screens/app-screen/navigationContract'

import { SoliSolaTabButton } from './bottom-tab-bar-buttons/SoliSolaTabButton'
import { BOTTOM_BAR_HEIGHT } from './constants'

const { togglePlay } = playbackActions
const { getPlaying } = playbackSelectors

export const bottomTabBarButtons: Record<SoliSolaTabRoute, IconComponent> =
  createSoliSolaTabMap({
    discover: IconExplore,
    sing: IconNote,
    music: IconPlay,
    feed: IconFeed,
    me: IconUser
  })

const interpolatePostion = (
  translationAnim: Animated.Value,
  bottomInset: number
) => ({
  transform: [
    {
      translateY: translationAnim.interpolate({
        inputRange: [
          0,
          FULL_DRAWER_HEIGHT -
            bottomInset -
            BOTTOM_BAR_HEIGHT -
            PLAY_BAR_HEIGHT,
          FULL_DRAWER_HEIGHT
        ],
        outputRange: [bottomInset + BOTTOM_BAR_HEIGHT, 0, 0]
      })
    }
  ]
})

export type BottomTabBarProps = Pick<RNBottomTabBarProps, 'state'> & {
  /**
   * Translation animation to move the bottom bar as drawers
   * are opened behind it
   */
  translationAnim: Animated.Value

  navigation: NavigationHelpers<
    ParamListBase,
    BottomTabNavigationEventMap & {
      scrollToTop: {
        data: undefined
      }
    }
  >
}

export const BottomTabBar = (props: BottomTabBarProps) => {
  const { translationAnim, navigation, state } = props
  const { routes, index: activeIndex } = state
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const isPlaying = useSelector(getPlaying)
  const centerMusicAction = getCenterMusicAction(
    routes[activeIndex]?.name,
    isPlaying
  )

  const handlePress = useCallback(
    (isFocused: boolean, routeName: string, routeKey: string) => {
      const event = navigation.emit({
        type: 'tabPress',
        target: routeKey,
        canPreventDefault: true
      })

      // Native navigation
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName)
      } else if (isFocused) {
        navigation.emit({
          type: 'scrollToTop'
        })
        if (routeName === 'music' && !event.defaultPrevented) {
          dispatch(togglePlay())
        }
      }
    },
    [dispatch, navigation]
  )

  const handleLongPress = useCallback(() => {
    navigation.emit({
      type: 'scrollToTop'
    })
  }, [navigation])

  return (
    <Animated.View
      style={[
        { zIndex: 4, elevation: 4 },
        interpolatePostion(translationAnim, insets.bottom)
      ]}
    >
      <Flex
        row
        pointerEvents='auto'
        borderTop='default'
        backgroundColor='surface1'
        wrap='nowrap'
        justifyContent='space-evenly'
        pb={insets.bottom}
        style={{ minHeight: BOTTOM_BAR_HEIGHT + insets.bottom }}
      >
        {routes.map(({ name, key }, index) => {
          // React Navigation state is runtime data. Fail safely if a stale or
          // restored navigator contains a route outside the frozen contract.
          if (!isSoliSolaTabRoute(name)) return null

          const routeName = name
          const icon =
            routeName === 'music' && centerMusicAction === 'pause'
              ? IconPause
              : bottomTabBarButtons[routeName]
          const label = t(SOLISOLA_TAB_LABEL_KEYS[routeName])

          return (
            <SoliSolaTabButton
              key={key}
              routeName={routeName}
              routeKey={key}
              label={label}
              icon={icon}
              isActive={index === activeIndex}
              isCenter={routeName === 'music'}
              isPlaying={
                routeName === 'music' && index === activeIndex
                  ? isPlaying
                  : undefined
              }
              onPress={handlePress}
              onLongPress={handleLongPress}
            />
          )
        })}
      </Flex>
    </Animated.View>
  )
}
