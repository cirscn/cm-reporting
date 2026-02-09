/**
 * @file ui/helpers/fieldRequired.tsx
 * @description 必填字段包裹组件：在表格/表单中标记黄色必填背景。
 *
 * 该函数在 4 个组件中重复出现，提取到此处统一管理：
 * - SmelterListTable
 * - ProductListTable
 * - MineListTable
 * - MineralsScopeReasonsForm
 */

import type { ReactNode } from 'react'

/**
 * 条件包裹必填字段样式。
 *
 * @param required - 是否必填（false 时直接返回 node，无包裹）
 * @param node - 需要被包裹的内容
 * @param disabled - 当前字段是否禁用（禁用时不加必填高亮）
 * @returns 包裹后的 JSX 或原始 node
 */
export function wrapRequired(required: boolean, node: ReactNode, disabled = false): ReactNode {
  if (!required || disabled) return node
  return <div className="field-required">{node}</div>
}
