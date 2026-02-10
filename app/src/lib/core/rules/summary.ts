/**
 * @file core/rules/summary.ts
 * @description 模块实现。
 */

// 说明：模块实现
import type { I18nKey } from '@core/i18n'
import type { TemplateVersionDef } from '@core/registry/types'
import { getCustomMineralLabels } from '@core/template/minerals'
import { isSmelterNotListed } from '@core/transform'
import { isValidEmail } from '@core/validation/email'
import { some } from 'lodash-es'

import type { FormDataForChecker } from './checker'
import { calculateAllGating } from './gating'
import {
  buildMineralLabelMap,
  getQuestionAnswerValue,
  getRequiredSmelterMinerals,
} from './helpers'
import type { FormStateForRequired } from './required'
import { calculateRequiredFields, getActiveMineralKeys } from './required'

/**
 * 导出类型：Translate。
 */
export type Translate = (key: I18nKey, options?: Record<string, unknown>) => string

/**
 * 导出接口类型：SectionProgress。
 */
export interface SectionProgress {
  total: number
  completed: number
}

/**
 * 导出接口类型：CheckerSummary。
 */
export interface CheckerSummary {
  completion: number
  totalRequired: number
  completedRequired: number
  /** 分区进度（用于 GlobalErrorBar 显示） */
  sections: {
    companyInfo: SectionProgress
    questionMatrix: SectionProgress
    companyQuestions: SectionProgress
    smelterList: SectionProgress
    productList: SectionProgress
  }
}

/**
 * 导出接口类型：PassedItem。
 */
export interface PassedItem {
  key: string
  label: string
  location: string
}

/**
 * 导出函数：buildCheckerSummary。
 */
