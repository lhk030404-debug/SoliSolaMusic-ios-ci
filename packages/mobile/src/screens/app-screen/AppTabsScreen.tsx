import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import type { NavigatorScreenParams } from '@react-navigation/native'

import { usePhantomConnect } from '../external-wallets/usePhantomConnect'

import { AppTabBar } from './AppTabBar'
import type { ExploreTabScreenParamList } from './ExploreTabScreen'
import { ExploreTabScreen } from './ExploreTabScreen'
import type { FeedTabScreenParamList } from './FeedTabScreen'
import { FeedTabScreen } from './FeedTabScreen'
import type { ProfileTabScreenParamList } from './ProfileTabScreen'
import { ProfileTabScreen } from './ProfileTabScreen'
import type { SingTabScreenParamList } from './SingTabScreen'
import { SingTabScreen } from './SingTabScreen'
import type { TrendingTabScreenParamList } from './TrendingTabScreen'
import { TrendingTabScreen } from './TrendingTabScreen'
import { DEFAULT_SOLISOLA_TAB } from './navigationContract'
import { usePrefetchNotifications } from './usePrefetchNotifications'

export type AppScreenParamList = {
  discover: NavigatorScreenParams<ExploreTabScreenParamList>
  sing: NavigatorScreenParams<SingTabScreenParamList>
  music: NavigatorScreenParams<TrendingTabScreenParamList>
  feed: NavigatorScreenParams<FeedTabScreenParamList>
  me: NavigatorScreenParams<ProfileTabScreenParamList>
}

const Tab = createBottomTabNavigator<AppScreenParamList>()

const screenOptions = { headerShown: false }
const tabBar = (props: BottomTabBarProps) => <AppTabBar {...props} />

export const AppTabsScreen = () => {
  usePhantomConnect((route) => route?.params?.params?.params ?? ({} as any))
  usePrefetchNotifications()

  return (
    <Tab.Navigator
      tabBar={tabBar}
      screenOptions={screenOptions}
      initialRouteName={DEFAULT_SOLISOLA_TAB}
    >
      <Tab.Screen name='discover' component={ExploreTabScreen} />
      <Tab.Screen name='sing' component={SingTabScreen} />
      <Tab.Screen name='music' component={TrendingTabScreen} />
      <Tab.Screen name='feed' component={FeedTabScreen} />
      <Tab.Screen name='me' component={ProfileTabScreen} />
    </Tab.Navigator>
  )
}
