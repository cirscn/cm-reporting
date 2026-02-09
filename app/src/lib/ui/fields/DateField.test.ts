import { describe, expect, test } from 'vitest'

import { resolveDateFieldValue } from './dateFieldValue'

describe('resolveDateFieldValue', () => {
  test('ISO 日期可被严格解析并保持不变', () => {
    const parsed = resolveDateFieldValue('2026-02-09')
    expect(parsed?.format('YYYY-MM-DD')).toBe('2026-02-09')
  })

  test('展示格式可走兜底解析，便于历史值兼容', () => {
    const parsed = resolveDateFieldValue('09-Feb-2026')
    expect(parsed?.format('YYYY-MM-DD')).toBe('2026-02-09')
  })

  test('无效日期字符串返回 undefined，避免传入 DatePicker 异常值', () => {
    expect(resolveDateFieldValue('2026/02/09')).toBeUndefined()
  })

  test('返回值具备 rc-picker 依赖的周相关能力', () => {
    const parsed = resolveDateFieldValue('2026-02-09')
    expect(typeof (parsed as unknown as { weekday?: unknown })?.weekday).toBe('function')
    expect(typeof (parsed as unknown as { week?: unknown })?.week).toBe('function')
    expect(typeof (parsed as unknown as { weekYear?: unknown })?.weekYear).toBe('function')
    expect(typeof (parsed as unknown as { localeData?: unknown })?.localeData).toBe('function')
  })
})
