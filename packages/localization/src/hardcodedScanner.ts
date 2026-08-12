import { createHash } from 'crypto'
import { readdirSync, readFileSync, statSync } from 'fs'
import { extname, join, relative } from 'path'

import { parse } from '@babel/parser'

export const HARDCODED_SCANNER_VERSION = 1

export type HardcodedFinding = {
  path: string
  line: number
  column: number
  kind: string
  context: string
  value: string
  fingerprint: string
}

export type HardcodedBaselineEntry = Omit<
  HardcodedFinding,
  'line' | 'column' | 'fingerprint'
> & {
  fingerprint: string
  count: number
}

export type HardcodedBaseline = {
  schemaVersion: 1
  scannerVersion: number
  sourceSha: string
  scope: string[]
  total: number
  entries: HardcodedBaselineEntry[]
}

const TYPESCRIPT_EXTENSIONS = new Set(['.ts', '.tsx'])
const NATIVE_EXTENSIONS = new Set(['.swift', '.kt', '.kts'])
const EXCLUDED_PATH_SEGMENTS = new Set([
  '__fixtures__',
  '__mocks__',
  '__tests__',
  'e2e',
  'fixtures',
  'generated',
  'mocks',
  'node_modules',
  'snapshots',
  'test',
  'tests'
])
const JSX_ATTRIBUTES = new Set([
  'accessibilityHint',
  'accessibilityLabel',
  'alt',
  'aria-label',
  'caption',
  'description',
  'emptyText',
  'errorMessage',
  'header',
  'hint',
  'label',
  'placeholder',
  'subtitle',
  'title'
])
const MESSAGE_PROPERTIES = new Set([
  ...JSX_ATTRIBUTES,
  'ariaLabel',
  'buttonText',
  'content',
  'message'
])
const UI_CALLS = new Set([
  'Alert.alert',
  'Snackbar.show',
  'Toast.show',
  'alert',
  'showToast',
  'toast'
])
const LOG_CALL_PATTERN =
  /^(?:console|logger|log)\.(?:debug|error|info|log|warn)$/

const normalizePath = (value: string) => value.replace(/\\/g, '/')
const normalizeCopy = (value: string) => value.replace(/\s+/g, ' ').trim()

const isExcludedPath = (filePath: string) => {
  const normalized = normalizePath(filePath)
  const lower = normalized.toLowerCase()
  if (lower.endsWith('.d.ts')) return true
  if (/\.(?:spec|test)\.[^.]+$/.test(lower)) return true
  return lower.split('/').some((segment) => EXCLUDED_PATH_SEGMENTS.has(segment))
}

const looksUserVisible = (value: string) => {
  const normalized = normalizeCopy(value)
  if (!normalized || !/\p{L}/u.test(normalized)) return false
  if (/^(?:https?|mailto|tel|audius):\/\//i.test(normalized)) return false
  if (/^[a-z][a-z0-9]*(?:[._:/-][a-z0-9]+)+$/i.test(normalized)) return false
  return true
}

const fingerprintFor = (
  path: string,
  kind: string,
  context: string,
  value: string
) =>
  createHash('sha256')
    .update(
      `${normalizePath(path)}\0${kind}\0${context}\0${normalizeCopy(value)}`
    )
    .digest('hex')

const finding = (
  path: string,
  kind: string,
  context: string,
  value: string,
  location?: { line?: number; column?: number } | null
): HardcodedFinding => {
  const normalized = normalizeCopy(value)
  return {
    path: normalizePath(path),
    line: location?.line ?? 1,
    column: (location?.column ?? 0) + 1,
    kind,
    context,
    value: normalized,
    fingerprint: fingerprintFor(path, kind, context, normalized)
  }
}

const nodeString = (node: any): string | undefined => {
  if (!node) return undefined
  if (node.type === 'StringLiteral') return node.value
  if (node.type === 'Literal' && typeof node.value === 'string')
    return node.value
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis.map((part: any) => part.value.cooked ?? '').join('')
  }
  if (node.type === 'JSXExpressionContainer') return nodeString(node.expression)
  return undefined
}

const propertyName = (node: any): string | undefined => {
  if (!node) return undefined
  if (node.type === 'Identifier' || node.type === 'JSXIdentifier')
    return node.name
  if (node.type === 'StringLiteral') return node.value
  return undefined
}

const calleeName = (node: any): string => {
  if (!node) return ''
  if (node.type === 'Identifier') return node.name
  if (
    node.type === 'MemberExpression' ||
    node.type === 'OptionalMemberExpression'
  ) {
    const object = calleeName(node.object)
    const property = propertyName(node.property)
    return object && property ? `${object}.${property}` : (property ?? object)
  }
  return ''
}

