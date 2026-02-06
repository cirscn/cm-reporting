/**
 * @file adapters/cirsGpmLegacyAdapter/toExternal.ts
 * @description 内部 Snapshot → CIRS GPM Legacy 格式转换。
 *
 * 核心流程：
 * 1. 深拷贝原始 legacy 对象（保留未映射字段）
 * 2. 按模块 patch：companyInfo → rangeQuestions → companyQuestions →
 *    smelters → mines → products → amrtReasons
 * 3. 每个 patch 函数使用 writeLegacyField 还原字段的原始 null/string/missing 状态
 * 4. 对 perMineral 数据：只写入活跃矿种，裁剪已取消的矿种行
 */

import type { TemplateVersionDef } from '@core/registry/types'
import type { FormData } from '@core/schema'
import { getActiveMineralKeys, parseOtherMineralKey } from '@core/template/minerals'
import { deepCloneJson } from '@core/template/strings'

import type { ReportSnapshotV1 } from '../../snapshot'

import { normalizeLegacyYesNoUnknown, writeLegacyField, writeNullableString } from './adapterUtils'
import { getCirsGpmLegacyPlan, normalizeMineralLabel } from './planCache'
import type { CirsGpmLegacyReport, CirsGpmLegacyRoundtripContext } from './types'

function isEmpty(value: unknown): boolean {
  return value === '' || value === null || value === undefined
}

function dateStringToEpochMsUtc(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const y = Number(match[1]!)
  const m = Number(match[2]!)
  const d = Number(match[3]!)
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null
  return Date.UTC(y, m - 1, d, 0, 0, 0, 0)
}

// writeNullableString 已提取到 adapterUtils.ts

function getString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function getAnyString(value: unknown): string {
  if (value === null || value === undefined) return ''
  const raw = typeof value === 'string' ? value : String(value)
  return raw.trim()
}

// normalizeLegacyYesNoUnknown 已提取到 adapterUtils.ts

function toLegacyYesNoUnknown(value: string): string {
  const raw = getString(value).trim()
  if (!raw) return ''
  const lower = raw.toLowerCase()
  if (lower === 'yes' || lower === 'y' || lower === 'true') return '1'
  if (lower === 'no' || lower === 'n' || lower === 'false') return '0'
  if (lower === 'unknown') return 'Unknown'
  return raw
}

function resolveMineralLabel(
  plan: ReturnType<typeof getCirsGpmLegacyPlan>,
  ctx: CirsGpmLegacyRoundtripContext,
  value: string,
  customMinerals: string[]
): string {
  const raw = getString(value)
  if (!raw) return ''
  const otherIndex = parseOtherMineralKey(raw)
  if (otherIndex !== null) {
    const label = customMinerals[otherIndex]?.trim()
    if (label) return label
  }
  const direct = ctx.mineralLabelByKey.get(raw)
  if (direct) return direct
  const key = plan.mineralKeyByLabel.get(normalizeMineralLabel(raw))
  if (!key) return raw
  return ctx.mineralLabelByKey.get(key) ?? plan.preferredMineralLabelByKey.get(key) ?? raw
}

function getNestedString(
  value: Record<string, Record<string, string> | string>,
  key: string,
  subKey: string | null
): string {
  const v = value[key]
  if (subKey) {
    if (typeof v === 'object' && v) return typeof (v as Record<string, unknown>)[subKey] === 'string' ? (v as Record<string, string>)[subKey] : ''
    return ''
  }
  return typeof v === 'string' ? v : ''
}

function epochForWrite(ctx: CirsGpmLegacyRoundtripContext, authorizationDate: string): string | number | null | undefined {
  const originalValue = ctx.effectiveDate.originalValue
  const originalType = ctx.effectiveDate.originalType

  if (authorizationDate === ctx.effectiveDate.derivedAuthorizationDate) {
    return originalValue
  }

  if (!authorizationDate) {
    if (originalType === 'missing') return undefined
    if (originalType === 'null') return null
    if (originalType === 'number') return 0
    return ''
  }

  const ms = dateStringToEpochMsUtc(authorizationDate)
  if (ms === null) return originalValue
  if (originalType === 'number') return ms
  return String(ms)
}

