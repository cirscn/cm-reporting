/**
 * @file app/navigation/NavigationContext.tsx
 * @description 导航上下文与路由辅助。
 */

// 说明：导航上下文与路由辅助
import type { ReactNode } from 'react'

import { NavigationContext } from './navigationContextValue'
import type { NavigationContextValue } from './types'

/**
 * 导出函数：NavigationProvider。
 */
export function NavigationProvider({
  value,
  children,
}: {
  value: NavigationContextValue
  children: ReactNode
}) {
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

// Navigation hooks live in useNavigation.ts to keep this file component-only for fast refresh.
