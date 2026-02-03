/**
 * @file core/rules/checker.ts
 * @description 模块实现。
 */

// 说明：模块实现
import type { I18nKey } from '@core/i18n'
import type { TemplateVersionDef } from '@core/registry/types'
import { getCustomMineralLabels } from '@core/template/minerals'
import { isSmelterNotListed } from '@core/transform'
import type { MineralsScopeRow } from '@core/types/tableRows'
import { isValidEmail } from '@core/validation/email'
import { ERROR_KEYS, type ErrorKey } from '@core/validation/errorKeys'
import { some } from 'lodash-es'

import { calculateAllGating } from './gating'
import {
  buildMineralLabelMap,
  getQuestionAnswerValue,
  getRequiredSmelterMinerals,
} from './helpers'
import { getActiveMineralKeys, type FormStateForRequired } from './required'

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

  // Check mine list (no-op for templates without checker rules)
  checkMineList(versionDef)

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

  const asText = (value: unknown) => (typeof value === 'string' ? value : '')

  const activeMinerals = getActiveMineralKeys(versionDef, formState)
  const gatingByMineral = calculateAllGating(versionDef, formState.questionAnswers, activeMinerals)
  const hasRequiredMineral = some(
    activeMinerals,
    (mineralKey) => gatingByMineral.get(mineralKey)?.companyQuestionsEnabled === true
  )

  if (!hasRequiredMineral) return

  for (const question of versionDef.companyQuestions) {
    if (question.perMineral) {
      for (const mineralKey of activeMinerals) {
        const gating = gatingByMineral.get(mineralKey)
        if (!gating?.companyQuestionsEnabled) continue
        const valueRecord = formData.companyQuestions[question.key]
        const rawValue =
          valueRecord && typeof valueRecord === 'object' ? valueRecord[mineralKey] ?? '' : ''
        const value = asText(rawValue)
        if (!value.trim()) {
          pushError(
            errors,
            'E',
            ERROR_KEYS.checker.requiredField,
            `companyQuestions.${question.key}.${mineralKey}`,
            question.labelKey
          )
          continue
        }
        if (question.hasCommentField) {
          const requiredWhen = question.commentRequiredWhen ?? []
          if (requiredWhen.length === 0 || !requiredWhen.includes(value)) {
            continue
          }
          const commentRecord = formData.companyQuestions[`${question.key}_comment`]
          const rawComment =
            commentRecord && typeof commentRecord === 'object'
              ? commentRecord[mineralKey] ?? ''
              : ''
          const comment = asText(rawComment)
          if (!comment.trim()) {
            pushError(
              errors,
              'E',
              ERROR_KEYS.checker.requiredCompanyQuestionComment,
              `companyQuestions.${question.key}_comment.${mineralKey}`,
              question.commentLabelKey ?? question.labelKey
            )
          }
        }
      }
      continue
    }

    const value = asText(formData.companyQuestions[question.key])
    if (!value.trim()) {
      pushError(
        errors,
        'E',
        ERROR_KEYS.checker.requiredField,
        `companyQuestions.${question.key}`,
        question.labelKey
      )
      continue
    }

    if (question.hasCommentField) {
      const requiredWhen = question.commentRequiredWhen ?? []
      if (requiredWhen.length === 0 || !requiredWhen.includes(value)) {
        continue
      }
      const comment = asText(formData.companyQuestions[`${question.key}_comment`])
      if (!comment.trim()) {
        pushError(
          errors,
          'E',
          ERROR_KEYS.checker.requiredCompanyQuestionComment,
          `companyQuestions.${question.key}_comment`,
          question.commentLabelKey ?? question.labelKey
        )
      }
    }
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
    const productNumber = row.productNumber || ''
    if (!productNumber.trim()) {
      pushError(
        errors,
        'R',
        ERROR_KEYS.checker.requiredField,
        `productList.${index}.productNumber`,
        versionDef.productList.productNumberLabelKey
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

  const requiredMinerals = getRequiredSmelterMinerals({
    versionDef,
    activeMinerals,
    gatingByMineral,
  })

  if (requiredMinerals.length === 0) return

  for (const mineralKey of requiredMinerals) {
    const hasRow = some(rows, (row) => row.metal === mineralKey)
    if (!hasRow) {
      const override = mineralLabelOverrides.get(mineralKey)
      pushError(
        errors,
        'R',
        ERROR_KEYS.checker.requiredSmelterList,
        `smelterList.${mineralKey}`,
        override ? undefined : mineralLabelMap.get(mineralKey),
        override ? { field: override } : undefined
      )
    }
  }

  if (!versionDef.smelterList.hasLookup) return
  if (!versionDef.smelterList.notListedRequireNameCountry) return

  rows.forEach((row, index) => {
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
// Check mine list (no template currently requires it in Checker)
// ---------------------------------------------------------------------------

function checkMineList(versionDef: TemplateVersionDef) {
  if (!versionDef.mineList.available) return
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
