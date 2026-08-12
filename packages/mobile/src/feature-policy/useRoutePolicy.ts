import { useFeatureFlag } from '@audius/common/hooks'
import { FeatureFlags } from '@audius/common/services'

import type { RuntimeKillSwitchOverrides } from './routePolicy'

export const useRuntimeKillSwitchOverrides = (): RuntimeKillSwitchOverrides => {
  const musicFeed = useFeatureFlag(FeatureFlags.MUSIC_FEED)
  const singingUploads = useFeatureFlag(FeatureFlags.SINGING_UPLOADS)
  const formalUploads = useFeatureFlag(FeatureFlags.FORMAL_UPLOADS)
  const comments = useFeatureFlag(FeatureFlags.COMMENTS)
  const recommendations = useFeatureFlag(FeatureFlags.RECOMMENDATIONS)
  const offlineDownloads = useFeatureFlag(FeatureFlags.OFFLINE_DOWNLOADS)
  const creatorWeb = useFeatureFlag(FeatureFlags.CREATOR_WEB)
  const adminActions = useFeatureFlag(FeatureFlags.ADMIN_ACTIONS)

  return {
    music_feed: { remoteOverride: musicFeed.isEnabled },
    singing_uploads: { remoteOverride: singingUploads.isEnabled },
    formal_uploads: { remoteOverride: formalUploads.isEnabled },
    comments: { remoteOverride: comments.isEnabled },
    recommendations: { remoteOverride: recommendations.isEnabled },
    offline_downloads: { remoteOverride: offlineDownloads.isEnabled },
    creator_web: { remoteOverride: creatorWeb.isEnabled },
    admin_actions: { remoteOverride: adminActions.isEnabled }
  }
}
