/**
 * @file public/integrations.ts
 * @description 对外扩展点：宿主接管“外部选择/回写列表”的交互与数据来源。
 */

import type { Locale } from '@core/i18n'
import type {
  ProductListConfig,
  SmelterListConfig,
  TemplateType,
  TemplateVersionDef,
} from '@core/registry/types'
import type { ProductRow, SmelterRow } from '@core/types/tableRows'

/** 外部选择器返回结果：null/undefined 表示取消；items 表示确认选择。 */
export type ExternalPickResult<T> = { items: T[] } | null | undefined

export type ExternalAddMode = 'append-empty-row' | 'external-only' | 'both'
export type SmelterLookupMode = 'internal' | 'external' | 'hybrid'

interface SmelterExternalContextBase {
  templateType: TemplateType
  versionId: string
  locale: Locale
  versionDef: TemplateVersionDef
  config: SmelterListConfig
  currentRows: ReadonlyArray<SmelterRow>
}

export interface SmelterRowPickContext extends SmelterExternalContextBase {
  rowId: string
  row: Readonly<SmelterRow>
  metal: string
}

export interface ProductPickContext {
  templateType: TemplateType
  versionId: string
  locale: Locale
  versionDef: TemplateVersionDef
  config: ProductListConfig
  currentRows: ReadonlyArray<ProductRow>
}

export interface SmelterListIntegration {
  /** 是否在触发外部选择时展示按钮 loading（默认 false）。 */
  showLoadingIndicator?: boolean
  /** 表格行样式：返回 className，交由宿主自行提供 CSS（不内置任何表现）。 */
  rowClassName?: (record: SmelterRow, index: number) => string
  /**
   * 行内外部选择：先在表格中选择 metal，再为当前行选择冶炼厂并回写。
   * - 返回 null/undefined 表示取消
   * - 返回 items[0] 将用于更新该行
   */
  onPickSmelterForRow?: (
    ctx: SmelterRowPickContext
  ) => Promise<ExternalPickResult<Partial<SmelterRow>>>
  /** 冶炼厂名称/选择入口交互模式：默认 'internal'（用户手填）。 */
  lookupMode?: SmelterLookupMode
}

export interface ProductListIntegration {
  /** 新增行为模式：默认 'append-empty-row'（保持现状）。 */
  addMode?: ExternalAddMode
  /** 外部选择按钮文案（默认 '从外部选择'）。 */
  label?: string
  /** 是否在触发外部选择时展示按钮 loading（默认 false）。 */
  showLoadingIndicator?: boolean
  /** 宿主接管外部选择并返回要回写的行数据。 */
  onPickProducts: (ctx: ProductPickContext) => Promise<ExternalPickResult<Partial<ProductRow>>>
}

export interface CMReportingIntegrations {
  smelterList?: SmelterListIntegration
  productList?: ProductListIntegration
}
