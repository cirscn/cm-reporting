import type { TemplateType, TemplateVersionDef } from '@core/registry/types'
import type { CMReportingIntegrations } from '@lib/public/integrations'
import type { StateCreator } from 'zustand'

import type { TemplateFormErrors, TemplateFormState } from './templateTypes'

export interface TemplateStoreActions {
  setCompanyInfoField: (key: string, value: string) => void
  setSelectedMinerals: (minerals: string[]) => void
  setCustomMinerals: (minerals: string[]) => void
  setQuestionValue: (questionKey: string, mineralKey: string | null, value: string) => void
  setQuestionComment: (questionKey: string, mineralKey: string | null, value: string) => void
  setCompanyQuestionValue: (key: string, value: string, mineralKey?: string) => void
  setMineralsScope: (rows: TemplateFormState['mineralsScope']) => void
  setSmelterList: (rows: TemplateFormState['smelterList']) => void
  setMineList: (rows: TemplateFormState['mineList']) => void
  setProductList: (rows: TemplateFormState['productList']) => void
  setFormData: (data: TemplateFormState) => void
  validateForm: () => Promise<boolean>
  resetForm: () => void
}

export interface TemplateStoreOptions {
  templateType: TemplateType
  versionId: string
  readOnly: boolean
  integrations?: CMReportingIntegrations
}

/** 每个 TemplateProvider 独立持有的表单状态与操作。 */
export interface TemplateStoreState extends TemplateFormState, TemplateStoreActions, TemplateStoreOptions {
  versionDef: TemplateVersionDef
  errors: TemplateFormErrors
  isDirty: boolean
}

type TemplateStateCreator = StateCreator<TemplateStoreState, [['zustand/immer', never]]>

export interface TemplateActionContext {
  set: Parameters<TemplateStateCreator>[0]
  get: Parameters<TemplateStateCreator>[1]
  versionDef: TemplateVersionDef
  defaultState: TemplateFormState
  scheduleValidation: () => void
}
