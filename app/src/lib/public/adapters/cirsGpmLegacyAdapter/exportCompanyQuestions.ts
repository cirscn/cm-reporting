import type { ExportContext } from './conversionTypes'
import { ensureQuestionList, getNestedString, isActiveQuestionMineral, writeQuestionAnswers } from './exportQuestionUtils'
import { buildQuestionExportScope, getString, labelForMineralKey } from './exportUtils'

function patchMineralCompanyQuestion(options: {
  context: ExportContext; questionKey: string; mineralKey: string
}) {
  const { context, questionKey, mineralKey } = options
  const type = labelForMineralKey(context, mineralKey)
  const originalLabel = context.ctx.mineralLabelByKey.get(mineralKey) ?? type
  const index = context.ctx.companyQuestionIndexByKey.get(`${questionKey}|${originalLabel}`)
  const answer = getNestedString({ value: context.data.companyQuestions, key: questionKey, subKey: mineralKey })
  const remark = getNestedString({ value: context.data.companyQuestions, key: `${questionKey}_comment`, subKey: mineralKey })
  if (index === undefined) {
    if (!answer && !remark) return
    ensureQuestionList({ context, key: 'cmtCompanyQuestions' }).push({ question: questionKey, type, answer, remark })
    return
  }
  const item = context.out.cmtCompanyQuestions![index]!
  writeQuestionAnswers({ item, state: context.ctx.companyQuestionFieldStatesByIndex.get(index), answer, remark })
  item.question = questionKey
  item.type = type
}

function patchGlobalCompanyQuestion(context: ExportContext, questionKey: string) {
  const index = context.ctx.companyQuestionIndexByKey.get(`${questionKey}|`)
  const answer = getString(context.data.companyQuestions[questionKey])
  const remark = getString(context.data.companyQuestions[`${questionKey}_comment`])
  if (index === undefined) {
    if (!answer && !remark) return
    ensureQuestionList({ context, key: 'cmtCompanyQuestions' }).push({ question: questionKey, type: null, answer, remark })
    return
  }
  const item = context.out.cmtCompanyQuestions![index]!
  writeQuestionAnswers({ item, state: context.ctx.companyQuestionFieldStatesByIndex.get(index), answer, remark })
  item.question = questionKey
  if ('type' in item) item.type = null
}

function pruneCompanyQuestions(context: ExportContext, scope: ReturnType<typeof buildQuestionExportScope>) {
  return context.out.cmtCompanyQuestions?.filter((item) => {
    const questionKey = typeof item.question === 'string' ? item.question : String(item.question ?? '')
    const def = context.plan.versionDef.companyQuestions.find((question) => question.key === questionKey)
    if (!def?.perMineral) return true
    const label = typeof item.type === 'string' ? item.type : item.type == null ? '' : String(item.type)
    return isActiveQuestionMineral({ context, label, scope })
  })
}

export function patchCompanyQuestions(context: ExportContext) {
  const existing = !!context.out.cmtCompanyQuestions
  const scope = buildQuestionExportScope(context)
  for (const def of context.plan.versionDef.companyQuestions) {
    if (!def.perMineral) {
      patchGlobalCompanyQuestion(context, def.key)
      continue
    }
    for (const mineralKey of scope.activeMineralKeys) {
      patchMineralCompanyQuestion({ context, questionKey: def.key, mineralKey })
    }
  }
  if (!context.out.cmtCompanyQuestions) return
  const pruned = pruneCompanyQuestions(context, scope)!
  context.out.cmtCompanyQuestions = pruned
  if (!existing && pruned.length === 0) delete context.out.cmtCompanyQuestions
}
