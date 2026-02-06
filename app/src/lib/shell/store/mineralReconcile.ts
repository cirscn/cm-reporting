import type { TemplateVersionDef } from '@core/registry/types'

import type { MineralReconcileNotice } from './templateTypes'

/**
 * 计算并合并“矿种删减后需人工校对”提示。
 */
export function buildMineralReconcileNotice(
  versionDef: TemplateVersionDef,
  previous: string[],
  next: string[],
  current: MineralReconcileNotice | null
): MineralReconcileNotice | null {
  if (versionDef.templateType !== 'emrt') return current
  if (versionDef.version.id !== '2.0' && versionDef.version.id !== '2.1') return current

  const nextSet = new Set(next)
  const removed = previous.filter((key) => !nextSet.has(key))
  if (removed.length === 0) return current

  const merged = new Set(current?.removedMinerals ?? [])
  removed.forEach((key) => merged.add(key))

  return {
    templateType: 'emrt',
    versionId: versionDef.version.id,
    removedMinerals: Array.from(merged),
  }
}
