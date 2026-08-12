import fs from 'fs'
import path from 'path'

import { evaluateRoutePolicy } from '../../feature-policy/routePolicy'

import licenseSnapshot from './licenses.snapshot.json'
import {
  LANGUAGE_OPTIONS,
  OFFLINE_SETTINGS_ROUTES,
  selectSettingsLanguage
} from './settingsExperience'

const repositoryRoot = path.resolve(__dirname, '../../../../..')

describe('SoliSola settings experience', () => {
  it('offers every launch locale plus the system preference', () => {
    expect(LANGUAGE_OPTIONS).toEqual(['system', 'en', 'zh-Hans', 'zh-Hant'])
  })

  it('applies the selected preference through the live localization provider', async () => {
    const setLocalePreference = jest.fn().mockResolvedValue(undefined)
    await selectSettingsLanguage(setLocalePreference, 'zh-Hant')
    expect(setLocalePreference).toHaveBeenCalledWith('zh-Hant')

    const provider = fs.readFileSync(
      path.join(
        repositoryRoot,
        'packages/mobile/src/localization/LocalizationProvider.tsx'
      ),
      'utf8'
    )
    const persistence = provider.indexOf('await writeLocalePreference(next)')
    const liveChange = provider.indexOf(
      'await changeRuntimeLocale(runtime, locale)'
    )
    expect(persistence).toBeGreaterThan(-1)
    expect(liveChange).toBeGreaterThan(persistence)
    expect(provider).toContain('setLocale(locale)')
  })

  it('registers language, licenses, and about as direct policy routes', () => {
    expect(OFFLINE_SETTINGS_ROUTES).toEqual([
      'LanguageSettingsScreen',
      'LicensesScreen',
      'AboutScreen'
    ])
    const navigator = fs.readFileSync(
      path.join(
        repositoryRoot,
        'packages/mobile/src/screens/app-screen/AppTabScreen.tsx'
      ),
      'utf8'
    )
    for (const route of OFFLINE_SETTINGS_ROUTES) {
      expect(evaluateRoutePolicy(route, 'direct')).toMatchObject({
        isAllowed: true,
        feature: 'profile_and_library'
      })
      expect(navigator).toContain(`isDirectRouteAllowed('${route}')`)
      expect(navigator).toContain(`name='${route}'`)
    }
  })

  it('keeps all three screens offline and removes Audius branding and links', () => {
    for (const file of [
      'LanguageSettingsScreen.tsx',
      'LicensesScreen.tsx',
      'AboutScreen.tsx'
    ]) {
      const source = fs.readFileSync(path.join(__dirname, file), 'utf8')
      expect(source).toContain('isOfflineCapable')
      expect(source).not.toMatch(/https?:\/\//i)
      expect(source).not.toMatch(/IconAudiusLogo|AUDIUS_[A-Z_]+|audius\.co/i)
      expect(source).not.toMatch(
        /Terms of Service|Privacy Policy|Careers|Discord|Instagram|Follow us/i
      )
    }
  })

  it('ships the exact root license and audited third-party facts offline', () => {
    expect(
      licenseSnapshot.rootLicenseText.replace(/\r\n/g, '\n').trimEnd()
    ).toBe(
      fs
        .readFileSync(path.join(repositoryRoot, 'LICENSE'), 'utf8')
        .replace(/\r\n/g, '\n')
        .trimEnd()
    )
    expect(licenseSnapshot.thirdParty.status).toBe(
      'inventory-complete-compliance-not-clean'
    )
    expect(licenseSnapshot.thirdParty.sbomComponents).toBe(5475)
    expect(licenseSnapshot.thirdParty.npmOccurrences).toBe(10557)
    expect(licenseSnapshot.thirdParty.uniqueNpmPackages).toBe(6349)
    expect(
      licenseSnapshot.thirdPartyNoticeText.replace(/\r\n/g, '\n').trimEnd()
    ).toBe(
      fs
        .readFileSync(
          path.join(repositoryRoot, 'third-party/THIRD_PARTY_NOTICES.md'),
          'utf8'
        )
        .replace(/\r\n/g, '\n')
        .trimEnd()
    )
  })
})
