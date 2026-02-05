/**
 * @file app/store/templateContext.ts
 * @description 状态管理与业务模型。
 */

// 说明：状态管理与业务模型
import type { TemplateType, TemplateVersionDef } from '@core/registry/types'
import type { CMReportingIntegrations } from '@lib/public/integrations'
import { createContext, useContext, useMemo } from 'react'

import type { TemplateFormErrors, TemplateFormState } from './templateTypes'

/** 模板静态信息上下文（模板类型/版本/定义）。 */
interface TemplateStaticContextValue {
  templateType: TemplateType
  versionId: string
  versionDef: TemplateVersionDef
}

/** 对外 integrations 上下文（用于宿主接管外部选择/回写）。 */
interface TemplateIntegrationsContextValue {
  integrations?: CMReportingIntegrations
}

/** 公司信息表单片段上下文。 */
interface TemplateCompanyInfoContextValue {
  companyInfo: TemplateFormState['companyInfo']
}

/** 矿产范围表单片段上下文。 */
interface TemplateMineralScopeContextValue {
  selectedMinerals: TemplateFormState['selectedMinerals']
  customMinerals: TemplateFormState['customMinerals']
}

/** 问题矩阵表单片段上下文。 */
interface TemplateQuestionsContextValue {
  questions: TemplateFormState['questions']
  questionComments: TemplateFormState['questionComments']
}

/** 公司问题表单片段上下文。 */
interface TemplateCompanyQuestionsContextValue {
  companyQuestions: TemplateFormState['companyQuestions']
}

/** 表格列表表单片段上下文。 */
interface TemplateListsContextValue {
  mineralsScope: TemplateFormState['mineralsScope']
  smelterList: TemplateFormState['smelterList']
  mineList: TemplateFormState['mineList']
  productList: TemplateFormState['productList']
}

/** 表单错误上下文。 */
interface TemplateErrorsContextValue {
  errors: TemplateFormErrors
}

/** 表单写操作上下文（setter/重置）。 */
interface TemplateActionsContextValue {
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
  /** 全量回填表单（用于导入 JSON 快照）。 */
  setFormData: (data: TemplateFormState) => void
  /** 触发一次全量校验（用于导出前确认）。 */
  validateForm: () => Promise<boolean>
  resetForm: () => void
}

/** 表单主体读取切片（不含列表与错误）。 */
interface TemplateFormSlice {
  companyInfo: TemplateFormState['companyInfo']
  selectedMinerals: TemplateFormState['selectedMinerals']
  customMinerals: TemplateFormState['customMinerals']
  questions: TemplateFormState['questions']
  questionComments: TemplateFormState['questionComments']
  companyQuestions: TemplateFormState['companyQuestions']
}

/** 模板完整读取视图（静态信息 + 表单主体 + 列表）。 */
interface TemplateState {
  meta: TemplateStaticContextValue
  form: TemplateFormSlice
  lists: TemplateListsContextValue
}

/** 模板静态信息 Provider。 */
export const TemplateStaticContext = createContext<TemplateStaticContextValue | null>(null)
/** 对外 integrations Provider。 */
export const TemplateIntegrationsContext = createContext<TemplateIntegrationsContextValue | null>(
  null
)
/** 公司信息 Provider。 */
export const TemplateCompanyInfoContext = createContext<TemplateCompanyInfoContextValue | null>(
  null
)
/** 矿产范围 Provider。 */
export const TemplateMineralScopeContext = createContext<TemplateMineralScopeContextValue | null>(
  null
)
/** 问题矩阵 Provider。 */
export const TemplateQuestionsContext = createContext<TemplateQuestionsContextValue | null>(null)
/** 公司问题 Provider。 */
export const TemplateCompanyQuestionsContext = createContext<TemplateCompanyQuestionsContextValue | null>(
  null
)
/** 列表数据 Provider。 */
export const TemplateListsContext = createContext<TemplateListsContextValue | null>(null)
/** 错误信息 Provider。 */
export const TemplateErrorsContext = createContext<TemplateErrorsContextValue | null>(null)
/** 表单写操作 Provider。 */
export const TemplateActionsContext = createContext<TemplateActionsContextValue | null>(null)

/** 统一的 Context 安全读取，避免空 Provider。 */
function useRequiredContext<T>(context: React.Context<T | null>, name: string): T {
  const value = useContext(context)
  if (!value) {
    throw new Error(`${name} must be used within TemplateProvider`)
  }
  return value
}

/** 读取模板静态信息（模板/版本/定义）。 */
function useTemplateMetaInternal() {
  return useRequiredContext(TemplateStaticContext, 'useTemplateState')
}

/** 读取对外 integrations（宿主扩展点）。 */
export function useTemplateIntegrations() {
  const { integrations } = useRequiredContext(
    TemplateIntegrationsContext,
    'useTemplateIntegrations'
  )
  return integrations
}

/** 读取表单主体数据（companyInfo/矿产范围/问题矩阵/公司问题）。 */
function useTemplateFormInternal(): TemplateFormSlice {
  const { companyInfo } = useRequiredContext(
    TemplateCompanyInfoContext,
    'useTemplateState'
  )
  const { selectedMinerals, customMinerals } = useRequiredContext(
    TemplateMineralScopeContext,
    'useTemplateState'
  )
  const { questions } = useRequiredContext(TemplateQuestionsContext, 'useTemplateState')
  const { questionComments } = useRequiredContext(TemplateQuestionsContext, 'useTemplateState')
  const { companyQuestions } = useRequiredContext(
    TemplateCompanyQuestionsContext,
    'useTemplateState'
  )

  return useMemo(
    () => ({
      companyInfo,
      selectedMinerals,
      customMinerals,
      questions,
      questionComments,
      companyQuestions,
    }),
    [companyInfo, selectedMinerals, customMinerals, questions, questionComments, companyQuestions]
  )
}

/** 读取表单错误信息。 */
export function useTemplateErrors() {
  const { errors } = useRequiredContext(TemplateErrorsContext, 'useTemplateErrors')
  return errors
}

/** 读取列表数据（冶炼厂/矿山/产品）。 */
function useTemplateListsInternal() {
  return useRequiredContext(TemplateListsContext, 'useTemplateState')
}

/** 读取表单写操作。 */
export function useTemplateActions() {
  return useRequiredContext(TemplateActionsContext, 'useTemplateActions')
}

/** 读取模板状态（静态信息 + 表单主体 + 列表）。 */
export function useTemplateState(): TemplateState {
  const meta = useTemplateMetaInternal()
  const form = useTemplateFormInternal()
  const lists = useTemplateListsInternal()

  return useMemo(
    () => ({ meta, form, lists }),
    [meta, form, lists]
  )
}
