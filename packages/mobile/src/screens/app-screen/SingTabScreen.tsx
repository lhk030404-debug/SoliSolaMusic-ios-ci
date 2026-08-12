import {
  evaluateFeaturePolicy,
  evaluateRoutePolicy,
  useRuntimeKillSwitchOverrides
} from 'app/feature-policy'
import { UploadModalScreen } from 'app/screens/upload-screen'

import type { AppTabScreenParamList } from './AppTabScreen'
import { createAppTabScreenStack } from './createAppTabScreenStack'

export type SingTabScreenParamList = AppTabScreenParamList & {
  Sing: undefined
}

const SingRootScreen = () => {
  const runtimeOverrides = useRuntimeKillSwitchOverrides()
  const singingAllowed = evaluateFeaturePolicy(
    'singing_uploads',
    runtimeOverrides.singing_uploads
  ).isAllowed
  const uploadAllowed = evaluateRoutePolicy(
    'Upload',
    'direct',
    runtimeOverrides
  ).isAllowed

  // The upload stack is the inherited interim implementation, so both the
  // singing and formal-upload kill switches must allow it. A disabled switch
  // deliberately fails closed instead of exposing another entry point.
  return singingAllowed && uploadAllowed ? <UploadModalScreen /> : null
}

/**
 * Reuse the existing upload stack until the dedicated single-performer Studio
 * lands in G06. This preserves one navigation/player foundation in G01.
 */
export const SingTabScreen = createAppTabScreenStack<SingTabScreenParamList>(
  (Stack) => <Stack.Screen name='Sing' component={SingRootScreen} />
)
