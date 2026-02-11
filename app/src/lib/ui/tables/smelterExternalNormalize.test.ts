/**
 * @file ui/tables/smelterExternalNormalize.test.ts
 * @description 外部冶炼厂 ID 归一化测试。
 */

import { describe, expect, test } from 'vitest'

import {
  buildNewSmelterRowId,
  hasDuplicateSmelterSelectionForMetal,
  hasExternalSmelterNumberInput,
  isTemporarySmelterRowId,
  resolveExternalSmelterId,
  resolveExternalSmelterRowId,
  resolveSmelterSelectionKey,
  shouldDisableSmelterFieldsAfterExternalPick,
} from './smelterExternalNormalize'

describe('resolveExternalSmelterId', () => {
  test('仅使用 smelterNumber', () => {
    expect(resolveExternalSmelterId({ smelterNumber: 'CID-001' })).toBe('CID-001')
    expect(resolveExternalSmelterId({ smelterNumber: ' CID-002 ' })).toBe('CID-002')
  })

  test('未传 smelterNumber 或为空时返回空字符串', () => {
    expect(resolveExternalSmelterId({ smelterId: 'SM-001', id: 'ROW-001' })).toBe('')
    expect(resolveExternalSmelterId({ smelterNumber: '  ' })).toBe('')
    expect(resolveExternalSmelterId({})).toBe('')
  })
})

describe('hasExternalSmelterNumberInput', () => {
  test('显式传 smelterNumber 时返回 true', () => {
    expect(hasExternalSmelterNumberInput({ smelterNumber: '' })).toBe(true)
    expect(hasExternalSmelterNumberInput({ smelterNumber: 'CID-001' })).toBe(true)
  })

  test('未传 smelterNumber 时返回 false', () => {
    expect(hasExternalSmelterNumberInput({ smelterId: 'SM-001', id: 'ROW-001' })).toBe(false)
    expect(hasExternalSmelterNumberInput({})).toBe(false)
  })
})

describe('buildNewSmelterRowId / isTemporarySmelterRowId', () => {
  test('新增行使用 smelter-new- 前缀', () => {
    const id = buildNewSmelterRowId(123)
    expect(id).toBe('smelter-new-123')
    expect(isTemporarySmelterRowId(id)).toBe(true)
  })

  test('非临时 ID 返回 false', () => {
    expect(isTemporarySmelterRowId('SM-001')).toBe(false)
  })
})

describe('resolveExternalSmelterRowId', () => {
  test('宿主回写 id 时覆盖当前行 id', () => {
    expect(resolveExternalSmelterRowId({ id: ' SM-001 ' }, 'smelter-new-1')).toBe('SM-001')
  })

  test('宿主未回写 id 时保留当前行 id（即使回写了 smelterNumber）', () => {
    expect(resolveExternalSmelterRowId({ smelterNumber: ' CID003469 ' }, 'smelter-new-1')).toBe(
      'smelter-new-1',
    )
  })

  test('宿主未回写 id 时保留当前行 id', () => {
    expect(resolveExternalSmelterRowId({}, 'smelter-new-1')).toBe('smelter-new-1')
    expect(resolveExternalSmelterRowId({ id: '   ' }, 'smelter-new-1')).toBe('smelter-new-1')
  })
})

describe('resolveSmelterSelectionKey', () => {
  test('仅使用非临时 row id', () => {
    expect(resolveSmelterSelectionKey({ id: 'ROW-2' })).toBe('ROW-2')
  })

  test('临时 row id 时，不产生判重键', () => {
    expect(resolveSmelterSelectionKey({ id: 'smelter-new-2' })).toBe('')
  })
})

describe('hasDuplicateSmelterSelectionForMetal', () => {
  test('同一 metal + 同一 row id 判定为重复', () => {
    expect(
      hasDuplicateSmelterSelectionForMetal({
        currentRows: [
          { id: 'ROW-1', metal: 'gold' },
          { id: 'ROW-2', metal: 'tin' },
        ],
        currentRowId: 'ROW-2',
        nextRow: { id: 'ROW-1', metal: 'gold' },
      }),
    ).toBe(true)
  })

  test('不同 metal 即使 row id 相同也不重复', () => {
    expect(
      hasDuplicateSmelterSelectionForMetal({
        currentRows: [{ id: 'ROW-1', metal: 'gold' }],
        currentRowId: 'ROW-2',
        nextRow: { id: 'ROW-1', metal: 'tin' },
      }),
    ).toBe(false)
  })

  test('按回写 id 判重（临时 id 不参与）', () => {
    expect(
      hasDuplicateSmelterSelectionForMetal({
        currentRows: [
          { id: 'SM-EXT-1', metal: 'gold' },
          { id: 'smelter-new-3', metal: 'gold' },
        ],
        currentRowId: 'ROW-2',
        nextRow: { id: 'SM-EXT-1', metal: 'gold' },
      }),
    ).toBe(true)
  })

  test('缺少 metal 或判重键时不判重', () => {
    expect(
      hasDuplicateSmelterSelectionForMetal({
        currentRows: [{ id: 'ROW-1', metal: 'gold' }],
        currentRowId: 'ROW-2',
        nextRow: { id: 'smelter-new-4', metal: '' },
      }),
    ).toBe(false)
  })
})

describe('shouldDisableSmelterFieldsAfterExternalPick', () => {
  test('非 external lookup 模式不锁定', () => {
    expect(
      shouldDisableSmelterFieldsAfterExternalPick({
        useExternalLookup: false,
        row: { id: 'CID-1', smelterLookup: 'Smelter A' },
        fromLookup: true,
        notListed: false,
        notYetIdentified: false,
      }),
    ).toBe(false)
  })

  test('not listed / not yet identified 不锁定', () => {
    expect(
      shouldDisableSmelterFieldsAfterExternalPick({
        useExternalLookup: true,
        row: { id: 'CID-1', smelterLookup: 'Smelter not listed' },
        fromLookup: false,
        notListed: true,
        notYetIdentified: false,
      }),
    ).toBe(false)
    expect(
      shouldDisableSmelterFieldsAfterExternalPick({
        useExternalLookup: true,
        row: { id: 'CID-1', smelterLookup: 'Smelter not yet identified' },
        fromLookup: false,
        notListed: false,
        notYetIdentified: true,
      }),
    ).toBe(false)
  })

  test('外部选择且来自 lookup 数据时锁定', () => {
    expect(
      shouldDisableSmelterFieldsAfterExternalPick({
        useExternalLookup: true,
        row: { id: 'smelter-new-1', smelterLookup: 'Smelter A' },
        fromLookup: true,
        notListed: false,
        notYetIdentified: false,
      }),
    ).toBe(true)
  })

  test('外部选择后行 id 已被宿主覆盖时也锁定', () => {
    expect(
      shouldDisableSmelterFieldsAfterExternalPick({
        useExternalLookup: true,
        row: { id: 'CID003469', smelterLookup: 'Fairsky Industrial Co., Limited' },
        fromLookup: false,
        notListed: false,
        notYetIdentified: false,
      }),
    ).toBe(true)
  })

  test('临时行 id 且未识别为 lookup 时不锁定', () => {
    expect(
      shouldDisableSmelterFieldsAfterExternalPick({
        useExternalLookup: true,
        row: { id: 'smelter-new-2', smelterLookup: 'Smelter A' },
        fromLookup: false,
        notListed: false,
        notYetIdentified: false,
      }),
    ).toBe(false)
  })
})
