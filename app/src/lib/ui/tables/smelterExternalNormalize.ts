/**
 * @file ui/tables/smelterExternalNormalize.ts
 * @description 外部冶炼厂回写字段归一化工具。
 */

import type { SmelterRow } from '@core/types/tableRows'

/**
 * 解析外部回写的冶炼厂 ID：smelterId 优先，id 兜底。
 */
export function resolveExternalSmelterId(
  partial: Pick<Partial<SmelterRow>, 'smelterId' | 'id'>,
): string {
  const smelterId = typeof partial.smelterId === 'string' ? partial.smelterId.trim() : ''
  if (smelterId) return smelterId
  const externalId = typeof partial.id === 'string' ? partial.id.trim() : ''
  if (externalId) return externalId
  return ''
}

/**
 * 判断本次外部回写是否携带了可用于更新 smelterId 的原始字段。
 */
export function hasExternalSmelterIdInput(
  partial: Pick<Partial<SmelterRow>, 'smelterId' | 'id'>,
): boolean {
  return typeof partial.smelterId === 'string' || typeof partial.id === 'string'
}
