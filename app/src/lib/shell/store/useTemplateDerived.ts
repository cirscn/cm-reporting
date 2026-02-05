/**
 * @file app/store/useTemplateDerived.ts
 * @description 状态管理与业务模型。
 */

// 说明：规则/页面派生逻辑集中在此，页面只消费结果。
import { runChecker, type CheckerError } from '@core/rules/checker'
import { getDocStatusData, type DocStatusBySection } from '@core/rules/docStatus'
import { calculateAllGating, type GatingResult } from '@core/rules/gating'
import { calculateRequiredFields, type RequiredFieldsResult } from '@core/rules/required'
import { buildCheckerSummary, type CheckerSummary, type PassedItem } from '@core/rules/summary'
import { getActiveMineralKeys } from '@core/template/minerals'
import { buildDeclarationViewModel, buildMineListViewModel, buildSmelterListViewModel } from '@core/viewmodels/pages'
import { useT } from '@ui/i18n/useT'
import { useCreation } from 'ahooks'

import { buildDataInput, buildRuleInput } from './ruleContext'
import { useTemplateState } from './templateContext'

/**
 * 导出接口类型：TemplateViewModels。
 */
export interface TemplateViewModels {
  declaration: ReturnType<typeof buildDeclarationViewModel>
  smelterList: ReturnType<typeof buildSmelterListViewModel>
  mineList: ReturnType<typeof buildMineListViewModel>
}

/**
 * 导出接口类型：TemplateDerived。
 */
export interface TemplateDerived {
  ruleInput: ReturnType<typeof buildRuleInput>
  dataInput: ReturnType<typeof buildDataInput>
  gatingByMineral: Map<string, GatingResult>
  requiredFields: RequiredFieldsResult
  checkerErrors: CheckerError[]
  checkerSummary: CheckerSummary
  checkerPassedItems: PassedItem[]
  docStatusBySection: DocStatusBySection
  viewModels: TemplateViewModels
}

/**
 * 导出函数：useTemplateDerived。
 */
export function useTemplateDerived(): TemplateDerived {
  const { meta, form, lists } = useTemplateState()
  const { t } = useT()

  const formState = useCreation(
    () => ({
      companyInfo: form.companyInfo,
      selectedMinerals: form.selectedMinerals,
      customMinerals: form.customMinerals,
      questions: form.questions,
      questionComments: form.questionComments,
      companyQuestions: form.companyQuestions,
      mineralsScope: lists.mineralsScope,
      smelterList: lists.smelterList,
      mineList: lists.mineList,
      productList: lists.productList,
    }),
    [
      form.companyInfo,
      form.selectedMinerals,
      form.customMinerals,
      form.questions,
      form.questionComments,
      form.companyQuestions,
      lists.mineralsScope,
      lists.smelterList,
      lists.mineList,
      lists.productList,
    ]
  )

  const ruleInput = useCreation(() => buildRuleInput(formState), [formState])
  const dataInput = useCreation(() => buildDataInput(formState), [formState])

  const activeMinerals = useCreation(
    () => getActiveMineralKeys(meta.versionDef, form.selectedMinerals, form.customMinerals),
    [meta.versionDef, form.selectedMinerals, form.customMinerals]
  )
  const gatingByMineral = useCreation(
    () => calculateAllGating(meta.versionDef, ruleInput.questionAnswers, activeMinerals),
    [meta.versionDef, ruleInput.questionAnswers, activeMinerals]
  )
  const requiredFields = useCreation(
    () => calculateRequiredFields(meta.versionDef, ruleInput),
    [meta.versionDef, ruleInput]
  )
  const checkerErrors = useCreation(
    () => runChecker(meta.versionDef, ruleInput, dataInput),
    [meta.versionDef, ruleInput, dataInput]
  )
  const checkerSummaryResult = useCreation(
    () => buildCheckerSummary(meta.versionDef, ruleInput, dataInput, t),
    [meta.versionDef, ruleInput, dataInput, t]
  )
  const docStatusBySection = useCreation(
    () => getDocStatusData(meta.versionDef, ruleInput),
    [meta.versionDef, ruleInput]
  )

  const declarationViewModel = useCreation(
    () =>
      buildDeclarationViewModel({
        versionDef: meta.versionDef,
        selectedMinerals: form.selectedMinerals,
        customMinerals: form.customMinerals,
      }),
    [meta.versionDef, form.selectedMinerals, form.customMinerals]
  )
  const smelterListViewModel = useCreation(
    () =>
      buildSmelterListViewModel({
        templateType: meta.templateType,
        versionDef: meta.versionDef,
        questionAnswers: form.questions,
        selectedMinerals: form.selectedMinerals,
        customMinerals: form.customMinerals,
      }),
    [meta.templateType, meta.versionDef, form.questions, form.selectedMinerals, form.customMinerals, t]
  )
  const mineListViewModel = useCreation(
    () =>
      buildMineListViewModel({
        templateType: meta.templateType,
        versionDef: meta.versionDef,
        questionAnswers: form.questions,
        selectedMinerals: form.selectedMinerals,
        customMinerals: form.customMinerals,
        smelterList: lists.smelterList,
      }),
    [
      meta.templateType,
      meta.versionDef,
      form.questions,
      form.selectedMinerals,
      form.customMinerals,
      lists.smelterList,
    ]
  )

  return {
    ruleInput,
    dataInput,
    gatingByMineral,
    requiredFields,
    checkerErrors,
    checkerSummary: checkerSummaryResult.summary,
    checkerPassedItems: checkerSummaryResult.passedItems,
    docStatusBySection,
    viewModels: {
      declaration: declarationViewModel,
      smelterList: smelterListViewModel,
      mineList: mineListViewModel,
    },
  }
}
