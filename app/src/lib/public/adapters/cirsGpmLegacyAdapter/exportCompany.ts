import { writeNullableString } from './adapterUtils'
import type { ExportContext } from './conversionTypes'
import type { CirsGpmLegacyReport, NullableFieldState } from './types'

const YEAR_GROUP_INDEX = 1
const MONTH_GROUP_INDEX = 2
const DAY_GROUP_INDEX = 3
const MONTH_NUMBER_OFFSET = 1
const EMPTY_DATE_TIMESTAMP = 0
const MISSING_FIELD_STATE: NullableFieldState = {
  exists: false, wasNull: false, wasString: false, wasNumber: false,
}

function dateStringToEpochMsUtc(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[YEAR_GROUP_INDEX])
  const month = Number(match[MONTH_GROUP_INDEX])
  const day = Number(match[DAY_GROUP_INDEX])
  if (![year, month, day].every(Number.isFinite)) return null
  return Date.UTC(year, month - MONTH_NUMBER_OFFSET, day)
}

function epochForWrite(context: ExportContext) {
  const authorizationDate = context.data.companyInfo.authorizationDate ?? ''
  const { originalValue, originalType, derivedAuthorizationDate } = context.ctx.effectiveDate
  if (authorizationDate === derivedAuthorizationDate) return originalValue
  if (!authorizationDate) {
    if (originalType === 'missing') return undefined
    if (originalType === 'null') return null
    if (originalType === 'number') return EMPTY_DATE_TIMESTAMP
    return ''
  }
  const ms = dateStringToEpochMsUtc(authorizationDate)
  if (ms === null) return originalValue
  return originalType === 'number' ? ms : String(ms)
}

function writeCompanyFields(options: { context: ExportContext; company: Record<string, unknown> }) {
  const { context, company } = options
  for (const field of context.plan.versionDef.companyInfoFields) {
    const legacyKey = context.plan.legacyCompanyKeyByInternalKey.get(field.key) ?? field.key
    if (legacyKey === 'effectiveDate') continue
    const state = context.ctx.companyFieldStates.get(legacyKey) ?? MISSING_FIELD_STATE
    const written = writeNullableString(state, context.data.companyInfo[field.key] ?? '')
    if (written === undefined) {
      if (state.exists) delete company[legacyKey]
      continue
    }
    company[legacyKey] = written
  }
}

export function patchCompanyInfo(context: ExportContext) {
  const company = (context.out.cmtCompany ?? {}) as Record<string, unknown>
  writeCompanyFields({ context, company })
  const effective = epochForWrite(context)
  if (effective === undefined) {
    if (context.ctx.effectiveDate.originalType !== 'missing') delete company.effectiveDate
  } else {
    company.effectiveDate = effective
  }
  const hasContent = Object.keys(company).length > 0 || context.ctx.companyFieldStates.size > 0
    || context.ctx.effectiveDate.originalType !== 'missing'
  if (context.out.cmtCompany || hasContent) {
    context.out.cmtCompany = company as CirsGpmLegacyReport['cmtCompany']
  }
}
