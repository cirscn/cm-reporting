/**
 * @file core/rules/gating.ts
 * @description 模块实现。
 */

// 说明：模块实现
import type { GatingCondition, TemplateVersionDef } from '@core/registry/types'

// ---------------------------------------------------------------------------
// Question answers type
// ---------------------------------------------------------------------------

/**
 * 导出类型：QuestionAnswers。
 */
export type QuestionAnswers = Record<string, Record<string, string> | string>

// ---------------------------------------------------------------------------
// Evaluate a single gating condition
// ---------------------------------------------------------------------------

function evaluateCondition(
  condition: GatingCondition,
  answers: QuestionAnswers,
  mineral?: string
): boolean {
  switch (condition.type) {
    case 'always':
      return true

    case 'q1-not-no': {
      // CMRT: Q1 ≠ No
      const q1 = answers['Q1']
      if (typeof q1 === 'object' && mineral) {
        return q1[mineral] !== 'No'
      }
      if (typeof q1 === 'string') {
        return q1 !== 'No'
      }
      return true // Not answered yet
    }

    case 'q1-yes': {
      // CMRT: Q1 = Yes
      const q1 = answers['Q1']
      if (typeof q1 === 'object' && mineral) {
        return q1[mineral] === 'Yes'
      }
      if (typeof q1 === 'string') {
        return q1 === 'Yes'
      }
      return false
    }

    case 'q1q2-not-no': {
      // CMRT: Q1 ≠ No AND Q2 ≠ No
      const q1 = answers['Q1']
      const q2 = answers['Q2']
      if (typeof q1 === 'object' && typeof q2 === 'object' && mineral) {
        return q1[mineral] !== 'No' && q2[mineral] !== 'No'
      }
      if (typeof q1 === 'string' && typeof q2 === 'string') {
        return q1 !== 'No' && q2 !== 'No'
      }
      return true
    }

    case 'q1q2-yes': {
      // CMRT: Q1 = Yes AND Q2 = Yes
      const q1 = answers['Q1']
      const q2 = answers['Q2']
      if (typeof q1 === 'object' && typeof q2 === 'object' && mineral) {
        return q1[mineral] === 'Yes' && q2[mineral] === 'Yes'
      }
      if (typeof q1 === 'string' && typeof q2 === 'string') {
        return q1 === 'Yes' && q2 === 'Yes'
      }
      return false
    }

    case 'q1-not-negatives': {
      // CRT/EMRT: Q1 not in negatives
      const q1 = answers['Q1']
      if (typeof q1 === 'object' && mineral) {
        return !condition.negatives.includes(q1[mineral] || '')
      }
      if (typeof q1 === 'string') {
        return !condition.negatives.includes(q1)
      }
      return true
    }

    case 'q1-not-negatives-and-q2-not-negatives': {
      // EMRT: Q1 not in negatives AND Q2 not in negatives
      const q1 = answers['Q1']
      const q2 = answers['Q2']
      if (typeof q1 === 'object' && typeof q2 === 'object' && mineral) {
        const q1Val = q1[mineral] || ''
        const q2Val = q2[mineral] || ''
        return (
          !condition.q1Negatives.includes(q1Val) && !condition.q2Negatives.includes(q2Val)
        )
      }
      return true
    }

    default:
      return true
  }
}

// ---------------------------------------------------------------------------
// Gating results
// ---------------------------------------------------------------------------

/**
 * 导出接口类型：GatingResult。
 */
export interface GatingResult {
  /** Q2 is shown for this mineral */
  q2Enabled: boolean
  /** Q3+ are shown for this mineral */
  laterQuestionsEnabled: boolean
  /** Company questions are shown */
  companyQuestionsEnabled: boolean
  /** Smelter list is required */
  smelterListRequired: boolean
}

/**
 * Calculate gating for a specific mineral
 */
export function calculateGating(
  versionDef: TemplateVersionDef,
  answers: QuestionAnswers,
  mineral?: string
): GatingResult {
  const { gating } = versionDef

  return {
    q2Enabled: gating.q2Gating ? evaluateCondition(gating.q2Gating, answers, mineral) : true,
    laterQuestionsEnabled: gating.laterQuestionsGating
      ? evaluateCondition(gating.laterQuestionsGating, answers, mineral)
      : true,
    companyQuestionsEnabled: gating.companyQuestionsGating
      ? evaluateCondition(gating.companyQuestionsGating, answers, mineral)
      : true,
    smelterListRequired: gating.smelterListGating
      ? evaluateCondition(gating.smelterListGating, answers, mineral)
      : true,
  }
}

/**
 * Calculate gating for all minerals (returns map)
 */
export function calculateAllGating(
  versionDef: TemplateVersionDef,
  answers: QuestionAnswers,
  mineralKeys?: string[]
): Map<string, GatingResult> {
  const result = new Map<string, GatingResult>()
  const keys =
    mineralKeys ?? versionDef.mineralScope.minerals.map((mineral) => mineral.key)

  keys.forEach((key) => {
    result.set(key, calculateGating(versionDef, answers, key))
  })

  return result
}
