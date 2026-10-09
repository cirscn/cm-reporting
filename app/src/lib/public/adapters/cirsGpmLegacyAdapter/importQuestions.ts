import type { CompanyQuestionDef, QuestionDef } from '@core/registry/types'

import type { ImportContext, LegacyCompanyQuestion, LegacyRangeQuestion } from './conversionTypes'
import { ensureObjectRecord, readFieldState } from './importUtils'
import { normalizeMineralLabel } from './planCache'

function normalizeLegacyAnswer(options: { templateType: string; questionKey: string; value: unknown }) {
  if (typeof options.value !== 'string') return ''
  const trimmed = options.value.trim()
  if (!trimmed) return ''
  if (options.templateType === 'crt' && options.questionKey === 'Q4' && /^100\s*%$/.test(trimmed)) return '1'
  return trimmed
}

function resolveQuestionMineral(context: ImportContext, label: string) {
  const normalized = normalizeMineralLabel(label)
  return context.plan.mineralKeyByLabel.get(normalized) ?? context.mineralLabelToKey.get(normalized)
}

function importRangeAnswer(options: {
  context: ImportContext; item: LegacyRangeQuestion; def: QuestionDef
}) {
  const { context, item, def } = options
  const answer = normalizeLegacyAnswer({
    templateType: context.ctx.templateType, questionKey: def.key, value: item.answer,
  })
  if (!def.perMineral) {
    context.data.questions[def.key] = answer
    context.data.questionComments[def.key] = item.remark ?? ''
    return
  }
  const mineralKey = resolveQuestionMineral(context, item.question)
  if (!mineralKey) return
  if (!context.ctx.mineralLabelByKey.has(mineralKey)) context.ctx.mineralLabelByKey.set(mineralKey, item.question)
  ensureObjectRecord(context.data.questions, def.key)[mineralKey] = answer
  ensureObjectRecord(context.data.questionComments, def.key)[mineralKey] = item.remark ?? ''
}

export function importRangeQuestions(context: ImportContext) {
  const definitions = new Map(context.plan.versionDef.questions.map((def) => [def.key, def]))
  ;(context.legacy.cmtRangeQuestions ?? []).forEach((item, index) => {
    const key = context.plan.questionKeyByType.get(item.type)
    const def = key ? definitions.get(key) : undefined
    if (!def) return
    context.ctx.rangeQuestionIndexByKey.set(`${item.type}|${item.question}`, index)
    context.ctx.rangeQuestionFieldStatesByIndex.set(index, {
      answer: readFieldState(item, 'answer'), remark: readFieldState(item, 'remark'),
    })
    importRangeAnswer({ context, item, def })
  })
}

function importCompanyAnswer(options: {
  context: ImportContext; item: LegacyCompanyQuestion; def: CompanyQuestionDef
}) {
  const { context, item, def } = options
  const commentKey = `${def.key}_comment`
  if (!def.perMineral) {
    context.data.companyQuestions[def.key] = item.answer ?? ''
    if (commentKey in context.data.companyQuestions) context.data.companyQuestions[commentKey] = item.remark ?? ''
    return
  }
  const label = String(item.type ?? '')
  const mineralKey = resolveQuestionMineral(context, label)
  if (!mineralKey) return
  context.ctx.mineralLabelByKey.set(mineralKey, label)
  ensureObjectRecord(context.data.companyQuestions, def.key)[mineralKey] = item.answer ?? ''
  ensureObjectRecord(context.data.companyQuestions, commentKey)[mineralKey] = item.remark ?? ''
}

export function importCompanyQuestions(context: ImportContext) {
  const definitions = new Map(context.plan.versionDef.companyQuestions.map((def) => [def.key, def]))
  ;(context.legacy.cmtCompanyQuestions ?? []).forEach((item, index) => {
    context.ctx.companyQuestionIndexByKey.set(`${item.question}|${item.type ?? ''}`, index)
    context.ctx.companyQuestionFieldStatesByIndex.set(index, {
      answer: readFieldState(item, 'answer'), remark: readFieldState(item, 'remark'),
    })
    const def = definitions.get(item.question)
    if (def) importCompanyAnswer({ context, item, def })
  })
}
