import type { SmelterRow } from '@core/types/tableRows'

/** 清空可见名称或查找选择时移除旧候选，查找清空同时移除自动字段。 */
export function clearChangedSmelterLookups(params: {
  previousRows: SmelterRow[]
  rows: SmelterRow[]
  hasLookup: boolean
}): SmelterRow[] {
  const { previousRows, rows, hasLookup } = params
  const previousById = new Map(previousRows.map((row) => [row.id, row]))
  return rows.map((row) => {
    const previous = previousById.get(row.id)
    if (!hasLookup) {
      if (!previous?.smelterName.trim() || row.smelterName.trim()) return row
      return { ...row, smelterName: '', smelterLookup: '' }
    }
    if (!previous?.smelterLookup.trim() || row.smelterLookup.trim()) return row
    return {
      ...row,
      smelterLookup: '',
      smelterName: '',
      smelterNumber: '',
      smelterCountry: '',
      smelterIdentification: '',
      sourceId: '',
      smelterStreet: '',
      smelterCity: '',
      smelterState: '',
    }
  })
}
