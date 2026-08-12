import { useTranslation } from '@solisola/localization'
import { View } from 'react-native'

import { Screen, ScreenContent, ScrollView, Text } from 'app/components/core'
import { makeStyles } from 'app/styles'

import licenseSnapshot from './licenses.snapshot.json'

const useStyles = makeStyles(({ spacing }) => ({
  content: {
    padding: spacing(5),
    gap: spacing(4)
  },
  section: {
    gap: spacing(2)
  },
  licenseText: {
    lineHeight: 22
  }
}))

export const LicensesScreen = () => {
  const { t } = useTranslation()
  const styles = useStyles()
  const { thirdParty } = licenseSnapshot

  return (
    <Screen title={t('licenses.title')} variant='secondary' topbarRight={null}>
      <ScreenContent isOfflineCapable>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.section}>
            <Text variant='h2'>
              {t('licenses.applicationSourceLicenseTitle')}
            </Text>
            <Text variant='body'>
              {t('licenses.applicationSourceLicenseBody', {
                license: licenseSnapshot.rootLicenseSpdx
              })}
            </Text>
            <Text
              variant='body2'
              allowNewline
              selectable
              style={styles.licenseText}
            >
              {licenseSnapshot.rootLicenseText}
            </Text>
          </View>
          <View style={styles.section}>
            <Text variant='h2'>{t('licenses.thirdPartyTitle')}</Text>
            <Text variant='body' allowNewline>
              {t('licenses.thirdPartySummary', {
                occurrences: thirdParty.npmOccurrences,
                packages: thirdParty.uniqueNpmPackages,
                components: thirdParty.sbomComponents
              })}
            </Text>
            <Text variant='body' allowNewline>
              {t('licenses.offlineNotice', {
                source: licenseSnapshot.noticeSource
              })}
            </Text>
            <Text
              variant='body2'
              allowNewline
              selectable
              style={styles.licenseText}
            >
              {licenseSnapshot.thirdPartyNoticeText}
            </Text>
          </View>
        </ScrollView>
      </ScreenContent>
    </Screen>
  )
}
