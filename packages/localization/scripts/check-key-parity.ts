/* eslint-disable no-console -- This CLI reports gate diagnostics to stdout/stderr. */

import {
  type LocaleResourceMap,
  validateLocaleResources
} from '../src/governance'
import en from '../src/locales/en.json'
import zhHans from '../src/locales/zh-Hans.json'
import zhHant from '../src/locales/zh-Hant.json'

const resources = {
  en,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant
} as LocaleResourceMap

const issues = validateLocaleResources(resources)
if (issues.length > 0) {
  console.error(`FAIL localization parity (${issues.length} issues)`)
  for (const issue of issues) {
    console.error(
      `${issue.locale}\t${issue.key}\t${issue.code}\t${issue.detail}`
    )
  }
  process.exitCode = 1
} else {
  console.log('PASS localization parity: en, zh-Hans, zh-Hant')
}
