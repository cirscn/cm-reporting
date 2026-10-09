import type { QuestionDef, TemplateVersionDef } from '@core/registry/types'
import { calculateGating } from '@core/rules/gating'

import { clearMineMetalsOutsideGating } from './mineCascade'
import type { TemplateStoreState } from './templateStoreTypes'

const NEXT_QUESTION_OFFSET = 1

function clearQuestion(state: TemplateStoreState, question: QuestionDef, mineralKey: string | null) {
  if (!question.perMineral) {
    state.questions[question.key] = ''
    state.questionComments[question.key] = ''
    return
  }
  if (!mineralKey) return
  const answer = state.questions[question.key]
  const comment = state.questionComments[question.key]
  if (typeof answer === 'object') answer[mineralKey] = ''
  if (typeof comment === 'object') comment[mineralKey] = ''
}

/** 回答已经写入状态后，在同一次更新内完成题目、冶炼厂与矿厂联动。 */
export function applyQuestionCascade(params: {
  state: TemplateStoreState
  versionDef: TemplateVersionDef
  questionKey: string
  mineralKey: string | null
}) {
  const { state, versionDef, questionKey, mineralKey } = params
  if (questionKey !== 'Q1' && questionKey !== 'Q2') return
  const q2Index = versionDef.questions.findIndex((question) => question.key === 'Q2')
  if (q2Index < 0) return
  const gating = calculateGating(versionDef, state.questions, mineralKey ?? undefined)
  if (!gating.q2Enabled) clearQuestion(state, versionDef.questions[q2Index], mineralKey)
  if (!gating.q2Enabled || !gating.laterQuestionsEnabled) {
    versionDef.questions.slice(q2Index + NEXT_QUESTION_OFFSET).forEach((question) => clearQuestion(state, question, mineralKey))
  }
  state.smelterList = state.smelterList.filter((row) => {
    const metal = row.metal.trim()
    return !metal || calculateGating(versionDef, state.questions, metal).smelterListRequired
  })
  state.mineList = clearMineMetalsOutsideGating({
    rows: state.mineList, versionDef, questions: state.questions, mineralKey,
  })
}
