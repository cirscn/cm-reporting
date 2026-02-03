/**
 * @file core/rules/required.ts
 * @description 模块实现。
 */

// 说明：模块实现
import type { FieldDef, TemplateVersionDef } from '@core/registry/types'
import { getActiveMineralKeys as getActiveMineralKeysFromTemplate } from '@core/template/minerals'

import { calculateAllGating, type GatingResult, type QuestionAnswers } from './gating'

// ---------------------------------------------------------------------------
// Required field result
// ---------------------------------------------------------------------------

/**
 * 导出接口类型：RequiredFieldsResult。
 */
export interface RequiredFieldsResult {
  companyInfo: Map<string, boolean>
  questions: Map<string, Map<string, boolean>> // Q1 -> mineral -> required
  companyQuestions: Map<string, boolean>
  smelterListRequired: boolean
  productListRequired: boolean
}

// ---------------------------------------------------------------------------
// Form state for required calculation
// ---------------------------------------------------------------------------

/**
 * 导出接口类型：FormStateForRequired。
 */
export interface FormStateForRequired {
  scopeType?: 'A' | 'B' | 'C'
  questionAnswers: QuestionAnswers
  selectedMinerals?: string[]
  customMinerals?: string[]
}

/**
 * 导出接口类型：RequiredContext。
 */
export interface RequiredContext {
  gatingByMineral: Map<string, GatingResult>
  activeMinerals: string[]
}

/**
 * 导出函数：buildRequiredContext。
 */
export function buildRequiredContext(
  versionDef: TemplateVersionDef,
  formState: FormStateForRequired
): RequiredContext {
  const activeMinerals = getActiveMineralKeysFromTemplate(
    versionDef,
    formState.selectedMinerals ?? [],
    formState.customMinerals ?? []
  )
  return {
    gatingByMineral: calculateAllGating(versionDef, formState.questionAnswers, activeMinerals),
    activeMinerals,
  }
}

// ---------------------------------------------------------------------------
// Calculate required fields
// ---------------------------------------------------------------------------

/**
 * 导出函数：calculateRequiredFields。
 */
export function calculateRequiredFields(
  versionDef: TemplateVersionDef,
  formState: FormStateForRequired
): RequiredFieldsResult {
  return calculateRequiredFieldsWithContext(
    versionDef,
    formState,
    buildRequiredContext(versionDef, formState)
  )
}

/**
 * 导出函数：calculateRequiredFieldsWithContext。
 */
export function calculateRequiredFieldsWithContext(
  versionDef: TemplateVersionDef,
  formState: FormStateForRequired,
  context: RequiredContext
): RequiredFieldsResult {
  const { gatingByMineral } = context
  const activeMinerals = new Set(context.activeMinerals)
  /** 必填计算矿种清单：以当前激活矿种为准，确保自定义矿种也被覆盖。 */
  const mineralsForRequired = context.activeMinerals

  // Company info fields
  const companyInfo = new Map<string, boolean>()
  for (const field of versionDef.companyInfoFields) {
    companyInfo.set(field.key, isFieldRequired(field, formState))
  }

  // Questions: per mineral
  const questions = new Map<string, Map<string, boolean>>()
  for (const question of versionDef.questions) {
    const mineralMap = new Map<string, boolean>()

    for (const mineralKey of mineralsForRequired) {
      if (!activeMinerals.has(mineralKey)) {
        mineralMap.set(mineralKey, false)
        continue
      }
      const gating = gatingByMineral.get(mineralKey)
      if (!gating) {
        mineralMap.set(mineralKey, false)
        continue
      }

      // Q1 always required if mineral is selected
      if (question.key === 'Q1') {
        mineralMap.set(mineralKey, true)
        continue
      }

      // Q2 required if gating allows
      if (question.key === 'Q2') {
        if (versionDef.templateType === 'amrt') {
          mineralMap.set(mineralKey, false)
        } else {
          mineralMap.set(mineralKey, gating.q2Enabled)
        }
        continue
      }

      // Q3+ required if later questions enabled
      mineralMap.set(mineralKey, gating.laterQuestionsEnabled)
    }

    questions.set(question.key, mineralMap)
  }

  // Company questions: enabled by gating
  const companyQuestions = new Map<string, boolean>()
  let companyQuestionsRequired = false
  for (const mineral of activeMinerals) {
    const gating = gatingByMineral.get(mineral)
    if (gating?.companyQuestionsEnabled) {
      companyQuestionsRequired = true
      break
    }
  }

  for (const cq of versionDef.companyQuestions) {
    companyQuestions.set(cq.key, companyQuestionsRequired)
  }

  // Smelter list required: any active mineral has smelter list required
  let smelterListRequired = false
  for (const mineralKey of activeMinerals) {
    if (gatingByMineral.get(mineralKey)?.smelterListRequired) {
      smelterListRequired = true
      break
    }
  }

  // Product list required if scope = B
  const productListRequired = formState.scopeType === 'B'

  return {
    companyInfo,
    questions,
    companyQuestions,
    smelterListRequired,
    productListRequired,
  }
}

// ---------------------------------------------------------------------------
// Active minerals helper
// ---------------------------------------------------------------------------

/**
 * 导出函数：getActiveMineralKeys。
 */
export function getActiveMineralKeys(
  versionDef: TemplateVersionDef,
  formState: FormStateForRequired
): string[] {
  return getActiveMineralKeysFromTemplate(
    versionDef,
    formState.selectedMinerals ?? [],
    formState.customMinerals ?? []
  )
}

// ---------------------------------------------------------------------------
// Helper: check if a field is required based on its definition and state
// ---------------------------------------------------------------------------

function isFieldRequired(field: FieldDef, formState: FormStateForRequired): boolean {
  if (field.required === true) return true
  if (field.required === false) return false

  // Conditional required
  if (field.required === 'conditional') {
    // scopeDescription is required if scope = C
    if (field.key === 'scopeDescription') {
      return formState.scopeType === 'C'
    }
  }

  return false
}
