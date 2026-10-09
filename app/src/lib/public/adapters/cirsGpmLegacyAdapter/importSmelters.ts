import type { SmelterRow } from '@core/types/tableRows'

import { normalizeLegacyYesNoUnknown } from './adapterUtils'
import type { ImportContext, LegacySmelter } from './conversionTypes'
import { resolveImportedMineral } from './importMinerals'
import { coerceId, readFieldStates, readOptionalLegacyFields } from './importUtils'

const SMELTER_STATE_KEYS = [
  'smelterName', 'smelterLookUp', 'smelterCountry', 'smelterId', 'remark',
  'isRecycle', 'mineName', 'mineCountry', 'suggest',
]
const OPTIONAL_FIELDS = {
  smelterStreet: 'smelterStreet', smelterCity: 'smelterCity', smelterState: 'smelterProvince',
  smelterContactName: 'smelterContact', smelterContactEmail: 'smelterEmail',
  proposedNextSteps: 'suggest', mineName: 'mineName', mineCountry: 'mineCountry', comments: 'remark',
}

function buildSmelterIdentity(item: LegacySmelter) {
  const number = item.smelterNumber || item.smelterId || undefined
  return {
    smelterNumber: number, smelterId: number, smelterIdentification: number,
    sourceId: item.smelterIdentification || undefined,
    recycledScrap: normalizeLegacyYesNoUnknown(item.isRecycle) || undefined,
  }
}

function buildSmelterRow(options: { context: ImportContext; item: LegacySmelter; id: string }): SmelterRow {
  const { context, item, id } = options
  return {
    ...readOptionalLegacyFields({ item, mapping: OPTIONAL_FIELDS }),
    ...buildSmelterIdentity(item),
    id,
    metal: resolveImportedMineral(context, item.metal),
    smelterLookup: item.smelterLookUp || item.smelterName || item.standardSmelterName || '',
    smelterName: item.standardSmelterName || item.smelterName || '',
    smelterCountry: item.smelterCountry ?? '',
  }
}

export function importSmelters(context: ImportContext) {
  context.data.smelterList = (context.legacy.cmtSmelters ?? []).map((item, index) => {
    const id = coerceId(item.id, `smelter-${index}`)
    context.ctx.smelterLegacyIndexByInternalId.set(id, index)
    context.ctx.smelterFieldStatesByIndex.set(index, readFieldStates(item, SMELTER_STATE_KEYS))
    if (item.smelterName === null) context.ctx.smelterNameFallbackByIndex.set(index, item.standardSmelterName ?? '')
    return buildSmelterRow({ context, item, id })
  })
}