function patchCompanyInfo(out: CirsGpmLegacyReport, data: FormData, ctx: CirsGpmLegacyRoundtripContext, versionDef: TemplateVersionDef) {
  const companyInfo = data.companyInfo ?? {}
  const companyObj = (out.cmtCompany ?? {}) as Record<string, unknown>

  const plan = getCirsGpmLegacyPlan(ctx.templateType, ctx.versionId)
  for (const field of versionDef.companyInfoFields) {
    const legacyKey = plan.legacyCompanyKeyByInternalKey.get(field.key) ?? field.key
    if (legacyKey === 'effectiveDate') continue

    const nextValue = companyInfo[field.key] ?? ''
    const state = ctx.companyFieldStates.get(legacyKey) ?? { exists: false, wasNull: false, wasString: false, wasNumber: false }
    const written = writeNullableString(state, nextValue)
    if (written === undefined) {
      if (state.exists) {
        delete companyObj[legacyKey]
      }
      continue
    }
    companyObj[legacyKey] = written
  }

  // effectiveDate
  const authDate = companyInfo.authorizationDate ?? ''
  const nextEffective = epochForWrite(ctx, authDate)
  if (nextEffective === undefined) {
    if (ctx.effectiveDate.originalType !== 'missing') delete companyObj.effectiveDate
  } else {
    companyObj.effectiveDate = nextEffective as unknown
  }

  if (!out.cmtCompany && (Object.keys(companyObj).length > 0 || ctx.companyFieldStates.size > 0 || ctx.effectiveDate.originalType !== 'missing')) {
    out.cmtCompany = companyObj as unknown as CirsGpmLegacyReport['cmtCompany']
  } else if (out.cmtCompany) {
    out.cmtCompany = companyObj as unknown as CirsGpmLegacyReport['cmtCompany']
  }
}

