import type { TemplateVersionDef } from '@core/registry/types'
import type { FormData } from '@core/schema'
import type { MineRow, MineralsScopeRow, ProductRow, SmelterRow } from '@core/types/tableRows'

import type { ReportSnapshotV1 } from '../../snapshot'

import { parseCirsGpmLegacyReport } from './parse'
import { getCirsGpmLegacyPlan, normalizeMineralLabel } from './planCache'
import type { CirsGpmLegacyRoundtripContext, NullableFieldState } from './types'

function deepCloneJson<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value)) as T
}

function readFieldState(obj: Record<string, unknown> | undefined, key: string): NullableFieldState {
  if (!obj) return { exists: false, wasNull: false, wasString: false, wasNumber: false }
  const exists = Object.prototype.hasOwnProperty.call(obj, key)
  if (!exists) return { exists: false, wasNull: false, wasString: false, wasNumber: false }
  const value = obj[key]
  return {
    exists: true,
    wasNull: value === null,
    wasString: typeof value === 'string',
    wasNumber: typeof value === 'number',
  }
}

function toNullableString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function toAnyString(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

function pickLegacyKey(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k)) return k
  }
  return keys[0] ?? ''
}

function normalizeLegacyAnswer(templateType: string, questionKey: string, value: unknown): string {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (templateType === 'crt' && questionKey === 'Q4' && /^100\s*%$/.test(trimmed)) {
    return '1'
  }
  return trimmed
}

function epochMsToDateString(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const ms = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(ms)) return ''
  const d = new Date(ms)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function humanizeKey(value: string): string {
  return value
    .split(/[-_]/)
    .map((part) => (part ? part[0]!.toUpperCase() + part.slice(1) : part))
    .join(' ')
}

function createEmptyFormData(versionDef: TemplateVersionDef): FormData {
  const companyInfo: Record<string, string> = {}
  for (const field of versionDef.companyInfoFields) {
    companyInfo[field.key] = ''
  }

  const questions: Record<string, Record<string, string> | string> = {}
  const questionComments: Record<string, Record<string, string> | string> = {}
  for (const question of versionDef.questions) {
    if (question.perMineral) {
      const perMineral: Record<string, string> = {}
      for (const mineral of versionDef.mineralScope.minerals) {
        perMineral[mineral.key] = ''
      }
      questions[question.key] = perMineral
      questionComments[question.key] = { ...perMineral }
    } else {
      questions[question.key] = ''
      questionComments[question.key] = ''
    }
  }

  const companyQuestions: Record<string, Record<string, string> | string> = {}
  for (const cq of versionDef.companyQuestions) {
    if (cq.perMineral) {
      const perMineral: Record<string, string> = {}
      for (const mineral of versionDef.mineralScope.minerals) {
        perMineral[mineral.key] = ''
      }
      companyQuestions[cq.key] = perMineral
    } else {
      companyQuestions[cq.key] = ''
    }
    if (cq.hasCommentField) {
      if (cq.perMineral) {
        const perMineralComment: Record<string, string> = {}
        for (const mineral of versionDef.mineralScope.minerals) {
          perMineralComment[mineral.key] = ''
        }
        companyQuestions[`${cq.key}_comment`] = perMineralComment
      } else {
        companyQuestions[`${cq.key}_comment`] = ''
      }
    }
  }

  const mineralsScope: MineralsScopeRow[] = []

  const allMinerals = versionDef.mineralScope.minerals.map((m) => m.key)
  const selectedMinerals = versionDef.mineralScope.mode === 'fixed' ? allMinerals : []
  const customMinerals =
    versionDef.mineralScope.mode === 'free-text'
      ? allMinerals.map((mineral, index) => {
          const defaults = versionDef.mineralScope.defaultCustomMinerals
          if (defaults && defaults.length > 0) {
            return defaults[index] ?? humanizeKey(mineral)
          }
          return humanizeKey(mineral)
        })
      : []

  return {
    companyInfo,
    selectedMinerals,
    customMinerals,
    questions,
    questionComments,
    companyQuestions,
    mineralsScope,
    smelterList: [],
    mineList: [],
    productList: [],
  }
}

function coerceId(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim()) return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return fallback
}

function ensureObjectRecord(value: Record<string, Record<string, string> | string>, key: string): Record<string, string> {
  const current = value[key]
  if (typeof current === 'object' && current !== null) return current as Record<string, string>
  const next: Record<string, string> = {}
  value[key] = next
  return next
}

