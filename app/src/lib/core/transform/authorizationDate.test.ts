import { describe, expect, test } from 'vitest'

import { normalizeAuthorizationDateInput } from './index'

describe('normalizeAuthorizationDateInput', () => {
  test('keeps ISO format unchanged', () => {
    expect(normalizeAuthorizationDateInput('2026-02-09')).toBe('2026-02-09')
  })

  test('converts millisecond timestamp to ISO date', () => {
    expect(normalizeAuthorizationDateInput(1770595200000)).toBe('2026-02-09')
  })

  test('converts second timestamp to ISO date', () => {
    expect(normalizeAuthorizationDateInput(1770595200)).toBe('2026-02-09')
  })

  test('converts numeric timestamp string to ISO date', () => {
    expect(normalizeAuthorizationDateInput('1770595200000')).toBe('2026-02-09')
    expect(normalizeAuthorizationDateInput('1770595200')).toBe('2026-02-09')
  })

  test('handles older timestamps correctly by digit-based detection', () => {
    expect(normalizeAuthorizationDateInput(946684800000)).toBe('2000-01-01')
    expect(normalizeAuthorizationDateInput(946684800)).toBe('2000-01-01')
    expect(normalizeAuthorizationDateInput('946684800000')).toBe('2000-01-01')
    expect(normalizeAuthorizationDateInput('946684800')).toBe('2000-01-01')
  })

  test('returns original value for unsupported input and lets schema reject it', () => {
    expect(normalizeAuthorizationDateInput('2026/02/09')).toBe('2026/02/09')
    expect(normalizeAuthorizationDateInput('999')).toBe('999')
    expect(normalizeAuthorizationDateInput(Number.NaN)).toBe('NaN')
  })
})