function patchRangeQuestions(out: CirsGpmLegacyReport, data: FormData, ctx: CirsGpmLegacyRoundtripContext, versionDef: TemplateVersionDef) {
  const plan = getCirsGpmLegacyPlan(ctx.templateType, ctx.versionId)
  const range = (out.cmtRangeQuestions ?? []) as Array<Record<string, unknown>>
  const existing = out.cmtRangeQuestions ? range : null

  const questionsByKey = new Map(versionDef.questions.map((q) => [q.key, q]))
  const activeMineralKeys = getActiveMineralKeys(
    versionDef,
    data.selectedMinerals ?? [],
    data.customMinerals ?? []
  )
  const activeMineralKeySet = new Set(activeMineralKeys)

  const labelToKeyFromCtx = new Map<string, string>()
  for (const [key, label] of ctx.mineralLabelByKey.entries()) {
    const norm = normalizeMineralLabel(label)
    if (!norm || labelToKeyFromCtx.has(norm)) continue
    labelToKeyFromCtx.set(norm, key)
  }

  const labelForMineralKey = (mineralKey: string): string => {
    const otherIndex = parseOtherMineralKey(mineralKey)
    if (otherIndex !== null) {
      const label = data.customMinerals?.[otherIndex]?.trim()
      if (label) return label
    }
    const fromCtx = ctx.mineralLabelByKey.get(mineralKey)
    if (fromCtx) return fromCtx
    const preferred = plan.preferredMineralLabelByKey.get(mineralKey)
    if (preferred) return preferred
    return mineralKey
  }

  const ensure = () => {
    if (!out.cmtRangeQuestions) out.cmtRangeQuestions = [] as unknown as NonNullable<CirsGpmLegacyReport['cmtRangeQuestions']>
    return out.cmtRangeQuestions as unknown as Array<Record<string, unknown>>
  }

  for (const [type, qKey] of plan.questionKeyByType.entries()) {
    const def = questionsByKey.get(qKey)
    if (!def) continue

    if (def.perMineral) {
      for (const mineralKey of activeMineralKeys) {
        const label = labelForMineralKey(mineralKey)
        const originalLabelForIndex = ctx.mineralLabelByKey.get(mineralKey) ?? label
        const idxKey = `${type}|${originalLabelForIndex}`
        const idx = ctx.rangeQuestionIndexByKey.get(idxKey)

        const nextAnswer = getNestedString(data.questions, qKey, mineralKey)
        const nextRemark = getNestedString(data.questionComments, qKey, mineralKey)

        if (idx === undefined) {
          if (isEmpty(nextAnswer) && isEmpty(nextRemark)) continue
          const target = ensure()
          target.push({ type, question: label, answer: nextAnswer ?? '', remark: nextRemark ?? '' })
          continue
        }

        const item = range[idx]!
        const state = ctx.rangeQuestionFieldStatesByIndex.get(idx)
        const answerState = state?.answer ?? { exists: true, wasNull: false, wasString: true, wasNumber: false }
        const remarkState = state?.remark ?? { exists: true, wasNull: false, wasString: true, wasNumber: false }

        const writtenAnswer = writeNullableString(answerState, nextAnswer)
        const writtenRemark = writeNullableString(remarkState, nextRemark)
        if (writtenAnswer !== undefined) item.answer = writtenAnswer
        if (writtenRemark !== undefined) item.remark = writtenRemark
        item.type = type
        item.question = label
      }
      continue
    }

    const idxKeyAny = Array.from(ctx.rangeQuestionIndexByKey.entries()).find(([k]) => k.startsWith(`${type}|`))
    const idx = idxKeyAny ? idxKeyAny[1] : undefined
    const nextAnswer = getString(data.questions[qKey])
    const nextRemark = getString(data.questionComments[qKey])
    if (idx === undefined) {
      if (isEmpty(nextAnswer) && isEmpty(nextRemark)) continue
      const target = ensure()
      const firstMineralKey = versionDef.mineralScope.minerals[0]?.key ?? ''
      const label = firstMineralKey
        ? ctx.mineralLabelByKey.get(firstMineralKey) ?? plan.preferredMineralLabelByKey.get(firstMineralKey) ?? firstMineralKey
        : ''
      target.push({ type, question: label, answer: nextAnswer, remark: nextRemark })
      continue
    }
    const item = range[idx]!
    const state = ctx.rangeQuestionFieldStatesByIndex.get(idx)
    const answerState = state?.answer ?? { exists: true, wasNull: false, wasString: true, wasNumber: false }
    const remarkState = state?.remark ?? { exists: true, wasNull: false, wasString: true, wasNumber: false }
    const writtenAnswer = writeNullableString(answerState, nextAnswer)
    const writtenRemark = writeNullableString(remarkState, nextRemark)
    if (writtenAnswer !== undefined) item.answer = writtenAnswer
    if (writtenRemark !== undefined) item.remark = writtenRemark
    item.type = type
  }

  if (!existing && out.cmtRangeQuestions && out.cmtRangeQuestions.length === 0) {
    delete out.cmtRangeQuestions
  }

  // Prune perMineral legacy rows that no longer belong to active minerals
  if (out.cmtRangeQuestions) {
    const pruned = (out.cmtRangeQuestions as unknown as Array<Record<string, unknown>>).filter((item) => {
      const type = typeof item.type === 'number' ? item.type : Number(item.type)
      const qKey = Number.isFinite(type) ? plan.questionKeyByType.get(type) : undefined
      if (!qKey) return true
      const def = questionsByKey.get(qKey)
      if (!def?.perMineral) return true
      const q = typeof item.question === 'string' ? item.question : String(item.question ?? '')
      const norm = normalizeMineralLabel(q)
      const mineralKey = plan.mineralKeyByLabel.get(norm) ?? labelToKeyFromCtx.get(norm)
      if (!mineralKey) return true
      return activeMineralKeySet.has(mineralKey)
    })
    out.cmtRangeQuestions = pruned as unknown as CirsGpmLegacyReport['cmtRangeQuestions']

    if (!existing && pruned.length === 0) {
      delete out.cmtRangeQuestions
    }
  }
}

