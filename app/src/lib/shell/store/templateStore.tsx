/**
 * @file app/store/templateStore.tsx
 * @description 状态管理与业务模型。
 */

// 说明：状态管理与业务模型
import { getVersionDef } from '@core/registry'
import type { TemplateType, TemplateVersionDef } from '@core/registry/types'
import { calculateGating } from '@core/rules/gating'
import { buildFormSchema } from '@core/schema'
import type { MineRow, MineralsScopeRow, ProductRow, SmelterRow } from '@core/types/tableRows'
import type { ErrorKey } from '@core/validation/errorKeys'
import { zodResolver } from '@hookform/resolvers/zod'
import type { CMReportingIntegrations } from '@lib/public/integrations'
import { useMemoizedFn } from 'ahooks'
import type { ReactNode } from 'react'
import { useEffect, useMemo } from 'react'
import type { FieldErrors, Resolver } from 'react-hook-form'
import { useForm, useWatch } from 'react-hook-form'

import {
  TemplateActionsContext,
  TemplateCompanyInfoContext,
  TemplateCompanyQuestionsContext,
  TemplateErrorsContext,
  TemplateIntegrationsContext,
  TemplateListsContext,
  TemplateMineralScopeContext,
  TemplateQuestionsContext,
  TemplateStaticContext,
} from './templateContext'
import type { TemplateFormErrors, TemplateFormState } from './templateTypes'

interface TemplateProviderProps {
  templateType: TemplateType
  versionId: string
  integrations?: CMReportingIntegrations
  children: ReactNode
}

/** 将 key 转为更友好的展示形式（用于默认自定义矿产名）。 */
function humanizeKey(value: string): string {
  return value
    .split(/[-_]/)
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ')
}

/** 基于模板定义构造空表单默认值。 */
function createEmptyState(versionDef: TemplateVersionDef): TemplateFormState {
  const companyInfo: Record<string, string> = {}
  for (const field of versionDef.companyInfoFields) {
    companyInfo[field.key] = ''
  }

  const questions: Record<string, Record<string, string> | string> = {}
  const questionComments: Record<string, Record<string, string> | string> = {}
  for (const question of versionDef.questions) {
    if (question.perMineral) {
      const perMineral: Record<string, string> = {}
      for (const mineral of versionDef.mineralScope.minerals) {
        perMineral[mineral.key] = ''
      }
      questions[question.key] = perMineral
      questionComments[question.key] = { ...perMineral }
    } else {
      questions[question.key] = ''
      questionComments[question.key] = ''
    }
  }

  const companyQuestions: Record<string, Record<string, string> | string> = {}
  for (const cq of versionDef.companyQuestions) {
    if (cq.perMineral) {
      const perMineral: Record<string, string> = {}
      for (const mineral of versionDef.mineralScope.minerals) {
        perMineral[mineral.key] = ''
      }
      companyQuestions[cq.key] = perMineral
    } else {
      companyQuestions[cq.key] = ''
    }
    if (cq.hasCommentField) {
      if (cq.perMineral) {
        const perMineralComment: Record<string, string> = {}
        for (const mineral of versionDef.mineralScope.minerals) {
          perMineralComment[mineral.key] = ''
        }
        companyQuestions[`${cq.key}_comment`] = perMineralComment
      } else {
        companyQuestions[`${cq.key}_comment`] = ''
      }
    }
  }

  const mineralsScope: MineralsScopeRow[] = []

  const allMinerals = versionDef.mineralScope.minerals.map((m) => m.key)
  const selectedMinerals =
    versionDef.mineralScope.mode === 'fixed' ? allMinerals : []
  const customMinerals =
    versionDef.mineralScope.mode === 'free-text'
      ? allMinerals.map((mineral, index) => {
          const defaults = versionDef.mineralScope.defaultCustomMinerals
          if (defaults && defaults.length > 0) {
            return defaults[index] ?? humanizeKey(mineral)
          }
          return humanizeKey(mineral)
        })
      : []

  return {
    companyInfo,
    selectedMinerals,
    customMinerals,
    questions,
    questionComments,
    companyQuestions,
    mineralsScope,
    smelterList: [],
    mineList: [],
    productList: [],
  }
}

