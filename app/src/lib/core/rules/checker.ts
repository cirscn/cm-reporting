/**
 * @file core/rules/checker.ts
 * @description 模块实现。
 */

// 说明：模块实现
import type { I18nKey } from '@core/i18n'
import type { TemplateVersionDef } from '@core/registry/types'
import { getCustomMineralLabels, getMetalsForSource } from '@core/template/minerals'
import { isSmelterNotListed } from '@core/transform'
import type { MineralsScopeRow } from '@core/types/tableRows'
import { isValidEmail } from '@core/validation/email'
import { ERROR_KEYS, type ErrorKey } from '@core/validation/errorKeys'
import { some } from 'lodash-es'

import {
  getCompanyQuestionAnswerValue,
  isCompanyQuestionCommentRequired,
} from './companyQuestions'
import { calculateAllGating } from './gating'
import {
  buildMineralLabelMap,
  getQuestionAnswerValue,
  getRequiredSmelterMinerals,
} from './helpers'
import { getActiveMineralKeys, type FormStateForRequired } from './required'
import { findDuplicateSmelterSelections } from './smelterDuplicates'

const REQUIRED_MINE_FIELDS_AFTER_METAL = [
  { key: 'smelterName', labelKey: 'tables.mineSmelterName' },
  { key: 'mineName', labelKey: 'tables.mineName' },
  { key: 'mineCountry', labelKey: 'tables.mineCountry' },
] as const

// ---------------------------------------------------------------------------
// Checker error
// ---------------------------------------------------------------------------

/**
 * 导出接口类型：CheckerError。
 */
export interface CheckerError {
  code: string // e.g., "R001", "E001", "C001", "A001"
  messageKey: ErrorKey // i18n key
  fieldPath: string // e.g., "companyInfo.companyName", "questions.Q1.tantalum"
  fieldLabelKey?: I18nKey
  messageValues?: Record<string, string>
  severity: 'error'
}

// ---------------------------------------------------------------------------
// Form data for checking
// ---------------------------------------------------------------------------

/**
 * 导出接口类型：FormDataForChecker。
 */
export interface FormDataForChecker {
  companyInfo: Record<string, string>
  questions: Record<string, Record<string, string> | string>
  companyQuestions: Record<string, Record<string, string> | string>
  mineralsScope: MineralsScopeRow[]
  smelterList: Array<Record<string, string | undefined>>
  mineList?: Array<Record<string, string | undefined>>
  productList: Array<Record<string, string | undefined>>
}

// ---------------------------------------------------------------------------
// Run checker
// ---------------------------------------------------------------------------

/**
 * 导出函数：runChecker。
 */
export function runChecker(
  versionDef: TemplateVersionDef,
  formState: FormStateForRequired,
  formData: FormDataForChecker
): CheckerError[] {
  const errors: CheckerError[] = []

  // Check company info required fields
  checkCompanyInfo(versionDef, formState, formData, errors)

  // Check minerals scope selection for templates with dynamic scope
  checkMineralsScopeSelection(versionDef, formState, errors)

  // Check questions
  checkQuestions(versionDef, formState, formData, errors)

  // Check company-level questions
  checkCompanyQuestions(versionDef, formState, formData, errors)

  // Check smelter list
  checkSmelterList(versionDef, formState, formData, errors)

  // Check product list
  checkProductList(versionDef, formState, formData, errors)

  // Check minerals scope (AMRT only)
  checkMineralsScope(versionDef, formData, errors)

  // Check mine list
  checkMineList(versionDef, formData, errors)

  // Check email format
  checkEmailFormat(formData, errors)

  return errors
}

// ---------------------------------------------------------------------------
// Check company info
// ---------------------------------------------------------------------------