function patchCompanyQuestions(out: CirsGpmLegacyReport, data: FormData, ctx: CirsGpmLegacyRoundtripContext, versionDef: TemplateVersionDef) {
  const plan = getCirsGpmLegacyPlan(ctx.templateType, ctx.versionId)
  const list = (out.cmtCompanyQuestions ?? []) as Array<Record<string, unknown>>
  const existing = out.cmtCompanyQuestions ? list : null

  const activeMineralKeys = getActiveMineralKeys(
    versionDef,
    data.selectedMinerals ?? [],
    data.customMinerals ?? []
  )
  const activeMineralKeySet = new Set(activeMineralKeys)

  const labelToKeyFromCtx = new Map<string, string>()
  for (const [key, label] of ctx.mineralLabelByKey.entries()) {
    const norm = normalizeMineralLabel(label)
    if (!norm || labelToKeyFromCtx.has(norm)) continue
    labelToKeyFromCtx.set(norm, key)
  }

  const labelForMineralKey = (mineralKey: string): string => {
    const otherIndex = parseOtherMineralKey(mineralKey)
    if (otherIndex !== null) {
      const label = data.customMinerals?.[otherIndex]?.trim()
      if (label) return label
    }
    const fromCtx = ctx.mineralLabelByKey.get(mineralKey)
    if (fromCtx) return fromCtx
    const preferred = plan.preferredMineralLabelByKey.get(mineralKey)
    if (preferred) return preferred
    return mineralKey
  }

  const ensure = () => {
    if (!out.cmtCompanyQuestions) out.cmtCompanyQuestions = [] as unknown as NonNullable<CirsGpmLegacyReport['cmtCompanyQuestions']>
    return out.cmtCompanyQuestions as unknown as Array<Record<string, unknown>>
  }

  for (const def of versionDef.companyQuestions) {
    if (def.perMineral) {
      for (const mineralKey of activeMineralKeys) {
        const typeLabel = labelForMineralKey(mineralKey)
        const originalTypeLabelForIndex = ctx.mineralLabelByKey.get(mineralKey) ?? typeLabel
        const idxKey = `${def.key}|${originalTypeLabelForIndex}`
        const idx = ctx.companyQuestionIndexByKey.get(idxKey)

        const nextAnswer = getNestedString(data.companyQuestions, def.key, mineralKey)
        const nextRemark = getNestedString(data.companyQuestions, `${def.key}_comment`, mineralKey)

        if (idx === undefined) {
          if (isEmpty(nextAnswer) && isEmpty(nextRemark)) continue
          const target = ensure()
          target.push({ question: def.key, type: typeLabel, answer: nextAnswer ?? '', remark: nextRemark ?? '' })
          continue
        }

        const item = list[idx]!
        const state = ctx.companyQuestionFieldStatesByIndex.get(idx)
        const answerState = state?.answer ?? { exists: true, wasNull: false, wasString: true, wasNumber: false }
        const remarkState = state?.remark ?? { exists: true, wasNull: false, wasString: true, wasNumber: false }
        const writtenAnswer = writeNullableString(answerState, nextAnswer)
        const writtenRemark = writeNullableString(remarkState, nextRemark)
        if (writtenAnswer !== undefined) item.answer = writtenAnswer
        if (writtenRemark !== undefined) item.remark = writtenRemark
        item.question = def.key
        item.type = typeLabel
      }
      continue
    }

    const idxKey = `${def.key}|`
    const idx = ctx.companyQuestionIndexByKey.get(idxKey)
    const nextAnswer = getString(data.companyQuestions[def.key])
    const nextRemark = getString(data.companyQuestions[`${def.key}_comment`])
    if (idx === undefined) {
      if (isEmpty(nextAnswer) && isEmpty(nextRemark)) continue
      const target = ensure()
      target.push({ question: def.key, type: null, answer: nextAnswer, remark: nextRemark })
      continue
    }
    const item = list[idx]!
    const state = ctx.companyQuestionFieldStatesByIndex.get(idx)
    const answerState = state?.answer ?? { exists: true, wasNull: false, wasString: true, wasNumber: false }
    const remarkState = state?.remark ?? { exists: true, wasNull: false, wasString: true, wasNumber: false }
    const writtenAnswer = writeNullableString(answerState, nextAnswer)
    const writtenRemark = writeNullableString(remarkState, nextRemark)
    if (writtenAnswer !== undefined) item.answer = writtenAnswer
    if (writtenRemark !== undefined) item.remark = writtenRemark
    item.question = def.key
    if ('type' in item) item.type = null
  }

  if (!existing && out.cmtCompanyQuestions && out.cmtCompanyQuestions.length === 0) {
    delete out.cmtCompanyQuestions
  }

  // Prune perMineral legacy rows that no longer belong to active minerals
  if (out.cmtCompanyQuestions) {
    const pruned = (out.cmtCompanyQuestions as unknown as Array<Record<string, unknown>>).filter((item) => {
      const questionKey = typeof item.question === 'string' ? item.question : String(item.question ?? '')
      const def = versionDef.companyQuestions.find((q) => q.key === questionKey)
      if (!def?.perMineral) return true
      const typeLabel = typeof item.type === 'string' ? item.type : item.type == null ? '' : String(item.type)
      const norm = normalizeMineralLabel(typeLabel)
      const mineralKey = plan.mineralKeyByLabel.get(norm) ?? labelToKeyFromCtx.get(norm)
      if (!mineralKey) return true
      return activeMineralKeySet.has(mineralKey)
    })
    out.cmtCompanyQuestions = pruned as unknown as CirsGpmLegacyReport['cmtCompanyQuestions']

    if (!existing && pruned.length === 0) {
      delete out.cmtCompanyQuestions
    }
  }
}

