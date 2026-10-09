import { getActiveMineralKeys, parseOtherMineralKey } from '@core/template/minerals'

import type { ExportContext } from './conversionTypes'
import { normalizeMineralLabel } from './planCache'

export function isEmpty(value: unknown): boolean {
  return value === '' || value === null || value === undefined
}

export function getString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function getAnyString(value: unknown): string {
  if (value === null || value === undefined) return ''
  return (typeof value === 'string' ? value : String(value)).trim()
}

export function toLegacyYesNoUnknown(value: string): string {
  const raw = getString(value).trim()
  if (!raw) return ''
  const lower = raw.toLowerCase()
  if (lower === 'yes' || lower === 'y' || lower === 'true') return '1'
  if (lower === 'no' || lower === 'n' || lower === 'false') return '0'
  if (lower === 'unknown') return 'Unknown'
  return raw
}

export function resolveMineralLabel(options: { context: ExportContext; value: string }): string {
  const { plan, ctx, data } = options.context
  const raw = getString(options.value)
  if (!raw) return ''
  const otherIndex = parseOtherMineralKey(raw)
  if (otherIndex !== null) {
    const label = data.customMinerals[otherIndex]?.trim()
    if (label) return label
  }
  const direct = ctx.mineralLabelByKey.get(raw)
  if (direct) return direct
  const key = plan.mineralKeyByLabel.get(normalizeMineralLabel(raw))
  if (!key) return raw
  return ctx.mineralLabelByKey.get(key) ?? plan.preferredMineralLabelByKey.get(key) ?? raw
}

export function labelForMineralKey(context: ExportContext, mineralKey: string): string {
  const otherIndex = parseOtherMineralKey(mineralKey)
  if (otherIndex !== null) {
    const label = context.data.customMinerals[otherIndex]?.trim()
    if (label) return label
  }
  return context.ctx.mineralLabelByKey.get(mineralKey)
    || context.plan.preferredMineralLabelByKey.get(mineralKey)
    || mineralKey
}

export function buildQuestionExportScope(context: ExportContext) {
  const activeMineralKeys = getActiveMineralKeys(
    context.plan.versionDef, context.data.selectedMinerals, context.data.customMinerals,
  )
  const labelToKey = new Map<string, string>()
  for (const [key, label] of context.ctx.mineralLabelByKey) {
    const norm = normalizeMineralLabel(label)
    if (norm && !labelToKey.has(norm)) labelToKey.set(norm, key)
  }
  return { activeMineralKeys, activeMineralKeySet: new Set(activeMineralKeys), labelToKey }
}

export function copyNonEmptyFields(options: {
  item: Record<string, unknown>
  values: Record<string, string | undefined>
}) {
  for (const [key, value] of Object.entries(options.values)) {
    if (!isEmpty(value)) options.item[key] = value
  }
}
