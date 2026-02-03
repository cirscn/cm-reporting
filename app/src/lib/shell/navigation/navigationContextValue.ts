/**
 * @file app/navigation/navigationContextValue.ts
 * @description 导航上下文与路由辅助。
 */

// 说明：导航上下文与路由辅助
import { createContext } from 'react'

import type { NavigationContextValue } from './types'

/**
 * 导出常量：NavigationContext。
 */
export const NavigationContext = createContext<NavigationContextValue | null>(null)
