/**
 * @file ui/forms/CompanyQuestionsForm.tsx
 * @description 模块实现。
 */

import type { I18nKey } from '@core/i18n'
import type { CompanyQuestionDef, GatingCondition, MineralDef, QuestionDef } from '@core/registry/types'
import type { GatingResult } from '@core/rules/gating'
import type { ErrorKey } from '@core/validation/errorKeys'
import { useHandlerMap } from '@ui/hooks/useHandlerMap'
import { useT } from '@ui/i18n/useT'
import { useCreation, useMemoizedFn } from 'ahooks'
import { Card, Flex, Tag, Typography } from 'antd'
import { compact } from 'lodash-es'

import { SelectField, TextField } from '../fields'

interface CompanyQuestionsFormProps {
  questions: CompanyQuestionDef[]
  questionDefs?: QuestionDef[]
  values: Record<string, Record<string, string> | string>
  onChange: (key: string, value: string, mineralKey?: string) => void
  minerals?: Array<MineralDef & { label?: string }>
  gatingByMineral?: Map<string, GatingResult>
  gatingCondition?: GatingCondition
  requiredByQuestion?: Map<string, boolean>
  errors?: Record<string, Record<string, ErrorKey> | ErrorKey>
}

/**
 * 公司层面问题表单：负责主问题选择与备注输入联动。
 */
export function CompanyQuestionsForm({
  questions,
  questionDefs,
  values,
  onChange,
  minerals = [],
  gatingByMineral,
  gatingCondition,
  requiredByQuestion,
  errors = {},
}: CompanyQuestionsFormProps) {
  const { t } = useT()
  const questionDefsSignature = useCreation(
    () =>
      (questionDefs ?? [])
        .map(
          (question) =>
            `${question.key}:${question.options
              .map((opt) => `${opt.value}:${opt.labelKey}`)
              .join(',')}`
        )
        .join('|'),
    [questionDefs]
  )
  const optionLabelsByQuestion = useCreation(() => {
    const map = new Map<string, Map<string, string>>()
    ;(questionDefs ?? []).forEach((question) => {
      const optionMap = new Map<string, string>()
      question.options.forEach((opt) => {
        optionMap.set(opt.value, t(opt.labelKey))
      })
      map.set(question.key, optionMap)
    })
    return map
  }, [questionDefs, questionDefsSignature, t])
  const companyQuestionsRequired = requiredByQuestion
    ? Array.from(requiredByQuestion.values()).some((value) => value)
    : gatingByMineral
      ? Array.from(gatingByMineral.values()).some((item) => item.companyQuestionsEnabled)
      : false
  const isOptional = !companyQuestionsRequired
  const requiredHint = useCreation(
    () => buildCompanyQuestionsRequiredHint(t, gatingCondition, optionLabelsByQuestion),
    [t, gatingCondition, optionLabelsByQuestion]
  )
  /** 题目签名：用于检测就地修改后的选项变化。 */
  const questionSignature = questions
    .map(
      (cq) =>
        `${cq.key}:${cq.perMineral ? 1 : 0}:${cq.hasCommentField ? 1 : 0}:${cq.options
          .map((opt) => `${opt.value}:${opt.labelKey}`)
          .join(',')}`
    )
    .join('|')
  /** 预先构建选项列表，避免每次渲染重复翻译与过滤。 */
  const optionsByQuestion = useCreation(() => {
    const map = new Map<string, { value: string; label: string }[]>()
    questions.forEach((cq) => {
      map.set(
        cq.key,
        compact(
          cq.options.map((opt) => {
            const label = t(opt.labelKey)
            return label ? { value: opt.value, label } : null
          })
        )
      )
    })
    return map
  }, [questions, questionSignature, t])
  /** 稳定回调，减少子组件不必要刷新。 */
  const handleChange = useMemoizedFn((key: string, value: string) => {
    onChange(key, value)
  })
  /** 预构建回调映射，减少 JSX 内联函数。 */
  const getSelectHandler = useHandlerMap(() => {
    const map = new Map<string, (value: string) => void>()
    questions.forEach((cq) => {
      if (cq.perMineral) return
      map.set(cq.key, (value) => handleChange(cq.key, value))
    })
    return map
  }, [questions, questionSignature, handleChange])

  const getPerMineralHandler = useHandlerMap(() => {
    const map = new Map<string, (value: string) => void>()
    questions.forEach((cq) => {
      if (!cq.perMineral) return
      minerals.forEach((mineral) => {
        map.set(`${cq.key}:${mineral.key}`, (value) =>
          onChange(cq.key, value, mineral.key)
        )
      })
    })
    return map
  }, [questions, minerals, onChange, questionSignature])

  const getCommentHandler = useHandlerMap(() => {
    const map = new Map<string, (value: string) => void>()
    questions.forEach((cq) => {
      if (!cq.hasCommentField || cq.perMineral) return
      const commentKey = `${cq.key}_comment`
      map.set(commentKey, (value) => handleChange(commentKey, value))
    })
    return map
  }, [questions, questionSignature, handleChange])

  const getPerMineralCommentHandler = useHandlerMap(() => {
    const map = new Map<string, (value: string) => void>()
    questions.forEach((cq) => {
      if (!cq.hasCommentField || !cq.perMineral) return
      const commentKey = `${cq.key}_comment`
      minerals.forEach((mineral) => {
        map.set(`${commentKey}:${mineral.key}`, (value) =>
          onChange(commentKey, value, mineral.key)
        )
      })
    })
    return map
  }, [questions, minerals, onChange, questionSignature])

  if (questions.length === 0) return null

  return (
    <Card
      title={
        <Flex wrap align="center" justify="space-between" gap={8}>
          <Typography.Title level={5} style={{ margin: 0 }}>{t('sections.companyQuestions')}</Typography.Title>
          <Tag color="blue">
            {requiredHint}
          </Tag>
        </Flex>
      }
    >
      <Flex vertical gap={0} data-optional={isOptional ? 'true' : 'false'}>
        {questions.map((cq) =>
          cq.perMineral
            ? renderPerMineralQuestionRow({
                question: cq,
                minerals,
                values,
                errors,
                gatingByMineral,
                options: optionsByQuestion.get(cq.key) ?? [],
                getPerMineralHandler,
                getPerMineralCommentHandler,
                t,
              })
            : renderCompanyQuestionRow({
                question: cq,
                values,
                errors,
                isOptional,
                requiredByQuestion,
                options: optionsByQuestion.get(cq.key) ?? [],
                getSelectHandler,
                getCommentHandler,
                t,
              })
        )}
      </Flex>
    </Card>
  )
}

