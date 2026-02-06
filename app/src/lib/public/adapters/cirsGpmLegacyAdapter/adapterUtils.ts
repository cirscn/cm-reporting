/**
 * @file adapters/cirsGpmLegacyAdapter/adapterUtils.ts
 * @description CIRS GPM legacy adapter 共享工具函数。
 *
 * 从 toInternal.ts / toExternal.ts 中提取的重复逻辑：
 * - normalizeLegacyYesNoUnknown：Yes/No/Unknown 格式标准化
 * - writeNullableString：按字段原始状态决定写回值（保留 null / '' / 不存在的区分）
 * - writeLegacyField：对单个 legacy 字段执行 writeNullableString 并处理 delete
 */

import type { NullableFieldState } from './types'

// ---------------------------------------------------------------------------
// Yes/No/Unknown 标准化
// ---------------------------------------------------------------------------

/**
 * 将 legacy 格式的 Yes/No/Unknown 值标准化为统一内部表示。
 *
 * 输入举例：'1' / 'yes' / 'Yes' / 'y' / 'true' → 'Yes'
 *           '0' / 'no'  / 'No'  / 'n' / 'false' → 'No'
 *           'unknown' / 'unk' → 'Unknown'
 */
export function normalizeLegacyYesNoUnknown(value: unknown): string {
  if (value === null || value === undefined) return ''
  const raw = String(value).trim()
  if (!raw) return ''
  const lower = raw.toLowerCase()
  if (lower === '1' || lower === 'yes' || lower === 'y' || lower === 'true') return 'Yes'
  if (lower === '0' || lower === 'no' || lower === 'n' || lower === 'false') return 'No'
  if (lower === 'unknown' || lower === 'unk') return 'Unknown'
  return raw
}

// ---------------------------------------------------------------------------
// 可空字段写回
// ---------------------------------------------------------------------------

/**
 * 根据原始字段状态（是否存在、是否为 null、是否为 string）决定写回值。
 *
 * 规则：
 * - 新值非空 → 直接返回新值
 * - 新值为空：
 *   - 原本不存在 → undefined（不写入）
 *   - 原本为 null → null
 *   - 其它 → ''
 */
export function writeNullableString(state: NullableFieldState, next: string): unknown {
  const trimmed = next ?? ''
  if (!trimmed) {
    if (!state.exists) return undefined
    if (state.wasNull) return null
    return ''
  }
  return trimmed
}

/**
 * 对单个 legacy 字段执行写回操作（合并 state 查询 + writeNullableString + delete）。
 *
 * 该函数消除了 patchSmelters / patchMines / patchProducts / patchAmrtReasons 中
 * 重复 4 次的 `const write = (key, value) => {...}` 闭包。
 */
export function writeLegacyField(
  item: Record<string, unknown>,
  states: Map<string, NullableFieldState>,
  key: string,
  value: string,
) {
  const state = states.get(key) ?? {
    exists: key in item,
    wasNull: item[key] === null,
    wasString: typeof item[key] === 'string',
    wasNumber: typeof item[key] === 'number',
  }
  const written = writeNullableString(state, value)
  if (written === undefined) {
    if (state.exists) delete item[key]
    return
  }
  item[key] = written
}
