/**
 * @file core/rules/helpers.ts
 * @description 规则计算共享小工具。
 */

// 说明：规则计算共享小工具
import type { I18nKey } from '@core/i18n'
import type { TemplateVersionDef } from '@core/registry/types'
import { compact } from 'lodash-es'

import type { GatingResult } from './gating'

/**
 * 根据模板定义构建矿产 key -> labelKey 的映射。
 */
export function buildMineralLabelMap(
  versionDef: TemplateVersionDef
): Map<string, I18nKey> {
  return new Map(
    versionDef.mineralScope.minerals.map((mineral) => [mineral.key, mineral.labelKey])
  )
}

/**
 * 读取问题答案（支持 perMineral 与非 perMineral）。
 */
export function getQuestionAnswerValue(
  answers: Record<string, Record<string, string> | string>,
  questionKey: string,
  mineralKey: string,
  perMineral: boolean
): string {
  const value = answers[questionKey]
  if (perMineral && typeof value === 'object') {
    return value[mineralKey] || ''
  }
  if (!perMineral && typeof value === 'string') {
    return value
  }
  return ''
}

/**
 * 计算需要填写 Smelter List 的矿产清单。
 */
export function getRequiredSmelterMinerals(params: {
  versionDef: TemplateVersionDef
  activeMinerals: string[]
  gatingByMineral: Map<string, GatingResult>
}): string[] {
  const { activeMinerals, gatingByMineral } = params

  return compact(
    activeMinerals.map((mineralKey) => {
      return gatingByMineral.get(mineralKey)?.smelterListRequired ? mineralKey : null
    })
  )
}
