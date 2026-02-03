/**
 * @file ui/theme/index.ts
 * @description CM Reporting 主题配置模块。
 * 提供主题配置类型定义和工具函数，支持外部覆盖样式。
 */

import type { ThemeConfig } from 'antd'
import type { CSSProperties } from 'react'

// 导出间距常量
export { SPACING, LAYOUT, COMPONENT } from './spacing'

// 导出 AppThemeScope 组件
export { AppThemeScope } from './AppThemeScope'

/**
 * CM 自定义 CSS 变量配置。
 * 用于覆盖 lib/variables.css 中定义的默认值。
 */
export interface CMCSSVariables {
  /** 布局相关 */
  layout?: {
    /** 内容区域最大宽度 */
    contentMaxWidth?: string
    /** 页面内边距 */
    pagePadding?: string
    /** 区块之间的间距 */
    sectionGap?: string
    /** 步骤导航内边距 */
    stepNavPadding?: string
  }

  /** 必填字段高亮 */
  fieldRequired?: {
    /** 背景色 */
    background?: string
    /** 边框色 */
    border?: string
  }

  /** 字段聚焦高亮 */
  fieldFocus?: {
    /** 阴影颜色 */
    shadowColor?: string
  }

  /** 动画配置 */
  animation?: {
    /** 过渡时长 */
    duration?: string
    /** 缓动函数 */
    easing?: string
  }

  /** 字体尺寸 */
  fontSize?: {
    /** 超小字体 */
    xs?: string
    /** 小字体 */
    sm?: string
    /** 基础字体 */
    base?: string
    /** 大字体 */
    lg?: string
  }

  /** 组件尺寸 */
  component?: {
    /** 按钮最小宽度 */
    buttonMinWidth?: string
    /** 加载占位区域高度 */
    placeholderHeight?: string
    /** 表单控件最大宽度 */
    formControlMaxWidth?: string
  }

  /** 表格/表单网格列宽 */
  grid?: {
    /** 问题矩阵 - 标签列宽度 */
    questionMatrixLabelWidth?: string
    /** 问题矩阵 - 答案列宽度 */
    questionMatrixAnswerWidth?: string
    /** 公司问题 - 标签列宽度 */
    companyQuestionLabelWidth?: string
    /** 公司问题 - 答案列宽度 */
    companyQuestionAnswerWidth?: string
  }

  /** 间距预设 */
  spacing?: {
    /** 列表项垂直间距 */
    listItemPadding?: string
    /** 空状态区域内边距 */
    emptyStatePadding?: string
  }
}

/**
 * CM 主题配置。
 * 结合 Ant Design 主题和 CM 自定义 CSS 变量。
 */
export interface CMThemeConfig {
  /** Ant Design 主题配置 */
  antd?: ThemeConfig
  /** CM 自定义 CSS 变量 */
  cssVariables?: CMCSSVariables
}

/**
 * 将 CMCSSVariables 转换为 CSS 变量对象。
 * 用于通过 style 属性注入到 DOM 中。
 */
