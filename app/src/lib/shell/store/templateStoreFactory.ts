import { getVersionDef } from '@core/registry'
import { buildFormSchema } from '@core/schema'
import { createEmptyFormData } from '@core/template/formDefaults'
import { enableMapSet } from 'immer'
import { createStore } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { createListActions } from './templateListActions'
import { createMineralActions } from './templateMineralActions'
import { createQuestionActions } from './templateQuestionActions'
import { EMPTY_ERRORS } from './templateStoreErrors'
import type { TemplateStoreOptions, TemplateStoreState } from './templateStoreTypes'
import { createFormActions, createValidationScheduler } from './templateValidation'

enableMapSet()

/** 每次动作只提交一次状态更新，将关联清理与原始修改一并保存。 */
export function createTemplateStore(options: TemplateStoreOptions) {
  const versionDef = getVersionDef(options.templateType, options.versionId)
  const defaultState = createEmptyFormData(versionDef)
  const schema = buildFormSchema(versionDef)
  return createStore<TemplateStoreState>()(immer((set, get) => {
    const context = {
      set, get, versionDef, defaultState,
      scheduleValidation: createValidationScheduler({ set, get, schema }),
    }
    return {
      ...options, versionDef, ...defaultState, errors: EMPTY_ERRORS, isDirty: false,
      ...createQuestionActions(context),
      ...createMineralActions(context),
      ...createListActions(context),
      ...createFormActions({ ...context, schema }),
    }
  }))
}
