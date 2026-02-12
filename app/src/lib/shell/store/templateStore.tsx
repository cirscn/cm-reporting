/**
 * @file shell/store/templateStore.tsx
 * @description zustand 状态管理：替代原 9 层 Context + react-hook-form 架构。
 *
 * 核心设计：
 * - 使用 zustand `createStore` + immer middleware 管理全量表单状态
 * - 通过 React Context 提供 store 实例（支持多实例/测试隔离）
 * - 消费侧用 selector 精确订阅，天然实现按需更新
 * - 校验使用 zod schema.safeParse 直接完成（无需 react-hook-form）
 * - 校验通过 queueMicrotask 延迟执行，同一帧内多次状态变更仅触发一次校验
 */

import { getVersionDef } from '@core/registry'
import type { TemplateType, TemplateVersionDef } from '@core/registry/types'
import { runChecker } from '@core/rules/checker'
import { calculateGating } from '@core/rules/gating'
import { buildFormSchema } from '@core/schema'
import { createEmptyFormData } from '@core/template/formDefaults'
import { normalizeAuthorizationDateInput } from '@core/transform'
import type { MineRow, MineralsScopeRow, ProductRow, SmelterRow } from '@core/types/tableRows'
import type { ErrorKey } from '@core/validation/errorKeys'
import type { CMReportingIntegrations } from '@lib/public/integrations'
import { enableMapSet } from 'immer'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { createStore } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { buildDataInput, buildRuleInput } from './ruleContext'
import { TemplateStoreContext } from './templateStoreContext'
import type { TemplateFormErrors, TemplateFormState } from './templateTypes'

enableMapSet()

// ---------------------------------------------------------------------------
// 空错误常量
// ---------------------------------------------------------------------------

const EMPTY_ERRORS: TemplateFormErrors = {
  companyInfo: {},
  customMinerals: {},
  mineralsScopeRows: {},
  questions: {},
  companyQuestions: {},
}

// ---------------------------------------------------------------------------
// Store 类型定义
// ---------------------------------------------------------------------------

/** zustand store 的完整类型（状态 + 元信息 + 错误 + 操作）。 */
export interface TemplateStoreState {
  // ── 静态元信息 ──
  templateType: TemplateType
  versionId: string
  versionDef: TemplateVersionDef
  readOnly: boolean
  integrations?: CMReportingIntegrations

  // ── 表单数据（即 TemplateFormState 的展开） ──
  companyInfo: Record<string, string>
  selectedMinerals: string[]
  customMinerals: string[]
  questions: Record<string, Record<string, string> | string>
  questionComments: Record<string, Record<string, string> | string>
  companyQuestions: Record<string, Record<string, string> | string>
  mineralsScope: MineralsScopeRow[]
  smelterList: SmelterRow[]
  mineList: MineRow[]
  productList: ProductRow[]

  // ── 校验 ──
  errors: TemplateFormErrors
  isDirty: boolean

  // ── 操作 ──
  setCompanyInfoField: (key: string, value: string) => void
  setSelectedMinerals: (minerals: string[]) => void
  setCustomMinerals: (minerals: string[]) => void
  setQuestionValue: (questionKey: string, mineralKey: string | null, value: string) => void
  setQuestionComment: (questionKey: string, mineralKey: string | null, value: string) => void
  setCompanyQuestionValue: (key: string, value: string, mineralKey?: string) => void
  setMineralsScope: (rows: MineralsScopeRow[]) => void
  setSmelterList: (rows: SmelterRow[]) => void
  setMineList: (rows: MineRow[]) => void
  setProductList: (rows: ProductRow[]) => void
  setFormData: (data: TemplateFormState) => void
  validateForm: () => Promise<boolean>
  resetForm: () => void
}

// ---------------------------------------------------------------------------
// 辅助函数
// ---------------------------------------------------------------------------

/** 嵌套字段写入器：处理 Record<key, Record<subKey, value> | value> 结构。 */
function writeNestedField(
  target: Record<string, Record<string, string> | string>,
  key: string,
  value: string,
  subKey?: string | null,
) {
  if (subKey) {
    const current = target[key]
    if (typeof current === 'object') {
      current[subKey] = value
    } else {
      target[key] = { [subKey]: value }
    }
  } else {
    target[key] = value
  }
}

/**
 * 问题字段写入器：按 perMineral 决定写入 Record<mineral, string> 还是纯 string。
 * 同时用于 questions 和 questionComments。
 */
