/**
 * @file core/rules/gating.ts
 * @description 问卷门控（gating）逻辑：根据 Q1/Q2 的回答决定后续问题是否展示。
 */

import type { GatingCondition, TemplateVersionDef } from '@core/registry/types'

// ---------------------------------------------------------------------------
// 问题回答类型
// ---------------------------------------------------------------------------

/** 问题回答集合：perMineral 时为嵌套 Record，否则为 string。 */
export type QuestionAnswers = Record<string, Record<string, string> | string>

// ---------------------------------------------------------------------------
// 辅助函数：统一读取指定问题、指定矿种的回答值
// ---------------------------------------------------------------------------

/**
 * 从回答集合中读取指定问题的值。
 * - perMineral 时读取 `answers[key][mineral]`
 * - 非 perMineral 时读取 `answers[key]`（string）
 * - 无法匹配时返回空字符串
 */
function getAnswer(answers: QuestionAnswers, key: string, mineral?: string): string {
  const entry = answers[key]
  if (typeof entry === 'object' && mineral) return entry[mineral] ?? ''
  if (typeof entry === 'string') return entry
  return ''
}

// ---------------------------------------------------------------------------
// 评估单个门控条件
// ---------------------------------------------------------------------------

function evaluateCondition(
  condition: GatingCondition,
  answers: QuestionAnswers,
  mineral?: string
): boolean {
  switch (condition.type) {
    case 'always':
      return true

    case 'q1-not-no':
      // CMRT：Q1 ≠ No（未回答视为"尚未否定"，返回 true）
      return getAnswer(answers, 'Q1', mineral) !== 'No'

    case 'q1-yes':
      // CMRT：Q1 = Yes
      return getAnswer(answers, 'Q1', mineral) === 'Yes'

    case 'q1q2-not-no':
      // CMRT：Q1 ≠ No 且 Q2 ≠ No
      return (
        getAnswer(answers, 'Q1', mineral) !== 'No' &&
        getAnswer(answers, 'Q2', mineral) !== 'No'
      )

    case 'q1q2-yes':
      // CMRT：Q1 = Yes 且 Q2 = Yes
      return (
        getAnswer(answers, 'Q1', mineral) === 'Yes' &&
        getAnswer(answers, 'Q2', mineral) === 'Yes'
      )

    case 'q1-not-negatives':
      // CRT/EMRT：Q1 不在否定选项列表中
      return !condition.negatives.includes(getAnswer(answers, 'Q1', mineral))

    case 'q1-not-negatives-and-q2-not-negatives':
      // EMRT：Q1 不在否定列表 且 Q2 不在否定列表
      return (
        !condition.q1Negatives.includes(getAnswer(answers, 'Q1', mineral)) &&
        !condition.q2Negatives.includes(getAnswer(answers, 'Q2', mineral))
      )

    default:
      return true
  }
}

// ---------------------------------------------------------------------------
// Gating results
// ---------------------------------------------------------------------------

/** 门控计算结果：控制各区块是否展示/必填。 */
export interface GatingResult {
  /** Q2 对该矿种是否展示。 */
  q2Enabled: boolean
  /** Q3+ 对该矿种是否展示。 */
  laterQuestionsEnabled: boolean
  /** 公司问题区块是否展示。 */
  companyQuestionsEnabled: boolean
  /** 冶炼厂列表是否必填。 */
  smelterListRequired: boolean
}

/** 计算指定矿种的门控结果。 */
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

/** 计算所有矿种的门控结果（返回 Map）。 */
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
