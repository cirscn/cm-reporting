/**
 * @file ui/forms/QuestionMatrixForm.tsx
 * @description 问题矩阵表单 - 单卡片模块内纵向排列问题。
 */

import type { I18nKey } from '@core/i18n'
import type { MineralDef, QuestionDef, TemplateVersionDef } from '@core/registry/types'
import type { GatingResult } from '@core/rules/gating'
import type { ErrorKey } from '@core/validation/errorKeys'
import { useT } from '@ui/i18n/useT'
import { useCreation, useMemoizedFn } from 'ahooks'
import { Card, Flex, Input, Select, Tag, Typography } from 'antd'

interface QuestionMatrixFormProps {
  versionDef: TemplateVersionDef
  minerals?: Array<MineralDef & { label?: string }>
  values: Record<string, Record<string, string> | string>
  commentValues: Record<string, Record<string, string> | string>
  onChange: (questionKey: string, mineralKey: string | null, value: string) => void
  onCommentChange: (questionKey: string, mineralKey: string | null, value: string) => void
  gatingByMineral?: Map<string, GatingResult>
  requiredByQuestion?: Map<string, Map<string, boolean>>
  errors?: Record<string, Record<string, ErrorKey> | ErrorKey>
}

type QuestionOptionItem = { value: string; label: string }

/**
 * 辅助函数：生成选项签名（用于检测就地修改）。
 */
function buildOptionSignature(options: QuestionDef['options']): string {
  return options.map((opt) => `${opt.value}:${opt.labelKey}`).join(',')
}

/**
 * 辅助函数：生成按矿种覆盖的选项签名。
 */
function buildOptionsByMineralSignature(
  optionsByMineral?: Record<string, QuestionDef['options']>
): string {
  if (!optionsByMineral) return ''
  return Object.keys(optionsByMineral)
    .sort()
    .map((key) => `${key}[${buildOptionSignature(optionsByMineral[key] ?? [])}]`)
    .join('|')
}

/**
 * 导出函数：QuestionMatrixForm。
 * 单卡片模块：问题纵向排列。
 */
