/**
 * @file app/store/templateTypes.ts
 * @description 状态管理与业务模型。
 */

// 说明：状态管理与业务模型
import type { FormData } from '@core/schema'
import type { ErrorKey } from '@core/validation/errorKeys'

/** 表单完整状态结构。 */
export type TemplateFormState = FormData

/** 矿种删减后需要人工校对的提示信息。 */
export interface MineralReconcileNotice {
  templateType: 'emrt'
  versionId: '2.0' | '2.1'
  removedMinerals: string[]
}

/** 表单错误结构（按模块拆分）。 */
export interface TemplateFormErrors {
  companyInfo: Record<string, ErrorKey>
  mineralsScope?: ErrorKey
  customMinerals: Record<number, ErrorKey>
  mineralsScopeRows: Record<number, { mineral?: ErrorKey; reason?: ErrorKey }>
  questions: Record<string, Record<string, ErrorKey> | ErrorKey>
  companyQuestions: Record<string, Record<string, ErrorKey> | ErrorKey>
}