function normalizeLegacyYesNoUnknown(value: unknown): string {
  if (value === null || value === undefined) return ''
  const raw = String(value).trim()
  if (!raw) return ''
  const lower = raw.toLowerCase()
  if (lower === '1' || lower === 'yes' || lower === 'y' || lower === 'true') return 'Yes'
  if (lower === '0' || lower === 'no' || lower === 'n' || lower === 'false') return 'No'
  if (lower === 'unknown' || lower === 'unk') return 'Unknown'
  return raw
}

export function cirsGpmLegacyToInternal(input: unknown): { snapshot: ReportSnapshotV1; ctx: CirsGpmLegacyRoundtripContext } {
  const parsed = parseCirsGpmLegacyReport(input)
  const plan = getCirsGpmLegacyPlan(parsed.templateType, parsed.versionId)
  const versionDef = plan.versionDef

  const legacy = parsed.legacy
  const original = deepCloneJson(legacy)

  const companyFieldStates = new Map<string, NullableFieldState>()
  const companyObj = (legacy.cmtCompany ?? undefined) as Record<string, unknown> | undefined
  for (const [, legacyKey] of plan.legacyCompanyKeyByInternalKey.entries()) {
    if (legacyKey === 'effectiveDate') continue
    companyFieldStates.set(legacyKey, readFieldState(companyObj, legacyKey))
  }

  const effectiveState = readFieldState(companyObj, 'effectiveDate')
  const rawEffective = companyObj ? (companyObj.effectiveDate as unknown) : undefined
  const originalType: CirsGpmLegacyRoundtripContext['effectiveDate']['originalType'] = !effectiveState.exists
    ? 'missing'
    : rawEffective === null
      ? 'null'
      : rawEffective === undefined
        ? 'undefined'
        : typeof rawEffective === 'string'
          ? 'string'
          : typeof rawEffective === 'number'
            ? 'number'
            : 'other'

  const derivedAuthorizationDate = epochMsToDateString(
    (rawEffective as string | number | null | undefined)
  )

  const data = createEmptyFormData(versionDef)

  // company info
  for (const field of versionDef.companyInfoFields) {
    const legacyKey = plan.legacyCompanyKeyByInternalKey.get(field.key) ?? field.key
    if (legacyKey === 'effectiveDate') {
      data.companyInfo[field.key] = derivedAuthorizationDate
      continue
    }
    const value = companyObj ? companyObj[legacyKey] : undefined
    data.companyInfo[field.key] = toNullableString(value)
  }

  // minerals label map from legacy (for stable write-back)
  const mineralLabelByKey = new Map<string, string>()
  const mineralLabelToKey = new Map<string, string>()
  const resolveMineralValue = (raw: unknown): string => {
    const label = typeof raw === 'string' ? raw : raw == null ? '' : String(raw)
    if (!label) return ''
    const norm = normalizeMineralLabel(label)
    const key = plan.mineralKeyByLabel.get(norm) ?? mineralLabelToKey.get(norm)
    if (key && !mineralLabelByKey.has(key)) {
      mineralLabelByKey.set(key, label)
    }
    return key ?? label
  }

  const range = legacy.cmtRangeQuestions ?? []
  if (versionDef.mineralScope.mode !== 'fixed') {
    const mode = versionDef.mineralScope.mode
    const type1Labels: string[] = []
    for (const item of range) {
      if (!item || item.type !== 1) continue
      const label = typeof item.question === 'string' ? item.question.trim() : ''
      if (label) type1Labels.push(label)
    }
    const hasOther = versionDef.mineralScope.minerals.some((m) => m.key === 'other')

    if (mode === 'dynamic-dropdown') {
      const selectedByRange = new Set<string>()
      const customLabels: string[] = []
      const maxOther = versionDef.mineralScope.otherSlotCount ?? 0
      for (const label of type1Labels) {
        const norm = normalizeMineralLabel(label)
        const mineralKey = plan.mineralKeyByLabel.get(norm)
        if (mineralKey) {
          selectedByRange.add(mineralKey)
          mineralLabelByKey.set(mineralKey, label)
          mineralLabelToKey.set(norm, mineralKey)
          continue
        }
        if (hasOther && maxOther > 0 && customLabels.length < maxOther) {
          customLabels.push(label)
        }
      }
      if (customLabels.length > 0 && hasOther && maxOther > 0) {
        selectedByRange.add('other')
        data.customMinerals = customLabels
        customLabels.forEach((label, index) => {
          const key = `other-${index}`
          const norm = normalizeMineralLabel(label)
          mineralLabelToKey.set(norm, key)
          mineralLabelByKey.set(key, label)
        })
      }
      if (selectedByRange.size > 0 || data.customMinerals.length > 0) {
        data.selectedMinerals = Array.from(selectedByRange)
      }
    } else if (mode === 'free-text') {
      if (type1Labels.length > 0) {
        const maxSlots = versionDef.mineralScope.maxCount ?? type1Labels.length
        const nextCustom = type1Labels.slice(0, maxSlots)
        data.customMinerals = nextCustom
        const minerals = versionDef.mineralScope.minerals
        for (let i = 0; i < nextCustom.length && i < minerals.length; i++) {
          const key = minerals[i]?.key
          const label = nextCustom[i]
          if (!key || !label) continue
          mineralLabelByKey.set(key, label)
          mineralLabelToKey.set(normalizeMineralLabel(label), key)
        }
      }
    }
  }

  // range questions
  const rangeQuestionIndexByKey = new Map<string, number>()
  const rangeQuestionFieldStatesByIndex = new Map<number, { answer: NullableFieldState; remark: NullableFieldState }>()

  const questionDefByKey = new Map(versionDef.questions.map((q) => [q.key, q]))
  for (let i = 0; i < range.length; i++) {
    const item = range[i]!
    const qKey = plan.questionKeyByType.get(item.type)
    if (!qKey) continue

    const qDef = questionDefByKey.get(qKey)
    if (!qDef) continue

    const key = `${item.type}|${item.question}`
    rangeQuestionIndexByKey.set(key, i)
    rangeQuestionFieldStatesByIndex.set(i, {
      answer: readFieldState(item as unknown as Record<string, unknown>, 'answer'),
      remark: readFieldState(item as unknown as Record<string, unknown>, 'remark'),
    })

    if (qDef.perMineral) {
      const labelNorm = normalizeMineralLabel(item.question)
      const mineralKey = plan.mineralKeyByLabel.get(labelNorm) ?? mineralLabelToKey.get(labelNorm)
      if (!mineralKey) continue
      if (!mineralLabelByKey.has(mineralKey)) {
        mineralLabelByKey.set(mineralKey, item.question)
      }
      const record = ensureObjectRecord(data.questions, qKey)
      record[mineralKey] = normalizeLegacyAnswer(parsed.templateType, qKey, item.answer)
      const commentRecord = ensureObjectRecord(data.questionComments, qKey)
      commentRecord[mineralKey] = item.remark ?? ''
      continue
    }
    data.questions[qKey] = normalizeLegacyAnswer(parsed.templateType, qKey, item.answer)
    data.questionComments[qKey] = item.remark ?? ''
  }

  // company questions
  const companyQuestionIndexByKey = new Map<string, number>()
  const companyQuestionFieldStatesByIndex = new Map<number, { answer: NullableFieldState; remark: NullableFieldState }>()
  const companyQuestions = legacy.cmtCompanyQuestions ?? []
  const companyDefByKey = new Map(versionDef.companyQuestions.map((q) => [q.key, q]))

  for (let i = 0; i < companyQuestions.length; i++) {
    const item = companyQuestions[i]!
    const questionKey = item.question
    const def = companyDefByKey.get(questionKey)
    const typeKey = item.type ?? ''
    const idxKey = `${questionKey}|${typeKey}`
    companyQuestionIndexByKey.set(idxKey, i)
    companyQuestionFieldStatesByIndex.set(i, {
      answer: readFieldState(item as unknown as Record<string, unknown>, 'answer'),
      remark: readFieldState(item as unknown as Record<string, unknown>, 'remark'),
    })

    if (!def) continue

    if (def.perMineral) {
      const labelNorm = normalizeMineralLabel(String(item.type ?? ''))
      const mineralKey = plan.mineralKeyByLabel.get(labelNorm) ?? mineralLabelToKey.get(labelNorm)
      if (!mineralKey) continue
      mineralLabelByKey.set(mineralKey, String(item.type ?? ''))
      const record = ensureObjectRecord(data.companyQuestions, questionKey)
      record[mineralKey] = item.answer ?? ''
      const commentKey = `${questionKey}_comment`
      const commentRecord = ensureObjectRecord(data.companyQuestions, commentKey)
      commentRecord[mineralKey] = item.remark ?? ''
      continue
    }
    data.companyQuestions[questionKey] = item.answer ?? ''
    const commentKey = `${questionKey}_comment`
    if (commentKey in data.companyQuestions) {
      data.companyQuestions[commentKey] = item.remark ?? ''
    }
  }

  // smelters
  const smelterLegacyIndexByInternalId = new Map<string, number>()
  const smelterFieldStatesByIndex = new Map<number, Map<string, NullableFieldState>>()
  const smelterNameFallbackByIndex = new Map<number, string>()
  const legacySmelters = legacy.cmtSmelters ?? []
  const smelterList: SmelterRow[] = []
  for (let i = 0; i < legacySmelters.length; i++) {
    const item = legacySmelters[i]!
    const internalId = coerceId(item.id, `smelter-${i}`)
    smelterLegacyIndexByInternalId.set(internalId, i)
    const stateMap = new Map<string, NullableFieldState>()
    for (const key of ['smelterName', 'smelterLookUp', 'smelterCountry', 'smelterId', 'remark', 'isRecycle', 'mineName', 'mineCountry', 'suggest']) {
      stateMap.set(key, readFieldState(item as unknown as Record<string, unknown>, key))
    }
    smelterFieldStatesByIndex.set(i, stateMap)

    const metal = resolveMineralValue(item.metal)
    const legacyLookup = item.smelterLookUp ?? ''
    const legacyName = item.smelterName ?? ''
    const legacyStandardName = item.standardSmelterName ?? ''
    const lookup = legacyLookup || legacyName || legacyStandardName
    const name = legacyStandardName || legacyName
    if (item.smelterName === null) {
      smelterNameFallbackByIndex.set(i, legacyStandardName)
    }
    const country = item.smelterCountry ?? ''
    const legacyNumber = item.smelterNumber ?? ''
    const legacyId = item.smelterId ?? ''
    const legacyIdentification = item.smelterIdentification ?? ''

    smelterList.push({
      id: internalId,
      metal,
      smelterLookup: lookup,
      smelterName: name,
      smelterCountry: country,
      smelterId: legacyNumber || legacyId || undefined,
      smelterIdentification: legacyNumber || legacyId || undefined,
      sourceId: legacyIdentification || undefined,
      smelterStreet: item.smelterStreet ?? undefined,
      smelterCity: item.smelterCity ?? undefined,
      smelterState: item.smelterProvince ?? undefined,
      smelterContactName: item.smelterContact ?? undefined,
      smelterContactEmail: item.smelterEmail ?? undefined,
      proposedNextSteps: item.suggest ?? undefined,
      mineName: item.mineName ?? undefined,
      mineCountry: item.mineCountry ?? undefined,
      recycledScrap: normalizeLegacyYesNoUnknown(item.isRecycle) || undefined,
      comments: item.remark ?? undefined,
    })
  }
  data.smelterList = smelterList

  // mines
  const mineLegacyIndexByInternalId = new Map<string, number>()
  const mineFieldStatesByIndex = new Map<number, Map<string, NullableFieldState>>()
  const legacyMines = legacy.minList ?? []
  const mineList: MineRow[] = []
  for (let i = 0; i < legacyMines.length; i++) {
    const item = legacyMines[i]!
    const internalId = `mine-${i}`
    mineLegacyIndexByInternalId.set(internalId, i)
    const stateMap = new Map<string, NullableFieldState>()
    for (const key of ['mineFacilityName', 'mineFacilityCountry', 'mineFacilityProvince', 'comments']) {
      stateMap.set(key, readFieldState(item as unknown as Record<string, unknown>, key))
    }
    mineFieldStatesByIndex.set(i, stateMap)

    mineList.push({
      id: internalId,
      metal: resolveMineralValue(item.metal),
      smelterName: item.smelterName ?? '',
      mineName: item.mineFacilityName ?? '',
      mineCountry: item.mineFacilityCountry ?? '',
      mineId: item.mineIdentificationNumber ?? undefined,
      mineIdSource: item.mineIdentification ?? undefined,
      mineStreet: item.mineFacilityStreet ?? undefined,
      mineCity: item.mineFacilityCity ?? undefined,
      mineProvince: item.mineFacilityProvince ?? '',
      mineDistrict: '',
      mineContactName: item.mineFacilityContact ?? undefined,
      mineContactEmail: item.mineFacilityEmail ?? undefined,
      proposedNextSteps: item.proposedNextSteps ?? undefined,
      comments: item.comments ?? '',
    })
  }
  data.mineList = mineList

  // products
  const productLegacyIndexByInternalId = new Map<string, number>()
  const productFieldStatesByIndex = new Map<number, Map<string, NullableFieldState>>()
  const productLegacyKeyByInternalKeyByIndex = new Map<
    number,
    Map<'productNumber' | 'productName' | 'requesterNumber' | 'requesterName' | 'comments', string>
  >()
  const legacyProducts = legacy.cmtParts ?? []
  const productList: ProductRow[] = []
  for (let i = 0; i < legacyProducts.length; i++) {
    const item = legacyProducts[i]!
    const obj = item as unknown as Record<string, unknown>
    const internalId = coerceId(obj.id ?? obj.partId, `product-${i}`)
    productLegacyIndexByInternalId.set(internalId, i)
    const stateMap = new Map<string, NullableFieldState>()
    for (const key of [
      'productNumber',
      'partNumber',
      'productName',
      'partName',
      'requesterNumber',
      'requestPartNumber',
      'requesterName',
      'requestPartName',
      'comments',
      'remark',
    ]) {
      stateMap.set(key, readFieldState(item as unknown as Record<string, unknown>, key))
    }
    productFieldStatesByIndex.set(i, stateMap)

    const legacyKeyByInternal = new Map<
      'productNumber' | 'productName' | 'requesterNumber' | 'requesterName' | 'comments',
      string
    >()
    legacyKeyByInternal.set('productNumber', pickLegacyKey(obj, ['productNumber', 'partNumber']))
    legacyKeyByInternal.set('productName', pickLegacyKey(obj, ['productName', 'partName']))
    legacyKeyByInternal.set('requesterNumber', pickLegacyKey(obj, ['requesterNumber', 'requestPartNumber']))
    legacyKeyByInternal.set('requesterName', pickLegacyKey(obj, ['requesterName', 'requestPartName']))
    legacyKeyByInternal.set('comments', pickLegacyKey(obj, ['comments', 'remark']))
    productLegacyKeyByInternalKeyByIndex.set(i, legacyKeyByInternal)

    const numValue = toAnyString(obj[legacyKeyByInternal.get('productNumber')!])
    const nameValue = toAnyString(obj[legacyKeyByInternal.get('productName')!])
    const requesterNumberKey = legacyKeyByInternal.get('requesterNumber')!
    const requesterNameKey = legacyKeyByInternal.get('requesterName')!
    const requesterNumberValue = toAnyString(obj[requesterNumberKey])
    const requesterNameValue = toAnyString(obj[requesterNameKey])
    const commentsValue = toAnyString(obj[legacyKeyByInternal.get('comments')!])

    productList.push({
      id: internalId,
      productNumber: numValue,
      productName: nameValue,
      requesterNumber: requesterNumberValue ? requesterNumberValue : undefined,
      requesterName: requesterNameValue ? requesterNameValue : undefined,
      comments: commentsValue,
    })
  }
  data.productList = productList

  // AMRT reasons
  const amrtReasonIndexByInternalId = new Map<string, number>()
  const amrtReasonFieldStatesByIndex = new Map<number, Map<string, NullableFieldState>>()
  const legacyReasons = legacy.amrtReasonList ?? []
  const reasons: MineralsScopeRow[] = []
  for (let i = 0; i < legacyReasons.length; i++) {
    const item = legacyReasons[i]!
    const internalId = coerceId(item.id, `minerals-scope-${i}`)
    amrtReasonIndexByInternalId.set(internalId, i)
    const stateMap = new Map<string, NullableFieldState>()
    for (const key of ['metal', 'reason']) {
      stateMap.set(key, readFieldState(item as unknown as Record<string, unknown>, key))
    }
    amrtReasonFieldStatesByIndex.set(i, stateMap)
    reasons.push({ id: internalId, mineral: resolveMineralValue(item.metal), reason: item.reason ?? '' })
  }
  data.mineralsScope = reasons

  const snapshot: ReportSnapshotV1 = {
    schemaVersion: 1,
    templateType: parsed.templateType,
    versionId: parsed.versionId,
    data,
  }

  const ctx: CirsGpmLegacyRoundtripContext = {
    templateType: parsed.templateType,
    versionId: parsed.versionId,
    original,
    companyFieldStates,
    effectiveDate: {
      exists: effectiveState.exists,
      originalValue: (rawEffective as string | number | null | undefined),
      originalType,
      derivedAuthorizationDate,
    },
    rangeQuestionIndexByKey,
    rangeQuestionFieldStatesByIndex,
    companyQuestionIndexByKey,
    companyQuestionFieldStatesByIndex,
    mineralLabelByKey,
    smelterLegacyIndexByInternalId,
    smelterFieldStatesByIndex,
    smelterNameFallbackByIndex,
    mineLegacyIndexByInternalId,
    mineFieldStatesByIndex,
    productLegacyIndexByInternalId,
    productFieldStatesByIndex,
    productLegacyKeyByInternalKeyByIndex,
    amrtReasonIndexByInternalId,
    amrtReasonFieldStatesByIndex,
  }

  return { snapshot, ctx }
}