function patchSmelters(out: CirsGpmLegacyReport, data: FormData, ctx: CirsGpmLegacyRoundtripContext, plan: ReturnType<typeof getCirsGpmLegacyPlan>) {
  const original = (out.cmtSmelters ?? []) as Array<Record<string, unknown>>
  const next: Array<Record<string, unknown>> = []

  for (const row of data.smelterList ?? []) {
    const legacyIndex = ctx.smelterLegacyIndexByInternalId.get(row.id)
    if (legacyIndex !== undefined) {
      const item = deepCloneJson(original[legacyIndex] ?? {}) as Record<string, unknown>
      const states = ctx.smelterFieldStatesByIndex.get(legacyIndex) ?? new Map()
      /** 简写：使用共享 writeLegacyField 写回单字段。 */
      const write = (key: string, value: string) => writeLegacyField(item, states, key, value)

      const originalItem = original[legacyIndex] ?? {}
      const originalLookup = getAnyString((originalItem as Record<string, unknown>).smelterLookUp)
      const originalName = getAnyString((originalItem as Record<string, unknown>).smelterName)
      const originalStandardName = getAnyString((originalItem as Record<string, unknown>).standardSmelterName)
      const derivedLookup = originalLookup || originalName || originalStandardName
      const derivedName = originalStandardName || originalName
      const originalNumber = getAnyString((originalItem as Record<string, unknown>).smelterNumber)
      const originalLegacyId = getAnyString((originalItem as Record<string, unknown>).smelterId)
      const originalIdentification = getAnyString((originalItem as Record<string, unknown>).smelterIdentification)
      const derivedId = originalNumber || originalLegacyId
      const derivedIdentification = originalNumber || originalLegacyId
      const derivedSourceId = originalIdentification
      const derivedRecycled = normalizeLegacyYesNoUnknown((originalItem as Record<string, unknown>).isRecycle)

      write('metal', resolveMineralLabel(plan, ctx, row.metal, data.customMinerals ?? []))
      if ((row.smelterLookup ?? '') !== derivedLookup) {
        write('smelterLookUp', row.smelterLookup)
      }
      if ((row.smelterName ?? '') !== derivedName) {
        if (originalStandardName) {
          write('standardSmelterName', row.smelterName)
        } else {
          // smelterName can be null in legacy
          const originalNameState = states.get('smelterName')
          const fallback = ctx.smelterNameFallbackByIndex.get(legacyIndex) ?? null
          if (originalNameState?.wasNull && fallback && row.smelterName === fallback) {
            item.smelterName = null
          } else {
            write('smelterName', row.smelterName)
          }
        }
      }
      write('smelterCountry', row.smelterCountry)
      const rowSmelterId = row.smelterId ?? ''
      const rowSmelterIdentification = row.smelterIdentification ?? ''
      const idChanged = rowSmelterId !== derivedId
      const identificationChanged = rowSmelterIdentification !== derivedIdentification
      if (idChanged || identificationChanged) {
        const nextNumber = idChanged ? rowSmelterId : rowSmelterIdentification
        const idTargetField = originalNumber ? 'smelterNumber' : (originalLegacyId ? 'smelterId' : 'smelterNumber')
        write(idTargetField, nextNumber)
      }
      if ((row.sourceId ?? '') !== derivedSourceId) {
        write('smelterIdentification', row.sourceId ?? '')
      }
      write('smelterStreet', row.smelterStreet ?? '')
      write('smelterCity', row.smelterCity ?? '')
      write('smelterProvince', row.smelterState ?? '')
      write('smelterContact', row.smelterContactName ?? '')
      write('smelterEmail', row.smelterContactEmail ?? '')
      write('suggest', row.proposedNextSteps ?? '')
      write('mineName', row.mineName ?? '')
      write('mineCountry', row.mineCountry ?? '')
      if ((row.recycledScrap ?? '') !== derivedRecycled) {
        write('isRecycle', toLegacyYesNoUnknown(row.recycledScrap ?? ''))
      }
      write('remark', row.comments ?? '')

      item.id = item.id ?? row.id
      next.push(item)
      continue
    }

    // New row
    const created: Record<string, unknown> = { id: row.id }
    const metalLabel = resolveMineralLabel(plan, ctx, row.metal, data.customMinerals ?? [])
    if (!isEmpty(metalLabel)) created.metal = metalLabel
    if (!isEmpty(row.smelterLookup)) created.smelterLookUp = row.smelterLookup
    if (!isEmpty(row.smelterName)) {
      created.smelterName = row.smelterName
      if (!isEmpty(row.smelterLookup)) {
        created.standardSmelterName = row.smelterName
      }
    }
    if (!isEmpty(row.smelterCountry)) created.smelterCountry = row.smelterCountry
    const nextNumber = row.smelterIdentification || row.smelterId
    if (!isEmpty(nextNumber)) created.smelterNumber = nextNumber
    if (!isEmpty(row.sourceId)) created.smelterIdentification = row.sourceId
    const legacyRecycled = toLegacyYesNoUnknown(row.recycledScrap ?? '')
    if (!isEmpty(legacyRecycled)) created.isRecycle = legacyRecycled
    if (!isEmpty(row.comments)) created.remark = row.comments
    next.push(created)
  }

  if (out.cmtSmelters || next.length > 0) {
    out.cmtSmelters = next as unknown as CirsGpmLegacyReport['cmtSmelters']
  }
}

