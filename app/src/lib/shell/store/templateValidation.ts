import { runChecker } from '@core/rules/checker'
import type { buildFormSchema } from '@core/schema'

import { buildDataInput, buildRuleInput } from './ruleContext'
import { getFormData, normalizeFormData } from './templateFormData'
import { EMPTY_ERRORS, mapZodErrors } from './templateStoreErrors'
import type { TemplateActionContext, TemplateStoreActions } from './templateStoreTypes'

type FormSchema = ReturnType<typeof buildFormSchema>
type ValidationContext = Pick<TemplateActionContext, 'set' | 'get'> & { schema: FormSchema }

/** 同一帧内的写入共用一次微任务校验，不增加额外状态更新。 */
export function createValidationScheduler({ set, get, schema }: ValidationContext) {
  let pending = false
  return () => {
    if (pending) return
    pending = true
    queueMicrotask(() => {
      pending = false
      const state = get()
      const result = schema.safeParse(getFormData(state))
      const errors = result.success ? EMPTY_ERRORS : mapZodErrors(result.error.issues)
      if (errors !== state.errors) set({ errors })
    })
  }
}

export function createFormActions(context: TemplateActionContext & { schema: FormSchema }): Pick<
  TemplateStoreActions, 'setFormData' | 'validateForm' | 'resetForm'
> {
  const { set, get, versionDef, defaultState, scheduleValidation, schema } = context
  return {
    setFormData: (data) => {
      set({ ...normalizeFormData(data), isDirty: false })
      scheduleValidation()
    },
    validateForm: async () => {
      const data = getFormData(get())
      const result = schema.safeParse(data)
      if (!result.success) {
        set({ errors: mapZodErrors(result.error.issues) })
        return false
      }
      set({ errors: EMPTY_ERRORS })
      return runChecker(versionDef, buildRuleInput(data), buildDataInput(data)).length === 0
    },
    resetForm: () => { set({ ...defaultState, errors: EMPTY_ERRORS, isDirty: false }) },
  }
}