export function QuestionMatrixForm({
  versionDef,
  minerals: mineralsOverride,
  values,
  commentValues,
  onChange,
  onCommentChange,
  gatingByMineral,
  requiredByQuestion,
  errors = {},
}: QuestionMatrixFormProps) {
  const { t } = useT()
  const { questions, mineralScope } = versionDef
  const rawMinerals = mineralsOverride ?? mineralScope.minerals

  const mineralSignature = rawMinerals
    .map((mineral) => `${mineral.key}:${mineral.labelKey ?? ''}`)
    .join('|')

  const questionSignature = questions
    .map(
      (question) =>
        `${question.key}:${question.perMineral ? 1 : 0}:${question.labelKey}:${buildOptionSignature(
          question.options
        )}:${buildOptionsByMineralSignature(question.optionsByMineral)}`
    )
    .join('|')

  const minerals: Array<MineralDef & { label?: string }> = useCreation(
    () => rawMinerals.map((mineral) => ({ ...mineral })),
    [rawMinerals, mineralSignature]
  )

  const optionsByKey = useCreation(() => {
    const map = new Map<string, QuestionOptionItem[]>()
    const toOptions = (options: QuestionDef['options']) =>
      options.map((opt) => ({
        value: opt.value,
        label: t(opt.labelKey),
      }))
    questions.forEach((question) => {
      if (question.perMineral) {
        minerals.forEach((mineral) => {
          const override = question.optionsByMineral?.[mineral.key]
          const options = override ?? question.options
          map.set(`${question.key}:${mineral.key}`, toOptions(options))
        })
        return
      }
      map.set(`${question.key}:__all`, toOptions(question.options))
    })
    return map
  }, [questions, minerals, mineralSignature, questionSignature, t])

  const handleChange = useMemoizedFn(
    (questionKey: string, mineralKey: string | null, value: string) => {
      onChange(questionKey, mineralKey, value)
    }
  )

  const handleCommentChange = useMemoizedFn(
    (questionKey: string, mineralKey: string | null, value: string) => {
      onCommentChange(questionKey, mineralKey, value)
    }
  )

  // 预构建回调
  const cellHandlers = useCreation(() => {
    const map = new Map<string, (value: string) => void>()
    questions.forEach((question) => {
      if (question.perMineral) {
        minerals.forEach((mineral) => {
          map.set(`${question.key}:${mineral.key}`, (value) =>
            handleChange(question.key, mineral.key, value)
          )
        })
        return
      }
      map.set(`${question.key}:__all`, (value) => handleChange(question.key, null, value))
    })
    return map
  }, [handleChange, minerals, questions, mineralSignature, questionSignature])

  const commentHandlers = useCreation(() => {
    const map = new Map<string, (value: string) => void>()
    questions.forEach((question) => {
      if (question.perMineral) {
        minerals.forEach((mineral) => {
          map.set(`${question.key}:${mineral.key}`, (value) =>
            handleCommentChange(question.key, mineral.key, value)
          )
        })
        return
      }
      map.set(`${question.key}:__all`, (value) => handleCommentChange(question.key, null, value))
    })
    return map
  }, [handleCommentChange, minerals, questions, mineralSignature, questionSignature])

  const getCellHandler = useMemoizedFn(
    (questionKey: string, mineralKey: string | null, perMineral: boolean) => {
      const key = perMineral ? `${questionKey}:${mineralKey ?? ''}` : `${questionKey}:__all`
      return cellHandlers.get(key)!
    }
  )

  const getCommentHandler = useMemoizedFn(
    (questionKey: string, mineralKey: string | null, perMineral: boolean) => {
      const key = perMineral ? `${questionKey}:${mineralKey ?? ''}` : `${questionKey}:__all`
      return commentHandlers.get(key)!
    }
  )

  const getOptions = useMemoizedFn(
    (questionKey: string, mineralKey: string | null, perMineral: boolean) => {
      const key = perMineral ? `${questionKey}:${mineralKey ?? ''}` : `${questionKey}:__all`
      return optionsByKey.get(key) ?? []
    }
  )

  return (
    <Card
      title={
        <Flex wrap align="center" justify="space-between" gap={8}>
          <div>
            <Typography.Title level={5} style={{ margin: 0 }}>
              {t('sections.questionMatrix')}
            </Typography.Title>
            <Typography.Text type="secondary">
              {t('sections.questionMatrixHint')}
            </Typography.Text>
          </div>
          <Tag color="blue">
            {t('badges.questionRange', { from: 1, to: questions.length })}
          </Tag>
        </Flex>
      }
    >
      <Flex vertical gap={0}>
        {questions.map((question) => (
          <QuestionRow
            key={question.key}
            question={question}
            minerals={minerals}
            values={values}
            commentValues={commentValues}
            errors={errors}
            gatingByMineral={gatingByMineral}
            requiredByQuestion={requiredByQuestion}
            getOptions={getOptions}
            getCellHandler={getCellHandler}
            getCommentHandler={getCommentHandler}
            t={t}
          />
        ))}
      </Flex>
    </Card>
  )
}

/**
 * 单个问题卡片组件
 */
