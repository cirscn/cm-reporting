/**
 * @file shell/store/templateContext.ts
 * @description 消费侧 hooks：基于 zustand selector 实现，保持原有公开 API 不变。
 *
 * 公开 hooks：
 * - useTemplateState()       → { meta, form, lists }
 * - useTemplateErrors()      → TemplateFormErrors
 * - useTemplateActions()     → 所有 setter/reset/validate
 * - useTemplateIntegrations() → CMReportingIntegrations | undefined
 */

import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useTemplateStore } from './templateStoreContext'
import type {
  MineralReconcileNotice,
  TemplateFormErrors,
  TemplateFormState,
} from './templateTypes'

// ---------------------------------------------------------------------------
// 公开类型（保持向后兼容）
// ---------------------------------------------------------------------------

/** 表单主体读取切片（不含列表与错误）。 */
interface TemplateFormSlice {
  companyInfo: TemplateFormState['companyInfo']
  selectedMinerals: TemplateFormState['selectedMinerals']
  customMinerals: TemplateFormState['customMinerals']
  questions: TemplateFormState['questions']
  questionComments: TemplateFormState['questionComments']
  companyQuestions: TemplateFormState['companyQuestions']
}

/** 列表数据读取切片。 */
interface TemplateListsSlice {
  mineralsScope: TemplateFormState['mineralsScope']
  smelterList: TemplateFormState['smelterList']
  mineList: TemplateFormState['mineList']
  productList: TemplateFormState['productList']
}

/** 模板静态信息。 */
interface TemplateMetaSlice {
  templateType: import('@core/registry/types').TemplateType
  versionId: string
  versionDef: import('@core/registry/types').TemplateVersionDef
}

/** 模板完整读取视图（静态信息 + 表单主体 + 列表）。 */
interface TemplateState {
  meta: TemplateMetaSlice
  form: TemplateFormSlice
  lists: TemplateListsSlice
}

/** 表单写操作。 */
interface TemplateActionsValue {
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
  clearMineralReconcileNotice: () => void
}

// ---------------------------------------------------------------------------
// Selectors（提升到模块顶层避免每次渲染创建新引用）
// ---------------------------------------------------------------------------

const selectMeta = (s: { templateType: TemplateMetaSlice['templateType']; versionId: string; versionDef: TemplateMetaSlice['versionDef'] }): TemplateMetaSlice => ({
  templateType: s.templateType,
  versionId: s.versionId,
  versionDef: s.versionDef,
})

const selectForm = (s: TemplateFormSlice): TemplateFormSlice => ({
  companyInfo: s.companyInfo,
  selectedMinerals: s.selectedMinerals,
  customMinerals: s.customMinerals,
  questions: s.questions,
  questionComments: s.questionComments,
  companyQuestions: s.companyQuestions,
})

const selectLists = (s: TemplateListsSlice): TemplateListsSlice => ({
  mineralsScope: s.mineralsScope,
  smelterList: s.smelterList,
  mineList: s.mineList,
  productList: s.productList,
})

const selectErrors = (s: { errors: TemplateFormErrors }): TemplateFormErrors => s.errors

const selectIntegrations = (s: { integrations?: import('@lib/public/integrations').CMReportingIntegrations }) => s.integrations
const selectMineralReconcileNotice = (s: { mineralReconcileNotice: MineralReconcileNotice | null }) => s.mineralReconcileNotice

/**
 * Actions selector：虽然 zustand store 中 action 引用在 store 生命周期内不变，
 * 但 selector 每次返回新对象。搭配 useShallow 做属性级浅比较，
 * 确保 action 引用未变时不触发消费组件 re-render。
 * 开销极低（~13 个属性的 === 比较），无需额外优化。
 */
const selectActions = (s: TemplateActionsValue): TemplateActionsValue => ({
  setCompanyInfoField: s.setCompanyInfoField,
  setSelectedMinerals: s.setSelectedMinerals,
  setCustomMinerals: s.setCustomMinerals,
  setQuestionValue: s.setQuestionValue,
  setQuestionComment: s.setQuestionComment,
  setCompanyQuestionValue: s.setCompanyQuestionValue,
  setMineralsScope: s.setMineralsScope,
  setSmelterList: s.setSmelterList,
  setMineList: s.setMineList,
  setProductList: s.setProductList,
  setFormData: s.setFormData,
  validateForm: s.validateForm,
  resetForm: s.resetForm,
  clearMineralReconcileNotice: s.clearMineralReconcileNotice,
})

// ---------------------------------------------------------------------------
// 公开 hooks
// ---------------------------------------------------------------------------

/** 读取模板状态（静态信息 + 表单主体 + 列表）。 */
export function useTemplateState(): TemplateState {
  const meta = useTemplateStore(useShallow(selectMeta))
  const form = useTemplateStore(useShallow(selectForm))
  const lists = useTemplateStore(useShallow(selectLists))

  return useMemo(() => ({ meta, form, lists }), [meta, form, lists])
}

/** 读取表单错误信息。 */
export function useTemplateErrors(): TemplateFormErrors {
  return useTemplateStore(selectErrors)
}

/** 读取表单写操作。 */
export function useTemplateActions(): TemplateActionsValue {
  return useTemplateStore(useShallow(selectActions))
}

/** 读取对外 integrations（宿主扩展点）。 */
export function useTemplateIntegrations() {
  return useTemplateStore(selectIntegrations)
}

/** 读取矿种删除后的人工校对提示。 */
export function useMineralReconcileNotice() {
  return useTemplateStore(selectMineralReconcileNotice)
}
