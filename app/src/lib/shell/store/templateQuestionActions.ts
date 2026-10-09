import type { QuestionDef } from '@core/registry/types'

import { applyQuestionCascade } from './questionCascade'
import type { TemplateActionContext, TemplateStoreActions, TemplateStoreState } from './templateStoreTypes'

function writeNestedField(
  target: Record<string, Record<string, string> | string>,
  params: { key: string; value: string; subKey?: string | null },
) {
  const { key, value, subKey } = params
  if (!subKey) {
    target[key] = value
    return
  }
  const current = target[key]
  if (typeof current === 'object') current[subKey] = value
  else target[key] = { [subKey]: value }
}

interface QuestionWrite {
  questionKey: string
  mineralKey: string | null
  value: string
  field: 'questions' | 'questionComments'
}

function writeQuestionField(state: TemplateStoreState, def: QuestionDef, params: QuestionWrite) {
  const { questionKey: key, mineralKey, value, field } = params
  if (!def.perMineral) {
    state[field][key] = value
    return
  }
  if (mineralKey) writeNestedField(state[field], { key, value, subKey: mineralKey })
}

function setQuestionField(context: TemplateActionContext, params: QuestionWrite) {
  const { set, get, versionDef, scheduleValidation } = context
  if (get().readOnly) return
  const def = versionDef.questions.find((question) => question.key === params.questionKey)
  set((state) => {
    if (!def) return
    writeQuestionField(state, def, params)
    state.isDirty = true
    if (params.field === 'questions') {
      applyQuestionCascade({ state, versionDef, questionKey: params.questionKey, mineralKey: params.mineralKey })
    }
  })
  scheduleValidation()
}

export function createQuestionActions(context: TemplateActionContext): Pick<
  TemplateStoreActions, 'setCompanyInfoField' | 'setQuestionValue' | 'setQuestionComment' | 'setCompanyQuestionValue'
> {
  const { set, get, scheduleValidation } = context
  return {
    setCompanyInfoField: (key, value) => {
      if (get().readOnly) return
      set((state) => { state.companyInfo[key] = value; state.isDirty = true })
      scheduleValidation()
    },
    setQuestionValue: (questionKey, mineralKey, value) => {
      setQuestionField(context, { questionKey, mineralKey, value, field: 'questions' })
    },
    setQuestionComment: (questionKey, mineralKey, value) => {
      setQuestionField(context, { questionKey, mineralKey, value, field: 'questionComments' })
    },
    setCompanyQuestionValue: (key, value, mineralKey) => {
      if (get().readOnly) return
      set((state) => {
        writeNestedField(state.companyQuestions, { key, value, subKey: mineralKey })
        state.isDirty = true
      })
      scheduleValidation()
    },
  }
}
