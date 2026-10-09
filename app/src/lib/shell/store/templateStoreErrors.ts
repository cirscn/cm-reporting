import type { ErrorKey } from '@core/validation/errorKeys'

import type { TemplateFormErrors } from './templateTypes'

export const EMPTY_ERRORS: TemplateFormErrors = {
  companyInfo: {}, customMinerals: {}, mineralsScopeRows: {}, questions: {}, companyQuestions: {},
}

function setRecordError(target: TemplateFormErrors['companyQuestions'], key: PropertyKey, message: ErrorKey) {
  if (typeof key === 'string') target[key] = message
}

function setIndexedError(target: Record<number, ErrorKey>, key: PropertyKey, message: ErrorKey) {
  if (typeof key === 'number') target[key] = message
}

function setMineralsScopeRowError(errors: TemplateFormErrors, path: PropertyKey[], message: ErrorKey) {
  const [index, field] = path
  if (typeof index !== 'number' || (field !== 'mineral' && field !== 'reason')) return
  const row = errors.mineralsScopeRows[index] ?? {}
  row[field] = message
  errors.mineralsScopeRows[index] = row
}

function setQuestionError(
  target: TemplateFormErrors['questions'], path: PropertyKey[], message: ErrorKey,
) {
  const [question, mineral] = path
  if (typeof question !== 'string') return
  if (typeof mineral !== 'string') {
    target[question] = message
    return
  }
  const current = target[question]
  const errors = typeof current === 'object' ? current : {}
  errors[mineral] = message
  target[question] = errors
}

function mapIssue(errors: TemplateFormErrors, issue: { path: PropertyKey[]; message: string }) {
  const [root, ...path] = issue.path
  const message = issue.message as ErrorKey
  switch (root) {
    case 'companyInfo':
      setRecordError(errors.companyInfo, path[0], message)
      break
    case 'selectedMinerals':
      errors.mineralsScope = message
      break
    case 'customMinerals':
      setIndexedError(errors.customMinerals, path[0], message)
      break
    case 'mineralsScope':
      setMineralsScopeRowError(errors, path, message)
      break
    case 'questions':
      setQuestionError(errors.questions, path, message)
      break
    case 'companyQuestions':
      setQuestionError(errors.companyQuestions, path, message)
      break
  }
}

/** 保留原有字段级错误结构；列表业务校验仍由 checker 负责。 */
export function mapZodErrors(issues: Array<{ path: PropertyKey[]; message: string }>): TemplateFormErrors {
  const errors: TemplateFormErrors = {
    companyInfo: {}, customMinerals: {}, mineralsScopeRows: {}, questions: {}, companyQuestions: {},
  }
  issues.forEach((issue) => mapIssue(errors, issue))
  return errors
}
