/**
 * @file ui/theme/AppThemeScope.tsx
 * @description 应用主题作用域组件，负责注入 Ant Design 和 CM 自定义 CSS 变量。
 */

import { theme } from 'antd'
import type { CSSProperties, ReactNode } from 'react'

import type { CMCSSVariables } from './index'
import { cssVariablesToStyle } from './index'

const { useToken } = theme

/**
 * AppThemeScope Props。
 */
export interface AppThemeScopeProps {
  /** 子组件 */
  children: ReactNode
  /** CM 自定义 CSS 变量配置 */
  cssVariables?: CMCSSVariables
}

/**
 * AppThemeScope：应用主题作用域组件。
 * 将 Ant Design token 转换为 CSS 变量，并支持注入 CM 自定义 CSS 变量。
 */
export function AppThemeScope({ children, cssVariables }: AppThemeScopeProps) {
  const { cssVar } = useToken()

  // Ant Design token 映射的 CSS 变量
  const appStyle = {
    '--app-bg-layout': `var(${cssVar.colorBgLayout})`,
    '--app-bg-container': `var(${cssVar.colorBgContainer})`,
    '--app-bg-elevated': `var(${cssVar.colorBgElevated})`,
    '--app-text': `var(${cssVar.colorText})`,
    '--app-text-secondary': `var(${cssVar.colorTextSecondary})`,
    '--app-text-tertiary': `var(${cssVar.colorTextTertiary})`,
    '--app-text-heading': `var(${cssVar.colorTextHeading})`,
    '--app-text-description': `var(${cssVar.colorTextDescription})`,
    '--app-border': `var(${cssVar.colorBorder})`,
    '--app-border-secondary': `var(${cssVar.colorBorderSecondary})`,
    '--app-split': `var(${cssVar.colorSplit})`,
    '--app-primary': `var(${cssVar.colorPrimary})`,
    '--app-primary-bg': `var(${cssVar.colorPrimaryBg})`,
    '--app-primary-border': `var(${cssVar.colorPrimaryBorder})`,
    '--app-info': `var(${cssVar.colorInfo})`,
    '--app-info-bg': `var(${cssVar.colorInfoBg})`,
    '--app-info-border': `var(${cssVar.colorInfoBorder})`,
    '--app-success': `var(${cssVar.colorSuccess})`,
    '--app-success-bg': `var(${cssVar.colorSuccessBg})`,
    '--app-success-border': `var(${cssVar.colorSuccessBorder})`,
    '--app-warning': `var(${cssVar.colorWarning})`,
    '--app-warning-bg': `var(${cssVar.colorWarningBg})`,
    '--app-warning-border': `var(${cssVar.colorWarningBorder})`,
    '--app-error': `var(${cssVar.colorError})`,
    '--app-error-bg': `var(${cssVar.colorErrorBg})`,
    '--app-error-border': `var(${cssVar.colorErrorBorder})`,
    '--app-fill-secondary': `var(${cssVar.colorFillSecondary})`,
    '--app-fill-tertiary': `var(${cssVar.colorFillTertiary})`,
    '--app-fill-quaternary': `var(${cssVar.colorFillQuaternary})`,
    '--app-bg-text-hover': `var(${cssVar.colorBgTextHover})`,
    '--app-bg-text-active': `var(${cssVar.colorBgTextActive})`,
  } as CSSProperties

  // 合并 Ant Design 变量和 CM 自定义变量
  const cmStyle = cssVariables ? cssVariablesToStyle(cssVariables) : {}
  const combinedStyle = { ...appStyle, ...cmStyle }

  return (
    <div style={combinedStyle}>
      {children}
    </div>
  )
}
