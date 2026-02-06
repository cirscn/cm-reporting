/**
 * @file ui/hooks/useHandlerMap.ts
 * @description 通用 handler 缓存 hook：合并 useCreation + useMemoizedFn 的重复模式。
 *
 * 典型用法（替代 useCreation + useMemoizedFn 组合）：
 *
 * ```ts
 * // 替代前：6+ 行
 * const handlers = useCreation(() => {
 *   const map = new Map<string, (v: string) => void>()
 *   items.forEach(item => map.set(item.key, v => onChange(item.key, v)))
 *   return map
 * }, [items, onChange])
 * const getHandler = useMemoizedFn((key: string) => handlers.get(key))
 *
 * // 替代后：4 行
 * const getHandler = useHandlerMap(() => {
 *   const map = new Map<string, (v: string) => void>()
 *   items.forEach(item => map.set(item.key, v => onChange(item.key, v)))
 *   return map
 * }, [items, onChange])
 * ```
 */

import { useCreation, useMemoizedFn } from 'ahooks'

/**
 * 创建缓存的 handler Map 并返回稳定的 getter 函数。
 *
 * @param factory  构建 Map 的工厂函数，当 deps 变更时重建。
 * @param deps     依赖数组，语义同 useCreation / useMemo。
 * @returns 稳定引用的 getter 函数：`(key) => handler | undefined`。
 */
export function useHandlerMap<K, V>(
  factory: () => Map<K, V>,
  deps: unknown[],
): (key: K) => V | undefined {
  const map = useCreation(factory, deps)
  return useMemoizedFn((key: K) => map.get(key))
}
