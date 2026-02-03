/**
 * @file core/registry/types.ts
 * @description 模块实现。
 */

// 说明：模块实现
// ---------------------------------------------------------------------------
// Template Type System
// ---------------------------------------------------------------------------

import type { I18nKey } from '@core/i18n'

/**
 * 导出类型：TemplateType。
 */
export type TemplateType = 'cmrt' | 'emrt' | 'crt' | 'amrt'

/**
 * 导出类型：ScopeType。
 */
export type ScopeType = 'A' | 'B' | 'C'

/**
 * 导出类型：CheckerSeverity。
 */
export type CheckerSeverity = 'error' | 'pass'

// ---------------------------------------------------------------------------
// Version
// ---------------------------------------------------------------------------

/**
 * 导出接口类型：TemplateVersion。
 */
export interface TemplateVersion {
  id: string
  label: string
  releaseDate?: string
}

// ---------------------------------------------------------------------------
// Minerals
// ---------------------------------------------------------------------------

/**
 * 导出接口类型：MineralDef。
 */
export interface MineralDef {
  key: string
  labelKey: I18nKey
}

/**
 * 导出类型：MineralInputMode。
 */
export type MineralInputMode = 'fixed' | 'dynamic-dropdown' | 'free-text'

/**
 * 导出接口类型：MineralScopeConfig。
 */
export interface MineralScopeConfig {
  mode: MineralInputMode
  minerals: MineralDef[]
  maxCount?: number
  /** 自由输入模式默认填充（按矿种槽位顺序）。 */
  defaultCustomMinerals?: string[]
  /** Other 矿种输入槽位数量（AMRT 1.3）。 */
  otherSlotCount?: number
}

// ---------------------------------------------------------------------------
// Scope (A/B/C)
// ---------------------------------------------------------------------------

/**
 * 导出接口类型：ScopeOption。
 */
export interface ScopeOption {
  value: ScopeType
  labelKey: I18nKey
}

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

/**
 * 导出接口类型：QuestionOption。
 */
export interface QuestionOption {
  value: string
  labelKey: I18nKey
}

/**
 * 导出接口类型：QuestionDef。
 */
export interface QuestionDef {
  key: string // e.g. "Q1", "Q2"
  labelKey: I18nKey
  options: QuestionOption[]
  /** 针对特定矿种覆盖选项（仅在 perMineral=true 时生效）。 */
  optionsByMineral?: Record<string, QuestionOption[]>
  perMineral: boolean // Q1-Qn 是否按矿种拆分
}

// ---------------------------------------------------------------------------
// Company Questions (A-I)
// ---------------------------------------------------------------------------

/**
 * 导出接口类型：CompanyQuestionDef。
 */
export interface CompanyQuestionDef {
  key: string // e.g. "A", "B"
  labelKey: I18nKey
  options: QuestionOption[]
  /** 是否按矿种拆分为多行（EMRT 的 C 题）。 */
  perMineral?: boolean
  hasCommentField?: boolean // 是否有注释/URL输入
  commentLabelKey?: I18nKey
  commentRequiredWhen?: string[]
}

// ---------------------------------------------------------------------------
// Pages / Tabs
// ---------------------------------------------------------------------------

/**
 * 导出类型：PageKey。
 */
export type PageKey =
  | 'revision'
  | 'instructions'
  | 'definitions'
  | 'declaration'
  | 'minerals-scope'
  | 'smelter-list'
  | 'checker'
  | 'mine-list'
  | 'product-list'
  | 'smelter-lookup'

/**
 * 导出接口类型：PageDef。
 */
export interface PageDef {
  key: PageKey
  labelKey: I18nKey
  available: boolean // 当前版本是否有此页
}

// ---------------------------------------------------------------------------
// Company Info Fields
// ---------------------------------------------------------------------------

/**
 * 导出接口类型：FieldDef。
 */
export interface FieldDef {
  key: string
  labelKey: I18nKey
  type: 'text' | 'email' | 'date' | 'select' | 'textarea'
  required: boolean | 'conditional' // conditional = 运行时由规则决定
}

// ---------------------------------------------------------------------------
// Gating Configuration
// ---------------------------------------------------------------------------

/**
 * 导出类型：GatingCondition。
 */
