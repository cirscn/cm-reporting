/**
 * @file shell/store/templateStoreContext.ts
 * @description zustand store 的 React Context 定义与底层 hook。
 *
 * 单独抽出以满足 react-refresh/only-export-components 规则：
 * - templateStore.tsx 仅导出 TemplateProvider（React 组件）
 * - 本文件仅导出 Context + useTemplateStore（非组件）
 */

import { createContext, useContext } from 'react'
import type { StoreApi } from 'zustand'
import { useStore } from 'zustand'

import type { TemplateStoreState } from './templateStore'

/** zustand store 实例类型。 */
export type TemplateStore = StoreApi<TemplateStoreState>

/** 用于 Provider 传递 store 实例的 Context。 */
export const TemplateStoreContext = createContext<TemplateStore | null>(null)

/** 使用 zustand selector 读取 store 状态（需在 TemplateProvider 内部调用）。 */
export function useTemplateStore<T>(selector: (state: TemplateStoreState) => T): T {
  const store = useContext(TemplateStoreContext)
  if (!store) {
    throw new Error('useTemplateStore must be used within TemplateProvider')
  }
  return useStore(store, selector)
}
