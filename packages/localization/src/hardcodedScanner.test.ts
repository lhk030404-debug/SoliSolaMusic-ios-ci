import {
  compareFindingsToBaseline,
  scanKotlinSource,
  scanSwiftSource,
  scanTypeScriptSource,
  toBaseline
} from './hardcodedScanner'

describe('hardcoded copy scanner', () => {
  test('finds JSX text and user-visible JSX attributes', () => {
    const findings = scanTypeScriptSource(
      'screen.tsx',
      `
        export const Screen = () => (
          <View>
            <Text>Hello listener</Text>
            <Input title="Display name" label={'Artist'} placeholder="Search music" />
            <Button accessibilityLabel="Play track" aria-label="Open player" />
          </View>
        )
      `
    )
    expect(findings.map(({ kind }) => kind)).toEqual(
      expect.arrayContaining([
        'jsx_text',
        'jsx_attribute:title',
        'jsx_attribute:label',
        'jsx_attribute:placeholder',
        'jsx_attribute:accessibilityLabel',
        'jsx_attribute:aria-label'
      ])
    )
  })

  test('finds message objects, alerts, and toasts', () => {
    const findings = scanTypeScriptSource(
      'feedback.ts',
      `
        const messages = { title: 'Upload failed', description: 'Try again' }
        Alert.alert('Microphone unavailable', 'Check system settings')
        toast({ content: 'Saved to your library' })
      `
    )
    expect(findings.map(({ value }) => value)).toEqual(
      expect.arrayContaining([
        'Upload failed',
        'Try again',
        'Microphone unavailable',
        'Check system settings',
        'Saved to your library'
      ])
    )
  })

  test('excludes URLs, test IDs, logs, enums, tests/fixtures, and UGC variables', () => {
    const source = `
      enum State { Ready = 'Ready' }
      const url = 'https://solisola.example/path'
      console.log('diagnostic only')
      logger.warn('not user visible')
      const view = <Text testID="profile-title">{post.body}</Text>
    `
    expect(scanTypeScriptSource('screen.tsx', source)).toEqual([])
    expect(
      scanTypeScriptSource('screen.test.tsx', '<Text>Fixture title</Text>')
    ).toEqual([])
    expect(
      scanTypeScriptSource('fixtures/post.tsx', '<Text>Fixture body</Text>')
    ).toEqual([])
    expect(
      scanTypeScriptSource(
        'web-player/WebPlayer.d.ts',
        'declare const playerTitle: "Visible type literal"'
      )
    ).toEqual([])
  })

  test('finds targeted Swift and Kotlin UI copy without flagging resources or logs', () => {
    expect(
      scanSwiftSource(
        'Player.swift',
        'Text("Play now")\n.navigationTitle("Music")\nprint("debug")'
      ).map(({ value }) => value)
    ).toEqual(['Play now', 'Music'])
    expect(
      scanKotlinSource(
        'Player.kt',
        'Text("Play now")\ncontentDescription = "Player"\nLog.d("tag", "debug")'
      ).map(({ value }) => value)
    ).toEqual(['Play now', 'Player'])
  })

  test('baseline blocks additions and changed copy but permits removals', () => {
    const original = scanTypeScriptSource(
      'screen.tsx',
      '<Text>Hello listener</Text>'
    )
    const baseline = toBaseline(original, 'test-sha')
    expect(compareFindingsToBaseline([], baseline).newFindings).toEqual([])
    expect(compareFindingsToBaseline(original, baseline).newFindings).toEqual(
      []
    )

    const changed = scanTypeScriptSource(
      'screen.tsx',
      '<Text>Hello artist</Text>'
    )
    expect(compareFindingsToBaseline(changed, baseline).newFindings).toEqual(
      changed
    )
  })
})
