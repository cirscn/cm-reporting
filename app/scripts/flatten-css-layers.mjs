/**
 * @file flatten-css-layers.mjs
 * @description 将库产物 CSS 中的 @layer 原位展开为纯 CSS 规则。
 */

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import postcss from 'postcss'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const targetCssPath = path.resolve(__dirname, '../dist/cm-reporting.css')

const start = process.hrtime.bigint()

const source = await readFile(targetCssPath, 'utf8')
const beforeBytes = Buffer.byteLength(source, 'utf8')

const root = postcss.parse(source, { from: targetCssPath })

let flattenedLayerCount = 0

root.walkAtRules((atRule) => {
  if (atRule.name !== 'layer') {
    return
  }

  flattenedLayerCount += 1

  if (atRule.nodes && atRule.nodes.length > 0) {
    atRule.replaceWith(...atRule.nodes)
    return
  }

  atRule.remove()
})

const outputCss = root.toString()
await writeFile(targetCssPath, outputCss, 'utf8')

const reparsedRoot = postcss.parse(outputCss, { from: targetCssPath })

let hasLayerDirective = false
let hasTailwindDirective = false
let hasConfigDirective = false
let hasTailwindImportDirective = false

reparsedRoot.walkAtRules((atRule) => {
  if (atRule.name === 'layer') {
    hasLayerDirective = true
  }

  if (atRule.name === 'tailwind') {
    hasTailwindDirective = true
  }

  if (atRule.name === 'config') {
    hasConfigDirective = true
  }

  if (atRule.name === 'import' && /tailwindcss/i.test(atRule.params)) {
    hasTailwindImportDirective = true
  }
})

if (hasLayerDirective || hasTailwindDirective || hasConfigDirective || hasTailwindImportDirective) {
  console.error(
    [
      '[flatten-css-layers] 检测到残留 Tailwind 指令，构建失败。',
      `@layer=${hasLayerDirective}`,
      `@tailwind=${hasTailwindDirective}`,
      `@config=${hasConfigDirective}`,
      `@import-tailwindcss=${hasTailwindImportDirective}`,
    ].join(' '),
  )

  process.exit(1)
}

const afterBytes = Buffer.byteLength(outputCss, 'utf8')
const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000

console.log(
  [
    '[flatten-css-layers] 完成。',
    `file=${path.relative(process.cwd(), targetCssPath)}`,
    `flattenedLayers=${flattenedLayerCount}`,
    `bytesBefore=${beforeBytes}`,
    `bytesAfter=${afterBytes}`,
    `durationMs=${durationMs.toFixed(2)}`,
  ].join(' '),
)
