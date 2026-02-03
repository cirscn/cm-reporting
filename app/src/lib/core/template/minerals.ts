/**
 * @file core/template/minerals.ts
 * @description 模块实现。
 */

// 说明：模块实现
import type { MetalDropdownSource, MineralDef, TemplateVersionDef } from '@core/registry/types'
import type { QuestionAnswers } from '@core/rules/gating'
import { compact, intersectionBy } from 'lodash-es'

const OTHER_MINERAL_PREFIX = 'other-'

function buildOtherMineralKey(index: number): string {
  return `${OTHER_MINERAL_PREFIX}${index}`
}

function getOtherMineralKeys(customMinerals: string[]): string[] {
  return compact(
    customMinerals.map((label, index) =>
      label.trim() ? buildOtherMineralKey(index) : null
    )
  )
}

function buildOtherMinerals(customMinerals: string[]): MineralDef[] {
  return compact(
    customMinerals.map((label, index) =>
      label.trim()
        ? { key: buildOtherMineralKey(index), labelKey: 'minerals.other' }
        : null
    )
  )
}

export function parseOtherMineralKey(key: string): number | null {
  if (!key.startsWith(OTHER_MINERAL_PREFIX)) return null
  const index = Number(key.slice(OTHER_MINERAL_PREFIX.length))
  return Number.isFinite(index) ? index : null
}

function getAnswerForMineral(
  answers: QuestionAnswers,
  questionKey: string,
  mineralKey: string
): string {
  const question = answers[questionKey]
  if (typeof question === 'object') {
    return question[mineralKey] || ''
  }
  if (typeof question === 'string') {
    return question
  }
  return ''
}

/**
 * 导出函数：getMetalsForSource。
 */
export function getMetalsForSource(
  source: MetalDropdownSource | undefined,
  versionDef: TemplateVersionDef,
  answers: QuestionAnswers,
  options?: { selectedMinerals?: string[]; customMinerals?: string[] }
): MineralDef[] {
  if (!source) return []

  if (source.type === 'fixed') {
    return source.metals
  }

  if (source.type === 'dynamic-active') {
    return getActiveMinerals(
      versionDef,
      options?.selectedMinerals ?? [],
      options?.customMinerals ?? []
    )
  }

  if (source.type === 'dynamic-q1-yes') {
    return intersectionBy(
      versionDef.mineralScope.minerals,
      compact(
        versionDef.mineralScope.minerals.map((mineral) =>
          getAnswerForMineral(answers, 'Q1', mineral.key) === 'Yes' ? mineral : null
        )
      ),
      (mineral) => mineral.key
    )
  }

  if (source.type === 'dynamic-q2-yes') {
    return intersectionBy(
      versionDef.mineralScope.minerals,
      compact(
        versionDef.mineralScope.minerals.map((mineral) =>
          getAnswerForMineral(answers, 'Q2', mineral.key) === 'Yes' ? mineral : null
        )
      ),
      (mineral) => mineral.key
    )
  }

  return []
}

/**
 * 导出函数：getCustomMineralLabels。
 */
export function getCustomMineralLabels(
  versionDef: TemplateVersionDef,
  customMinerals: string[],
  selectedMinerals: string[] = []
): Map<string, string> {
  const labels = new Map<string, string>()
  if (versionDef.mineralScope.mode === 'free-text') {
    versionDef.mineralScope.minerals.forEach((mineral, index) => {
      const label = customMinerals[index]?.trim()
      if (label) labels.set(mineral.key, label)
    })
    return labels
  }

  if (
    versionDef.mineralScope.mode === 'dynamic-dropdown' &&
    selectedMinerals.includes('other')
  ) {
    customMinerals.forEach((label, index) => {
      const value = label.trim()
      if (value) labels.set(buildOtherMineralKey(index), value)
    })
  }

  return labels
}

/**
 * 导出函数：getActiveMineralKeys。
 */
export function getActiveMineralKeys(
  versionDef: TemplateVersionDef,
  selectedMinerals: string[],
  customMinerals: string[]
): string[] {
  const minerals = versionDef.mineralScope.minerals
  if (versionDef.mineralScope.mode === 'dynamic-dropdown') {
    const base = minerals
      .filter((m) => m.key !== 'other' && selectedMinerals.includes(m.key))
      .map((m) => m.key)
    const otherKeys = selectedMinerals.includes('other')
      ? getOtherMineralKeys(customMinerals)
      : []
    return [...base, ...otherKeys]
  }
  if (versionDef.mineralScope.mode === 'free-text') {
    return minerals
      .filter((_, index) => Boolean(customMinerals[index]?.trim()))
      .map((m) => m.key)
  }
  return minerals.map((m) => m.key)
}

/**
 * 导出函数：getActiveMinerals。
 */
export function getActiveMinerals(
  versionDef: TemplateVersionDef,
  selectedMinerals: string[],
  customMinerals: string[]
): MineralDef[] {
  const allMinerals = versionDef.mineralScope.minerals

  if (versionDef.mineralScope.mode === 'dynamic-dropdown') {
    const base = intersectionBy(
      allMinerals,
      compact(
        allMinerals.map((mineral) =>
          selectedMinerals.includes(mineral.key) && mineral.key !== 'other' ? mineral : null
        )
      ),
      (mineral) => mineral.key
    )
    const otherMinerals = selectedMinerals.includes('other')
      ? buildOtherMinerals(customMinerals)
      : []
    return [...base, ...otherMinerals]
  }

  if (versionDef.mineralScope.mode === 'free-text') {
    return compact(
      allMinerals.map((mineral, index) =>
        customMinerals[index]?.trim() ? mineral : null
      )
    )
  }

  return allMinerals
}

/**
 * 导出函数：getDisplayMinerals。
 */
export function getDisplayMinerals(
  versionDef: TemplateVersionDef,
  selectedMinerals: string[],
  customMinerals: string[]
): Array<MineralDef & { label?: string }> {
  const active = getActiveMinerals(versionDef, selectedMinerals, customMinerals)
  const labels = getCustomMineralLabels(versionDef, customMinerals, selectedMinerals)
  return active.map((mineral) => ({ ...mineral, label: labels.get(mineral.key) }))
}