/** 模板表单 Provider：负责表单默认值、校验与状态切片。 */
export function TemplateProvider({
  templateType,
  versionId,
  integrations,
  children,
}: TemplateProviderProps) {
  // NOTE: integrations 不参与表单 schema 与默认值；仅用于 UI 层“外部选择/回写”扩展点。
  const versionDef = useMemo(
    () => getVersionDef(templateType, versionId),
    [templateType, versionId]
  )

  const defaultState = useMemo(() => createEmptyState(versionDef), [versionDef])
  const schema = useMemo(() => buildFormSchema(versionDef), [versionDef])

  const resolver = useMemo<Resolver<TemplateFormState>>(
    () => zodResolver(schema),
    [schema]
  )

  const { control, reset, setValue, trigger, formState } = useForm<TemplateFormState>({
    defaultValues: defaultState,
    resolver,
    mode: 'onChange',
  })
  const companyInfo = useWatch({
    control,
    name: 'companyInfo',
    defaultValue: defaultState.companyInfo,
  }) as TemplateFormState['companyInfo']
  const selectedMinerals = useWatch({
    control,
    name: 'selectedMinerals',
    defaultValue: defaultState.selectedMinerals,
  }) as TemplateFormState['selectedMinerals']
  const customMinerals = useWatch({
    control,
    name: 'customMinerals',
    defaultValue: defaultState.customMinerals,
  }) as TemplateFormState['customMinerals']
  const questions = useWatch({
    control,
    name: 'questions',
    defaultValue: defaultState.questions,
  }) as TemplateFormState['questions']
  const questionComments = useWatch({
    control,
    name: 'questionComments',
    defaultValue: defaultState.questionComments,
  }) as TemplateFormState['questionComments']
  const companyQuestions = useWatch({
    control,
    name: 'companyQuestions',
    defaultValue: defaultState.companyQuestions,
  }) as TemplateFormState['companyQuestions']
  const mineralsScope = useWatch({
    control,
    name: 'mineralsScope',
    defaultValue: defaultState.mineralsScope,
  }) as TemplateFormState['mineralsScope']
  const smelterList = useWatch({
    control,
    name: 'smelterList',
    defaultValue: defaultState.smelterList,
  }) as TemplateFormState['smelterList']
  const mineList = useWatch({
    control,
    name: 'mineList',
    defaultValue: defaultState.mineList,
  }) as TemplateFormState['mineList']
  const productList = useWatch({
    control,
    name: 'productList',
    defaultValue: defaultState.productList,
  }) as TemplateFormState['productList']

  useEffect(() => {
    reset(defaultState)
  }, [defaultState, reset])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!formState.isDirty) return
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [formState.isDirty])

  const errors = useMemo(
    () => mapFormErrors(formState.errors),
    [formState.errors]
  )

  const setCompanyInfoField = useMemoizedFn((key: string, value: string) => {
    setValue(`companyInfo.${key}`, value, { shouldDirty: true, shouldValidate: true })
  })

  const setSelectedMinerals = useMemoizedFn((minerals: string[]) => {
    setValue('selectedMinerals', minerals, { shouldDirty: true, shouldValidate: true })
  })

  const setCustomMinerals = useMemoizedFn((minerals: string[]) => {
    setValue('customMinerals', minerals, { shouldDirty: true, shouldValidate: true })
  })

  const questionDefsByKey = useMemo(
    () => new Map(versionDef.questions.map((question) => [question.key, question])),
    [versionDef.questions]
  )
  const questionKeyOrder = useMemo(
    () => versionDef.questions.map((question) => question.key),
    [versionDef.questions]
  )

  /** 写入问题回答（值未变则跳过，避免不必要的 re-render）。 */
  const applyQuestionValue = useMemoizedFn(
    (key: string, targetMineral: string | null, nextValue: string) => {
      const def = questionDefsByKey.get(key)
      if (!def) return
      if (def.perMineral) {
        if (!targetMineral) return
        if (
          typeof questions[key] === 'object' &&
          (questions[key] as Record<string, string>)[targetMineral] === nextValue
        ) return
        setValue(`questions.${key}.${targetMineral}`, nextValue, { shouldDirty: true, shouldValidate: true })
        return
      }
      if (questions[key] === nextValue) return
      setValue(`questions.${key}`, nextValue, { shouldDirty: true, shouldValidate: true })
    }
  )

  /** 写入问题备注（值未变则跳过）。 */
  const applyQuestionComment = useMemoizedFn(
    (key: string, targetMineral: string | null, nextValue: string) => {
      const def = questionDefsByKey.get(key)
      if (!def) return
      if (def.perMineral) {
        if (!targetMineral) return
        if (
          typeof questionComments[key] === 'object' &&
          (questionComments[key] as Record<string, string>)[targetMineral] === nextValue
        ) return
        setValue(`questionComments.${key}.${targetMineral}`, nextValue, { shouldDirty: true, shouldValidate: true })
        return
      }
      if (questionComments[key] === nextValue) return
      setValue(`questionComments.${key}`, nextValue, { shouldDirty: true, shouldValidate: true })
    }
  )

  /**
   * Q1/Q2 变更时的门控级联：根据 gating 结果清空受影响的后续问题。
   * 仅在 Q1 或 Q2 变更时触发。
   */
  const applyGatingCascade = useMemoizedFn(
    (questionKey: string, mineralKey: string | null, value: string) => {
      const questionDef = questionDefsByKey.get(questionKey)
      if (!questionDef || (questionKey !== 'Q1' && questionKey !== 'Q2')) return

      // 构建包含本次变更的问题快照，用于 gating 计算
      const nextQuestions: TemplateFormState['questions'] = { ...questions }
      if (questionDef.perMineral) {
        if (!mineralKey) return
        const current = typeof nextQuestions[questionKey] === 'object' ? nextQuestions[questionKey] : {}
        nextQuestions[questionKey] = { ...(current as Record<string, string>), [mineralKey]: value }
      } else {
        nextQuestions[questionKey] = value
      }

      const gating = calculateGating(
        versionDef,
        nextQuestions,
        questionDef.perMineral ? mineralKey ?? undefined : undefined
      )
      const q2Index = questionKeyOrder.indexOf('Q2')
      if (q2Index < 0) return
      const laterKeys = questionKeyOrder.slice(q2Index + 1)

      // Q2 被门控禁用：清空 Q2 及后续所有问题
      if (!gating.q2Enabled) {
        applyQuestionValue('Q2', mineralKey, '')
        applyQuestionComment('Q2', mineralKey, '')
        laterKeys.forEach((k) => { applyQuestionValue(k, mineralKey, ''); applyQuestionComment(k, mineralKey, '') })
        return
      }

      // 后续问题被门控禁用：仅清空 Q3+
      if (!gating.laterQuestionsEnabled) {
        laterKeys.forEach((k) => { applyQuestionValue(k, mineralKey, ''); applyQuestionComment(k, mineralKey, '') })
      }
    }
  )

  const setQuestionValue = useMemoizedFn(
    (questionKey: string, mineralKey: string | null, value: string) => {
      applyQuestionValue(questionKey, mineralKey, value)
      applyGatingCascade(questionKey, mineralKey, value)
    }
  )

  const setQuestionComment = useMemoizedFn(
    (questionKey: string, mineralKey: string | null, value: string) => {
      const questionDef = questionDefsByKey.get(questionKey)
      if (!questionDef) return
      if (questionDef.perMineral) {
        if (!mineralKey) return
        setValue(`questionComments.${questionKey}.${mineralKey}`, value, {
          shouldDirty: true,
          shouldValidate: true,
        })
        return
      }
      setValue(`questionComments.${questionKey}`, value, {
        shouldDirty: true,
        shouldValidate: true,
      })
    }
  )

  const setCompanyQuestionValue = useMemoizedFn(
    (key: string, value: string, mineralKey?: string) => {
      if (mineralKey) {
        setValue(`companyQuestions.${key}.${mineralKey}`, value, {
          shouldDirty: true,
          shouldValidate: true,
        })
        return
      }
      setValue(`companyQuestions.${key}`, value, { shouldDirty: true, shouldValidate: true })
    }
  )

  const setMineralsScope = useMemoizedFn((rows: MineralsScopeRow[]) => {
    setValue('mineralsScope', rows, { shouldDirty: true, shouldValidate: true })
  })

  const setSmelterList = useMemoizedFn((rows: SmelterRow[]) => {
    setValue('smelterList', rows, { shouldDirty: true, shouldValidate: true })
  })

  const setMineList = useMemoizedFn((rows: MineRow[]) => {
    setValue('mineList', rows, { shouldDirty: true, shouldValidate: true })
  })

  const setProductList = useMemoizedFn((rows: ProductRow[]) => {
    setValue('productList', rows, { shouldDirty: true, shouldValidate: true })
  })

  const resetForm = useMemoizedFn(() => {
    reset(defaultState)
  })

  const setFormData = useMemoizedFn((data: TemplateFormState) => {
    // 以全量快照为准：调用方应保证 templateType/versionId 匹配。
    reset(data)
  })

  const validateForm = useMemoizedFn(async () => {
    return trigger()
  })

  const staticValue = useMemo(
    () => ({ templateType, versionId, versionDef }),
    [templateType, versionId, versionDef]
  )
  const integrationsValue = useMemo(
    () => ({ integrations }),
    [integrations]
  )
  const companyInfoValue = useMemo(() => ({ companyInfo }), [companyInfo])
  const mineralScopeValue = useMemo(
    () => ({ selectedMinerals, customMinerals }),
    [selectedMinerals, customMinerals]
  )
  const questionsValue = useMemo(
    () => ({ questions, questionComments }),
    [questions, questionComments]
  )
  const companyQuestionsValue = useMemo(
    () => ({ companyQuestions }),
    [companyQuestions]
  )
  const listsValue = useMemo(
    () => ({ mineralsScope, smelterList, mineList, productList }),
    [mineralsScope, smelterList, mineList, productList]
  )
  const errorsValue = useMemo(() => ({ errors }), [errors])
  const actionsValue = useMemo(
    () => ({
      setCompanyInfoField,
      setSelectedMinerals,
      setCustomMinerals,
      setQuestionValue,
      setQuestionComment,
      setCompanyQuestionValue,
      setMineralsScope,
      setSmelterList,
      setMineList,
      setProductList,
      setFormData,
      validateForm,
      resetForm,
    }),
    [
      setCompanyInfoField,
      setSelectedMinerals,
      setCustomMinerals,
      setQuestionValue,
      setQuestionComment,
      setCompanyQuestionValue,
      setMineralsScope,
      setSmelterList,
      setMineList,
      setProductList,
      setFormData,
      validateForm,
      resetForm,
    ]
  )

  return (
    <TemplateStaticContext.Provider value={staticValue}>
      <TemplateIntegrationsContext.Provider value={integrationsValue}>
        <TemplateCompanyInfoContext.Provider value={companyInfoValue}>
          <TemplateMineralScopeContext.Provider value={mineralScopeValue}>
            <TemplateQuestionsContext.Provider value={questionsValue}>
              <TemplateCompanyQuestionsContext.Provider value={companyQuestionsValue}>
                <TemplateListsContext.Provider value={listsValue}>
                  <TemplateErrorsContext.Provider value={errorsValue}>
                    <TemplateActionsContext.Provider value={actionsValue}>
                      {children}
                    </TemplateActionsContext.Provider>
                  </TemplateErrorsContext.Provider>
                </TemplateListsContext.Provider>
              </TemplateCompanyQuestionsContext.Provider>
            </TemplateQuestionsContext.Provider>
          </TemplateMineralScopeContext.Provider>
        </TemplateCompanyInfoContext.Provider>
      </TemplateIntegrationsContext.Provider>
    </TemplateStaticContext.Provider>
  )
}

