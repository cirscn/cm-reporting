/**
 * @file app/navigation/types.ts
 * @description 导航上下文与路由辅助。
 */

// 说明：导航上下文与路由辅助
/**
 * 导出接口类型：NavigationState。
 */
export interface NavigationState {
  pathname: string
  params: Record<string, string | undefined>
  searchParams: URLSearchParams
}

/**
 * 导出接口类型：NavigationActions。
 */
export interface NavigationActions {
  navigate: (to: string, opts?: { replace?: boolean }) => void
}

/**
 * 导出接口类型：NavigationContextValue。
 */
export interface NavigationContextValue {
  state: NavigationState
  actions: NavigationActions
}
