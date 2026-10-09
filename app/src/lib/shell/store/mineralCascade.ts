import type { TemplateVersionDef } from '@core/registry/types'
import { getActiveMineralKeys } from '@core/template/minerals'

import type { TemplateStoreState } from './templateStoreTypes'

function clearMineralValues(values: Record<string, string> | string, removed: Set<string>) {
  if (typeof values !== 'object') return
  removed.forEach((mineral) => { values[mineral] = '' })
}

/** 取消申报矿种时继续删除整行，与 Q1/Q2 的字段清空保持不同语义。 */
export function applyRemovedMineralsCascade(state: TemplateStoreState, removedMinerals: string[]) {
  const removed = new Set(removedMinerals.map((mineral) => mineral.trim()).filter(Boolean))
  if (removed.size === 0) return
  state.versionDef.questions.forEach((question) => {
    if (!question.perMineral) return
    clearMineralValues(state.questions[question.key], removed)
    clearMineralValues(state.questionComments[question.key], removed)
  })
  state.versionDef.companyQuestions.forEach((question) => {
    if (!question.perMineral) return
    clearMineralValues(state.companyQuestions[question.key], removed)
    if (question.hasCommentField) clearMineralValues(state.companyQuestions[`${question.key}_comment`], removed)
  })
  state.mineralsScope = state.mineralsScope.filter((row) => !removed.has(row.mineral.trim()))
  state.smelterList = state.smelterList.filter((row) => !removed.has(row.metal.trim()))
  state.mineList = state.mineList.filter((row) => !removed.has(row.metal.trim()))
}

export function resolveRemovedMinerals(params: {
  versionDef: TemplateVersionDef
  prevSelectedMinerals: string[]
  nextSelectedMinerals: string[]
  prevCustomMinerals: string[]
  nextCustomMinerals: string[]
}): string[] {
  const { versionDef, prevSelectedMinerals, nextSelectedMinerals, prevCustomMinerals, nextCustomMinerals } = params
  const nextSelected = new Set(nextSelectedMinerals.map((mineral) => mineral.trim()).filter(Boolean))
  const removedSelected = prevSelectedMinerals.filter((mineral) => mineral.trim() && !nextSelected.has(mineral.trim()))
  if (versionDef.mineralScope.mode === 'fixed') return removedSelected
  const previousActive = getActiveMineralKeys(versionDef, prevSelectedMinerals, prevCustomMinerals)
  const nextActive = new Set(getActiveMineralKeys(versionDef, nextSelectedMinerals, nextCustomMinerals))
  const removedActive = previousActive.filter((mineral) => !nextActive.has(mineral))
  return versionDef.mineralScope.mode === 'free-text'
    ? Array.from(new Set([...removedSelected, ...removedActive]))
    : removedActive
}