/** 将 react-hook-form 的 errors 转为 UI 友好结构。 */
function mapFormErrors(errors: FieldErrors<TemplateFormState>): TemplateFormErrors {
  return {
    companyInfo: mapFlatErrors(errors.companyInfo),
    mineralsScope: getErrorMessage(errors.selectedMinerals),
    customMinerals: mapArrayErrors(errors.customMinerals as FieldErrors<string[]> | undefined),
    mineralsScopeRows: mapMineralsScopeErrors(
      errors.mineralsScope as FieldErrors<MineralsScopeRow[]> | undefined
    ),
    questions: mapQuestionErrors(errors.questions),
    companyQuestions: mapQuestionErrors(
      errors.companyQuestions as FieldErrors<Record<string, Record<string, string> | string>> | undefined
    ),
  }
}

/** 平铺 Record 类型的错误。 */
function mapFlatErrors(fieldErrors: FieldErrors<Record<string, string>> | undefined) {
  const result: Record<string, ErrorKey> = {}
  if (!fieldErrors) return result

  Object.entries(fieldErrors).forEach(([key, value]) => {
    const message = getErrorMessage(value)
    if (message) result[key] = message
  })

  return result
}

/** 处理按问题/矿产维度嵌套的错误结构。 */
function mapQuestionErrors(
  fieldErrors: FieldErrors<Record<string, Record<string, string> | string>> | undefined
): Record<string, Record<string, ErrorKey> | ErrorKey> {
  const result: Record<string, Record<string, ErrorKey> | ErrorKey> = {}
  if (!fieldErrors) return result

  Object.entries(fieldErrors).forEach(([questionKey, errorValue]) => {
    const message = getErrorMessage(errorValue)
    if (message) {
      result[questionKey] = message
      return
    }
    if (errorValue && typeof errorValue === 'object') {
      const mineralErrors: Record<string, ErrorKey> = {}
      Object.entries(errorValue as Record<string, unknown>).forEach(([mineralKey, mineralError]) => {
        const mineralMessage = getErrorMessage(mineralError)
        if (mineralMessage) mineralErrors[mineralKey] = mineralMessage
      })
      if (Object.keys(mineralErrors).length > 0) {
        result[questionKey] = mineralErrors
      }
    }
  })

  return result
}

