import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import postcss from 'postcss'
import { describe, expect, test } from 'vitest'

const css = postcss.parse(readFileSync(resolve(process.cwd(), 'src/lib/form-overrides.css'), 'utf8'))

describe('自定义冶炼厂查找输入文字颜色', () => {
  test.each(['ant-select-selection-search-input', 'ant-select-input'])(
    '%s 使用主题错误色覆盖只读文字颜色',
    (inputClassName) => {
      const declarations: Record<string, string> = {}
      const selector = `.smelter-list-table .cm-smelter-row-custom .${inputClassName}`
      css.walkRules((rule) => {
        if (!rule.selectors.includes(selector)) return
        rule.walkDecls((declaration) => {
          declarations[declaration.prop] = `${declaration.value}${declaration.important ? ' !important' : ''}`
        })
      })

      expect(declarations.color).toBe('var(--app-error) !important')
      expect(declarations['-webkit-text-fill-color']).toBe('var(--app-error) !important')
    },
  )
})