function checkCompanyInfo(
  versionDef: TemplateVersionDef,
  formState: FormStateForRequired,
  formData: FormDataForChecker,
  errors: CheckerError[]
) {
  for (const field of versionDef.companyInfoFields) {
    const value = formData.companyInfo[field.key] || ''

    // Check required
    if (field.required === true && !value.trim()) {
      pushError(
        errors,
        'R',
        ERROR_KEYS.checker.requiredField,
        `companyInfo.${field.key}`,
        field.labelKey
      )
    }

    // Check conditional required (scope C -> scopeDescription)
    if (
      field.required === 'conditional' &&
      field.key === 'scopeDescription' &&
      formState.scopeType === 'C' &&
      !value.trim()
    ) {
      pushError(
        errors,
        'R',
        ERROR_KEYS.checker.requiredField,
        'companyInfo.scopeDescription',
        'fields.scopeDescription'
      )
    }
  }
}

// ---------------------------------------------------------------------------
// Check questions (Q1/Q2/Q3+ required per gating)
// ---------------------------------------------------------------------------

function checkQuestions(
  versionDef: TemplateVersionDef,
  formState: FormStateForRequired,
  formData: FormDataForChecker,
  errors: CheckerError[]
) {
  const activeMinerals = getActiveMineralKeys(versionDef, formState)
  const gatingByMineral = calculateAllGating(versionDef, formState.questionAnswers, activeMinerals)

  for (const question of versionDef.questions) {
    if (question.perMineral) {
      for (const mineralKey of activeMinerals) {
        const gating = gatingByMineral.get(mineralKey)
        const value = getQuestionAnswerValue(
          formData.questions,
          question.key,
          mineralKey,
          question.perMineral
        )
        const required = isQuestionRequired(versionDef, question.key, gating)
        if (required && !value.trim()) {
          pushError(
            errors,
            'E',
            ERROR_KEYS.checker.requiredField,
            `questions.${question.key}.${mineralKey}`,
            question.labelKey
          )
        }
      }
    } else {
      const firstMineralKey = activeMinerals[0] ?? versionDef.mineralScope.minerals[0]?.key
      const gating = firstMineralKey ? gatingByMineral.get(firstMineralKey) : undefined
      const value = getQuestionAnswerValue(
        formData.questions,
        question.key,
        firstMineralKey ?? '',
        question.perMineral
      )
      const required = isQuestionRequired(versionDef, question.key, gating)
      if (required && !value.trim()) {
        pushError(
          errors,
          'E',
          ERROR_KEYS.checker.requiredField,
          `questions.${question.key}`,
          question.labelKey
        )
      }
    }
  }
}

function checkMineralsScopeSelection(
  versionDef: TemplateVersionDef,
  formState: FormStateForRequired,
  errors: CheckerError[]
) {
  if (versionDef.templateType !== 'emrt' && versionDef.templateType !== 'amrt') return
  if (versionDef.mineralScope.mode !== 'dynamic-dropdown') return
  const selectedMinerals = formState.selectedMinerals ?? []
  if (selectedMinerals.length > 0) return

  pushError(
    errors,
    'R',
    ERROR_KEYS.checker.requiredField,
    'mineralsScope.selection',
    'tabs.mineralsScope'
  )
}

// ---------------------------------------------------------------------------
// Check company-level questions
// ---------------------------------------------------------------------------

function checkCompanyQuestions(
  versionDef: TemplateVersionDef,
  formState: FormStateForRequired,
  formData: FormDataForChecker,
  errors: CheckerError[]
) {
  if (versionDef.companyQuestions.length === 0) return

  const activeMinerals = getActiveMineralKeys(versionDef, formState)
  const gatingByMineral = calculateAllGating(versionDef, formState.questionAnswers, activeMinerals)
  const hasRequiredMineral = some(
    activeMinerals,
    (mineralKey) => gatingByMineral.get(mineralKey)?.companyQuestionsEnabled === true,
  )
  for (const question of versionDef.companyQuestions) {
    if (question.perMineral) {
      // ── perMineral 公司问题：每个活跃矿种独立校验 ──
      for (const mineralKey of activeMinerals) {
        const required = gatingByMineral.get(mineralKey)?.companyQuestionsEnabled === true
        checkSingleCompanyQuestion(formData, question, errors, required, mineralKey)
      }
    } else {
      // ── 全局公司问题 ──
      checkSingleCompanyQuestion(formData, question, errors, hasRequiredMineral)
    }
  }
}

