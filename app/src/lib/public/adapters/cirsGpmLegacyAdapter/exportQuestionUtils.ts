import { writeNullableString } from './adapterUtils'
import type { ExportContext } from './conversionTypes'
import { normalizeMineralLabel } from './planCache'
import type { NullableFieldState } from './types'

const STRING_FIELD_STATE: NullableFieldState = {
  exists: true, wasNull: false, wasString: true, wasNumber: false,
}

export function getNestedString(options: {
  value: Record<string, Record<string, string> | string>
  key: string
  subKey: string
}): string {
  const record = options.value[options.key]
  if (typeof record !== 'object' || !record) return ''
  const value = record[options.subKey]
  return typeof value === 'string' ? value : ''
}

export function writeQuestionAnswers(options: {
  item: Record<string, unknown>
  state?: { answer: NullableFieldState; remark: NullableFieldState }
  answer: string
  remark: string
}) {
  const writtenAnswer = writeNullableString(options.state?.answer ?? STRING_FIELD_STATE, options.answer)
  const writtenRemark = writeNullableString(options.state?.remark ?? STRING_FIELD_STATE, options.remark)
  if (writtenAnswer !== undefined) options.item.answer = writtenAnswer
  if (writtenRemark !== undefined) options.item.remark = writtenRemark
}

export function ensureQuestionList(options: {
  context: ExportContext
  key: 'cmtRangeQuestions' | 'cmtCompanyQuestions'
}): Array<Record<string, unknown>> {
  const { out } = options.context
  if (!out[options.key]) out[options.key] = []
  return out[options.key] as Array<Record<string, unknown>>
}

export function isActiveQuestionMineral(options: {
  context: ExportContext
  label: string
  scope: { labelToKey: Map<string, string>; activeMineralKeySet: Set<string> }
}) {
  const normalized = normalizeMineralLabel(options.label)
  const key = options.context.plan.mineralKeyByLabel.get(normalized) ?? options.scope.labelToKey.get(normalized)
  return !key || options.scope.activeMineralKeySet.has(key)
}
