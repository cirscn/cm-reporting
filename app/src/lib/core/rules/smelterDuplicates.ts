/**
 * @file core/rules/smelterDuplicates.ts
 * @description Smelter List duplicate selection rules shared by UI and Checker.
 */

const NEW_SMELTER_ROW_ID_PREFIX = 'smelter-new-'
const DUPLICATE_KEY_SEPARATOR = '\u0000'

type SmelterSelectionRow = {
  id?: string
  metal?: string
}

export function buildNewSmelterRowId(now: number = Date.now()): string {
  return `${NEW_SMELTER_ROW_ID_PREFIX}${now}`
}

export function isTemporarySmelterRowId(id: string): boolean {
  return id.startsWith(NEW_SMELTER_ROW_ID_PREFIX)
}

export function resolveSmelterSelectionKey(row: Pick<SmelterSelectionRow, 'id'>): string {
  const normalizedRowId = typeof row.id === 'string' ? row.id.trim() : ''
  if (!normalizedRowId || isTemporarySmelterRowId(normalizedRowId)) return ''
  return normalizedRowId
}

export function hasDuplicateSmelterSelectionForMetal(params: {
  currentRows: ReadonlyArray<SmelterSelectionRow>
  currentRowId: string
  nextRow: SmelterSelectionRow
}): boolean {
  const nextMetal = params.nextRow.metal?.trim() ?? ''
  if (!nextMetal) return false
  const nextSelectionKey = resolveSmelterSelectionKey(params.nextRow)
  if (!nextSelectionKey) return false
  return params.currentRows.some((row) => {
    if (row.id === params.currentRowId) return false
    return (row.metal?.trim() ?? '') === nextMetal && resolveSmelterSelectionKey(row) === nextSelectionKey
  })
}

export function findDuplicateSmelterSelections(
  rows: ReadonlyArray<SmelterSelectionRow>,
): Array<{ index: number; firstIndex: number; selectionKey: string; metal: string }> {
  const seen = new Map<string, number>()
  const reportedMetals = new Set<string>()
  const duplicates: Array<{ index: number; firstIndex: number; selectionKey: string; metal: string }> = []

  rows.forEach((row, index) => {
    const metal = row.metal?.trim() ?? ''
    const selectionKey = resolveSmelterSelectionKey(row)
    if (!metal || !selectionKey) return
    if (reportedMetals.has(metal)) return
    const duplicateKey = `${metal}${DUPLICATE_KEY_SEPARATOR}${selectionKey}`
    const firstIndex = seen.get(duplicateKey)
    if (firstIndex !== undefined) {
      duplicates.push({ index, firstIndex, selectionKey, metal })
      reportedMetals.add(metal)
      return
    }
    seen.set(duplicateKey, index)
  })

  return duplicates
}