const locationOf = (node: any) => node?.loc?.start

const addIfVisible = (
  findings: HardcodedFinding[],
  filePath: string,
  node: any,
  kind: string,
  context: string
) => {
  const value = nodeString(node)
  if (value !== undefined && looksUserVisible(value)) {
    findings.push(finding(filePath, kind, context, value, locationOf(node)))
  }
}

export const scanTypeScriptSource = (
  filePath: string,
  source: string
): HardcodedFinding[] => {
  if (isExcludedPath(filePath)) return []

  const ast = parse(source, {
    sourceType: 'unambiguous',
    errorRecovery: false,
    plugins: ['decorators-legacy', 'importAttributes', 'jsx', 'typescript']
  })
  const findings: HardcodedFinding[] = []

  const visit = (node: any, ancestors: any[]) => {
    if (!node || typeof node !== 'object') return
    const nextAncestors = [...ancestors, node]

    if (node.type === 'JSXText') {
      if (looksUserVisible(node.value)) {
        findings.push(
          finding(
            filePath,
            'jsx_text',
            'JSX child text',
            node.value,
            locationOf(node)
          )
        )
      }
    } else if (node.type === 'JSXAttribute') {
      const name = propertyName(node.name)
      if (name && JSX_ATTRIBUTES.has(name)) {
        addIfVisible(
          findings,
          filePath,
          node.value,
          `jsx_attribute:${name}`,
          name
        )
      }
    } else if (node.type === 'ObjectProperty' || node.type === 'Property') {
      const name = propertyName(node.key)
      const insideEnum = ancestors.some((ancestor) =>
        ['EnumDeclaration', 'TSEnumDeclaration'].includes(ancestor.type)
      )
      const callAncestor = [...ancestors]
        .reverse()
        .find((ancestor) => ancestor.type === 'CallExpression')
      const insideLogCall = callAncestor
        ? LOG_CALL_PATTERN.test(calleeName(callAncestor.callee))
        : false
      if (
        name &&
        MESSAGE_PROPERTIES.has(name) &&
        !insideEnum &&
        !insideLogCall
      ) {
        addIfVisible(
          findings,
          filePath,
          node.value,
          `object_property:${name}`,
          name
        )
      }
    } else if (node.type === 'CallExpression') {
      const name = calleeName(node.callee)
      if (UI_CALLS.has(name)) {
        node.arguments.forEach((argument: any, index: number) =>
          addIfVisible(
            findings,
            filePath,
            argument,
            `ui_call:${name}`,
            `argument:${index}`
          )
        )
      }
    }

    for (const [key, child] of Object.entries(node)) {
      if (['comments', 'errors', 'loc', 'start', 'end'].includes(key)) continue
      if (Array.isArray(child)) {
        child.forEach((item) => visit(item, nextAncestors))
      } else if (child && typeof child === 'object') {
        visit(child, nextAncestors)
      }
    }
  }

  visit(ast, [])
  return findings.sort(compareFinding)
}

type NativePattern = { kind: string; context: string; pattern: RegExp }

const scanNativeSource = (
  filePath: string,
  source: string,
  patterns: NativePattern[]
): HardcodedFinding[] => {
  if (isExcludedPath(filePath)) return []
  const findings: HardcodedFinding[] = []
  const lines = source.split(/\r?\n/)
  lines.forEach((line, lineIndex) => {
    patterns.forEach(({ kind, context, pattern }) => {
      const matcher = new RegExp(pattern.source, pattern.flags)
      for (const match of line.matchAll(matcher)) {
        const value = match.groups?.copy
        if (!value || !looksUserVisible(value)) continue
        findings.push(
          finding(filePath, kind, context, value, {
            line: lineIndex + 1,
            column: (match.index ?? 0) + 1
          })
        )
      }
    })
  })
  return findings.sort(compareFinding)
}

const swiftPatterns: NativePattern[] = [
  {
    kind: 'swift_ui_literal',
    context: 'SwiftUI initializer',
    pattern:
      /\b(?:Button|Label|Text|TextField|Toggle)\s*\(\s*"(?<copy>(?:\\.|[^"\\])*)"/g
  },
  {
    kind: 'swift_ui_modifier',
    context: 'SwiftUI visible/a11y modifier',
    pattern:
      /\.(?:accessibilityHint|accessibilityLabel|alert|navigationTitle)\s*\(\s*"(?<copy>(?:\\.|[^"\\])*)"/g
  }
]

