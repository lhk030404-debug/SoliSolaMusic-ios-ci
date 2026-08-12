/* eslint-disable no-console -- This CLI reports gate diagnostics to stdout/stderr. */

import { execFileSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

import {
  compareFindingsToBaseline,
  type HardcodedBaseline,
  type HardcodedFinding,
  scanRepository,
  toBaseline
} from '../src/hardcodedScanner'

const repositoryRoot = resolve(__dirname, '../../..')
const baselinePath = resolve(
  repositoryRoot,
  'packages/localization/baselines/hardcoded-copy.json'
)
const options = new Set(process.argv.slice(2))
const allowedOptions = new Set(['--all', '--strict', '--write-baseline'])

for (const option of options) {
  if (!allowedOptions.has(option)) {
    throw new Error(`unknown option: ${option}`)
  }
}

const currentSha = () =>
  execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: repositoryRoot,
    encoding: 'utf8'
  }).trim()

const printFinding = (item: HardcodedFinding) =>
  console.log(
    `${item.path}:${item.line}:${item.column}\t${item.kind}\t${JSON.stringify(item.value)}`
  )

const findings = scanRepository(repositoryRoot)

if (options.has('--write-baseline')) {
  const baseline = toBaseline(findings, currentSha())
  writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`, 'utf8')
  console.log(
    `WROTE hardcoded-copy legacy baseline: ${findings.length} findings (${baseline.entries.length} distinct fingerprints)`
  )
} else if (!existsSync(baselinePath)) {
  throw new Error(
    `missing ${baselinePath}; an explicit reviewed --write-baseline is required`
  )
} else {
  const baseline = JSON.parse(
    readFileSync(baselinePath, 'utf8')
  ) as HardcodedBaseline
  const { newFindings } = compareFindingsToBaseline(findings, baseline)

  if (options.has('--all')) findings.forEach(printFinding)
  console.log(
    `Hardcoded-copy inventory: ${findings.length} current; ${baseline.total} legacy baseline; ${newFindings.length} new/changed`
  )

  if (options.has('--strict') && findings.length > 0) {
    console.error(
      'FAIL strict hardcoded-copy check: repository findings remain'
    )
    process.exitCode = 1
  } else if (newFindings.length > 0) {
    newFindings.forEach(printFinding)
    console.error(
      'FAIL hardcoded-copy regression: new or changed user-visible literals found'
    )
    process.exitCode = 1
  } else {
    console.log('PASS hardcoded-copy regression: no new or changed findings')
  }
}