function patchMines(out: CirsGpmLegacyReport, data: FormData, ctx: CirsGpmLegacyRoundtripContext, plan: ReturnType<typeof getCirsGpmLegacyPlan>) {
  const original = (out.minList ?? []) as Array<Record<string, unknown>>
  const next: Array<Record<string, unknown>> = []

  for (const row of data.mineList ?? []) {
    const legacyIndex = ctx.mineLegacyIndexByInternalId.get(row.id)
    if (legacyIndex !== undefined) {
      const item = deepCloneJson(original[legacyIndex] ?? {}) as Record<string, unknown>
      const states = ctx.mineFieldStatesByIndex.get(legacyIndex) ?? new Map()
      const write = (key: string, value: string) => writeLegacyField(item, states, key, value)

      write('metal', resolveMineralLabel(plan, ctx, row.metal, data.customMinerals ?? []))
      write('smelterName', row.smelterName)
      write('mineFacilityName', row.mineName)
      write('mineFacilityCountry', row.mineCountry)
      write('mineFacilityStreet', row.mineStreet ?? '')
      write('mineFacilityCity', row.mineCity ?? '')
      write('mineFacilityProvince', row.mineProvince ?? '')
      write('mineIdentificationNumber', row.mineId ?? '')
      write('mineIdentification', row.mineIdSource ?? '')
      write('mineFacilityContact', row.mineContactName ?? '')
      write('mineFacilityEmail', row.mineContactEmail ?? '')
      write('proposedNextSteps', row.proposedNextSteps ?? '')
      write('comments', row.comments ?? '')

      next.push(item)
      continue
    }

    const created: Record<string, unknown> = {}
    const metalLabel = resolveMineralLabel(plan, ctx, row.metal, data.customMinerals ?? [])
    if (!isEmpty(metalLabel)) created.metal = metalLabel
    if (!isEmpty(row.smelterName)) created.smelterName = row.smelterName
    if (!isEmpty(row.mineName)) created.mineFacilityName = row.mineName
    if (!isEmpty(row.mineCountry)) created.mineFacilityCountry = row.mineCountry
    if (!isEmpty(row.comments)) created.comments = row.comments
    next.push(created)
  }

  if (out.minList || next.length > 0) {
    out.minList = next as unknown as CirsGpmLegacyReport['minList']
  }
}

