import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import postcss from 'postcss'

const SCOPE_SELECTOR = '.cm-reporting-scope'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const sourceCssPath = path.resolve(__dirname, '../dist/cm-reporting.css')
const targetCssPath = path.resolve(__dirname, '../dist/cm-reporting.scoped.css')

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

export function scopeCss(source) {
  const root = postcss.parse(source)

  removeGlobalTailwindPropertyRegistrations(root)

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
