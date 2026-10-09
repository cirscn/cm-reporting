import type { ImportContext } from './conversionTypes'
import { normalizeMineralLabel } from './planCache'

const MINERAL_SCOPE_QUESTION_TYPE = 1

export function resolveImportedMineral(context: ImportContext, raw: unknown): string {
  const label = typeof raw === 'string' ? raw : raw == null ? '' : String(raw)
  if (!label) return ''
  const norm = normalizeMineralLabel(label)
  const key = context.plan.mineralKeyByLabel.get(norm) ?? context.mineralLabelToKey.get(norm)
  if (key && !context.ctx.mineralLabelByKey.has(key)) context.ctx.mineralLabelByKey.set(key, label)
  return key ?? label
}

function recordMineralLabel(options: { context: ImportContext; key: string; label: string }) {
  options.context.ctx.mineralLabelByKey.set(options.key, options.label)
  options.context.mineralLabelToKey.set(normalizeMineralLabel(options.label), options.key)
}

function collectDynamicLabels(context: ImportContext, labels: string[]) {
  const selected = new Set<string>()
  const custom: string[] = []
  const scope = context.plan.versionDef.mineralScope
  const hasOther = scope.minerals.some((mineral) => mineral.key === 'other')
  const maxOther = scope.otherSlotCount ?? 0
  for (const label of labels) {
    const key = context.plan.mineralKeyByLabel.get(normalizeMineralLabel(label))
    if (key) {
      selected.add(key)
      recordMineralLabel({ context, key, label })
      continue
    }
    if (hasOther && custom.length < maxOther) custom.push(label)
  }
  return { selected, custom, hasOther, maxOther }
}

function importDynamicScope(context: ImportContext, labels: string[]) {
  const { selected, custom, hasOther, maxOther } = collectDynamicLabels(context, labels)
  if (custom.length > 0 && hasOther && maxOther > 0) {
    selected.add('other')
    context.data.customMinerals = custom
    custom.forEach((label, index) => recordMineralLabel({ context, key: `other-${index}`, label }))
  }
  if (selected.size > 0 || context.data.customMinerals.length > 0) {
    context.data.selectedMinerals = Array.from(selected)
  }
}

function importFreeTextScope(context: ImportContext, labels: string[]) {
  if (labels.length === 0) return
  const scope = context.plan.versionDef.mineralScope
  const maxSlots = scope.maxCount ?? labels.length
  const custom = labels.slice(0, maxSlots)
  context.data.customMinerals = custom
  custom.forEach((label, index) => {
    const key = scope.minerals[index]?.key
    if (key && label) recordMineralLabel({ context, key, label })
  })
}

export function importMineralScope(context: ImportContext) {
  const mode = context.plan.versionDef.mineralScope.mode
  if (mode === 'fixed') return
  const labels = (context.legacy.cmtRangeQuestions ?? [])
    .filter((item) => item.type === MINERAL_SCOPE_QUESTION_TYPE)
    .map((item) => item.question.trim())
    .filter(Boolean)
  if (mode === 'dynamic-dropdown') importDynamicScope(context, labels)
  if (mode === 'free-text') importFreeTextScope(context, labels)
}