export type GatingCondition =
  | { type: 'q1-yes' } // CMRT: Q1=Yes
  | { type: 'q1q2-yes' } // CMRT: Q1=Yes AND Q2=Yes
  | { type: 'q1-not-no' } // CMRT: Q1≠No（旧版本逻辑）
  | { type: 'q1q2-not-no' } // CMRT: Q1≠No AND Q2≠No（旧版本逻辑）
  | { type: 'q1-not-negatives'; negatives: string[] } // CRT/EMRT: Q1≠否定值
  | { type: 'q1-not-negatives-and-q2-not-negatives'; q1Negatives: string[]; q2Negatives: string[] } // EMRT: Q1≠否定 AND Q2≠否定
  | { type: 'always' }

/**
 * 导出接口类型：GatingConfig。
 */
export interface GatingConfig {
  /** 控制 Q2 显示的条件 */
  q2Gating?: GatingCondition
  /** 控制 Q3+ 显示的条件 */
  laterQuestionsGating?: GatingCondition
  /** 控制公司层面问题显示的条件 */
  companyQuestionsGating?: GatingCondition
  /** 控制 Smelter List 必填的条件 */
  smelterListGating?: GatingCondition
}

// ---------------------------------------------------------------------------
// Smelter List Configuration
// ---------------------------------------------------------------------------

/**
 * 导出类型：MetalDropdownSource。
 */
export type MetalDropdownSource =
  | { type: 'fixed'; metals: MineralDef[] }
  | { type: 'dynamic-active' } // 已选矿种/自定义矿种
  | { type: 'dynamic-q1-yes' } // Q1=Yes 的矿种
  | { type: 'dynamic-q2-yes' } // Q2=Yes 的矿种

/**
 * 导出接口类型：SmelterListConfig。
 */
export interface SmelterListConfig {
  metalDropdownSource: MetalDropdownSource
  hasIdColumn: boolean
  hasLookup: boolean
  hasCombinedColumn: boolean
  /** 100% 回收料选项范围（默认 Yes/No/Unknown）。 */
  recycledScrapOptions?: 'yes-no' | 'yes-no-unknown'
  /** “Smelter not listed” 是否要求填写名称+国家（不同版本差异）。 */
  notListedRequireNameCountry?: boolean
  /** “Smelter not yet identified” 的默认国家填充值。 */
  notYetIdentifiedCountryDefault?: string
  /** 针对特定金属覆盖 not yet identified 的国家填充值。 */
  notYetIdentifiedCountryByMetal?: Record<string, string>
}

// ---------------------------------------------------------------------------
// Mine List Configuration
// ---------------------------------------------------------------------------

/**
 * 导出接口类型：MineListConfig。
 */
export interface MineListConfig {
  available: boolean
  metalDropdownSource?: MetalDropdownSource
  smelterNameMode?: 'manual' | 'dropdown' // EMRT 2.0=manual, 2.1=dropdown
}

// ---------------------------------------------------------------------------
// Product List Configuration
// ---------------------------------------------------------------------------

/**
 * 导出接口类型：ProductListConfig。
 */
export interface ProductListConfig {
  hasRequesterColumns: boolean
  productNumberLabelKey: I18nKey
  productNameLabelKey: I18nKey
  commentLabelKey: I18nKey
}

// ---------------------------------------------------------------------------
// Date Configuration
// ---------------------------------------------------------------------------

/**
 * 导出接口类型：DateConfig。
 */
export interface DateConfig {
  minDate: string // ISO format
  maxDate?: string // undefined = no upper limit
}

// ---------------------------------------------------------------------------
// Complete Template Definition (per version)
// ---------------------------------------------------------------------------

/**
 * 导出接口类型：TemplateVersionDef。
 */
export interface TemplateVersionDef {
  templateType: TemplateType
  version: TemplateVersion
  pages: PageDef[]
  mineralScope: MineralScopeConfig
  companyInfoFields: FieldDef[]
  questions: QuestionDef[]
  companyQuestions: CompanyQuestionDef[]
  gating: GatingConfig
  smelterList: SmelterListConfig
  mineList: MineListConfig
  productList: ProductListConfig
  dateConfig: DateConfig
}

// ---------------------------------------------------------------------------
// Template Definition (top-level, all versions)
// ---------------------------------------------------------------------------

/**
 * 导出接口类型：TemplateDefinition。
 */
export interface TemplateDefinition {
  type: TemplateType
  name: string
  fullNameKey: I18nKey
  versions: TemplateVersion[]
  defaultVersion: string
}