/**
 * 渲染单个公司层面问题卡片。
 * 依赖预构建 handler，避免每次 render 生成闭包。
 */
function renderCompanyQuestionRow({
  question,
  values,
  errors,
  isOptional,
  requiredByQuestion,
  options,
  getSelectHandler,
  getCommentHandler,
  t,
}: {
  question: CompanyQuestionDef
  values: Record<string, Record<string, string> | string>
  errors: Record<string, Record<string, ErrorKey> | ErrorKey>
  isOptional: boolean
  requiredByQuestion?: Map<string, boolean>
  options: Array<{ value: string; label: string }>
  getSelectHandler: (key: string) => ((value: string) => void) | undefined
  getCommentHandler: (key: string) => ((value: string) => void) | undefined
  t: (key: I18nKey) => string
}) {
  const selectError = getCompanyQuestionError(errors, question.key, '', false)
  const commentKey = `${question.key}_comment`
  const selectHandler = getSelectHandler(question.key)
  const commentHandler = getCommentHandler(commentKey)
  const commentRequiredWhen = question.commentRequiredWhen ?? []
  const mainValue = getCompanyQuestionValue(values, question.key, '', false)
  const commentError = getCompanyQuestionCommentError(errors, commentKey, '', false)
  const questionRequired = requiredByQuestion?.get(question.key) ?? !isOptional
  // 备注始终展示，但仅在命中特定选项时要求必填。
  const shouldRequireComment =
    question.hasCommentField && commentRequiredWhen.includes(mainValue || '')
  const commentRequired = questionRequired && shouldRequireComment
  const commentValue = getCompanyQuestionCommentValue(values, commentKey, '', false)

  return (
    <div key={question.key} className="company-question-row">
      <div className="company-question-grid">
        <Typography.Text className="company-question-label">
          {t(question.labelKey)}
        </Typography.Text>
        <div className="company-question-answer">
          <SelectField
            value={getCompanyQuestionValue(values, question.key, '', false)}
            onChange={selectHandler}
            options={options}
            placeholder={t('placeholders.select')}
            required={questionRequired}
            error={selectError}
            allowClear
            fieldPath={`companyQuestions.${question.key}`}
          />
        </div>
        <div className="company-question-comment">
          {question.hasCommentField && (
            <TextField
              value={commentValue}
              onChange={commentHandler}
              placeholder={
                question.commentLabelKey
                  ? t(question.commentLabelKey)
                  : t('placeholders.comments')
              }
              required={commentRequired}
              multiline
              rows={2}
              error={commentError}
              fieldPath={`companyQuestions.${commentKey}`}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 渲染按矿种拆分的公司层面问题（EMRT C）。
 */
function renderPerMineralQuestionRow({
  question,
  minerals,
  values,
  errors,
  gatingByMineral,
  options,
  getPerMineralHandler,
  getPerMineralCommentHandler,
  t,
}: {
  question: CompanyQuestionDef
  minerals: Array<MineralDef & { label?: string }>
  values: Record<string, Record<string, string> | string>
  errors: Record<string, Record<string, ErrorKey> | ErrorKey>
  gatingByMineral?: Map<string, GatingResult>
  options: Array<{ value: string; label: string }>
  getPerMineralHandler: (key: string) => ((value: string) => void) | undefined
  getPerMineralCommentHandler: (key: string) => ((value: string) => void) | undefined
  t: (key: I18nKey) => string
}) {
  if (minerals.length === 0) return null
  const commentKey = `${question.key}_comment`

  return (
    <div key={question.key} className="company-question-row">
      <div className="company-question-grid company-question-grid-per-mineral">
        <Typography.Text className="company-question-label company-question-label-full" strong>
          {t(question.labelKey)}
        </Typography.Text>
        {minerals.map((mineral) => {
          const required = gatingByMineral?.get(mineral.key)?.companyQuestionsEnabled === true
          const value = getCompanyQuestionValue(values, question.key, mineral.key, true)
          const error = getCompanyQuestionError(errors, question.key, mineral.key, true)
          const handler = getPerMineralHandler(`${question.key}:${mineral.key}`)
          const commentValue = getCompanyQuestionCommentValue(values, commentKey, mineral.key, true)
          const commentError = getCompanyQuestionCommentError(
            errors,
            commentKey,
            mineral.key,
            true
          )
          const commentRequiredWhen = question.commentRequiredWhen ?? []
          const shouldRequireComment =
            question.hasCommentField && commentRequiredWhen.includes(value || '')
          const commentRequired = required && shouldRequireComment
          const perMineralCommentHandler = getPerMineralCommentHandler(
            `${commentKey}:${mineral.key}`
          )
          return (
            <div key={mineral.key} className="company-question-mineral-row">
              <Typography.Text className="company-question-mineral-label">
                {mineral.label ?? t(mineral.labelKey)}
              </Typography.Text>
              <div className="company-question-answer">
                <SelectField
                  value={value}
                  onChange={handler}
                  options={options}
                  placeholder={t('placeholders.select')}
                  required={required}
                  error={error}
                  allowClear
                  fieldPath={`companyQuestions.${question.key}.${mineral.key}`}
                />
              </div>
              <div className="company-question-comment">
                {question.hasCommentField && (
                  <TextField
                    value={commentValue}
                    onChange={perMineralCommentHandler}
                    placeholder={
                      question.commentLabelKey
                        ? t(question.commentLabelKey)
                        : t('placeholders.comments')
                    }
                    required={commentRequired}
                    multiline
                    rows={2}
                    error={commentError}
                    fieldPath={`companyQuestions.${commentKey}.${mineral.key}`}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * 读取公司问题值（支持 perMineral 与普通问题）。
 */
function getCompanyQuestionValue(
  values: Record<string, Record<string, string> | string>,
  questionKey: string,
  mineralKey: string,
  perMineral: boolean
): string {
  const value = values[questionKey]
  if (perMineral && typeof value === 'object') {
    return value[mineralKey] || ''
  }
  if (!perMineral && typeof value === 'string') {
    return value
  }
  return ''
}

/**
 * 读取公司问题错误（支持 perMineral 与普通问题）。
 */
function getCompanyQuestionError(
  errors: Record<string, Record<string, ErrorKey> | ErrorKey>,
  questionKey: string,
  mineralKey: string,
  perMineral: boolean
): ErrorKey | undefined {
  const questionError = errors[questionKey]
  if (perMineral && questionError && typeof questionError === 'object') {
    return questionError[mineralKey]
  }
  if (!perMineral && typeof questionError === 'string') {
    return questionError
  }
  return undefined
}

/**
 * 读取公司问题备注值（支持 perMineral 与普通问题）。
 */
function getCompanyQuestionCommentValue(
  values: Record<string, Record<string, string> | string>,
  commentKey: string,
  mineralKey: string,
  perMineral: boolean
): string {
  const value = values[commentKey]
  if (perMineral && value && typeof value === 'object') {
    return value[mineralKey] || ''
  }
  if (!perMineral && typeof value === 'string') {
    return value
  }
  return ''
}

/**
 * 读取公司问题备注错误（支持 perMineral 与普通问题）。
 */
function getCompanyQuestionCommentError(
  errors: Record<string, Record<string, ErrorKey> | ErrorKey>,
  commentKey: string,
  mineralKey: string,
  perMineral: boolean
): ErrorKey | undefined {
  const commentError = errors[commentKey]
  if (perMineral && commentError && typeof commentError === 'object') {
    return commentError[mineralKey]
  }
  if (!perMineral && typeof commentError === 'string') {
    return commentError
  }
  return undefined
}

/**
 * 计算公司问题必填提示文案（跟随 Excel gating 条件）。
 */
function buildCompanyQuestionsRequiredHint(
  t: (key: I18nKey, options?: Record<string, unknown>) => string,
  gatingCondition?: GatingCondition,
  optionLabelsByQuestion?: Map<string, Map<string, string>>
): string {
  const condition = gatingCondition
    ? resolveGatingConditionLabel(t, gatingCondition, optionLabelsByQuestion)
    : t('conditions.always')
  return t('badges.companyQuestionsRequired', { condition })
}

/**
 * 解析 gating 条件为可展示文案。
 */
function resolveGatingConditionLabel(
  t: (key: I18nKey, options?: Record<string, unknown>) => string,
  condition: GatingCondition,
  optionLabelsByQuestion?: Map<string, Map<string, string>>
): string {
  const resolveOptionLabel = (questionKey: 'Q1' | 'Q2', value: string) =>
    optionLabelsByQuestion?.get(questionKey)?.get(value) ?? value
  const formatLabels = (labels: string[]) => labels.filter(Boolean).join(' / ')

  switch (condition.type) {
    case 'always':
      return t('conditions.always')
    case 'q1-not-no':
      return t('conditions.q1NotNo', { no: resolveOptionLabel('Q1', 'No') })
    case 'q1-yes':
      return t('conditions.q1Yes', { yes: resolveOptionLabel('Q1', 'Yes') })
    case 'q1q2-not-no':
      return t('conditions.q1q2NotNo', {
        no: resolveOptionLabel('Q1', 'No'),
        noQ2: resolveOptionLabel('Q2', 'No'),
      })
    case 'q1q2-yes':
      return t('conditions.q1q2Yes', {
        yes: resolveOptionLabel('Q1', 'Yes'),
        yesQ2: resolveOptionLabel('Q2', 'Yes'),
      })
    case 'q1-not-negatives':
      return t('conditions.q1NotNegatives', {
        negatives: formatLabels(
          condition.negatives.map((value) => resolveOptionLabel('Q1', value))
        ),
      })
    case 'q1-not-negatives-and-q2-not-negatives':
      return t('conditions.q1NotNegativesAndQ2NotNegatives', {
        q1Negatives: formatLabels(
          condition.q1Negatives.map((value) => resolveOptionLabel('Q1', value))
        ),
        q2Negatives: formatLabels(
          condition.q2Negatives.map((value) => resolveOptionLabel('Q2', value))
        ),
      })
    default:
      return t('conditions.always')
  }
}
