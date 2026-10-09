import { deepCloneJson } from '@core/template/strings'

import { readMappedRowFields, writeLegacyFields } from './adapterUtils'
import type { ExportContext, ProductFieldMapping } from './conversionTypes'
import { copyNonEmptyFields } from './exportUtils'
import type { CirsGpmLegacyReport } from './types'

const DEFAULT_PRODUCT_FIELDS = {
  partNumber: 'partNumber', partName: 'partName', requestPartNumber: 'requestPartNumber',
  requestPartName: 'requestPartName', remark: 'remark',
}

function resolveProductFields(mapping: ProductFieldMapping | undefined) {
  return Object.fromEntries(Object.entries(DEFAULT_PRODUCT_FIELDS).map(([key, legacyKey]) => [
    key, mapping?.get(key as keyof typeof DEFAULT_PRODUCT_FIELDS) ?? legacyKey,
  ]))
}

export function patchProducts(context: ExportContext) {
  const original = context.out.cmtParts ?? []
  const defaultMapping = context.ctx.productLegacyKeyByInternalKeyByIndex.values().next().value
  const next = context.data.productList.map((row) => {
    const index = context.ctx.productLegacyIndexByInternalId.get(row.id)
    const mapping = index === undefined ? defaultMapping : context.ctx.productLegacyKeyByInternalKeyByIndex.get(index)
    const values = readMappedRowFields({ row, mapping: resolveProductFields(mapping) })
    if (index === undefined) {
      const item: Record<string, unknown> = { id: row.id }
      copyNonEmptyFields({ item, values })
      return item
    }
    const item = deepCloneJson(original[index] ?? {})
    writeLegacyFields({ item, values, states: context.ctx.productFieldStatesByIndex.get(index) ?? new Map() })
    return item
  })
  if (context.out.cmtParts || next.length > 0) context.out.cmtParts = next as CirsGpmLegacyReport['cmtParts']
}
