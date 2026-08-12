import type { LocalePreference } from '@solisola/localization'
import { useTranslation } from '@solisola/localization'
import { View } from 'react-native'

import { IconCheck } from '@audius/harmony-native'
import { Screen, ScreenContent, ScrollView, Text } from 'app/components/core'
import { useLocalization } from 'app/localization'
import { makeStyles } from 'app/styles'
import { useThemePalette } from 'app/utils/theme'

import { SettingsRowLabel } from './SettingRowLabel'
import { SettingsRow } from './SettingsRow'
import { LANGUAGE_OPTIONS, selectSettingsLanguage } from './settingsExperience'

const optionKeys: Record<LocalePreference, string> = {
  system: 'languageSettings.followSystem',
  en: 'languageSettings.english',
  'zh-Hans': 'languageSettings.simplifiedChinese',
  'zh-Hant': 'languageSettings.traditionalChinese'
}

const useStyles = makeStyles(({ spacing }) => ({
  description: {
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(4)
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
}))

export const LanguageSettingsScreen = () => {
  const { t } = useTranslation()
  const { preference, setLocalePreference } = useLocalization()
  const palette = useThemePalette()
  const styles = useStyles()

  return (
    <Screen
      title={t('languageSettings.title')}
      variant='secondary'
      topbarRight={null}
    >
      <ScreenContent isOfflineCapable>
        <ScrollView>
          <Text variant='body' color='neutral' style={styles.description}>
            {t('settings.languageDescription')}
          </Text>
          {LANGUAGE_OPTIONS.map(option => {
            const label = t(optionKeys[option])
            const isSelected = preference === option
            const selected = t('languageSettings.selectedAnnouncement', {
              language: label
            })
            return (
              <SettingsRow
                key={option}
                onPress={() =>
                  selectSettingsLanguage(setLocalePreference, option)
                }
                accessibilityLabel={
                  isSelected ? `${label}. ${selected}` : label
                }
                accessibilityState={{ selected: isSelected }}
                hideCaret
              >
                <View style={styles.option}>
                  <SettingsRowLabel label={label} />
                  {isSelected ? (
                    <IconCheck width={20} height={20} fill={palette.neutral} />
                  ) : null}
                </View>
              </SettingsRow>
            )
          })}
        </ScrollView>
      </ScreenContent>
    </Screen>
  )
}
