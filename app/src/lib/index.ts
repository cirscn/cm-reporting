/**
 * @file lib/index.ts
 * @description NPM 包公共 API 入口。
 */

import './styles.css'

// ---------------------------------------------------------------------------
// 核心组件
// ---------------------------------------------------------------------------

export { CMReportingApp } from './CMReportingApp'
export type { CMReportingAppProps } from './CMReportingApp'

export { CMReportingProvider } from './providers/CMReportingProvider'
export type { CMReportingProviderProps } from './providers/CMReportingProvider'

// ---------------------------------------------------------------------------
// 类型
// ---------------------------------------------------------------------------

export type { Locale, I18nKey } from './core/i18n'
export type {
  TemplateType,
  PageKey,
  TemplateVersionDef,
  TemplateDefinition,
  TemplateVersion,
  MineralDef,
  ScopeType,
} from './core/registry/types'

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

export {
  getTemplateTypes,
  getTemplateDefinition,
  getAllTemplateDefinitions,
  getVersionDef,
  getVersions,
  getDefaultVersion,
  isValidTemplateType,
  isValidVersion,
} from './core/registry'

// ---------------------------------------------------------------------------
// 高级 API（按需导出）
// ---------------------------------------------------------------------------

// 页面组件
export { DeclarationPage } from './shell/pages/DeclarationPage'
export { SmelterListPage } from './shell/pages/SmelterListPage'
export { MineListPage } from './shell/pages/MineListPage'
export { ProductListPage } from './shell/pages/ProductListPage'
export { MineralsScopePage } from './shell/pages/MineralsScopePage'
export { RevisionPage } from './shell/pages/RevisionPage'
export { CheckerPage } from './shell/pages/CheckerPage'
export { DocPage } from './shell/pages/DocContent'
export { TemplateShell } from './shell/pages/TemplateShell'
export type { TemplateShellProps } from './shell/pages/TemplateShell'

// 状态管理
export {
  TemplateProvider,
  useTemplateState,
  useTemplateActions,
  useTemplateErrors,
  useTemplateDerived,
} from './shell/store'
export type { TemplateDerived, TemplateViewModels } from './shell/store'

// 导航
export { NavigationProvider, useNavigation, useOptionalNavigation, Navigate } from './shell/navigation'
export type { NavigationActions, NavigationContextValue, NavigationState } from './shell/navigation'
export { buildTemplatePath, resolveTemplateRoute } from './shell/routing/resolveTemplateRoute'

// 布局组件
export { AppLayout } from './ui/layout/AppLayout'
export { StepNav, type StepNavItem } from './ui/layout/StepNav'
export { SectionCard, SectionHeader, StatusBadge } from './ui/layout/SectionCard'
export { LanguageSwitcher } from './ui/layout/LanguageSwitcher'

// i18n
export { initI18n, isI18nInitialized } from './core/i18n'
export { useT } from './ui/i18n/useT'

// 主题配置
export type { CMCSSVariables, CMThemeConfig } from './ui/theme'
export {
  cssVariablesToStyle,
  defaultAntdTheme,
  mergeThemeConfig,
  SPACING,
  LAYOUT,
  COMPONENT,
} from './ui/theme'