/**
 * 校验单个公司级问题（含 comment 条件校验）。
 *
 * @param mineralKey - 若为 perMineral 问题则传入矿种 key，否则 undefined
 */
function checkSingleCompanyQuestion(
  formData: FormDataForChecker,
  question: TemplateVersionDef['companyQuestions'][number],
  errors: CheckerError[],
  required: boolean,
  mineralKey?: string,
) {
  const fieldSuffix = mineralKey ? `.${mineralKey}` : ''

  // ── 1. 校验回答值是否为空 ──
  const value = getCompanyQuestionAnswerValue(
    formData.companyQuestions,
    question.key,
    mineralKey
  )

  if (required && !value.trim()) {
    pushError(errors, 'E', ERROR_KEYS.checker.requiredField, `companyQuestions.${question.key}${fieldSuffix}`, question.labelKey)
    return
  }

  // ── 2. 条件校验 comment：仅当回答值匹配 commentRequiredWhen 时 ──
  if (!isCompanyQuestionCommentRequired(question, value)) return

  const commentKey = `${question.key}_comment`
  const comment = getCompanyQuestionAnswerValue(
    formData.companyQuestions,
    commentKey,
    mineralKey
  )

  if (!comment.trim()) {
    pushError(
      errors, 'E', ERROR_KEYS.checker.requiredCompanyQuestionComment,
      `companyQuestions.${commentKey}${fieldSuffix}`,
      question.commentLabelKey ?? question.labelKey,
    )
  }
}

// ---------------------------------------------------------------------------
// Check product list
// ---------------------------------------------------------------------------

function checkProductList(
  versionDef: TemplateVersionDef,
  formState: FormStateForRequired,
  formData: FormDataForChecker,
  errors: CheckerError[]
) {
  if (formState.scopeType !== 'B') return

  const rows = formData.productList ?? []
  if (rows.length === 0) {
    pushError(errors, 'R', ERROR_KEYS.checker.requiredProductList, 'productList')
    return
  }

  rows.forEach((row, index) => {
    const partNumber = row.partNumber || ''
    if (!partNumber.trim()) {
      pushError(
        errors,
        'R',
        ERROR_KEYS.checker.requiredField,
        `productList.${index}.partNumber`,
        versionDef.productList.partNumberLabelKey
      )
    }
  })
}

// ---------------------------------------------------------------------------
// Check minerals scope (AMRT only)
// ---------------------------------------------------------------------------

function checkMineralsScope(
  versionDef: TemplateVersionDef,
  formData: FormDataForChecker,
  errors: CheckerError[]
) {
  if (versionDef.templateType !== 'amrt') return

  const rows = formData.mineralsScope ?? []
  rows.forEach((row, index) => {
    const mineral = (row.mineral ?? '').trim()
    if (!mineral) return
    const reason = (row.reason ?? '').trim()
    if (!reason) {
      pushError(
        errors,
        'A',
        ERROR_KEYS.checker.requiredField,
        `mineralsScope.${index}.reason`,
        'tables.mineralsScopeReason'
      )
    }
  })
}

// ---------------------------------------------------------------------------
// Check smelter list
// ---------------------------------------------------------------------------

function getSelectableSmelterMetalKeys(
  versionDef: TemplateVersionDef,
  formState: FormStateForRequired
): Set<string> {
  return new Set(
    getMetalsForSource(
      versionDef.smelterList.metalDropdownSource,
      versionDef,
      formState.questionAnswers,
      {
        selectedMinerals: formState.selectedMinerals,
        customMinerals: formState.customMinerals,
      }
    ).map((mineral) => mineral.key)
  )
}