const kotlinPatterns: NativePattern[] = [
  {
    kind: 'kotlin_ui_literal',
    context: 'Compose UI initializer',
    pattern:
      /\b(?:Button|Text)\s*\(\s*(?:text\s*=\s*)?"(?<copy>(?:\\.|[^"\\])*)"/g
  },
  {
    kind: 'kotlin_ui_property',
    context: 'Android visible/a11y property',
    pattern:
      /\b(?:contentDescription|label|placeholder)\s*=\s*"(?<copy>(?:\\.|[^"\\])*)"/g
  },
  {
    kind: 'kotlin_ui_toast',
    context: 'Android toast',
    pattern: /\bToast\.makeText\([^,]+,\s*"(?<copy>(?:\\.|[^"\\])*)"/g
  }
]

export const scanSwiftSource = (filePath: string, source: string) =>
  scanNativeSource(filePath, source, swiftPatterns)

export const scanKotlinSource = (filePath: string, source: string) =>
  scanNativeSource(filePath, source, kotlinPatterns)

const compareFinding = (left: HardcodedFinding, right: HardcodedFinding) =>
  `${left.path}:${String(left.line).padStart(8, '0')}:${left.kind}:${left.value}`.localeCompare(
    `${right.path}:${String(right.line).padStart(8, '0')}:${right.kind}:${right.value}`
  )

const listSourceFiles = (root: string, current: string): string[] => {
  const result: string[] = []
  for (const name of readdirSync(current).sort()) {
    const absolute = join(current, name)
    const relativePath = normalizePath(relative(root, absolute))
    if (isExcludedPath(relativePath)) continue
    const stats = statSync(absolute)
    if (stats.isDirectory()) result.push(...listSourceFiles(root, absolute))
    else if (
      TYPESCRIPT_EXTENSIONS.has(extname(name)) ||
      NATIVE_EXTENSIONS.has(extname(name))
    ) {
      result.push(absolute)
    }
  }
  return result
}

export const DEFAULT_SCAN_SCOPE = [
  'packages/common/src',
  'packages/mobile/android',
  'packages/mobile/ios',
  'packages/mobile/src',
  'packages/web/src'
]

export const scanRepository = (
  repositoryRoot: string,
  scope = DEFAULT_SCAN_SCOPE
): HardcodedFinding[] => {
  const findings: HardcodedFinding[] = []
  for (const scopePath of scope) {
    const absoluteScope = join(repositoryRoot, scopePath)
    for (const absolute of listSourceFiles(repositoryRoot, absoluteScope)) {
      const filePath = normalizePath(relative(repositoryRoot, absolute))
      const source = readFileSync(absolute, 'utf8')
      const extension = extname(absolute)
      try {
        if (TYPESCRIPT_EXTENSIONS.has(extension)) {
          findings.push(...scanTypeScriptSource(filePath, source))
        } else if (extension === '.swift') {
          findings.push(...scanSwiftSource(filePath, source))
        } else {
          findings.push(...scanKotlinSource(filePath, source))
        }
      } catch (error) {
        throw new Error(
          `hardcoded-copy parse failed for ${filePath}: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      }
    }
  }
  return findings.sort(compareFinding)
}

export const toBaseline = (
  findings: HardcodedFinding[],
  sourceSha: string,
  scope = DEFAULT_SCAN_SCOPE
): HardcodedBaseline => {
  const entries = new Map<string, HardcodedBaselineEntry>()
  for (const item of findings) {
    const existing = entries.get(item.fingerprint)
    if (existing) existing.count += 1
    else {
      entries.set(item.fingerprint, {
        fingerprint: item.fingerprint,
        path: item.path,
        kind: item.kind,
        context: item.context,
        value: item.value,
        count: 1
      })
    }
  }
  return {
    schemaVersion: 1,
    scannerVersion: HARDCODED_SCANNER_VERSION,
    sourceSha,
    scope: [...scope],
    total: findings.length,
    entries: [...entries.values()].sort((left, right) =>
      left.fingerprint.localeCompare(right.fingerprint)
    )
  }
}

export const compareFindingsToBaseline = (
  findings: HardcodedFinding[],
  baseline: HardcodedBaseline
) => {
  if (baseline.scannerVersion !== HARDCODED_SCANNER_VERSION) {
    throw new Error(
      `baseline scanner version ${baseline.scannerVersion} does not match ${HARDCODED_SCANNER_VERSION}`
    )
  }
  const remaining = new Map(
    baseline.entries.map((entry) => [entry.fingerprint, entry.count])
  )
  const newFindings: HardcodedFinding[] = []
  for (const item of findings) {
    const count = remaining.get(item.fingerprint) ?? 0
    if (count > 0) remaining.set(item.fingerprint, count - 1)
    else newFindings.push(item)
  }
  return { newFindings: newFindings.sort(compareFinding) }
}