/** 处理数组错误（含 root 错误）。 */
function mapArrayErrors(fieldErrors: FieldErrors<string[]> | undefined) {
  const result: Record<number, ErrorKey> = {}
  if (!fieldErrors || typeof fieldErrors !== 'object') return result

  Object.entries(fieldErrors).forEach(([key, value]) => {
    if (key === 'root') {
      const message = getErrorMessage(value)
      if (message) result[-1] = message
      return
    }
    const index = Number(key)
    if (!Number.isNaN(index)) {
      const message = getErrorMessage(value)
      if (message) result[index] = message
    }
  })

  return result
}

/** 处理 Minerals Scope 行错误。 */
function mapMineralsScopeErrors(fieldErrors: FieldErrors<MineralsScopeRow[]> | undefined) {
  const result: Record<number, { mineral?: ErrorKey; reason?: ErrorKey }> = {}
  if (!fieldErrors || typeof fieldErrors !== 'object') return result

  Object.entries(fieldErrors).forEach(([key, value]) => {
    const index = Number(key)
    if (Number.isNaN(index) || typeof value !== 'object' || !value) return
    const mineralMessage = getErrorMessage((value as { mineral?: unknown }).mineral)
    const reasonMessage = getErrorMessage((value as { reason?: unknown }).reason)
    if (mineralMessage || reasonMessage) {
      result[index] = { mineral: mineralMessage, reason: reasonMessage }
    }
  })

  return result
}

/** 提取错误 message 并强制为 ErrorKey。 */
function getErrorMessage(error: unknown): ErrorKey | undefined {
  if (!error || typeof error !== 'object') return undefined
  const message = (error as { message?: unknown }).message
  if (typeof message === 'string') return message as ErrorKey
  return undefined
}