function getSmelterMetalErrorLabel(params: {
  metal: string
  mineralLabelMap: Map<string, I18nKey>
  mineralLabelOverrides: Map<string, string>
}): {
  fieldLabelKey?: I18nKey
  messageValues?: Record<string, string>
} {
  const override = params.mineralLabelOverrides.get(params.metal)
  if (override) return { messageValues: { field: override } }

  const labelKey = params.mineralLabelMap.get(params.metal)
  if (labelKey) return { fieldLabelKey: labelKey }

  return { messageValues: { field: params.metal } }
}

function checkOutOfScopeSmelterMetals(params: {
  rows: FormDataForChecker['smelterList']
  selectableMetalKeys: Set<string>
  mineralLabelMap: Map<string, I18nKey>
  mineralLabelOverrides: Map<string, string>
  errors: CheckerError[]
}) {
  const reportedMetals = new Set<string>()
  params.rows.forEach((row, index) => {
    const metal = (row.metal ?? '').trim()
    if (!metal || params.selectableMetalKeys.has(metal)) return
    if (reportedMetals.has(metal)) return

    reportedMetals.add(metal)

    const label = getSmelterMetalErrorLabel({
      metal,
      mineralLabelMap: params.mineralLabelMap,
      mineralLabelOverrides: params.mineralLabelOverrides,
    })
    pushError(
      params.errors,
      'R',
      ERROR_KEYS.checker.outOfScopeSmelterMetal,
      `smelterList.${index}.metal`,
      label.fieldLabelKey,
      label.messageValues
    )
  })
}

function checkRequiredSmelterMinerals(params: {
  requiredMinerals: string[]
  rows: FormDataForChecker['smelterList']
  mineralLabelMap: Map<string, I18nKey>
  mineralLabelOverrides: Map<string, string>
  errors: CheckerError[]
}) {
  for (const mineralKey of params.requiredMinerals) {
    const hasRow = some(params.rows, (row) => row.metal === mineralKey)
    if (hasRow) continue

    const override = params.mineralLabelOverrides.get(mineralKey)
    pushError(
      params.errors,
      'R',
      ERROR_KEYS.checker.requiredSmelterList,
      `smelterList.${mineralKey}`,
      override ? undefined : params.mineralLabelMap.get(mineralKey),
      override ? { field: override } : undefined
    )
  }
}

function checkDuplicateSmelterSelections(params: {
  rows: FormDataForChecker['smelterList']
  errors: CheckerError[]
}) {
  const duplicates = findDuplicateSmelterSelections(params.rows)
  duplicates.forEach((duplicate) => {
    pushError(
      params.errors,
      'R',
      ERROR_KEYS.checker.duplicateSmelterSelection,
      `smelterList.${duplicate.index}.id`,
      undefined,
      { field: duplicate.metal }
    )
  })
}

