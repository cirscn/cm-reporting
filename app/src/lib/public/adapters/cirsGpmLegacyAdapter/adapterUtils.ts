/**
 * @file adapters/cirsGpmLegacyAdapter/adapterUtils.ts
 * @description CIRS GPM legacy adapter 共享工具函数。
 *
 * 统一处理答案别名、字段映射和 null / 空字符串 / 字段缺失的精确写回。
 */

import type { NullableFieldState } from './types'

const LEGACY_ANSWER_BY_ALIAS = new Map<string, string>([
  ['1', 'Yes'], ['yes', 'Yes'], ['y', 'Yes'], ['true', 'Yes'],
  ['0', 'No'], ['no', 'No'], ['n', 'No'], ['false', 'No'],
  ['unknown', 'Unknown'], ['unk', 'Unknown'],
])

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
  return LEGACY_ANSWER_BY_ALIAS.get(raw.toLowerCase()) ?? raw
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
 * 使用原始字段状态保留 null、空字符串与字段缺失的区别。
 */
export function writeLegacyField(
  options: {
    item: Record<string, unknown>
    states: Map<string, NullableFieldState>
    key: string
    value: string
  },
) {
  const { item, states, key, value } = options
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

export function writeLegacyFields(options: {
  item: Record<string, unknown>
  states: Map<string, NullableFieldState>
  values: Record<string, string | undefined>
}) {
  const { item, states, values } = options
  for (const [key, value] of Object.entries(values)) {
    writeLegacyField({ item, states, key, value: value ?? '' })
  }
}

export function readMappedRowFields(options: {
  row: Record<string, string | undefined>
  mapping: Record<string, string>
}): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(options.mapping).map(([internalKey, legacyKey]) => [legacyKey, options.row[internalKey]]),
  )
}
