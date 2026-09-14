/**
 * @file examples/smelterRowClassName.ts
 * @description Examples 中 Smelter List 宿主附加行样式的共享规则与场景数据。
 */

import { SMELTER_LOOKUP_DATA, SMELTER_LOOKUP_META } from '@core/data/lookups'
import { isSmelterNotIdentified, isSmelterNotListed } from '@core/transform'
import type { SmelterRow } from '@lib/index'

export const EXTERNAL_SMELTER_ROW_CLASS_NAME = 'smelter-row-unlisted'

interface ExampleSmelterRowOptions {
  id: string
  lookup: string
  name?: string
}

function createExampleSmelterRow({ id, lookup, name = '' }: ExampleSmelterRowOptions): SmelterRow {
  return {
    id,
    metal: 'Sn',
    smelterLookup: lookup,
    smelterName: name,
    smelterCountry: '',
  }
}

export const SMELTER_ROW_CLASS_NAME_SEED_ROWS: SmelterRow[] = [
  createExampleSmelterRow({ id: 'S1', lookup: 'Malaysia Smelting Corporation' }),
  createExampleSmelterRow({ id: 'S2', lookup: 'Some External Smelter Not In Lookup' }),
  createExampleSmelterRow({
    id: 'S3',
    lookup: SMELTER_LOOKUP_META.notListed,
    name: 'Example Custom Smelter',
  }),
]

/** 仅演示宿主对 lookup 主数据之外名称的附加标红规则。 */
export function getExampleSmelterRowClassName(record: SmelterRow): string {
  const lookup = record.smelterLookup.trim()
  if (!lookup) return ''
  if (isSmelterNotListed(lookup) || isSmelterNotIdentified(lookup)) return ''
  return SMELTER_LOOKUP_DATA[lookup] ? '' : EXTERNAL_SMELTER_ROW_CLASS_NAME
}