export function cssVariablesToStyle(variables: CMCSSVariables): CSSProperties {
  const style: Record<string, string> = {}

  // 布局
  if (variables.layout?.contentMaxWidth) {
    style['--cm-content-max-width'] = variables.layout.contentMaxWidth
  }
  if (variables.layout?.pagePadding) {
    style['--cm-page-padding'] = variables.layout.pagePadding
  }
  if (variables.layout?.sectionGap) {
    style['--cm-section-gap'] = variables.layout.sectionGap
  }
  if (variables.layout?.stepNavPadding) {
    style['--cm-step-nav-padding'] = variables.layout.stepNavPadding
  }

  // 必填字段高亮
  if (variables.fieldRequired?.background) {
    style['--cm-field-required-bg'] = variables.fieldRequired.background
  }
  if (variables.fieldRequired?.border) {
    style['--cm-field-required-border'] = variables.fieldRequired.border
  }

  // 字段聚焦高亮
  if (variables.fieldFocus?.shadowColor) {
    style['--cm-field-focus-shadow-color'] = variables.fieldFocus.shadowColor
  }

  // 动画
  if (variables.animation?.duration) {
    style['--cm-transition-duration'] = variables.animation.duration
  }
  if (variables.animation?.easing) {
    style['--cm-transition-easing'] = variables.animation.easing
  }

  // 字体尺寸
  if (variables.fontSize?.xs) {
    style['--cm-font-size-xs'] = variables.fontSize.xs
  }
  if (variables.fontSize?.sm) {
    style['--cm-font-size-sm'] = variables.fontSize.sm
  }
  if (variables.fontSize?.base) {
    style['--cm-font-size-base'] = variables.fontSize.base
  }
  if (variables.fontSize?.lg) {
    style['--cm-font-size-lg'] = variables.fontSize.lg
  }

  // 组件尺寸
  if (variables.component?.buttonMinWidth) {
    style['--cm-button-min-width'] = variables.component.buttonMinWidth
  }
  if (variables.component?.placeholderHeight) {
    style['--cm-placeholder-height'] = variables.component.placeholderHeight
  }
  if (variables.component?.formControlMaxWidth) {
    style['--cm-form-control-max-width'] = variables.component.formControlMaxWidth
  }

  // 表格/表单网格列宽
  if (variables.grid?.questionMatrixLabelWidth) {
    style['--cm-question-matrix-label-width'] = variables.grid.questionMatrixLabelWidth
  }
  if (variables.grid?.questionMatrixAnswerWidth) {
    style['--cm-question-matrix-answer-width'] = variables.grid.questionMatrixAnswerWidth
  }
  if (variables.grid?.companyQuestionLabelWidth) {
    style['--cm-company-question-label-width'] = variables.grid.companyQuestionLabelWidth
  }
  if (variables.grid?.companyQuestionAnswerWidth) {
    style['--cm-company-question-answer-width'] = variables.grid.companyQuestionAnswerWidth
  }

  // 间距预设
  if (variables.spacing?.listItemPadding) {
    style['--cm-list-item-padding'] = variables.spacing.listItemPadding
  }
  if (variables.spacing?.emptyStatePadding) {
    style['--cm-empty-state-padding'] = variables.spacing.emptyStatePadding
  }

  return style as CSSProperties
}

/**
 * 默认 Ant Design 主题配置。
 */
export const defaultAntdTheme: ThemeConfig = {
  cssVar: { prefix: 'ant' },
  token: {
    // 主色系统 - 与原型设计对齐
    colorPrimary: '#1565c0',
    colorPrimaryHover: '#1976d2',
    colorPrimaryActive: '#0d47a1',
    colorPrimaryBg: '#e3f2fd',
    colorPrimaryBorder: '#90caf9',

    // 状态颜色
    colorSuccess: '#2e7d32',
    colorSuccessBg: '#e8f5e9',
    colorSuccessBorder: '#4caf50',
    colorWarning: '#f57c00',
    colorWarningBg: '#fff3e0',
    colorWarningBorder: '#ff9800',
    colorError: '#c62828',
    colorErrorBg: '#ffebee',
    colorErrorBorder: '#ef5350',
    colorInfo: '#0288d1',
    colorInfoBg: '#e1f5fe',
    colorInfoBorder: '#03a9f4',

    // 文本颜色
    colorText: '#212121',
    colorTextSecondary: '#757575',
    colorTextTertiary: '#9e9e9e',
    colorTextHeading: '#212121',
    colorTextDescription: '#757575',

    // 背景颜色
    colorBgLayout: '#f5f5f5',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',

    // 边框颜色
    colorBorder: '#e0e0e0',
    colorBorderSecondary: '#eeeeee',

    // 填充颜色
    colorFillSecondary: '#eeeeee',
    colorFillTertiary: '#f5f5f5',
    colorFillQuaternary: '#fafafa',

    // 圆角
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 4,
    borderRadiusXS: 2,

    // 字体
    fontFamily: "'IBM Plex Sans', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontFamilyCode: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
    fontSize: 14,

    // 阴影
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
}

/**
 * 合并主题配置。
 * 将用户提供的配置与默认配置深度合并。
 */
export function mergeThemeConfig(
  customTheme?: ThemeConfig,
  defaultTheme: ThemeConfig = defaultAntdTheme
): ThemeConfig {
  if (!customTheme) return defaultTheme

  return {
    ...defaultTheme,
    ...customTheme,
    cssVar: {
      ...defaultTheme.cssVar,
      ...customTheme.cssVar,
    },
    token: {
      ...defaultTheme.token,
      ...customTheme.token,
    },
    components: {
      ...defaultTheme.components,
      ...customTheme.components,
    },
  }
}