function patchProducts(out: CirsGpmLegacyReport, data: FormData, ctx: CirsGpmLegacyRoundtripContext) {
  const original = (out.cmtParts ?? []) as Array<Record<string, unknown>>
  const next: Array<Record<string, unknown>> = []

  const defaultLegacyKeys = (() => {
    for (const mapping of ctx.productLegacyKeyByInternalKeyByIndex.values()) return mapping
    return null
  })()
  const keyFor = (
    mapping: Map<'productNumber' | 'productName' | 'requesterNumber' | 'requesterName' | 'comments', string> | null | undefined,
    internalKey: 'productNumber' | 'productName' | 'requesterNumber' | 'requesterName' | 'comments',
    fallback: string
  ): string => mapping?.get(internalKey) ?? fallback

  for (const row of data.productList ?? []) {
    const legacyIndex = ctx.productLegacyIndexByInternalId.get(row.id)
    if (legacyIndex !== undefined) {
      const item = deepCloneJson(original[legacyIndex] ?? {}) as Record<string, unknown>
      const states = ctx.productFieldStatesByIndex.get(legacyIndex) ?? new Map()
      const mapping = ctx.productLegacyKeyByInternalKeyByIndex.get(legacyIndex) ?? null
      const write = (key: string, value: string) => writeLegacyField(item, states, key, value)

      write(keyFor(mapping, 'productNumber', 'productNumber'), row.productNumber)
      write(keyFor(mapping, 'productName', 'productName'), row.productName)
      write(keyFor(mapping, 'requesterNumber', 'requesterNumber'), row.requesterNumber ?? '')
      write(keyFor(mapping, 'requesterName', 'requesterName'), row.requesterName ?? '')
      write(keyFor(mapping, 'comments', 'comments'), row.comments ?? '')
      next.push(item)
      continue
    }

    const created: Record<string, unknown> = { id: row.id }
    const map = defaultLegacyKeys
    const numberKey = keyFor(map, 'productNumber', 'productNumber')
    const nameKey = keyFor(map, 'productName', 'productName')
    const requesterNumberKey = keyFor(map, 'requesterNumber', 'requesterNumber')
    const requesterNameKey = keyFor(map, 'requesterName', 'requesterName')
    const commentsKey = keyFor(map, 'comments', 'comments')

    if (!isEmpty(row.productNumber)) created[numberKey] = row.productNumber
    if (!isEmpty(row.productName)) created[nameKey] = row.productName
    if (!isEmpty(row.requesterNumber)) created[requesterNumberKey] = row.requesterNumber
    if (!isEmpty(row.requesterName)) created[requesterNameKey] = row.requesterName
    if (!isEmpty(row.comments)) created[commentsKey] = row.comments
    next.push(created)
  }

  if (out.cmtParts || next.length > 0) {
    out.cmtParts = next as unknown as CirsGpmLegacyReport['cmtParts']
  }
}

