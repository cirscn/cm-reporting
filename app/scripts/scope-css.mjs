import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import postcss from 'postcss'

const SCOPE_SELECTOR = '.cm-reporting-scope'
const PREFLIGHT_BOX_RESET_SELECTORS = new Set(['*', '::after', '::before', '::backdrop', '::file-selector-button'])
const PREFLIGHT_FORM_RESET_SELECTORS = new Set([
  'button',
  'input',
  'select',
  'optgroup',
  'textarea',
  '::file-selector-button',
])
const TRANSPARENT_VALUES = new Set(['#0000', 'transparent'])
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const sourceCssPath = path.resolve(__dirname, '../dist/cm-reporting.css')
const targetCssPath = path.resolve(__dirname, '../dist/cm-reporting.scoped.css')

function normalizeDeclarationValue(value) {
  return value.replace(/\s+/g, '').toLowerCase()
}

function ruleHasDeclaration(rule, property, value) {
  const normalizedValue = normalizeDeclarationValue(value)
  let hasDeclaration = false

  rule.walkDecls(property, (decl) => {
    if (normalizeDeclarationValue(decl.value) === normalizedValue) {
      hasDeclaration = true
    }
  })

  return hasDeclaration
}

function ruleHasAnyDeclarationValue(rule, property, values) {
  let hasDeclaration = false

  rule.walkDecls(property, (decl) => {
    if (values.has(normalizeDeclarationValue(decl.value))) {
      hasDeclaration = true
    }
  })

  return hasDeclaration
}

function selectorSetMatches(selector, expectedSelectors) {
  const selectors = splitSelectorList(selector).map((item) => item.trim())

  if (selectors.length !== expectedSelectors.size) {
    return false
  }

  return selectors.every((item) => expectedSelectors.has(item))
}

function isTailwindPreflightResetRule(rule) {
  if (
    selectorSetMatches(rule.selector, PREFLIGHT_BOX_RESET_SELECTORS) &&
    ruleHasDeclaration(rule, 'box-sizing', 'border-box') &&
    ruleHasDeclaration(rule, 'border', '0 solid') &&
    ruleHasDeclaration(rule, 'margin', '0') &&
    ruleHasDeclaration(rule, 'padding', '0')
  ) {
    return true
  }

  return (
    selectorSetMatches(rule.selector, PREFLIGHT_FORM_RESET_SELECTORS) &&
    ruleHasDeclaration(rule, 'font', 'inherit') &&
    ruleHasAnyDeclarationValue(rule, 'background-color', TRANSPARENT_VALUES) &&
    ruleHasDeclaration(rule, 'border-radius', '0')
  )
}

function scopeSelector(selector) {
  const trimmedSelector = selector.trim()

  if (!trimmedSelector) {
    return selector
  }

  if (trimmedSelector === ':root' || trimmedSelector === ':host') {
    return SCOPE_SELECTOR
  }

  if (trimmedSelector === 'html' || trimmedSelector === 'body') {
    return SCOPE_SELECTOR
  }

  if (trimmedSelector.startsWith(`${SCOPE_SELECTOR}`)) {
    return trimmedSelector
  }

  return `${SCOPE_SELECTOR} ${trimmedSelector}`
}

function splitSelectorList(selector) {
  const selectors = []
  let current = ''
  let depth = 0

  for (const char of selector) {
    if (char === '(' || char === '[') depth += 1
    if (char === ')' || char === ']') depth -= 1

    if (char === ',' && depth === 0) {
      selectors.push(current)
      current = ''
      continue
    }

    current += char
  }

  if (current) {
    selectors.push(current)
  }

  return selectors
}

function scopeRule(rule) {
  rule.selector = splitSelectorList(rule.selector).map(scopeSelector).join(',')
}

function removeGlobalTailwindPropertyRegistrations(root) {
  root.walkAtRules('property', (atRule) => {
    if (atRule.params.trim().startsWith('--tw-')) {
      atRule.remove()
    }
  })
}

function removeTailwindPreflightResets(root) {
  root.walkRules((rule) => {
    if (isTailwindPreflightResetRule(rule)) {
      rule.remove()
    }
  })
}

export function scopeCss(source) {
  const root = postcss.parse(source)

  removeGlobalTailwindPropertyRegistrations(root)
  removeTailwindPreflightResets(root)

  root.walkRules((rule) => {
    if (!rule.selector) {
      return
    }

    if (rule.parent?.type === 'atrule' && rule.parent.name === 'keyframes') {
      return
    }

    scopeRule(rule)
  })

  return root.toString()
}

async function main() {
  const start = process.hrtime.bigint()
  const source = await readFile(sourceCssPath, 'utf8')
  const scopedCss = scopeCss(source)

  await writeFile(targetCssPath, scopedCss, 'utf8')

  const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000

  console.log(
    [
      '[scope-css] 完成。',
      `source=${path.relative(process.cwd(), sourceCssPath)}`,
      `target=${path.relative(process.cwd(), targetCssPath)}`,
      `bytes=${Buffer.byteLength(scopedCss, 'utf8')}`,
      `durationMs=${durationMs.toFixed(2)}`,
    ].join(' '),
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main()
}
