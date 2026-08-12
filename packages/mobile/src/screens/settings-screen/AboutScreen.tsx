import { useCallback, useEffect, useState } from 'react'

import { useTranslation } from '@solisola/localization'
import CodePush from '@bravemobile/react-native-code-push'
import { View } from 'react-native'

import { IconInfo } from '@audius/harmony-native'
import { SoliSolaMark } from 'app/branding'
import { Screen, ScreenContent, ScrollView, Text } from 'app/components/core'
import { useNavigation } from 'app/hooks/useNavigation'
import { makeStyles } from 'app/styles'

import packageInfo from '../../../package.json'
import brand from '../../../../../config/BRAND.json'
import type { ProfileTabScreenParamList } from '../app-screen/ProfileTabScreen'

import { SettingsDivider } from './SettingsDivider'
import { SettingsRowLabel } from './SettingRowLabel'
import { SettingsRow } from './SettingsRow'

const { version: appVersion } = packageInfo

const useStyles = makeStyles(({ spacing }) => ({
  content: {
    paddingBottom: spacing(6)
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing(4),
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(6)
  },
  identity: {
    flexShrink: 1,
    minWidth: 180,
    gap: spacing(1)
  },
  notice: {
    paddingHorizontal: spacing(5),
    paddingBottom: spacing(5)
  }
}))

export const AboutScreen = () => {
  const { t } = useTranslation()
  const styles = useStyles()
  const navigation = useNavigation<ProfileTabScreenParamList>()
  const [otaLabel, setOtaLabel] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const loadOtaLabel = async () => {
      try {
        const pkg = await CodePush.getUpdateMetadata(
          CodePush.UpdateState.RUNNING
        )
        if (!cancelled && pkg?.label) setOtaLabel(pkg.label)
      } catch {
        // CodePush is optional in local/offline builds; the base version remains valid.
      }
    }
    void loadOtaLabel()
    return () => {
      cancelled = true
    }
  }, [])

  const openLicenses = useCallback(() => {
    navigation.push('LicensesScreen')
  }, [navigation])

  const versionLine = otaLabel
    ? `${t('about.version', { version: appVersion })} · ${t('about.ota', {
        version: otaLabel
      })}`
    : t('about.version', { version: appVersion })

  return (
    <Screen variant='secondary' title={t('about.title')} topbarRight={null}>
      <ScreenContent isOfflineCapable>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <SoliSolaMark size={84} accessible={false} />
            <View style={styles.identity}>
              <Text variant='h2'>{brand.product_name}</Text>
              <Text variant='body2'>{versionLine}</Text>
            </View>
          </View>
          <Text variant='body' allowNewline style={styles.notice}>
            {t('about.noticeSummary')}
          </Text>
          <SettingsDivider />
          <SettingsRow onPress={openLicenses} firstItem>
            <SettingsRowLabel label={t('about.licenses')} icon={IconInfo} />
          </SettingsRow>
          <SettingsDivider />
        </ScrollView>
      </ScreenContent>
    </Screen>
  )
}
