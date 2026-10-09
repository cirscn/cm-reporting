import { deepCloneJson } from '@core/template/strings'
import type { SmelterRow } from '@core/types/tableRows'

import { normalizeLegacyYesNoUnknown, readMappedRowFields, writeLegacyField, writeLegacyFields } from './adapterUtils'
import type { ExportContext } from './conversionTypes'
import { copyNonEmptyFields, getAnyString, isEmpty, resolveMineralLabel, toLegacyYesNoUnknown } from './exportUtils'
import type { CirsGpmLegacyReport, NullableFieldState } from './types'

const DIRECT_FIELDS = {
  smelterCountry: 'smelterCountry', smelterStreet: 'smelterStreet', smelterCity: 'smelterCity',
  smelterState: 'smelterProvince', smelterContactName: 'smelterContact', smelterContactEmail: 'smelterEmail',
  proposedNextSteps: 'suggest', mineName: 'mineName', mineCountry: 'mineCountry', comments: 'remark',
}
interface ExistingSmelterOptions {
  context: ExportContext
  row: SmelterRow
  item: Record<string, unknown>
  index: number
  states: Map<string, NullableFieldState>
}

function shouldPreserveNullName(options: ExistingSmelterOptions) {
  const fallback = options.context.ctx.smelterNameFallbackByIndex.get(options.index)
  return options.states.get('smelterName')?.wasNull && fallback && options.row.smelterName === fallback
}

function patchSmelterName(options: ExistingSmelterOptions) {
  const { row, item, states } = options
  const standardName = getAnyString(item.standardSmelterName)
  const originalName = getAnyString(item.smelterName)
  const lookup = getAnyString(item.smelterLookUp) || originalName || standardName
  if (row.smelterLookup !== lookup) writeLegacyField({ item, states, key: 'smelterLookUp', value: row.smelterLookup })
  if (row.smelterName === (standardName || originalName)) return
  if (standardName) {
    writeLegacyField({ item, states, key: 'standardSmelterName', value: row.smelterName })
    return
  }
  if (shouldPreserveNullName(options)) {
    item.smelterName = null
    return
  }
  writeLegacyField({ item, states, key: 'smelterName', value: row.smelterName })
}

function patchSmelterNumber(options: ExistingSmelterOptions) {
  const { row, item, states } = options
  const originalNumber = getAnyString(item.smelterNumber)
  const originalLegacyId = getAnyString(item.smelterId)
  const derivedNumber = originalNumber || originalLegacyId
  const number = row.smelterNumber ?? ''
  const identification = row.smelterIdentification ?? ''
  if (number === derivedNumber && identification === derivedNumber) return
  const value = number !== derivedNumber ? number : identification
  const key = originalNumber ? 'smelterNumber' : originalLegacyId ? 'smelterId' : 'smelterNumber'
  writeLegacyField({ item, states, key, value })
}

function patchSmelterIdentity(options: ExistingSmelterOptions) {
  const { row, item, states } = options
  patchSmelterNumber(options)
  if ((row.sourceId ?? '') !== getAnyString(item.smelterIdentification)) {
    writeLegacyField({ item, states, key: 'smelterIdentification', value: row.sourceId ?? '' })
  }
  if ((row.recycledScrap ?? '') !== normalizeLegacyYesNoUnknown(item.isRecycle)) {
    writeLegacyField({ item, states, key: 'isRecycle', value: toLegacyYesNoUnknown(row.recycledScrap ?? '') })
  }
}

function patchExistingSmelter(options: ExistingSmelterOptions) {
  const { context, row, item, states } = options
  patchSmelterName(options)
  patchSmelterIdentity(options)
  writeLegacyFields({
    item, states,
    values: {
      ...readMappedRowFields({ row, mapping: DIRECT_FIELDS }),
      metal: resolveMineralLabel({ context, value: row.metal }),
    },
  })
  item.id = item.id ?? row.id
  return item
}

function createSmelter(context: ExportContext, row: SmelterRow) {
  const item: Record<string, unknown> = { id: row.id }
  copyNonEmptyFields({ item, values: {
    metal: resolveMineralLabel({ context, value: row.metal }),
    smelterLookUp: row.smelterLookup,
    smelterName: row.smelterName,
    smelterCountry: row.smelterCountry,
    smelterNumber: row.smelterNumber || row.smelterIdentification,
    smelterIdentification: row.sourceId,
    isRecycle: toLegacyYesNoUnknown(row.recycledScrap ?? ''),
    remark: row.comments,
  } })
  if (!isEmpty(row.smelterName) && !isEmpty(row.smelterLookup)) item.standardSmelterName = row.smelterName
  return item
}

export function patchSmelters(context: ExportContext) {
  const original = context.out.cmtSmelters ?? []
  const next = context.data.smelterList.map((row) => {
    const index = context.ctx.smelterLegacyIndexByInternalId.get(row.id)
    if (index === undefined) return createSmelter(context, row)
    return patchExistingSmelter({
      context, row, index,
      item: deepCloneJson(original[index] ?? {}),
      states: context.ctx.smelterFieldStatesByIndex.get(index) ?? new Map(),
    })
  })
  if (context.out.cmtSmelters || next.length > 0) {
    context.out.cmtSmelters = next as CirsGpmLegacyReport['cmtSmelters']
  }
}
