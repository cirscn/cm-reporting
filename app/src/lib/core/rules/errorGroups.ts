/**
 * @file core/rules/errorGroups.ts
 * @description Checker 错误分组逻辑。
 */

// 说明：将错误分组规则下沉到 core，避免 UI 重复维护。
import type { I18nKey } from '@core/i18n'
import type { TemplateType, TemplateVersionDef } from '@core/registry/types'
import { groupBy } from 'lodash-es'

import type { CheckerError } from './checker'

type ErrorGroupKey =
  | 'companyInfo'
  | 'mineralsScope'
  | 'questionMatrix'
  | 'companyQuestions'
  | 'smelter'
  | 'mine'
  | 'product'
  | 'other'

/**
 * 导出类型：ErrorGroup。
 */
export type ErrorGroup = {
  key: ErrorGroupKey
  labelKey: I18nKey
  items: CheckerError[]
}

const CMRT_GROUP_ORDER: Array<{ key: ErrorGroupKey; labelKey: I18nKey }> = [
  { key: 'companyInfo', labelKey: 'checker.groups.companyInfo' },
  { key: 'mineralsScope', labelKey: 'checker.groups.mineralsScope' },
  { key: 'questionMatrix', labelKey: 'checker.groups.questionMatrix' },
  { key: 'companyQuestions', labelKey: 'checker.groups.companyQuestions' },
  { key: 'smelter', labelKey: 'checker.groups.smelter' },
  { key: 'mine', labelKey: 'checker.groups.mine' },
  { key: 'product', labelKey: 'checker.groups.product' },
  { key: 'other', labelKey: 'checker.groups.other' },
] as const

const DEFAULT_GROUP_ORDER: Array<{ key: ErrorGroupKey; labelKey: I18nKey }> = [
  { key: 'companyInfo', labelKey: 'checker.groups.companyInfo' },
  { key: 'mineralsScope', labelKey: 'checker.groups.mineralsScope' },
  { key: 'questionMatrix', labelKey: 'checker.groups.questionMatrix' },
  { key: 'companyQuestions', labelKey: 'checker.groups.companyQuestions' },
  { key: 'product', labelKey: 'checker.groups.product' },
  { key: 'smelter', labelKey: 'checker.groups.smelter' },
  { key: 'mine', labelKey: 'checker.groups.mine' },
  { key: 'other', labelKey: 'checker.groups.other' },
] as const

/**
 * 选择分组顺序：CMRT 按 Excel Checker（Smelter 在 Product 之前），
 * 其余模板按 PRD（Product 在 Smelter 之前）。
 */
const getGroupOrder = (templateType?: TemplateType) =>
  templateType === 'cmrt' ? CMRT_GROUP_ORDER : DEFAULT_GROUP_ORDER

const getGroupKey = (fieldPath: string): ErrorGroupKey => {
  const prefix = fieldPath.split('.')[0]
  switch (prefix) {
    case 'companyInfo':
      return 'companyInfo'
    case 'mineralsScope':
      return 'mineralsScope'
    case 'questions':
      return 'questionMatrix'
    case 'companyQuestions':
      return 'companyQuestions'
    case 'smelterList':
      return 'smelter'
    case 'mineList':
      return 'mine'
    case 'productList':
      return 'product'
    default:
      return 'other'
  }
}

/**
 * 导出函数：groupCheckerErrors。
 */
const parseIndex = (value: string) => {
  const index = Number(value)
  return Number.isFinite(index) ? index : null
}

const buildOrderMap = (keys: string[]) =>
  new Map(keys.map((key, index) => [key, index]))

const buildSortKeyFactory = (versionDef: TemplateVersionDef | undefined) => {
  if (!versionDef) {
    return (_groupKey: ErrorGroupKey, error: CheckerError) => error.fieldPath
  }

  const companyInfoOrder = buildOrderMap(
    versionDef.companyInfoFields.map((field) => field.key)
  )
  const questionOrder = buildOrderMap(versionDef.questions.map((question) => question.key))
  const mineralOrder = buildOrderMap(
    versionDef.mineralScope.minerals.map((mineral) => mineral.key)
  )
  const companyQuestionOrder = buildOrderMap(
    versionDef.companyQuestions.map((question) => question.key)
  )

  return (groupKey: ErrorGroupKey, error: CheckerError) => {
    const parts = error.fieldPath.split('.')
    switch (groupKey) {
      case 'companyInfo': {
        const key = parts[1] ?? ''
        return `${companyInfoOrder.get(key) ?? 999}-${error.fieldPath}`
      }
      case 'mineralsScope': {
        const index = parseIndex(parts[1] ?? '')
        return `${index ?? 999}-mineralsScope-${error.fieldPath}`
      }
      case 'questionMatrix': {
        const questionKey = parts[1] ?? ''
        const mineralKey = parts[2] ?? ''
        const questionIndex = questionOrder.get(questionKey) ?? 999
        const mineralIndex = mineralKey ? mineralOrder.get(mineralKey) ?? 999 : -1
        return `${questionIndex}-${mineralIndex}-${error.fieldPath}`
      }
      case 'companyQuestions': {
        const keyWithSuffix = parts[1] ?? ''
        const isComment = keyWithSuffix.endsWith('_comment')
        const key = isComment ? keyWithSuffix.replace('_comment', '') : keyWithSuffix
        const base = companyQuestionOrder.get(key) ?? 999
        const mineralKey = !isComment ? parts[2] : ''
        const mineralIndex = mineralKey ? mineralOrder.get(mineralKey) ?? 999 : -1
        const suffix = isComment ? 2 : mineralKey ? 0 : 1
        return `${base}-${suffix}-${mineralIndex}-${error.fieldPath}`
      }
      case 'smelter': {
        const index = parseIndex(parts[1] ?? '')
        if (index !== null) {
          return `${index}-smelter-${error.fieldPath}`
        }
        const mineralIndex = mineralOrder.get(parts[1] ?? '') ?? 999
        return `${mineralIndex}-mineral-${error.fieldPath}`
      }
      case 'mine': {
        const index = parseIndex(parts[1] ?? '')
        return `${index ?? -1}-mine-${error.fieldPath}`
      }
      case 'product': {
        const index = parseIndex(parts[1] ?? '')
        return `${index ?? -1}-product-${error.fieldPath}`
      }
      default:
        return error.fieldPath
    }
  }
}

export function groupCheckerErrors(
  errors: CheckerError[],
  versionDef?: TemplateVersionDef
): ErrorGroup[] {
  const grouped = groupBy(errors, (error) => getGroupKey(error.fieldPath))
  const sortKeyFactory = buildSortKeyFactory(versionDef)
  const groupOrder = getGroupOrder(versionDef?.templateType)

  return groupOrder.flatMap((group) => {
    const items = grouped[group.key]
    if (!items || items.length === 0) return []
    const sorted = [...items].sort((a, b) =>
      sortKeyFactory(group.key, a).localeCompare(sortKeyFactory(group.key, b))
    )
    return [{ key: group.key, labelKey: group.labelKey, items: sorted }]
  })
}