function QuestionRow({
  question,
  minerals,
  values,
  commentValues,
  errors,
  gatingByMineral,
  requiredByQuestion,
  getOptions,
  getCellHandler,
  getCommentHandler,
  t,
}: {
  question: QuestionDef
  minerals: Array<MineralDef & { label?: string }>
  values: Record<string, Record<string, string> | string>
  commentValues: Record<string, Record<string, string> | string>
  errors: Record<string, Record<string, ErrorKey> | ErrorKey>
  gatingByMineral?: Map<string, GatingResult>
  requiredByQuestion?: Map<string, Map<string, boolean>>
  getOptions: (
    questionKey: string,
    mineralKey: string | null,
    perMineral: boolean
  ) => QuestionOptionItem[]
  getCellHandler: (
    questionKey: string,
    mineralKey: string | null,
    perMineral: boolean
  ) => ((value: string) => void) | undefined
  getCommentHandler: (
    questionKey: string,
    mineralKey: string | null,
    perMineral: boolean
  ) => ((value: string) => void) | undefined
  t: (key: I18nKey) => string
}) {
  // 判断整行是否禁用
  let rowDisabled = question.key !== 'Q1'
  for (const mineral of minerals) {
    const gating = gatingByMineral?.get(mineral.key)
    const isDisabled = getQuestionDisabled(question.key, gating)
    if (!isDisabled) {
      rowDisabled = false
      break
    }
  }

  return (
    <div className={`question-matrix-row ${rowDisabled ? 'question-row-disabled' : ''}`}>
      <Flex vertical gap={12}>
        {/* 问题标题 - labelKey 已包含序号，不再额外添加 */}
        <div>
          <Typography.Text strong style={{ fontSize: 14 }}>
            {t(question.labelKey)}
          </Typography.Text>
        </div>

        {/* 金属列表 - 纵向排列 */}
        <Flex vertical gap={8}>
          {minerals.map((mineral) => {
            const gating = gatingByMineral?.get(mineral.key)
            const isDisabled = getQuestionDisabled(question.key, gating)
            const currentValue = getQuestionValue(
              values,
              question.key,
              mineral.key,
              question.perMineral
            )
            const currentComment = getQuestionValue(
              commentValues,
              question.key,
              mineral.key,
              question.perMineral
            )
            const error = getQuestionError(errors, question.key, mineral.key, question.perMineral)
            void error // Suppress unused variable warning - error display not yet implemented
            const required = requiredByQuestion?.get(question.key)?.get(mineral.key) === true
            const cellHandler = getCellHandler(question.key, mineral.key, question.perMineral)
            const commentHandler = getCommentHandler(question.key, mineral.key, question.perMineral)
            const options = getOptions(question.key, mineral.key, question.perMineral)

            return (
              <div key={mineral.key} className="question-matrix-grid">
                {/* 金属名称 */}
                <Typography.Text
                  className="question-matrix-label"
                  type={isDisabled ? 'secondary' : undefined}
                >
                  {mineral.label ?? t(mineral.labelKey)}
                </Typography.Text>

                <div className="question-matrix-answer">
                  <Select
                    value={currentValue || undefined}
                    onChange={cellHandler}
                    options={options}
                    placeholder={t('placeholders.select')}
                    disabled={isDisabled}
                    allowClear
                    className={!isDisabled && required && !currentValue ? 'field-required-empty' : undefined}
                    data-field-path={
                      question.perMineral
                        ? `questions.${question.key}.${mineral.key}`
                        : `questions.${question.key}`
                    }
                  />
                </div>

                <div className="question-matrix-comment">
                  <Input.TextArea
                    value={currentComment || undefined}
                    onChange={(e) => commentHandler?.(e.target.value)}
                    placeholder={t('placeholders.comments')}
                    disabled={isDisabled}
                    autoSize={{ minRows: 1, maxRows: 2 }}
                    rows={1}
                    style={{ resize: 'none' }}
                    data-field-path={
                      question.perMineral
                        ? `questionComments.${question.key}.${mineral.key}`
                        : `questionComments.${question.key}`
                    }
                  />
                </div>
              </div>
            )
          })}
        </Flex>
      </Flex>
    </div>
  )
}

// 辅助函数：判断问题是否在 gating 下禁用
function getQuestionDisabled(questionKey: string, gating?: GatingResult): boolean {
  if (!gating) return false
  if (questionKey === 'Q1') return false
  if (questionKey === 'Q2') return !gating.q2Enabled
  return !gating.laterQuestionsEnabled
}

// 辅助函数：获取问题当前值（支持 perMineral/全局）
function getQuestionValue(
  values: Record<string, Record<string, string> | string>,
  questionKey: string,
  mineralKey: string,
  perMineral: boolean
): string {
  const questionValue = values[questionKey]
  if (perMineral && typeof questionValue === 'object') {
    return questionValue[mineralKey] || ''
  }
  if (typeof questionValue === 'string') {
    return questionValue
  }
  return ''
}

// 辅助函数：获取问题错误（支持 perMineral/全局）
function getQuestionError(
  errors: Record<string, Record<string, ErrorKey> | ErrorKey>,
  questionKey: string,
  mineralKey: string,
  perMineral: boolean
): ErrorKey | undefined {
  const questionError = errors[questionKey]
  if (perMineral && typeof questionError === 'object') {
    return questionError[mineralKey]
  }
  if (typeof questionError === 'string') {
    return questionError
  }
  return undefined
}
