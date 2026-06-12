/**
 * @file app/pages/DeclarationPage.tsx
 * @description 第一页申报表单，按折叠面板组织公司信息、申报范围和公司层面问题。
 */

import { hasRequiredCompanyQuestionComment } from '@core/rules/companyQuestions'
import { useOptionalNavigation } from '@shell/navigation/useNavigation'
import {
  useTemplateActions,
  useTemplateDerived,
  useTemplateErrors,
  useTemplateState,
} from '@shell/store'
import { CompanyInfoForm } from '@ui/forms/CompanyInfoForm'
import { CompanyQuestionsForm } from '@ui/forms/CompanyQuestionsForm'
import { buildCompanyQuestionsRequiredHint } from '@ui/forms/companyQuestionsRequiredHint'
import { MineralScopeForm } from '@ui/forms/MineralScopeForm'
import { QuestionMatrixForm } from '@ui/forms/QuestionMatrixForm'
import { useT } from '@ui/i18n/useT'
import { LAYOUT } from '@ui/theme/spacing'
import { Collapse, Flex, Tag, Typography } from 'antd'
import { type ReactNode, useState } from 'react'

import {
  DECLARATION_PANEL_KEY_VALUES,
  getActiveDeclarationPanelKeys,
} from './declarationPanelState'
import { useFieldFocus } from './useFieldFocus'

const DECLARATION_PANEL_KEYS = DECLARATION_PANEL_KEY_VALUES

const DEFAULT_ACTIVE_DECLARATION_PANELS = [DECLARATION_PANEL_KEYS.companyInfo]
const DECLARATION_COMPANY_INFO_LABEL_WIDTH = 220

function normalizeCollapseKeys(keys: string | string[]) {
  if (Array.isArray(keys)) {
    return keys
  }
  return keys ? [keys] : []
}

function buildPanelLabel(title: string, extra?: ReactNode, required?: boolean) {
  return (
    <Flex wrap align="center" justify="space-between" gap={8} style={{ width: '100%' }}>
      <Flex align="center" gap={8}>
        <Typography.Text strong>{title}</Typography.Text>
        {required ? <Typography.Text type="danger">*</Typography.Text> : undefined}
      </Flex>
      {extra}
    </Flex>
  )
}

function isCompanyInfoFieldRequired(
  field: { key: string; required?: boolean | 'conditional' },
  requiredFields: Map<string, boolean>
) {
  const requiredState = requiredFields.get(field.key)
  return requiredState === undefined ? field.required === true : requiredState === true
}

export function DeclarationPage() {
  const { meta, form } = useTemplateState()
  const navigation = useOptionalNavigation()
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
  const { gatingByMineral, requiredFields, viewModels } = useTemplateDerived()
  const { displayMinerals } = viewModels.declaration
  const focusFieldPath =
    navigation?.state.searchParams.get('focus') ??
    (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('focus') : null)
  const [manualPanelState, setManualPanelState] = useState<{
    manualActivePanelKeys: string[]
    ignoredFocusFieldPath: string | null
  }>({
    manualActivePanelKeys: DEFAULT_ACTIVE_DECLARATION_PANELS,
    ignoredFocusFieldPath: null,
  })
  const activePanelKeys = getActiveDeclarationPanelKeys({
    focusFieldPath,
    ignoredFocusFieldPath: manualPanelState.ignoredFocusFieldPath,
    manualActivePanelKeys: manualPanelState.manualActivePanelKeys,
  })

  useFieldFocus()

  const requiredCompanyFields = versionDef.companyInfoFields.filter(
    (field) => isCompanyInfoFieldRequired(field, requiredFields.companyInfo)
  )
  const completedCompanyFields = requiredCompanyFields.filter((field) => {
    const value = companyInfo[field.key]
    return typeof value === 'string' && value.trim().length > 0
  })
  const companyInfoExtra =
    requiredCompanyFields.length > 0 ? (
      <Tag color="orange">
        {t('badges.requiredCompleted', {
          done: completedCompanyFields.length,
          total: requiredCompanyFields.length,
        })}
      </Tag>
    ) : undefined

  const mineralsScopeExtra =
    versionDef.mineralScope.mode === 'dynamic-dropdown' && versionDef.mineralScope.maxCount ? (
      <Tag color="orange">
        {selectedMinerals.length}/{versionDef.mineralScope.maxCount}
      </Tag>
    ) : undefined

  const companyQuestionsExtra =
    versionDef.companyQuestions.length > 0 ? (
      <Tag color="blue">
        {buildCompanyQuestionsRequiredHint(t, versionDef.gating.companyQuestionsGating)}
      </Tag>
    ) : undefined
  const mineralsScopeTitleRequired =
    versionDef.mineralScope.mode !== 'fixed' || versionDef.questions.length > 0
  const companyQuestionsTitleRequired = Array.from(
    requiredFields.companyQuestions.values()
  ).some((required) => required) || hasRequiredCompanyQuestionComment({
    questions: versionDef.companyQuestions,
    values: companyQuestions,
    mineralKeys: displayMinerals.map((mineral) => mineral.key),
  })

  const declarationPanels: Array<{ key: string; label: ReactNode; children: ReactNode }> = [
    {
      key: DECLARATION_PANEL_KEYS.companyInfo,
      label: buildPanelLabel(t('sections.companyInfo'), companyInfoExtra, requiredCompanyFields.length > 0),
      children: (
        <CompanyInfoForm
          versionDef={versionDef}
          values={companyInfo}
          onChange={setCompanyInfoField}
          requiredFields={requiredFields.companyInfo}
          errors={errors.companyInfo}
          dateFormatHint={t('hints.authorizationDate')}
          showTitle={false}
          fieldLayout="horizontal"
          fieldSpan={24}
          labelWidth={DECLARATION_COMPANY_INFO_LABEL_WIDTH}
        />
      ),
    },
    {
      key: DECLARATION_PANEL_KEYS.mineralsScope,
      label: buildPanelLabel(
        t('sections.mineralsScope'),
        mineralsScopeExtra,
        mineralsScopeTitleRequired
      ),
      children: (
        <Flex vertical gap={LAYOUT.sectionGap}>
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
            showTitle={false}
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
            headerMode="section"
          />
        </Flex>
      ),
    },
  ]

  if (versionDef.companyQuestions.length > 0) {
    declarationPanels.push({
      key: DECLARATION_PANEL_KEYS.companyQuestions,
      label: buildPanelLabel(
        t('sections.companyQuestions'),
        companyQuestionsExtra,
        companyQuestionsTitleRequired
      ),
      children: (
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
          showTitle={false}
        />
      ),
    })
  }

  return (
    <Flex vertical gap={LAYOUT.sectionGap}>
      <Collapse
        accordion
        items={declarationPanels}
        activeKey={activePanelKeys}
        onChange={(keys) =>
          setManualPanelState({
            manualActivePanelKeys: normalizeCollapseKeys(keys),
            ignoredFocusFieldPath: focusFieldPath,
          })
        }
      />
    </Flex>
  )
}
