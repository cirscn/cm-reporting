/**
 * @file examples/smelterRowClassName.test.ts
 * @description 验证 Examples 只追加宿主业务规则，不重复实现库内置标红。
 */

import { SMELTER_LOOKUP_META } from '@core/data/lookups'
import type { SmelterRow } from '@lib/index'
import { describe, expect, it } from 'vitest'

import {
  EXTERNAL_SMELTER_ROW_CLASS_NAME,
  getExampleSmelterRowClassName,
  SMELTER_ROW_CLASS_NAME_SEED_ROWS,
} from './smelterRowClassName'

function createRow(smelterLookup: string): SmelterRow {
  return {
    id: 'test-row',
    metal: 'Sn',
    smelterLookup,
    smelterName: '',
    smelterCountry: '',
  }
}

describe('Examples Smelter List 行样式', () => {
  it.each([
    SMELTER_LOOKUP_META.notListed,
    SMELTER_LOOKUP_META.notListed.toUpperCase(),
    SMELTER_LOOKUP_META.notYetIdentified,
    'Malaysia Smelting Corporation',
  ])('不为库内置标准值或 lookup 主数据追加宿主 class：%s', (lookup) => {
    expect(getExampleSmelterRowClassName(createRow(lookup))).toBe('')
  })

  it('只为 lookup 主数据之外的外部名称追加宿主 class', () => {
    expect(getExampleSmelterRowClassName(createRow('Some External Smelter Not In Lookup'))).toBe(
      EXTERNAL_SMELTER_ROW_CLASS_NAME
    )
  })

  it('专用场景包含 Smelter not listed 标准值，用于展示库内置标红', () => {
    expect(
      SMELTER_ROW_CLASS_NAME_SEED_ROWS.some(
        (row) => row.smelterLookup === SMELTER_LOOKUP_META.notListed
      )
    ).toBe(true)
  })
})
