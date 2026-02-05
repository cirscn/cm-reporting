/**
 * @file app/pages/DeclarationPage.tsx
 * @description 页面组件。
 */

// 说明：页面组件
import {
  useTemplateActions,
  useTemplateDerived,
  useTemplateErrors,
  useTemplateState,
} from '@shell/store'
import { CompanyInfoForm } from '@ui/forms/CompanyInfoForm'
import { CompanyQuestionsForm } from '@ui/forms/CompanyQuestionsForm'
import { MineralScopeForm } from '@ui/forms/MineralScopeForm'
import { QuestionMatrixForm } from '@ui/forms/QuestionMatrixForm'
import { useT } from '@ui/i18n/useT'
import { LAYOUT } from '@ui/theme/spacing'
import { Flex } from 'antd'

import { useFieldFocus } from './useFieldFocus'

/** Declaration 页面：汇总公司信息、矿产范围、问题矩阵与公司问题。 */
export function DeclarationPage() {
  const { meta, form } = useTemplateState()
  const { versionDef } = meta
  const {
    companyInfo,
    selectedMinerals,
    customMinerals,
    questions,
    questionComments,
    companyQuestions,
  } = form
  const errors = useTemplateErrors()
  const {
    setCompanyInfoField,
    setSelectedMinerals,
    setCustomMinerals,
    setQuestionValue,
    setQuestionComment,
    setCompanyQuestionValue,
  } = useTemplateActions()
  const { t } = useT()

  // 规则派生：用于必填校验和 gating 控制。
  const { gatingByMineral, requiredFields, viewModels } = useTemplateDerived()

  // 页面派生数据：集中输出"展示矿产 + 公司问题 gating"的结果，页面只消费渲染。
  const { displayMinerals } = viewModels.declaration

  useFieldFocus()

  return (
    <Flex vertical gap={LAYOUT.sectionGap}>
      <CompanyInfoForm
        versionDef={versionDef}
        values={companyInfo}
        onChange={setCompanyInfoField}
        requiredFields={requiredFields.companyInfo}
        errors={errors.companyInfo}
        dateFormatHint={t('hints.authorizationDate')}
      />

      <MineralScopeForm
        versionDef={versionDef}
        selectedMinerals={selectedMinerals}
        onMineralsChange={setSelectedMinerals}
        customMinerals={customMinerals}
        onCustomMineralsChange={setCustomMinerals}
        errors={{
          selection: errors.mineralsScope,
          custom: errors.customMinerals,
        }}
      />

	      <QuestionMatrixForm
	        versionDef={versionDef}
	        minerals={displayMinerals}
	        values={questions}
	        commentValues={questionComments}
	        onChange={setQuestionValue}
	        onCommentChange={setQuestionComment}
	        gatingByMineral={gatingByMineral}
	        requiredByQuestion={requiredFields.questions}
	        errors={errors.questions}
	      />

	      <CompanyQuestionsForm
	        questions={versionDef.companyQuestions}
	        questionDefs={versionDef.questions}
	        minerals={displayMinerals}
	        values={companyQuestions}
	        onChange={setCompanyQuestionValue}
	        gatingByMineral={gatingByMineral}
	        gatingCondition={versionDef.gating.companyQuestionsGating}
        requiredByQuestion={requiredFields.companyQuestions}
        errors={errors.companyQuestions}
      />
    </Flex>
  )
}
