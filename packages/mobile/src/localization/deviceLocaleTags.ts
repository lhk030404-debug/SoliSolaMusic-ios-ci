type LanguageTagLocale = Readonly<{ languageTag: string }>

export const getLanguageTagsFromLocales = (
  locales: readonly LanguageTagLocale[]
): string[] => locales.map(({ languageTag }) => languageTag)
