/**
 * @file app/store/templateTypes.ts
 * @description 状态管理与业务模型。
 */

// 说明：状态管理与业务模型
import type { FormData } from '@core/schema'
import type { ErrorKey } from '@core/validation/errorKeys'

/** 表单完整状态结构。 */
export type TemplateFormState = FormData

/** 表单错误结构（按模块拆分）。 */
export interface TemplateFormErrors {
  companyInfo: Record<string, ErrorKey>
  mineralsScope?: ErrorKey
  customMinerals: Record<number, ErrorKey>
  mineralsScopeRows: Record<number, { mineral?: ErrorKey; reason?: ErrorKey }>
  questions: Record<string, Record<string, ErrorKey> | ErrorKey>
  companyQuestions: Record<string, Record<string, ErrorKey> | ErrorKey>
}
