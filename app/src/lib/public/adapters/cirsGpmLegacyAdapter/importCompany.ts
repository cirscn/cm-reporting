import { epochMsToChinaIsoDate } from '@core/transform'

import type { ImportContext } from './conversionTypes'
import { readFieldState, toNullableString } from './importUtils'
import type { CirsGpmLegacyRoundtripContext } from './types'

const EMPTY_EFFECTIVE_DATE_TIMESTAMP = 0
type EffectiveDateContext = CirsGpmLegacyRoundtripContext['effectiveDate']

function getEffectiveDateType(options: {
  exists: boolean
  value: unknown
}): EffectiveDateContext['originalType'] {
  if (!options.exists) return 'missing'
  if (options.value === null) return 'null'
  if (options.value === undefined) return 'undefined'
  if (typeof options.value === 'string') return 'string'
  if (typeof options.value === 'number') return 'number'
  return 'other'
}

function epochMsToDateString(value: EffectiveDateContext['originalValue']): string {
  if (value === null || value === undefined) return ''
  const raw = typeof value === 'string' ? value.trim() : value
  if (raw === '' || raw === EMPTY_EFFECTIVE_DATE_TIMESTAMP || raw === String(EMPTY_EFFECTIVE_DATE_TIMESTAMP)) return ''
  const ms = Number(raw)
  if (!Number.isFinite(ms)) return ''
  return epochMsToChinaIsoDate(ms) ?? ''
}

function importEffectiveDate(context: ImportContext) {
  const companyObj = context.legacy.cmtCompany
  const state = readFieldState(companyObj, 'effectiveDate')
  const value = companyObj?.effectiveDate
  context.ctx.effectiveDate = {
    exists: state.exists,
    originalValue: value,
    originalType: getEffectiveDateType({ exists: state.exists, value }),
    derivedAuthorizationDate: epochMsToDateString(value),
  }
}

export function importCompanyInfo(context: ImportContext) {
  const { legacy, plan, data, ctx } = context
  const companyObj = legacy.cmtCompany
  importEffectiveDate(context)
  for (const legacyKey of plan.legacyCompanyKeyByInternalKey.values()) {
    if (legacyKey === 'effectiveDate') continue
    ctx.companyFieldStates.set(legacyKey, readFieldState(companyObj, legacyKey))
  }
  for (const field of plan.versionDef.companyInfoFields) {
    const legacyKey = plan.legacyCompanyKeyByInternalKey.get(field.key) ?? field.key
    data.companyInfo[field.key] = legacyKey === 'effectiveDate'
      ? ctx.effectiveDate.derivedAuthorizationDate
      : toNullableString(companyObj?.[legacyKey])
  }
}
