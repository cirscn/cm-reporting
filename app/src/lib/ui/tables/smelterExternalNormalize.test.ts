/**
 * @file ui/tables/smelterExternalNormalize.test.ts
 * @description 外部冶炼厂 ID 归一化测试。
 */

import { describe, expect, test } from 'vitest'

import { hasExternalSmelterIdInput, resolveExternalSmelterId } from './smelterExternalNormalize'

describe('resolveExternalSmelterId', () => {
  test('优先使用 smelterId', () => {
    expect(resolveExternalSmelterId({ smelterId: 'SM-001', id: 'CID-001' })).toBe('SM-001')
  })

  test('smelterId 为空时使用 id 兜底', () => {
    expect(resolveExternalSmelterId({ smelterId: '   ', id: 'CID-002' })).toBe('CID-002')
  })

  test('两者都为空时返回空字符串', () => {
    expect(resolveExternalSmelterId({ smelterId: '  ', id: '  ' })).toBe('')
    expect(resolveExternalSmelterId({})).toBe('')
  })
})

describe('hasExternalSmelterIdInput', () => {
  test('显式传 smelterId 或 id 时返回 true', () => {
    expect(hasExternalSmelterIdInput({ smelterId: '' })).toBe(true)
    expect(hasExternalSmelterIdInput({ id: '' })).toBe(true)
    expect(hasExternalSmelterIdInput({ smelterId: 'SM-001' })).toBe(true)
    expect(hasExternalSmelterIdInput({ id: 'CID-001' })).toBe(true)
  })

  test('未传 smelterId 与 id 时返回 false', () => {
    expect(hasExternalSmelterIdInput({})).toBe(false)
  })
})
