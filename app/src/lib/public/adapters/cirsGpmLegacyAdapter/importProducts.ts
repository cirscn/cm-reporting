import type { ProductRow } from '@core/types/tableRows'

import type { ImportContext, LegacyProduct, ProductFieldMapping } from './conversionTypes'
import { coerceId, readFieldStates, toAnyString } from './importUtils'

const PRODUCT_ALIASES = {
  partNumber: ['partNumber', 'productNumber'], partName: ['partName', 'productName'],
  requestPartNumber: ['requestPartNumber', 'requesterNumber'], requestPartName: ['requestPartName', 'requesterName'],
  remark: ['remark', 'comments'],
} as const

function createProductMapping(item: LegacyProduct): ProductFieldMapping {
  return new Map(Object.entries(PRODUCT_ALIASES).map(([key, aliases]) => {
    const legacyKey = aliases.find((alias) => Object.prototype.hasOwnProperty.call(item, alias)) ?? aliases[0]
    return [key as keyof typeof PRODUCT_ALIASES, legacyKey]
  }))
}

function buildProductRow(options: { item: LegacyProduct; id: string; mapping: ProductFieldMapping }): ProductRow {
  const { item, id, mapping } = options
  const read = (key: keyof typeof PRODUCT_ALIASES) => toAnyString(item[mapping.get(key)!])
  return {
    id, partNumber: read('partNumber'), partName: read('partName'),
    requestPartNumber: read('requestPartNumber') || undefined,
    requestPartName: read('requestPartName') || undefined,
    remark: read('remark'),
  }
}

export function importProducts(context: ImportContext) {
  const stateKeys = Object.values(PRODUCT_ALIASES).flat()
  context.data.productList = (context.legacy.cmtParts ?? []).map((item, index) => {
    const id = coerceId(item.id ?? item.partId, `product-${index}`)
    const mapping = createProductMapping(item)
    context.ctx.productLegacyIndexByInternalId.set(id, index)
    context.ctx.productFieldStatesByIndex.set(index, readFieldStates(item, stateKeys))
    context.ctx.productLegacyKeyByInternalKeyByIndex.set(index, mapping)
    return buildProductRow({ item, id, mapping })
  })
}
