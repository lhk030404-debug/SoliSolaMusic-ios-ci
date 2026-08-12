import { useCallback } from 'react'

import { useTranslation } from '@solisola/localization'

import {
  IconCloudDownload,
  IconInfo,
  IconNote,
  IconMessage,
  IconNotificationOn,
  IconSettings,
  IconUserUnfollow,
  IconListeningHistory
} from '@audius/harmony-native'
import { SoliSolaWordmark } from 'app/branding'
import { Screen, ScreenContent, ScrollView } from 'app/components/core'
import { useShowManagerModeNotAvailable } from 'app/components/manager-mode-drawer/useShowManagerModeNotAvailable'
import { useNavigation } from 'app/hooks/useNavigation'
import { useLocalization } from 'app/localization'
import { makeStyles } from 'app/styles'

import type { ProfileTabScreenParamList } from '../app-screen/ProfileTabScreen'

import { AccountSettingsRow } from './AccountSettingsRow'
import { AppearanceSettingsRow } from './AppearanceSettingsRow'
import { SettingsRowLabel } from './SettingRowLabel'
import { SettingsDivider } from './SettingsDivider'
import { SettingsRow } from './SettingsRow'
import { SettingsRowDescription } from './SettingsRowDescription'

const useStyles = makeStyles(({ spacing }) => ({
  logo: {
    marginVertical: spacing(6),
    alignSelf: 'center'
  }
}))

const IconProps = { height: 28, width: 28, style: { marginRight: 4 } }

export const SettingsScreen = () => {
  const styles = useStyles()
  const navigation = useNavigation<ProfileTabScreenParamList>()
  const { t } = useTranslation()
  const { preference } = useLocalization()

  useShowManagerModeNotAvailable()

  const handlePressInbox = useCallback(() => {
    navigation.push('InboxSettingsScreen')
  }, [navigation])

  const handlePressDownloads = useCallback(() => {
    navigation.push('DownloadSettingsScreen')
  }, [navigation])

  const handlePressNotifications = useCallback(() => {
    navigation.push('NotificationSettingsScreen')
  }, [navigation])

  const handlePressCommentSettings = useCallback(() => {
    navigation.push('CommentSettingsScreen')
  }, [navigation])

  const handlePressAbout = useCallback(() => {
    navigation.push('AboutScreen')
  }, [navigation])

  const handlePressLanguage = useCallback(() => {
    navigation.push('LanguageSettingsScreen')
  }, [navigation])

  const handlePressLicenses = useCallback(() => {
    navigation.push('LicensesScreen')
  }, [navigation])

  const handlePressHistory = useCallback(() => {
    navigation.push('ListeningHistoryScreen')
  }, [navigation])

  return (
    <Screen
      variant='secondary'
      title={t('settings.title')}
      icon={IconSettings}
      IconProps={IconProps}
      url='/settings'
      topbarRight={null}
    >
      <ScreenContent isOfflineCapable>
        <ScrollView>
          <SoliSolaWordmark height={48} style={styles.logo} />
          <AccountSettingsRow />
          <SettingsDivider />
          <AppearanceSettingsRow />
          <SettingsRow onPress={handlePressInbox}>
            <SettingsRowLabel label={t('settings.inbox')} icon={IconMessage} />
            <SettingsRowDescription>
              {t('settings.inboxDescription')}
            </SettingsRowDescription>
          </SettingsRow>
          <SettingsRow onPress={handlePressNotifications}>
            <SettingsRowLabel
              label={t('settings.notifications')}
              icon={IconNotificationOn}
            />
            <SettingsRowDescription>
              {t('settings.notificationsDescription')}
            </SettingsRowDescription>
          </SettingsRow>
          <SettingsRow onPress={handlePressCommentSettings}>
            <SettingsRowLabel
              label={t('settings.comment')}
              icon={IconUserUnfollow}
            />
            <SettingsRowDescription>
              {t('settings.commentDescription')}
            </SettingsRowDescription>
          </SettingsRow>
          <SettingsRow onPress={handlePressDownloads}>
            <SettingsRowLabel
              label={t('settings.downloads')}
              icon={IconCloudDownload}
            />
          </SettingsRow>
          <SettingsRow onPress={handlePressHistory}>
            <SettingsRowLabel
              label={t('settings.history')}
              icon={IconListeningHistory}
            />
          </SettingsRow>
          <SettingsDivider />
          <SettingsRow onPress={handlePressLanguage}>
            <SettingsRowLabel
              label={t('settings.language')}
              icon={IconSettings}
            />
            <SettingsRowDescription>
              {t('settings.languageDescription', { preference })}
            </SettingsRowDescription>
          </SettingsRow>
          <SettingsRow onPress={handlePressAbout}>
            <SettingsRowLabel label={t('settings.about')} icon={IconInfo} />
          </SettingsRow>
          <SettingsRow onPress={handlePressLicenses}>
            <SettingsRowLabel label={t('settings.licenses')} icon={IconNote} />
          </SettingsRow>
          <SettingsDivider />
        </ScrollView>
      </ScreenContent>
    </Screen>
  )
}
