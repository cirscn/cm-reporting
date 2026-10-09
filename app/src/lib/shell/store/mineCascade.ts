import type { MineListConfig, TemplateVersionDef } from '@core/registry/types'
import { calculateGating, type QuestionAnswers } from '@core/rules/gating'
import type { MineRow, SmelterRow } from '@core/types/tableRows'
import { buildMineSmelterOptions } from '@core/viewmodels/mineSmelterOptions'

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

function indexSmelterOptions(rows: SmelterRow[]) {
  const { smelterOptionsByMetal } = buildMineSmelterOptions(rows)
  return new Map(Object.entries(smelterOptionsByMetal).map(([metal, options]) => [metal, {
    names: new Set(options.map((option) => option.label)),
    namesById: new Map(options.map((option) => [option.value, option.label])),
  }]))
}

function clearMineSmelter(row: MineRow): MineRow {
  return { ...row, smelterName: '', smelterId: '' }
}

/** 同一次冶炼厂编辑内同步关联，不按名称猜 ID，也不清洗无关历史数据。 */
export function reconcileMineSmelters(params: {
  rows: MineRow[]
  previousSmelters: SmelterRow[]
  nextSmelters: SmelterRow[]
  smelterNameMode: MineListConfig['smelterNameMode']
}): MineRow[] {
  const { rows, previousSmelters, nextSmelters, smelterNameMode } = params
  const previousIds = collectSmelterIdsByMetal(previousSmelters)
  const retainedIds = collectSmelterIdsByMetal(nextSmelters)
  const previousOptions = indexSmelterOptions(previousSmelters)
  const nextOptions = indexSmelterOptions(nextSmelters)
  const nextRows = rows.map((row) => {
    const metal = row.metal.trim()
    const next = nextOptions.get(metal)
    if (row.smelterId) {
      if (!previousIds.get(metal)?.has(row.smelterId)) return row
      const name = next?.namesById.get(row.smelterId)
      const previousName = previousOptions.get(metal)?.namesById.get(row.smelterId)
      if (retainedIds.get(metal)?.has(row.smelterId) && name === previousName) return row
      if (!name) return clearMineSmelter(row)
      return name === row.smelterName ? row : { ...row, smelterName: name }
    }
    if (smelterNameMode !== 'dropdown') return row
    const name = row.smelterName.trim()
    if (!previousOptions.get(metal)?.names.has(name) || next?.names.has(name)) return row
    return clearMineSmelter(row)
  })
  return nextRows.some((row, index) => row !== rows[index]) ? nextRows : rows
}
