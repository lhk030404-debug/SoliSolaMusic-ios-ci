import designTokenContract from '../../../../../config/DESIGN_TOKENS.json'

export const soliSolaTokens = designTokenContract.tokens

export type SoliSolaTokens = typeof soliSolaTokens
export type SoliSolaColorMode = keyof SoliSolaTokens['color']

/** Resolve timing tokens without making motion accessibility a component concern. */
export const getSoliSolaMotion = (prefersReducedMotion = false) => ({
  durationMs: prefersReducedMotion
    ? soliSolaTokens.motion.reduced_duration_ms
    : soliSolaTokens.motion.duration_ms,
  easing: soliSolaTokens.motion.easing
})

/** CSS custom properties for consumers that cannot access the Emotion theme. */
export const getSoliSolaCssVariables = (mode: SoliSolaColorMode) => {
  const color = soliSolaTokens.color[mode]
  return {
    '--solisola-color-background': color.background,
    '--solisola-color-surface': color.surface,
    '--solisola-color-text': color.text,
    '--solisola-color-text-subdued': color.text_subdued,
    '--solisola-color-primary': color.brand_primary,
    '--solisola-color-secondary': color.brand_secondary,
    '--solisola-color-accent': color.brand_accent,
    '--solisola-color-focus': color.focus,
    '--solisola-font-family': soliSolaTokens.typography.font_family.web
  } as const
}
