/**
 * @file app/navigation/useNavigation.ts
 * @description 导航上下文与路由辅助。
 */

// 说明：导航上下文与路由辅助
import { useContext } from 'react'

import { NavigationContext } from './navigationContextValue'

/**
 * 自定义 Hook：useNavigation。
 */
export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) {
    throw new Error('useNavigation must be used within NavigationProvider')
  }
  return ctx
}

/**
 * 自定义 Hook：useOptionalNavigation。
 */
export function useOptionalNavigation() {
  return useContext(NavigationContext)
}
