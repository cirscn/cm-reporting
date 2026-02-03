/**
 * @file core/rules/docStatus.ts
 * @description 模块实现。
 */

// 说明：模块实现
import type { GatingCondition, TemplateVersionDef } from '@core/registry/types'
import { compact, uniq } from 'lodash-es'

import {
  buildRequiredContext,
  calculateRequiredFieldsWithContext,
  type FormStateForRequired,
} from './required'

/**
 * 导出类型：DocStatusType。
 */
export type DocStatusType =
  | 'productListRequired'
  | 'productListNotRequired'
  | 'productListUnknown'
  | 'smelterListRequired'
  | 'smelterListNotRequired'
  | 'smelterListUnknown'
  | 'smelterListPending'
  | 'mineListAvailable'
  | 'mineListNotAvailable'

/**
 * 导出接口类型：DocStatusData。
 */
export interface DocStatusData {
  type: DocStatusType
  metals?: string[]
  questions?: 'Q1' | 'Q1/Q2'
}

/**
 * 导出接口类型：DocStatusBySection。
 */
export interface DocStatusBySection {
  productList: DocStatusData
  smelterList: DocStatusData
  mineList: DocStatusData
}

/**
 * 导出函数：getDocStatusData。
 */
export function getDocStatusData(
  versionDef: TemplateVersionDef,
  formState: FormStateForRequired
): DocStatusBySection {
  const requiredContext = buildRequiredContext(versionDef, formState)
  const requiredFields = calculateRequiredFieldsWithContext(versionDef, formState, requiredContext)
  const { activeMinerals, gatingByMineral } = requiredContext

  const productList: DocStatusData = requiredFields.productListRequired
    ? { type: 'productListRequired' }
    : formState.scopeType
      ? { type: 'productListNotRequired' }
      : { type: 'productListUnknown' }

  const missingGatingMetals = getMissingGatingMetals(
    versionDef.gating.smelterListGating,
    activeMinerals,
    formState.questionAnswers
  )
  let smelterList: DocStatusData
  if (activeMinerals.length === 0) {
    smelterList = { type: 'smelterListUnknown' }
  } else if (missingGatingMetals.length > 0) {
    smelterList = {
      type: 'smelterListPending',
      metals: missingGatingMetals,
      questions: getGatingQuestionLabel(versionDef.gating.smelterListGating),
    }
  } else if (requiredFields.smelterListRequired) {
    const requiredMinerals = compact(
      activeMinerals.map((mineralKey) =>
        gatingByMineral.get(mineralKey)?.smelterListRequired ? mineralKey : null
      )
    )
    smelterList = {
      type: 'smelterListRequired',
      metals: uniq(requiredMinerals),
    }
  } else {
    smelterList = { type: 'smelterListNotRequired' }
  }

  const mineList: DocStatusData = versionDef.mineList.available
    ? { type: 'mineListAvailable' }
    : { type: 'mineListNotAvailable' }

  return {
    productList,
    smelterList,
    mineList,
  }
}

function getGatingQuestionLabel(condition?: GatingCondition): 'Q1' | 'Q1/Q2' {
  if (!condition) return 'Q1/Q2'
  switch (condition.type) {
    case 'q1-yes':
    case 'q1-not-no':
    case 'q1-not-negatives':
      return 'Q1'
    case 'q1q2-yes':
    case 'q1q2-not-no':
    case 'q1-not-negatives-and-q2-not-negatives':
      return 'Q1/Q2'
    default:
      return 'Q1/Q2'
  }
}

function getMissingGatingMetals(
  condition: GatingCondition | undefined,
  activeMinerals: string[],
  answers: Record<string, Record<string, string> | string>
): string[] {
  if (!condition) return []

  const needsQ1 =
    condition.type === 'q1-yes' ||
    condition.type === 'q1-not-no' ||
    condition.type === 'q1q2-not-no' ||
    condition.type === 'q1-not-negatives' ||
    condition.type === 'q1-not-negatives-and-q2-not-negatives'
  const needsQ2 =
    condition.type === 'q1q2-yes' ||
    condition.type === 'q1q2-not-no' ||
    condition.type === 'q1-not-negatives-and-q2-not-negatives'

  const missing = new Set<string>()
  if (needsQ1) {
    const q1 = answers['Q1']
    if (typeof q1 === 'string') {
      if (!q1.trim()) activeMinerals.forEach((m) => missing.add(m))
    } else {
      activeMinerals.forEach((mineral) => {
        if (!q1?.[mineral]?.trim()) missing.add(mineral)
      })
    }
  }

  if (needsQ2) {
    const q2 = answers['Q2']
    if (typeof q2 === 'string') {
      if (!q2.trim()) activeMinerals.forEach((m) => missing.add(m))
    } else {
      activeMinerals.forEach((mineral) => {
        if (!q2?.[mineral]?.trim()) missing.add(mineral)
      })
    }
  }

  return uniq(Array.from(missing))
}
