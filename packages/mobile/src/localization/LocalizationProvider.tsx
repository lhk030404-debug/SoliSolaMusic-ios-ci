import type { ReactNode } from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import type {
  LaunchLocale,
  LocalePreference,
  LocalizationRuntime,
} from '@solisola/localization'
import {
  changeRuntimeLocale,
  createLocalization,
  I18nextProvider,
  resolveLocale,
} from '@solisola/localization'

import {
  getDeviceLanguageTags,
  subscribeToDeviceLocaleChanges,
} from './deviceLocale'
import { readLocalePreference, writeLocalePreference } from './storage'

type LocalizationContextValue = {
  locale: LaunchLocale
  preference: LocalePreference
  setLocalePreference: (preference: LocalePreference) => Promise<void>
}

const LocalizationContext = createContext<LocalizationContextValue | null>(null)

type LocalizationProviderProps = {
  children: ReactNode
  /** Optional account locale; no backend field is introduced by this task. */
  accountLocale?: string | null
}

export const LocalizationProvider = ({
  children,
  accountLocale,
}: LocalizationProviderProps) => {
  const [runtime, setRuntime] = useState<LocalizationRuntime | null>(null)
  const [preference, setPreference] = useState<LocalePreference>('system')
  const [locale, setLocale] = useState<LaunchLocale>('en')
  const [initializationError, setInitializationError] = useState<Error | null>(
    null,
  )

  useEffect(() => {
    let active = true
    const initialize = async () => {
      const manual = await readLocalePreference()
      const locale = resolveLocale({
        manual,
        account: accountLocale,
        device: getDeviceLanguageTags(),
      })
      const instance = await createLocalization(locale)
      if (active) {
        setPreference(manual ?? 'system')
        setLocale(locale)
        setRuntime(instance)
      }
    }
    initialize().catch((error: unknown) => {
      if (active) {
        setInitializationError(
          error instanceof Error
            ? error
            : new Error('Localization initialization failed'),
        )
      }
    })
    return () => {
      active = false
    }
  }, [accountLocale])

  const setLocalePreference = useCallback(
    async (next: LocalePreference) => {
      await writeLocalePreference(next)
      const locale = resolveLocale({
        manual: next,
        account: accountLocale,
        device: getDeviceLanguageTags(),
      })
      if (runtime) await changeRuntimeLocale(runtime, locale)
      setLocale(locale)
      setPreference(next)
    },
    [accountLocale, runtime],
  )

  useEffect(() => {
    if (!runtime || preference !== 'system') return undefined
    return subscribeToDeviceLocaleChanges(() => {
      const next = resolveLocale({
        manual: 'system',
        account: accountLocale,
        device: getDeviceLanguageTags(),
      })
      changeRuntimeLocale(runtime, next)
        .then(setLocale)
        .catch((error: unknown) => {
          setInitializationError(
            error instanceof Error ? error : new Error('Locale change failed'),
          )
        })
    })
  }, [accountLocale, preference, runtime])

  const value = useMemo<LocalizationContextValue | null>(() => {
    if (!runtime) return null
    return { locale, preference, setLocalePreference }
  }, [locale, preference, runtime, setLocalePreference])

  if (initializationError) throw initializationError
  if (!runtime || !value) return null
  return (
    <LocalizationContext.Provider value={value}>
      <I18nextProvider i18n={runtime}>{children}</I18nextProvider>
    </LocalizationContext.Provider>
  )
}

export const useLocalization = (): LocalizationContextValue => {
  const value = useContext(LocalizationContext)
  if (!value)
    throw new Error('useLocalization must be used within LocalizationProvider')
  return value
}
