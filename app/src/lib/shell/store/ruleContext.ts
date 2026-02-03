/**
 * @file app/store/ruleContext.ts
 * @description 状态管理与业务模型。
 */

// 说明：状态管理与业务模型
import type { TemplateFormState } from './templateTypes'

/**
 * 导出类型：ScopeType。
 */
export type ScopeType = 'A' | 'B' | 'C' | undefined

/**
 * 导出接口类型：RuleInput。
 */
export interface RuleInput {
  scopeType: ScopeType
  questionAnswers: TemplateFormState['questions']
  selectedMinerals: TemplateFormState['selectedMinerals']
  customMinerals: TemplateFormState['customMinerals']
}

/**
 * 导出接口类型：DataInput。
 */
export interface DataInput {
  companyInfo: TemplateFormState['companyInfo']
  questions: TemplateFormState['questions']
  companyQuestions: TemplateFormState['companyQuestions']
  mineralsScope: TemplateFormState['mineralsScope']
  smelterList: TemplateFormState['smelterList']
  mineList: TemplateFormState['mineList']
  productList: TemplateFormState['productList']
}

/**
 * 导出接口类型：RuleContext。
 */
export interface RuleContext {
  scopeType: ScopeType
  ruleInput: RuleInput
  dataInput: DataInput
}

/**
 * 导出函数：buildRuleInput。
 */
export function buildRuleInput(state: TemplateFormState): RuleInput {
  const scopeType = state.companyInfo.declarationScope as ScopeType
  return {
    scopeType,
    questionAnswers: state.questions,
    selectedMinerals: state.selectedMinerals,
    customMinerals: state.customMinerals,
  }
}

/**
 * 导出函数：buildDataInput。
 */
export function buildDataInput(state: TemplateFormState): DataInput {
  return {
    companyInfo: state.companyInfo,
    questions: state.questions,
    companyQuestions: state.companyQuestions,
    mineralsScope: state.mineralsScope,
    smelterList: state.smelterList,
    mineList: state.mineList,
    productList: state.productList,
  }
}

/**
 * 导出函数：buildRuleContext。
 */
export function buildRuleContext(state: TemplateFormState): RuleContext {
  const scopeType = state.companyInfo.declarationScope as ScopeType
  return {
    scopeType,
    ruleInput: {
      scopeType,
      questionAnswers: state.questions,
      selectedMinerals: state.selectedMinerals,
      customMinerals: state.customMinerals,
    },
    dataInput: buildDataInput(state),
  }
}