function writeQuestionField(
  target: Record<string, Record<string, string> | string>,
  def: { perMineral: boolean },
  questionKey: string,
  mineralKey: string | null,
  value: string,
) {
  if (def.perMineral) {
    if (!mineralKey) return
    writeNestedField(target, questionKey, value, mineralKey)
  } else {
    target[questionKey] = value
  }
}

function normalizeFormData(data: TemplateFormState): TemplateFormState {
  return {
    ...data,
    companyInfo: {
      ...data.companyInfo,
      authorizationDate: normalizeAuthorizationDateInput(data.companyInfo.authorizationDate),
    },
  }
}

// ---------------------------------------------------------------------------
// Zod 错误映射
// ---------------------------------------------------------------------------

/** 将 Zod issues 映射为 UI 友好的 TemplateFormErrors。 */
function mapZodErrors(issues: Array<{ path: PropertyKey[]; message: string }>): TemplateFormErrors {
  const result: TemplateFormErrors = {
    companyInfo: {},
    customMinerals: {},
    mineralsScopeRows: {},
    questions: {},
    companyQuestions: {},
  }

  for (const issue of issues) {
    const [root, ...rest] = issue.path
    const msg = issue.message as ErrorKey

    switch (root) {
      case 'companyInfo': {
        const key = rest[0]
        if (typeof key === 'string') result.companyInfo[key] = msg
        break
      }
      case 'selectedMinerals':
        result.mineralsScope = msg
        break
      case 'customMinerals': {
        const idx = rest[0]
        if (typeof idx === 'number') result.customMinerals[idx] = msg
        break
      }
      case 'mineralsScope': {
        const idx = rest[0]
        const field = rest[1]
        if (typeof idx === 'number' && (field === 'mineral' || field === 'reason')) {
          const existing = result.mineralsScopeRows[idx] ?? {}
          existing[field] = msg
          result.mineralsScopeRows[idx] = existing
        }
        break
      }
      case 'questions': {
        const qKey = rest[0]
        const mKey = rest[1]
        if (typeof qKey === 'string') {
          if (typeof mKey === 'string') {
            const existing = result.questions[qKey]
            if (existing && typeof existing === 'object') {
              (existing as Record<string, ErrorKey>)[mKey] = msg
            } else {
              result.questions[qKey] = { [mKey]: msg }
            }
          } else {
            result.questions[qKey] = msg
          }
        }
        break
      }
      case 'companyQuestions': {
        const cqKey = rest[0]
        const mKey = rest[1]
        if (typeof cqKey === 'string') {
          if (typeof mKey === 'string') {
            const existing = result.companyQuestions[cqKey]
            if (existing && typeof existing === 'object') {
              (existing as Record<string, ErrorKey>)[mKey] = msg
            } else {
              result.companyQuestions[cqKey] = { [mKey]: msg }
            }
          } else {
            result.companyQuestions[cqKey] = msg
          }
        }
        break
      }
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// 获取 TemplateFormState 快照（从 store 中提取表单字段）
// ---------------------------------------------------------------------------

function getFormData(s: TemplateStoreState): TemplateFormState {
  return {
    companyInfo: s.companyInfo,
    selectedMinerals: s.selectedMinerals,
    customMinerals: s.customMinerals,
    questions: s.questions,
    questionComments: s.questionComments,
    companyQuestions: s.companyQuestions,
    mineralsScope: s.mineralsScope,
    smelterList: s.smelterList,
    mineList: s.mineList,
    productList: s.productList,
  }
}

// ---------------------------------------------------------------------------
// Store 工厂
// ---------------------------------------------------------------------------

/** 创建 zustand store 实例（每个 TemplateProvider 一个）。 */
function createTemplateStore(
  templateType: TemplateType,
  versionId: string,
  readOnly: boolean,
  integrations?: CMReportingIntegrations
) {
  const versionDef = getVersionDef(templateType, versionId)
  const defaultState = createEmptyFormData(versionDef)
  const schema = buildFormSchema(versionDef)

  const questionDefsByKey = new Map(versionDef.questions.map((q) => [q.key, q]))
  const questionKeyOrder = versionDef.questions.map((q) => q.key)

  /** 同步运行 zod 全量校验（用于字段级错误映射与基础结构校验）。 */
  function runValidationSync(state: TemplateStoreState): TemplateFormErrors {
    const result = schema.safeParse(getFormData(state))
    if (result.success) return EMPTY_ERRORS
    return mapZodErrors(result.error.issues)
  }

  /**
   * 延迟校验调度器：通过 queueMicrotask 将校验推迟到当前微任务队列末尾。
   *
   * 优势：
   * - 同一帧内多次 set() 仅触发一次校验（例如门控级联清空多个字段）
   * - 校验在浏览器绘制前完成（microtask），UI 不会闪烁
   * - 避免每次按键都跑一遍完整 zod schema
   */
  let validationPending = false
  function scheduleValidation(
    set: (partial: Partial<TemplateStoreState>) => void,
    get: () => TemplateStoreState
  ) {
    if (validationPending) return
    validationPending = true
    queueMicrotask(() => {
      validationPending = false
      const state = get()
      const errors = runValidationSync(state)
      // 仅在 errors 引用变化时更新（EMPTY_ERRORS 是稳定引用）
      if (errors !== state.errors) {
        set({ errors })
      }
    })
  }

  /**
   * 门控级联清空：Q1/Q2 变更时，按 gating 规则清空受影响的后续问题。
   *
   * 逻辑：
   * 1. 仅 Q1/Q2 触发级联
   * 2. 计算当前 gating 状态
   * 3. 若 Q2 被禁用：清空 Q2 + Q2 之后所有问题
   * 4. 若仅后续问题被禁用：清空 Q2 之后所有问题
   */
  function applyGatingCascade(
    s: TemplateStoreState,
    questionKey: string,
    mineralKey: string | null,
    value: string,
    def: { perMineral: boolean },
  ) {
    if (questionKey !== 'Q1' && questionKey !== 'Q2') return

    // 构建包含最新值的 questions 快照用于 gating 计算
    const nextQuestions = { ...getFormData(s).questions }
    if (def.perMineral && mineralKey) {
      const cur = typeof nextQuestions[questionKey] === 'object' ? nextQuestions[questionKey] : {}
      nextQuestions[questionKey] = { ...(cur as Record<string, string>), [mineralKey]: value }
    } else if (!def.perMineral) {
      nextQuestions[questionKey] = value
    }

    const gating = calculateGating(
      versionDef,
      nextQuestions,
      def.perMineral ? mineralKey ?? undefined : undefined,
    )
    const q2Index = questionKeyOrder.indexOf('Q2')
    if (q2Index < 0) return
    const laterKeys = questionKeyOrder.slice(q2Index + 1)

    /** 清空指定问题的回答与备注。 */
    const clearQuestion = (k: string, m: string | null) => {
      const d = questionDefsByKey.get(k)
      if (!d) return
      if (d.perMineral && m) {
        const qv = s.questions[k]
        if (typeof qv === 'object') qv[m] = ''
        const cv = s.questionComments[k]
        if (typeof cv === 'object') cv[m] = ''
      } else if (!d.perMineral) {
        s.questions[k] = ''
        s.questionComments[k] = ''
      }
    }

    if (!gating.q2Enabled) {
      clearQuestion('Q2', mineralKey)
      laterKeys.forEach((k) => clearQuestion(k, mineralKey))
    } else if (!gating.laterQuestionsEnabled) {
      laterKeys.forEach((k) => clearQuestion(k, mineralKey))
    }
  }

  return createStore<TemplateStoreState>()(
    immer((set, get) => ({
      // ── 静态元信息 ──
      templateType,
      versionId,
      versionDef,
      readOnly,
      integrations,

      // ── 表单数据 ──
      ...defaultState,

      // ── 校验 ──
      errors: EMPTY_ERRORS,
      isDirty: false,

      // ── Actions ──
      // 每个 action 仅调用一次 set()，校验通过 scheduleValidation 延迟到微任务。

      setCompanyInfoField: (key, value) => {
        if (get().readOnly) return
        set((s) => { s.companyInfo[key] = value; s.isDirty = true })
        scheduleValidation(set, get)
      },

      setSelectedMinerals: (minerals) => {
        if (get().readOnly) return
        set((s) => {
          s.selectedMinerals = minerals
          s.isDirty = true
        })
        scheduleValidation(set, get)
      },

      setCustomMinerals: (minerals) => {
        if (get().readOnly) return
        set({ customMinerals: minerals, isDirty: true })
        scheduleValidation(set, get)
      },

      setQuestionValue: (questionKey, mineralKey, value) => {
        if (get().readOnly) return
        set((s) => {
          // ── 1. 写入回答值 ──
          const def = questionDefsByKey.get(questionKey)
          if (!def) return
          writeQuestionField(s.questions, def, questionKey, mineralKey, value)
          s.isDirty = true

          // ── 2. 门控级联：Q1/Q2 变更时清空受影响的后续问题 ──
          applyGatingCascade(s, questionKey, mineralKey, value, def)
        })
        scheduleValidation(set, get)
      },

      setQuestionComment: (questionKey, mineralKey, value) => {
        if (get().readOnly) return
        set((s) => {
          const def = questionDefsByKey.get(questionKey)
          if (!def) return
          writeQuestionField(s.questionComments, def, questionKey, mineralKey, value)
          s.isDirty = true
        })
        scheduleValidation(set, get)
      },

      setCompanyQuestionValue: (key, value, mineralKey?) => {
        if (get().readOnly) return
        set((s) => {
          writeNestedField(s.companyQuestions, key, value, mineralKey)
          s.isDirty = true
        })
        scheduleValidation(set, get)
      },

      setMineralsScope: (rows) => {
        if (get().readOnly) return
        set({ mineralsScope: rows, isDirty: true })
        scheduleValidation(set, get)
      },

      setSmelterList: (rows) => {
        if (get().readOnly) return
        set({ smelterList: rows, isDirty: true })
        scheduleValidation(set, get)
      },

      setMineList: (rows) => {
        if (get().readOnly) return
        set({ mineList: rows, isDirty: true })
        scheduleValidation(set, get)
      },

      setProductList: (rows) => {
        if (get().readOnly) return
        set({ productList: rows, isDirty: true })
        scheduleValidation(set, get)
      },

      setFormData: (data) => {
        set({ ...normalizeFormData(data), isDirty: false })
        scheduleValidation(set, get)
      },

      /** 同步全量校验（用于导出前确认），不走 scheduleValidation。 */
      validateForm: async () => {
        const state = get()
        const formData = getFormData(state)
        const schemaResult = schema.safeParse(formData)

        if (!schemaResult.success) {
          set({ errors: mapZodErrors(schemaResult.error.issues) })
          return false
        }

        // zod 通过后继续执行 checker 业务规则，submit/validate 双重门控保持一致。
        set({ errors: EMPTY_ERRORS })
        const checkerErrors = runChecker(versionDef, buildRuleInput(formData), buildDataInput(formData))
        return checkerErrors.length === 0
      },

      resetForm: () => {
        set({
          ...defaultState,
          errors: EMPTY_ERRORS,
          isDirty: false,
        })
      },
    }))
  )
}

// ---------------------------------------------------------------------------
// React Provider
// ---------------------------------------------------------------------------

interface TemplateProviderProps {
  templateType: TemplateType
  versionId: string
  readOnly?: boolean
  integrations?: CMReportingIntegrations
  children: ReactNode
}

/**
 * 模板 Provider：创建/重置 zustand store 实例。
 *
 * 使用 React 官方 "Storing information from previous renders" 模式
 * （https://react.dev/reference/react/useState#storing-information-from-previous-renders）
 * 在 templateType/versionId 变更时同步重建 store，避免子组件看到过期实例。
 */
export function TemplateProvider({
  templateType,
  versionId,
  readOnly = false,
  integrations,
  children,
}: TemplateProviderProps) {
  const currentKey = `${templateType}:${versionId}`

  // "derive state from props" 模式：在 render 期间检测 key 变化并同步重建 store。
  // React 会在 setState 后立即重新渲染本组件，子组件不会看到过期 store。
  const [prevKey, setPrevKey] = useState(currentKey)
  const [store, setStore] = useState(() =>
    createTemplateStore(templateType, versionId, readOnly, integrations)
  )
  if (currentKey !== prevKey) {
    setPrevKey(currentKey)
    setStore(createTemplateStore(templateType, versionId, readOnly, integrations))
  }

  // integrations/readOnly 变更时仅更新引用（不重建 store）
  useEffect(() => {
    store.setState({ integrations, readOnly })
  }, [store, integrations, readOnly])

  // 离开页面前提示（isDirty）
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    const unsubscribe = store.subscribe((state) => {
      if (state.isDirty) {
        window.addEventListener('beforeunload', handler)
      } else {
        window.removeEventListener('beforeunload', handler)
      }
    })

    return () => {
      unsubscribe()
      window.removeEventListener('beforeunload', handler)
    }
  }, [store])

  return (
    <TemplateStoreContext.Provider value={store}>
      {children}
    </TemplateStoreContext.Provider>
  )
}
