import { useHasAccount } from '@audius/common/api'
import type { DrawerContentComponentProps } from '@react-navigation/drawer'

import { Flex } from '@audius/harmony-native'
import { SoliSolaWordmark } from 'app/branding'
import {
  getDrawerRouteNames,
  useRuntimeKillSwitchOverrides
} from 'app/feature-policy'

import { AppDrawerContextProvider } from '../AppDrawerContext'

import { AccountDetails } from './AccountDetails'
import { VanityMetrics } from './VanityMetrics'
import {
  ProfileNavItem,
  ContestsNavItem,
  MessagesNavItem,
  WalletNavItem,
  FanClubsNavItem,
  RewardsNavItem,
  UploadNavItem,
  SettingsNavItem,
  FeatureFlagsNavItem
} from './nav-items'

type AccountDrawerProps = DrawerContentComponentProps & {
  gesturesDisabled: boolean
  setGesturesDisabled: (disabled: boolean) => void
  setIsAtStackRoot: (isAtStackRoot: boolean) => void
}

export const LeftNavDrawer = (props: AccountDrawerProps) => {
  const { navigation: drawerHelpers, ...other } = props
  const hasAccount = useHasAccount()
  if (!hasAccount) return null

  return (
    <AppDrawerContextProvider drawerHelpers={drawerHelpers} {...other}>
      <WrappedLeftNavDrawer />
    </AppDrawerContextProvider>
  )
}

const WrappedLeftNavDrawer = () => {
  const runtimeOverrides = useRuntimeKillSwitchOverrides()
  const allowedRoutes = new Set(getDrawerRouteNames(runtimeOverrides))

  return (
    <Flex h='100%' pv='unit16' justifyContent='space-between'>
      <Flex>
        <AccountDetails />
        <VanityMetrics />
        {allowedRoutes.has('Profile') ? <ProfileNavItem /> : null}
        {allowedRoutes.has('Contests') ? <ContestsNavItem /> : null}
        {allowedRoutes.has('ChatList') ? <MessagesNavItem /> : null}
        {allowedRoutes.has('wallet') ? <WalletNavItem /> : null}
        {allowedRoutes.has('FanClubsExplore') ? <FanClubsNavItem /> : null}
        {allowedRoutes.has('RewardsScreen') ? <RewardsNavItem /> : null}
        {allowedRoutes.has('Upload') ? <UploadNavItem /> : null}
        {allowedRoutes.has('SettingsScreen') ? <SettingsNavItem /> : null}
        {allowedRoutes.has('FeatureFlagOverride') ? (
          <FeatureFlagsNavItem />
        ) : null}
      </Flex>
      <Flex ph='xl'>
        <SoliSolaWordmark height={24} />
      </Flex>
    </Flex>
  )
}
