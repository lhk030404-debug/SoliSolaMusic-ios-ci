// Generated from config/FEATURE_FLAGS.yaml by tools/generate_feature_policy.py.
// Do not edit by hand. Run the generator and commit the deterministic result.
export const SOLISOLA_FEATURE_POLICY = {
  launchRequired: {
    discover: true,
    singing: true,
    vertical_music_feed: true,
    social_feed: true,
    profile_and_library: true,
    formal_music_upload: true,
    creator_web: true,
    admin_moderation: true,
    standard_streaming: true,
    compressed_offline_download: true,
    shared_solisola_identity: true,
    shared_social_graph: true
  },
  launchLocales: ['en', 'zh-Hans', 'zh-Hant'],
  removed: {
    live_streaming: false,
    realtime_group_singing: false,
    asynchronous_duet: false,
    realtime_autotune: false,
    ai_voice_cloning: false,
    membership: false,
    advertising: false,
    automatic_creator_revenue_split: false
  },
  phase2: {
    desktop_app: false,
    creator_analytics_center: false,
    user_visible_lossless_streaming: false,
    user_visible_lossless_download: false,
    carplay: false,
    android_auto: false,
    post_recording_pitch_correction: false
  },
  runtimeKillSwitches: [
    'music_feed',
    'singing_uploads',
    'formal_uploads',
    'comments',
    'recommendations',
    'offline_downloads',
    'creator_web',
    'admin_actions'
  ]
} as const

export type LaunchRequiredFeature =
  keyof typeof SOLISOLA_FEATURE_POLICY.launchRequired
export type RemovedFeature = keyof typeof SOLISOLA_FEATURE_POLICY.removed
export type Phase2Feature = keyof typeof SOLISOLA_FEATURE_POLICY.phase2
export type RuntimeKillSwitch =
  (typeof SOLISOLA_FEATURE_POLICY.runtimeKillSwitches)[number]
export type SoliSolaFeature =
  | LaunchRequiredFeature
  | RemovedFeature
  | Phase2Feature
  | RuntimeKillSwitch
