import type { TemplateVersionDef } from '@core/registry/types'
import { calculateGating, type QuestionAnswers } from '@core/rules/gating'
import type { MineRow, SmelterRow } from '@core/types/tableRows'

/** 仅清理当前回答影响的矿种，保留矿厂详情和独立行主键。 */
export function clearMineMetalsOutsideGating(params: {
  rows: MineRow[]
  versionDef: TemplateVersionDef
  questions: QuestionAnswers
  mineralKey: string | null
}): MineRow[] {
  const { rows, versionDef, questions, mineralKey } = params
  if (!versionDef.mineList.available) return rows
  return rows.map((row) => {
    const metal = row.metal.trim()
    if (!metal || (mineralKey && metal !== mineralKey)) return row
    if (calculateGating(versionDef, questions, metal).smelterListRequired) return row
    return { ...row, metal: '', smelterName: '', smelterId: '' }
  })
}

function collectSmelterIdsByMetal(rows: SmelterRow[]): Map<string, Set<string>> {
  const idsByMetal = new Map<string, Set<string>>()
  for (const row of rows) {
    const metal = row.metal.trim()
    const ids = idsByMetal.get(metal) ?? new Set<string>()
    ids.add(row.id)
    idsByMetal.set(metal, ids)
  }
  return idsByMetal
}

/** 按本次移除的金属和 ID 清理，既不按名称猜关联，也不清洗无关历史数据。 */
export function clearRemovedMineSmelters(params: {
  rows: MineRow[]
  previousSmelters: SmelterRow[]
  nextSmelters: SmelterRow[]
}): MineRow[] {
  const { rows, previousSmelters, nextSmelters } = params
  const retainedIds = collectSmelterIdsByMetal(nextSmelters)
  const removedIds = collectSmelterIdsByMetal(previousSmelters.filter(
    (row) => !retainedIds.get(row.metal.trim())?.has(row.id),
  ))
  if (removedIds.size === 0) return rows
  return rows.map((row) => {
    if (!row.smelterId || !removedIds.get(row.metal.trim())?.has(row.smelterId)) return row
    return { ...row, smelterName: '', smelterId: '' }
  })
}