function patchAmrtReasons(out: CirsGpmLegacyReport, data: FormData, ctx: CirsGpmLegacyRoundtripContext, plan: ReturnType<typeof getCirsGpmLegacyPlan>) {
  const original = (out.amrtReasonList ?? []) as Array<Record<string, unknown>>
  const next: Array<Record<string, unknown>> = []

  for (const row of data.mineralsScope ?? []) {
    const legacyIndex = ctx.amrtReasonIndexByInternalId.get(row.id)
    if (legacyIndex !== undefined) {
      const item = deepCloneJson(original[legacyIndex] ?? {}) as Record<string, unknown>
      const states = ctx.amrtReasonFieldStatesByIndex.get(legacyIndex) ?? new Map()
      const write = (key: string, value: string) => writeLegacyField(item, states, key, value)

      write('metal', resolveMineralLabel(plan, ctx, row.mineral, data.customMinerals ?? []))
      write('reason', row.reason)
      item.id = item.id ?? row.id
      next.push(item)
      continue
    }

    const created: Record<string, unknown> = { id: row.id }
    const metalLabel = resolveMineralLabel(plan, ctx, row.mineral, data.customMinerals ?? [])
    if (!isEmpty(metalLabel)) created.metal = metalLabel
    if (!isEmpty(row.reason)) created.reason = row.reason
    next.push(created)
  }

  if (out.amrtReasonList || next.length > 0) {
    out.amrtReasonList = next as unknown as CirsGpmLegacyReport['amrtReasonList']
  }
}

export function internalToCirsGpmLegacy(snapshot: ReportSnapshotV1, ctx: CirsGpmLegacyRoundtripContext): CirsGpmLegacyReport {
  if (snapshot.templateType !== ctx.templateType || snapshot.versionId !== ctx.versionId) {
    throw new Error('snapshot does not match ctx templateType/versionId')
  }

  const out = deepCloneJson(ctx.original)
  const plan = getCirsGpmLegacyPlan(ctx.templateType, ctx.versionId)
  const versionDef = plan.versionDef
  const data = snapshot.data

  patchCompanyInfo(out, data, ctx, versionDef)
  patchRangeQuestions(out, data, ctx, versionDef)
  patchCompanyQuestions(out, data, ctx, versionDef)
  patchSmelters(out, data, ctx, plan)
  patchMines(out, data, ctx, plan)
  patchProducts(out, data, ctx)
  patchAmrtReasons(out, data, ctx, plan)

  return out
}