function checkSmelterList(
  versionDef: TemplateVersionDef,
  formState: FormStateForRequired,
  formData: FormDataForChecker,
  errors: CheckerError[]
) {
  const rows = formData.smelterList ?? []
  const activeMinerals = getActiveMineralKeys(versionDef, formState)
  const gatingByMineral = calculateAllGating(versionDef, formState.questionAnswers, activeMinerals)
  const mineralLabelMap = buildMineralLabelMap(versionDef)
  const mineralLabelOverrides = getCustomMineralLabels(
    versionDef,
    formState.customMinerals ?? [],
    formState.selectedMinerals ?? []
  )
  const selectableMetalKeys = getSelectableSmelterMetalKeys(versionDef, formState)

  const requiredMinerals = getRequiredSmelterMinerals({
    versionDef,
    activeMinerals,
    gatingByMineral,
  })

  if (requiredMinerals.length > 0) {
    checkRequiredSmelterMinerals({
      requiredMinerals,
      rows,
      mineralLabelMap,
      mineralLabelOverrides,
      errors,
    })
  }

  checkDuplicateSmelterSelections({ rows, errors })

  checkOutOfScopeSmelterMetals({
    rows,
    selectableMetalKeys,
    mineralLabelMap,
    mineralLabelOverrides,
    errors,
  })

  if (requiredMinerals.length === 0) return

  if (!versionDef.smelterList.hasLookup) return

  rows.forEach((row, index) => {
    const metal = row.metal || ''
    if (!metal.trim()) return
    if (!selectableMetalKeys.has(metal.trim())) return
    const lookup = row.smelterLookup || ''
    if (lookup.trim()) return
    pushError(
      errors,
      'R',
      ERROR_KEYS.checker.requiredField,
      `smelterList.${index}.smelterLookup`,
      'tables.smelterLookup'
    )
  })

  if (!versionDef.smelterList.notListedRequireNameCountry) return

  rows.forEach((row, index) => {
    const metal = (row.metal || '').trim()
    if (metal && !selectableMetalKeys.has(metal)) return
    if (!isSmelterNotListed(row.smelterLookup || '')) return
    const name = row.smelterName || ''
    if (!name.trim()) {
      pushError(
        errors,
        'R',
        ERROR_KEYS.checker.requiredField,
        `smelterList.${index}.smelterName`,
        'tables.smelterName'
      )
    }
    const country = row.smelterCountry || ''
    if (!country.trim()) {
      pushError(
        errors,
        'R',
        ERROR_KEYS.checker.requiredField,
        `smelterList.${index}.smelterCountry`,
        'tables.country'
      )
    }
  })
}

// ---------------------------------------------------------------------------
// Check mine list
// ---------------------------------------------------------------------------

function checkMineList(
  versionDef: TemplateVersionDef,
  formData: FormDataForChecker,
  errors: CheckerError[],
) {
  if (!versionDef.mineList.available) return

  const rows = formData.mineList ?? []
  rows.forEach((row, index) => {
    const metal = row.metal || ''
    if (!metal.trim()) return

    REQUIRED_MINE_FIELDS_AFTER_METAL.forEach((field) => {
      const value = row[field.key] || ''
      if (value.trim()) return
      pushError(
        errors,
        'R',
        ERROR_KEYS.checker.requiredField,
        `mineList.${index}.${field.key}`,
        field.labelKey,
      )
    })
  })
}

// ---------------------------------------------------------------------------
// Check email format
// ---------------------------------------------------------------------------

function checkEmailFormat(formData: FormDataForChecker, errors: CheckerError[]) {
  const emailFields = ['contactEmail', 'authorizerEmail'] as const
  for (const key of emailFields) {
    const value = formData.companyInfo[key] || ''
    if (value.trim() && !isValidEmail(value)) {
      const fieldLabelKey = key === 'contactEmail' ? 'fields.contactEmail' : 'fields.authorizerEmail'
      pushError(
        errors,
        'E',
        ERROR_KEYS.checker.invalidEmail,
        `companyInfo.${key}`,
        fieldLabelKey
      )
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pushError(
  errors: CheckerError[],
  prefix: string,
  messageKey: ErrorKey,
  fieldPath: string,
  fieldLabelKey?: I18nKey,
  messageValues?: Record<string, string>
) {
  errors.push({
    code: `${prefix}${String(errors.length + 1).padStart(3, '0')}`,
    messageKey,
    fieldPath,
    fieldLabelKey,
    messageValues,
    severity: 'error',
  })
}

function isQuestionRequired(
  versionDef: TemplateVersionDef,
  questionKey: string,
  gating?: { q2Enabled: boolean; laterQuestionsEnabled: boolean }
) {
  if (questionKey === 'Q1') return true
  if (questionKey === 'Q2') {
    if (versionDef.templateType === 'amrt') return false
    return gating?.q2Enabled ?? true
  }
  return gating?.laterQuestionsEnabled ?? true
}

// ---------------------------------------------------------------------------
// Get error count
// ---------------------------------------------------------------------------

/**
 * 导出函数：getErrorCount。
 */
export function getErrorCount(errors: CheckerError[]): number {
  return errors.length
}
