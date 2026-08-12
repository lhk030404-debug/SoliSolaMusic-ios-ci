import { addEventListener, getLocales } from 'react-native-localize'

export const getDeviceLanguageTags = (): string[] =>
  getLocales().map(({ languageTag }) => languageTag)

export const subscribeToDeviceLocaleChanges = (listener: () => void) =>
  addEventListener('change', listener)
