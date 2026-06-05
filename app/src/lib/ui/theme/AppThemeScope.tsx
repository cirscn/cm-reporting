/**
 * @file ui/theme/AppThemeScope.tsx
 * @description Theme variable scope container.
 */

import type { ReactNode } from 'react'

import { useAppThemeScopeStyle } from './useAppThemeScopeStyle'

import type { CMCSSVariables } from './index'

export interface AppThemeScopeProps {
  children: ReactNode
  cssVariables?: CMCSSVariables
}

export function AppThemeScope({ children, cssVariables }: AppThemeScopeProps) {
  const combinedStyle = useAppThemeScopeStyle(cssVariables)

  return (
    <div style={combinedStyle}>
      {children}
    </div>
  )
}
