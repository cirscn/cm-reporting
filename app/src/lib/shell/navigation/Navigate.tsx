/**
 * @file app/navigation/Navigate.tsx
 * @description 导航上下文与路由辅助。
 */

// 说明：导航上下文与路由辅助
import { useEffect } from 'react'

import { useNavigation } from './useNavigation'

/**
 * 导出函数：Navigate。
 */
export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const { actions } = useNavigation()

  useEffect(() => {
    actions.navigate(to, { replace })
  }, [actions, replace, to])

  return null
}
