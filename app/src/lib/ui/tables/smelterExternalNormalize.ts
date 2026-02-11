/**
 * @file ui/tables/smelterExternalNormalize.ts
 * @description 外部冶炼厂回写字段归一化工具。
 */

import type { SmelterRow } from '@core/types/tableRows'

const NEW_SMELTER_ROW_ID_PREFIX = 'smelter-new-'

/**
 * 解析外部回写的冶炼厂 ID：smelterId 优先，id 兜底。
 */
export function resolveExternalSmelterId(
  partial: Pick<Partial<SmelterRow>, 'smelterId' | 'id'>,
): string {
  const smelterId = typeof partial.smelterId === 'string' ? partial.smelterId.trim() : ''
  if (smelterId) return smelterId
  const externalId = typeof partial.id === 'string' ? partial.id.trim() : ''
  if (externalId) return externalId
  return ''
}

/**
 * 新增空行时生成临时行 ID。
 * 说明：宿主完成冶炼厂选择后，可由宿主回写的 id 覆盖该临时值。
 */
export function buildNewSmelterRowId(now: number = Date.now()): string {
  return `${NEW_SMELTER_ROW_ID_PREFIX}${now}`
}

/** 判断是否为“新增空行”的临时 ID。 */
export function isTemporarySmelterRowId(id: string): boolean {
  return id.startsWith(NEW_SMELTER_ROW_ID_PREFIX)
}

/**
 * 解析外部回写后的行 ID：优先使用宿主回写的 id（去空格），否则保留当前行 ID。
 */
export function resolveExternalSmelterRowId(
  partial: Pick<Partial<SmelterRow>, 'smelterId' | 'id'>,
  currentRowId: string,
): string {
  const externalId = typeof partial.id === 'string' ? partial.id.trim() : ''
  if (externalId) return externalId
  const resolvedSmelterId = resolveExternalSmelterId(partial)
  if (resolvedSmelterId) return resolvedSmelterId
  return currentRowId
}

/**
 * 解析“同一金属下冶炼厂去重”所用的唯一键：
 * - 优先使用 smelterId
 * - 若 smelterId 为空，且行 id 不是临时值，则使用行 id
 */
export function resolveSmelterSelectionKey(
  row: Pick<SmelterRow, 'id' | 'smelterId'>,
): string {
  const normalizedSmelterId = typeof row.smelterId === 'string' ? row.smelterId.trim() : ''
  if (normalizedSmelterId) return normalizedSmelterId
  const normalizedRowId = typeof row.id === 'string' ? row.id.trim() : ''
  if (!normalizedRowId || isTemporarySmelterRowId(normalizedRowId)) return ''
  return normalizedRowId
}

/**
 * 判断当前修改是否会造成“同一 metal 下重复选择同一冶炼厂”。
 */
export function hasDuplicateSmelterSelectionForMetal(params: {
  currentRows: ReadonlyArray<Pick<SmelterRow, 'id' | 'metal' | 'smelterId'>>
  currentRowId: string
  nextRow: Pick<SmelterRow, 'id' | 'metal' | 'smelterId'>
}): boolean {
  const nextMetal = params.nextRow.metal.trim()
  if (!nextMetal) return false
  const nextSelectionKey = resolveSmelterSelectionKey(params.nextRow)
  if (!nextSelectionKey) return false
  return params.currentRows.some((row) => {
    if (row.id === params.currentRowId) return false
    return row.metal.trim() === nextMetal && resolveSmelterSelectionKey(row) === nextSelectionKey
  })
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
 * 判断本次外部回写是否携带了可用于更新 smelterId 的原始字段。
 */
export function hasExternalSmelterIdInput(
  partial: Pick<Partial<SmelterRow>, 'smelterId' | 'id'>,
): boolean {
  return typeof partial.smelterId === 'string' || typeof partial.id === 'string'
}