export function buildCheckerSummary(
  versionDef: TemplateVersionDef,
  formState: FormStateForRequired,
  formData: FormDataForChecker,
  t: Translate
): { summary: CheckerSummary; passedItems: PassedItem[] } {
  const asText = (value: unknown) => (typeof value === 'string' ? value : '')
  const required = calculateRequiredFields(versionDef, formState)
  const { companyInfo, questions, companyQuestions, smelterList, productList } = formData

  let totalRequired = 0
  let completedRequired = 0
  const passedItems: PassedItem[] = []

  const addPassed = (key: string, label: string, location: string) => {
    passedItems.push({ key, label, location })
  }

  const declarationLabel = t('checker.groups.declaration')
  const smelterLabel = t('checker.groups.smelter')
  const productLabel = t('checker.groups.product')
  const mineralLabelByKey = buildMineralLabelMap(versionDef)
  const mineralLabelOverrides = getCustomMineralLabels(
    versionDef,
    formState.customMinerals ?? [],
    formState.selectedMinerals ?? []
  )

  // Company info fields
  let companyRequired = 0
  let companyCompleted = 0
  for (const field of versionDef.companyInfoFields) {
    const isRequired = required.companyInfo.get(field.key) === true
    if (!isRequired) continue
    totalRequired += 1
    companyRequired += 1
    const value = companyInfo[field.key] || ''
    if (value.trim()) {
      completedRequired += 1
      companyCompleted += 1
      addPassed(`companyInfo.${field.key}`, t(field.labelKey), declarationLabel)
    }
  }
  if (companyRequired > 0 && companyCompleted === companyRequired) {
    addPassed(
      'summary.companyInfo',
      t('checker.sectionComplete', { section: t('sections.companyInfo') }),
      declarationLabel
    )
  }

  // Minerals scope selection required for dynamic-dropdown templates (EMRT/AMRT)
  const requiresMineralsScopeSelection =
    (versionDef.templateType === 'emrt' || versionDef.templateType === 'amrt') &&
    versionDef.mineralScope.mode === 'dynamic-dropdown'
  if (requiresMineralsScopeSelection) {
    totalRequired += 1
    const selectedMinerals = formState.selectedMinerals ?? []
    if (selectedMinerals.length > 0) {
      completedRequired += 1
      addPassed('mineralsScope.selection', t('tabs.mineralsScope'), declarationLabel)
    }
  }

  // Questions
  let questionsRequired = 0
  let questionsCompleted = 0
  for (const question of versionDef.questions) {
    const requiredMap = required.questions.get(question.key)
    if (!requiredMap) continue
    for (const [mineralKey, isRequired] of requiredMap.entries()) {
      if (!isRequired) continue
      totalRequired += 1
      questionsRequired += 1
      const answer = getQuestionAnswerValue(
        questions,
        question.key,
        mineralKey,
        question.perMineral
      )
      if (answer.trim()) {
        completedRequired += 1
        questionsCompleted += 1
        const mineralLabelKey = mineralLabelByKey.get(mineralKey)
        const mineralLabel = mineralLabelKey ? t(mineralLabelKey) : mineralKey
        addPassed(`questions.${question.key}.${mineralKey}`, `${question.key} ${mineralLabel}`, declarationLabel)
      }
    }
  }
  if (questionsRequired > 0 && questionsCompleted === questionsRequired) {
    addPassed(
      'summary.questionMatrix',
      t('checker.sectionComplete', { section: t('sections.questionMatrix') }),
      declarationLabel
    )
  }

  const activeMinerals = getActiveMineralKeys(versionDef, formState)
  const gatingByMineral = calculateAllGating(versionDef, formState.questionAnswers, activeMinerals)

  // Company questions + comment fields
  let companyQuestionsRequired = 0
  let companyQuestionsCompleted = 0
  for (const question of versionDef.companyQuestions) {
    if (question.perMineral) {
      activeMinerals.forEach((mineralKey) => {
        const gating = gatingByMineral.get(mineralKey)
        if (!gating?.companyQuestionsEnabled) return
        totalRequired += 1
        companyQuestionsRequired += 1
        const valueRecord = companyQuestions[question.key]
        const rawValue =
          valueRecord && typeof valueRecord === 'object' ? valueRecord[mineralKey] ?? '' : ''
        const value = asText(rawValue)
        if (value.trim()) {
          completedRequired += 1
          companyQuestionsCompleted += 1
          const overrideLabel = mineralLabelOverrides.get(mineralKey)
          const mineralLabelKey = mineralLabelByKey.get(mineralKey)
          const mineralLabel = overrideLabel ?? (mineralLabelKey ? t(mineralLabelKey) : mineralKey)
          addPassed(
            `companyQuestions.${question.key}.${mineralKey}`,
            `${question.key}. ${t(question.labelKey)} (${mineralLabel})`,
            declarationLabel
          )
        }
        if (question.hasCommentField) {
          const requiredWhen = question.commentRequiredWhen ?? []
          if (requiredWhen.length === 0 || !requiredWhen.includes(value)) return
          totalRequired += 1
          companyQuestionsRequired += 1
          const commentRecord = companyQuestions[`${question.key}_comment`]
          const rawComment =
            commentRecord && typeof commentRecord === 'object'
              ? commentRecord[mineralKey] ?? ''
              : ''
          const comment = asText(rawComment)
          if (comment.trim()) {
            completedRequired += 1
            companyQuestionsCompleted += 1
            const overrideLabel = mineralLabelOverrides.get(mineralKey)
            const mineralLabelKey = mineralLabelByKey.get(mineralKey)
            const mineralLabel = overrideLabel ?? (mineralLabelKey ? t(mineralLabelKey) : mineralKey)
            addPassed(
              `companyQuestions.${question.key}_comment.${mineralKey}`,
              `${t(question.commentLabelKey ?? question.labelKey)} (${mineralLabel})`,
              declarationLabel
            )
          }
        }
      })
      continue
    }

    const isRequired = required.companyQuestions.get(question.key) === true
    if (!isRequired) continue
    totalRequired += 1
    companyQuestionsRequired += 1
    const value = asText(companyQuestions[question.key])
    if (value.trim()) {
      completedRequired += 1
      companyQuestionsCompleted += 1
      addPassed(
        `companyQuestions.${question.key}`,
        `${question.key}. ${t(question.labelKey)}`,
        declarationLabel
      )
    }

    if (question.hasCommentField) {
      const requiredWhen = question.commentRequiredWhen ?? []
      if (requiredWhen.length > 0 && requiredWhen.includes(value)) {
        totalRequired += 1
        companyQuestionsRequired += 1
        const comment = asText(companyQuestions[`${question.key}_comment`])
        if (comment.trim()) {
          completedRequired += 1
          companyQuestionsCompleted += 1
          addPassed(
            `companyQuestions.${question.key}_comment`,
            t(question.commentLabelKey ?? question.labelKey),
            declarationLabel
          )
        }
      }
    }
  }
  if (companyQuestionsRequired > 0 && companyQuestionsCompleted === companyQuestionsRequired) {
    addPassed(
      'summary.companyQuestions',
      t('checker.sectionComplete', { section: t('sections.companyQuestions') }),
      declarationLabel
    )
  }

  // Smelter list required by mineral
  const requiredMinerals = getRequiredSmelterMinerals({
    versionDef,
    activeMinerals,
    gatingByMineral,
  })
  const smelterRulesEnabled = requiredMinerals.length > 0
  let smelterRequired = 0
  let smelterCompleted = 0
  requiredMinerals.forEach((mineralKey) => {
    totalRequired += 1
    smelterRequired += 1
    const hasRow = some(smelterList, (row) => row.metal === mineralKey)
    if (hasRow) {
      completedRequired += 1
      smelterCompleted += 1
      const overrideLabel = mineralLabelOverrides.get(mineralKey)
      const mineralLabelKey = mineralLabelByKey.get(mineralKey)
      const mineralLabel = overrideLabel ?? (mineralLabelKey ? t(mineralLabelKey) : mineralKey)
      addPassed(
        `smelterList.${mineralKey}`,
        t('checker.passedSmelterForMineral', { mineral: mineralLabel }),
        smelterLabel
      )
    }
  })
  if (
    smelterRulesEnabled &&
    versionDef.smelterList.hasLookup &&
    (versionDef.templateType === 'emrt' || versionDef.templateType === 'amrt')
  ) {
    smelterList.forEach((row, index) => {
      const metal = row.metal || ''
      if (!metal.trim()) return
      totalRequired += 1
      smelterRequired += 1
      const lookup = row.smelterLookup || ''
      if (lookup.trim()) {
        completedRequired += 1
        smelterCompleted += 1
        addPassed(
          `smelterList.${index}.smelterLookup`,
          t('tables.smelterName'),
          smelterLabel
        )
      }
    })
  }
  // Smelter not listed -> name/country required (when enabled)
  if (
    smelterRulesEnabled &&
    versionDef.smelterList.hasLookup &&
    versionDef.smelterList.notListedRequireNameCountry
  ) {
    smelterList.forEach((row, index) => {
      if (!isSmelterNotListed(row.smelterLookup || '')) return
      totalRequired += 1
      smelterRequired += 1
      const name = row.smelterName || ''
      if (name.trim()) {
        completedRequired += 1
        smelterCompleted += 1
        addPassed(
          `smelterList.${index}.smelterName`,
          t('tables.smelterName'),
          smelterLabel
        )
      }
      totalRequired += 1
      smelterRequired += 1
      const country = row.smelterCountry || ''
      if (country.trim()) {
        completedRequired += 1
        smelterCompleted += 1
        addPassed(
          `smelterList.${index}.smelterCountry`,
          t('tables.country'),
          smelterLabel
        )
      }
    })
  }

  if (smelterRequired > 0 && smelterCompleted === smelterRequired) {
    addPassed(
      'summary.smelterList',
      t('checker.sectionComplete', { section: t('tabs.smelterList') }),
      smelterLabel
    )
  }

  // Product list required for scope B
  let productRequired = 0
  let productCompleted = 0
  if (formState.scopeType === 'B') {
    totalRequired += 1
    productRequired += 1
    if (productList.length > 0) {
      completedRequired += 1
      productCompleted += 1
      addPassed('productList', t('checker.passedProductList'), productLabel)
    }
    productList.forEach((row, index) => {
      totalRequired += 1
      productRequired += 1
      const value = row.productNumber || ''
      if (value.trim()) {
        completedRequired += 1
        productCompleted += 1
        addPassed(`productList.${row.id}.productNumber`, t('checker.passedProductRow', { index: index + 1 }), productLabel)
      }
    })
    if (productRequired > 0 && productCompleted === productRequired) {
      addPassed(
        'summary.productList',
        t('checker.sectionComplete', { section: t('tabs.productList') }),
        productLabel
      )
    }
  }

  // Valid email checks (only if provided)
  const contactEmail = companyInfo.contactEmail || ''
  if (contactEmail.trim() && isValidEmail(contactEmail)) {
    addPassed('companyInfo.contactEmail.valid', t('checker.validEmail', { field: t('fields.contactEmail') }), declarationLabel)
  }
  const authorizerEmail = companyInfo.authorizerEmail || ''
  if (authorizerEmail.trim() && isValidEmail(authorizerEmail)) {
    addPassed(
      'companyInfo.authorizerEmail.valid',
      t('checker.validEmail', { field: t('fields.authorizerEmail') }),
      declarationLabel
    )
  }

  const completion = totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 100

  return {
    summary: {
      completion,
      totalRequired,
      completedRequired,
      sections: {
        companyInfo: { total: companyRequired, completed: companyCompleted },
        questionMatrix: { total: questionsRequired, completed: questionsCompleted },
        companyQuestions: { total: companyQuestionsRequired, completed: companyQuestionsCompleted },
        smelterList: { total: smelterRequired, completed: smelterCompleted },
        productList: { total: productRequired, completed: productCompleted },
      },
    },
    passedItems,
  }
}
