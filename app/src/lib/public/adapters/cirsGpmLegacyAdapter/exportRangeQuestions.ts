import type { ExportContext } from './conversionTypes'
import { ensureQuestionList, getNestedString, isActiveQuestionMineral, writeQuestionAnswers } from './exportQuestionUtils'
import { buildQuestionExportScope, getString, labelForMineralKey } from './exportUtils'

function patchMineralQuestion(options: {
  context: ExportContext; type: number; questionKey: string; mineralKey: string
}) {
  const { context, type, questionKey, mineralKey } = options
  const label = labelForMineralKey(context, mineralKey)
  const originalLabel = context.ctx.mineralLabelByKey.get(mineralKey) ?? label
  const index = context.ctx.rangeQuestionIndexByKey.get(`${type}|${originalLabel}`)
  const answer = getNestedString({ value: context.data.questions, key: questionKey, subKey: mineralKey })
  const remark = getNestedString({ value: context.data.questionComments, key: questionKey, subKey: mineralKey })
  if (index === undefined) {
    if (!answer && !remark) return
    ensureQuestionList({ context, key: 'cmtRangeQuestions' }).push({ type, question: label, answer, remark })
    return
  }
  const item = context.out.cmtRangeQuestions![index]!
  writeQuestionAnswers({ item, state: context.ctx.rangeQuestionFieldStatesByIndex.get(index), answer, remark })
  item.type = type
  item.question = label
}

function patchGlobalQuestion(options: { context: ExportContext; type: number; questionKey: string }) {
  const { context, type, questionKey } = options
  const entry = Array.from(context.ctx.rangeQuestionIndexByKey).find(([key]) => key.startsWith(`${type}|`))
  const index = entry?.[1]
  const answer = getString(context.data.questions[questionKey])
  const remark = getString(context.data.questionComments[questionKey])
  if (index === undefined) {
    if (!answer && !remark) return
    const firstMineral = context.plan.versionDef.mineralScope.minerals[0]?.key
    const question = firstMineral ? labelForMineralKey(context, firstMineral) : ''
    ensureQuestionList({ context, key: 'cmtRangeQuestions' }).push({ type, question, answer, remark })
    return
  }
  const item = context.out.cmtRangeQuestions![index]!
  writeQuestionAnswers({ item, state: context.ctx.rangeQuestionFieldStatesByIndex.get(index), answer, remark })
  item.type = type
}

function pruneRangeQuestions(context: ExportContext, scope: ReturnType<typeof buildQuestionExportScope>) {
  const definitions = new Map(context.plan.versionDef.questions.map((def) => [def.key, def]))
  return context.out.cmtRangeQuestions?.filter((item) => {
    const type = typeof item.type === 'number' ? item.type : Number(item.type)
    const key = Number.isFinite(type) ? context.plan.questionKeyByType.get(type) : undefined
    const def = key ? definitions.get(key) : undefined
    if (!def?.perMineral) return true
    const label = typeof item.question === 'string' ? item.question : String(item.question ?? '')
    return isActiveQuestionMineral({ context, label, scope })
  })
}

export function patchRangeQuestions(context: ExportContext) {
  const existing = !!context.out.cmtRangeQuestions
  const definitions = new Map(context.plan.versionDef.questions.map((def) => [def.key, def]))
  const scope = buildQuestionExportScope(context)
  for (const [type, questionKey] of context.plan.questionKeyByType) {
    const def = definitions.get(questionKey)
    if (!def) continue
    if (!def.perMineral) {
      patchGlobalQuestion({ context, type, questionKey })
      continue
    }
    for (const mineralKey of scope.activeMineralKeys) {
      patchMineralQuestion({ context, type, questionKey, mineralKey })
    }
  }
  if (!context.out.cmtRangeQuestions) return
  const pruned = pruneRangeQuestions(context, scope)!
  context.out.cmtRangeQuestions = pruned
  if (!existing && pruned.length === 0) delete context.out.cmtRangeQuestions
}
