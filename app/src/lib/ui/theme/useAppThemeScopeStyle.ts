import { theme } from 'antd'
import type { CSSProperties } from 'react'

import type { CMCSSVariables } from './index'
import { cssVariablesToStyle } from './index'

const { useToken } = theme

type UseTokenContext = ReturnType<typeof useToken>
type TokenLike = UseTokenContext['token']
type TokenKey = keyof TokenLike & string
type CssVarLike = Record<string, string>

const TOKEN_VARIABLE_MAPPINGS = [
  ['--app-bg-layout', 'colorBgLayout'],
  ['--app-bg-container', 'colorBgContainer'],
  ['--app-bg-elevated', 'colorBgElevated'],
  ['--app-text', 'colorText'],
  ['--app-text-secondary', 'colorTextSecondary'],
  ['--app-text-tertiary', 'colorTextTertiary'],
  ['--app-text-heading', 'colorTextHeading'],
  ['--app-text-description', 'colorTextDescription'],
  ['--app-border', 'colorBorder'],
  ['--app-border-secondary', 'colorBorderSecondary'],
  ['--app-split', 'colorSplit'],
  ['--app-primary', 'colorPrimary'],
  ['--app-primary-bg', 'colorPrimaryBg'],
  ['--app-primary-border', 'colorPrimaryBorder'],
  ['--app-info', 'colorInfo'],
  ['--app-info-bg', 'colorInfoBg'],
  ['--app-info-border', 'colorInfoBorder'],
  ['--app-success', 'colorSuccess'],
  ['--app-success-bg', 'colorSuccessBg'],
  ['--app-success-border', 'colorSuccessBorder'],
  ['--app-warning', 'colorWarning'],
  ['--app-warning-bg', 'colorWarningBg'],
  ['--app-warning-border', 'colorWarningBorder'],
  ['--app-error', 'colorError'],
  ['--app-error-bg', 'colorErrorBg'],
  ['--app-error-border', 'colorErrorBorder'],
  ['--app-fill-secondary', 'colorFillSecondary'],
  ['--app-fill-tertiary', 'colorFillTertiary'],
  ['--app-fill-quaternary', 'colorFillQuaternary'],
  ['--app-bg-text-hover', 'colorBgTextHover'],
  ['--app-bg-text-active', 'colorBgTextActive'],
] as const satisfies readonly (readonly [string, TokenKey])[]

function resolveCssVariableValue(tokenKey: TokenKey, token: TokenLike, cssVar?: CssVarLike): string {
  const cssVariableName = cssVar?.[tokenKey]
  if (typeof cssVariableName === 'string' && cssVariableName.length > 0) {
    return `var(${cssVariableName})`
  }

  const tokenValue = token[tokenKey]
  if (tokenValue === null || tokenValue === undefined) {
    return ''
  }

  return String(tokenValue)
}

function buildAntdTokenStyle(token: TokenLike, cssVar?: CssVarLike): CSSProperties {
  const style = TOKEN_VARIABLE_MAPPINGS.reduce<Record<string, string>>((result, [cssProperty, tokenKey]) => {
    result[cssProperty] = resolveCssVariableValue(tokenKey, token, cssVar)
    return result
  }, {})

  return style as CSSProperties
}

export function useAppThemeScopeStyle(cssVariables?: CMCSSVariables): CSSProperties {
  const tokenContext = useToken() as UseTokenContext & { cssVar?: CssVarLike }
  const appStyle = buildAntdTokenStyle(tokenContext.token, tokenContext.cssVar)
  const cmStyle = cssVariables ? cssVariablesToStyle(cssVariables) : {}

  return { height: '100%', minHeight: '100%', ...appStyle, ...cmStyle }
}
