import AsyncStorage from '@react-native-async-storage/async-storage'

import type { LocalePreference } from '@solisola/localization'
import { launchLocales } from '@solisola/localization'
import { LOCALE_PREFERENCE_KEY } from 'app/constants/storage-keys'

const isLocalePreference = (value: string): value is LocalePreference =>
  value === 'system' || launchLocales.includes(value as never)

export const readLocalePreference =
  async (): Promise<LocalePreference | null> => {
    const value = await AsyncStorage.getItem(LOCALE_PREFERENCE_KEY)
    return value && isLocalePreference(value) ? value : null
  }

export const writeLocalePreference = (preference: LocalePreference) =>
  AsyncStorage.setItem(LOCALE_PREFERENCE_KEY, preference)
