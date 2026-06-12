/**
 * @file ui/tables/smelterExternalNormalize.ts
 * @description 外部冶炼厂回写字段归一化工具。
 */

import { isTemporarySmelterRowId } from '@core/rules/smelterDuplicates'
import type { SmelterRow } from '@core/types/tableRows'

export {
  buildNewSmelterRowId,
  hasDuplicateSmelterSelectionForMetal,
  isTemporarySmelterRowId,
  resolveSmelterSelectionKey,
} from '@core/rules/smelterDuplicates'

type ExternalSmelterLookupFields = Pick<Partial<SmelterRow>, 'smelterLookup' | 'smelterName'>

type ExternalSmelterIdFields = Pick<Partial<SmelterRow>, 'id'> & {
  smelterId?: string
  smelterNumber?: string
}

type ExternalSmelterIdentityFields = Pick<
  Partial<SmelterRow>,
  'smelterIdentification' | 'sourceId'
>

type ExternalSmelterMergeFields = Partial<SmelterRow>
type AvailableMetalOption = {
  key: string
  label?: string
}

function trimString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function hasExternalSmelterIdentityInput(partial: ExternalSmelterMergeFields): boolean {
  return (
    hasExternalSmelterNumberInput(partial) ||
    typeof partial.smelterIdentification === 'string' ||
    typeof partial.sourceId === 'string'
  )
}

function resolveMergedSmelterNumber(partial: ExternalSmelterMergeFields, current: string): string {
  const resolvedSmelterNumber = resolveExternalSmelterNumber(partial)
  if (resolvedSmelterNumber) return resolvedSmelterNumber
  if (hasExternalSmelterNumberInput(partial)) return ''
  return trimString(current)
}

function matchesMetalOption(input: string, option: AvailableMetalOption): boolean {
  const normalizedInput = input.toLowerCase()
  if (option.key.trim().toLowerCase() === normalizedInput) return true
  return trimString(option.label).toLowerCase() === normalizedInput
}

/**
 * 解析外部回写后的冶炼厂查找显示值：
 * - 优先使用 smelterLookup
 * - 未回写时回退到 smelterName，保证查找列和 checker 使用同一来源
 */
export function resolveExternalSmelterLookup(
  partial: ExternalSmelterLookupFields,
): string {
  const smelterLookup =
    typeof partial.smelterLookup === 'string' ? partial.smelterLookup.trim() : ''
  if (smelterLookup) return smelterLookup

  const smelterName = typeof partial.smelterName === 'string' ? partial.smelterName.trim() : ''
  if (smelterName) return smelterName

  return ''
}

/**
 * 解析外部回写的冶炼厂识别号码：仅识别 smelterNumber。
 */
export function resolveExternalSmelterNumber(
  partial: ExternalSmelterIdFields,
): string {
  const smelterNumber = trimString(partial.smelterNumber)
  if (smelterNumber) return smelterNumber
  return ''
}

export function resolveExternalSmelterMetal(
  metal: string | undefined,
  availableMetals: ReadonlyArray<AvailableMetalOption>,
): { value: string; inScope: boolean } {
  const normalizedMetal = trimString(metal)
  if (!normalizedMetal) return { value: '', inScope: true }

  const matched = availableMetals.find((option) => matchesMetalOption(normalizedMetal, option))
  if (matched) return { value: matched.key, inScope: true }

  return { value: normalizedMetal, inScope: false }
}

/**
 * 解析外部回写的冶炼厂识别与来源识别号：
 * - smelterNumber 是 CID 展示号，冶炼厂识别列也应显示该 CID
 * - sourceId 优先使用显式 sourceId
 * - 部分宿主会把 RMI 来源写进 smelterIdentification，这里转入 sourceId
 */
export function resolveExternalSmelterIdentityFields(
  partial: ExternalSmelterIdentityFields,
  smelterNumber: string,
): Required<ExternalSmelterIdentityFields> {
  const normalizedNumber = trimString(smelterNumber)
  const explicitSourceId = trimString(partial.sourceId)
  const externalIdentification = trimString(partial.smelterIdentification)
  const sourceFromIdentification =
    normalizedNumber && externalIdentification !== normalizedNumber ? externalIdentification : ''

  return {
    smelterIdentification: normalizedNumber || externalIdentification,
    sourceId: explicitSourceId || sourceFromIdentification,
  }
}

export function mergeExternalSmelterPickIntoRow(params: {
  row: SmelterRow
  partial: ExternalSmelterMergeFields
  preserveMetal: boolean
}): SmelterRow {
  const resolvedRowId = resolveExternalSmelterRowId(
    {
      id: params.partial.id,
      smelterId: params.partial.smelterId,
      smelterNumber: params.partial.smelterNumber,
    },
    params.row.id,
  )
  if (!resolvedRowId.trim()) return params.row
  const resolvedLookup = resolveExternalSmelterLookup({
    smelterLookup: params.partial.smelterLookup,
    smelterName: params.partial.smelterName,
  })
  const merged: SmelterRow = {
    ...params.row,
    ...(params.partial as Record<string, string | undefined>),
    id: resolvedRowId,
    metal: params.preserveMetal ? params.row.metal : params.partial.metal ?? params.row.metal,
    smelterLookup: resolvedLookup || params.row.smelterLookup,
    smelterNumber: resolveMergedSmelterNumber(
      params.partial,
      params.partial.smelterNumber ?? params.row.smelterNumber ?? '',
    ),
  }
  if (!hasExternalSmelterIdentityInput(params.partial)) return merged
  const identityFields = resolveExternalSmelterIdentityFields(
    {
      smelterIdentification: params.partial.smelterIdentification,
      sourceId: params.partial.sourceId,
    },
    merged.smelterNumber ?? '',
  )
  return {
    ...merged,
    smelterIdentification: identityFields.smelterIdentification,
    sourceId: identityFields.sourceId,
  }
}

/**
 * 解析外部回写后的行 ID：仅使用宿主回写的 id，否则保留当前行 ID。
 */
export function resolveExternalSmelterRowId(
  partial: ExternalSmelterIdFields,
  currentRowId: string,
): string {
  const externalId = typeof partial.id === 'string' ? partial.id.trim() : ''
  if (externalId) return externalId
  return currentRowId
}

/**
 * 判断外部选择后的冶炼厂基础信息字段是否应锁定。
 */
export function shouldDisableSmelterFieldsAfterExternalPick(params: {
  useExternalLookup: boolean
  row: Pick<SmelterRow, 'id' | 'smelterLookup'>
  fromLookup: boolean
  notListed: boolean
  notYetIdentified: boolean
}): boolean {
  if (!params.useExternalLookup) return false
  if (params.notListed || params.notYetIdentified) return false
  const normalizedLookup = params.row.smelterLookup.trim()
  if (!normalizedLookup) return false
  if (params.fromLookup) return true
  const normalizedRowId = params.row.id.trim()
  if (!normalizedRowId) return false
  return !isTemporarySmelterRowId(normalizedRowId)
}

/**
 * 判断本次外部回写是否携带了可用于更新 smelterNumber 的原始字段。
 */
export function hasExternalSmelterNumberInput(
  partial: ExternalSmelterIdFields,
): boolean {
  return typeof partial.smelterNumber === 'string'
}
