/**
 * @file public/excel.ts
 * @description 对外稳定的 Excel 导出入口（基于模板赋值后导出）。
 *
 * 说明：严格 1:1 保留模板的 DV/格式/公式/隐藏 sheet 等，必须采用“基于原始模板最小 patch”的实现。
 */

import { getVersionDef } from '@core/registry'
import type { TemplateVersionDef } from '@core/registry/types'
import { normalizeSmelterLookup, toDisplayDate } from '@core/transform'

import {
  getSheetXml,
  loadXlsxContext,
  removeCalcChain,
  setFullCalcOnLoad,
  setSheetXml,
  isFormulaCell,
  writeCellInlineStr,
  writeCellInlineStrOverwriteFormula,
  zipXlsx,
  readCellText,
} from './_xlsx'
import { getExcelDeclarationAnchors } from './excelMapping'
import type { ReportSnapshotV1 } from './snapshot'

export interface ExportExcelInput {
  /** 原始 RMI 模板文件内容（.xlsx），推荐来自包内 templates 或宿主自有存储。 */
  templateXlsx: ArrayBuffer
  snapshot: ReportSnapshotV1
}

function cell(col: string, row: number): string {
  return `${col}${row}`
}

function normalizeToken(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function humanizeMineralKey(key: string): string {
  // rough: rareEarthElements -> Rare Earth Elements
  const spaced = key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
  if (!spaced) return ''
  return spaced[0]!.toUpperCase() + spaced.slice(1)
}

function toExcelScopeValue(raw: string, options: string[]): string {
  // internal: 'A'|'B'|'C' ; excel: "A. Company ..." (来自模板 DV 列表)
  const prefix = raw?.trim()
  if (!prefix) return ''
  const hit = options.find((o) => o.trim().startsWith(`${prefix}.`))
  return hit ?? raw
}

function buildAmrtMineralOptionMap(
  declXml: string,
  sharedStrings: string[],
  versionDef: TemplateVersionDef
): Map<string, string> {
  // AMRT 下拉选项来源：Declaration!B68:B80（模板内定义），包含 "Other [specify below]" 等精确文案。
  const options: string[] = []
  for (let r = 68; r <= 90; r += 1) {
    const v = readCellText(declXml, cell('B', r), sharedStrings)
    if (v && v.trim()) options.push(v.trim())
  }

  const map = new Map<string, string>()
  const otherOpt = options.find((o) => o.toLowerCase().includes('other'))
  if (otherOpt) map.set('other', otherOpt)

  const aliasesByKey: Record<string, string[]> = {
    aluminum: ['Aluminum', 'Aluminium'],
    sodaAsh: ['Soda Ash'],
    rareEarthElements: ['Rare Earth Elements'],
  }

  for (const mineral of versionDef.mineralScope.minerals) {
    if (mineral.key === 'other') continue
    const aliases = aliasesByKey[mineral.key] ?? [humanizeMineralKey(mineral.key)]
    const norms = aliases.map(normalizeToken)
    const hit = options.find((opt) => norms.includes(normalizeToken(opt)))
    if (hit) {
      map.set(mineral.key, hit)
      continue
    }
    // fallback: keep readable value; DV 可能提示无效，但导出不崩溃
    map.set(mineral.key, aliases[0] ?? mineral.key)
  }

  return map
}

function writeCompanyInfo(declXml: string, versionDef: TemplateVersionDef, snapshot: ReportSnapshotV1, readDvOptions: (cellRef: string) => string[]): string {
  const info = snapshot.data.companyInfo ?? {}

  const templateType = versionDef.templateType
  const base: Record<string, string> = {
    companyName: 'D8',
    declarationScope: 'D9',
    scopeDescription: 'D10',
  }

  const afterScopeBaseRow =
    templateType === 'emrt' ? 16 :
    templateType === 'amrt' ? 17 :
    12 // cmrt/crt

  const restKeys = [
    'companyId',
    'companyAuthId',
    'address',
    'contactName',
    'contactEmail',
    'contactPhone',
    'authorizerName',
    'authorizerTitle',
    'authorizerEmail',
    'authorizerPhone',
    'authorizationDate',
  ]

  restKeys.forEach((k, idx) => {
    base[k] = cell('D', afterScopeBaseRow + idx)
  })

  let next = declXml
  for (const field of versionDef.companyInfoFields) {
    const key = field.key
    const target = base[key]
    if (!target) continue
    const raw = info[key] ?? ''
    if (!raw) continue

    if (key === 'authorizationDate') {
      next = writeCellInlineStr(next, target, toDisplayDate(raw))
      continue
    }
    if (key === 'declarationScope') {
      const options = readDvOptions(target)
      next = writeCellInlineStr(next, target, toExcelScopeValue(raw, options))
      continue
    }
    next = writeCellInlineStr(next, target, raw)
  }

  return next
}

function writeListSheetRows(
  sheetXml: string,
  startRow: number,
  rows: Array<Record<string, string | undefined>>,
  colByKey: Record<string, string>,
  valueTransform?: (key: string, value: string) => string
): string {
  let next = sheetXml
  rows.forEach((row, index) => {
    const excelRow = startRow + index
    for (const [key, col] of Object.entries(colByKey)) {
      const raw = row[key]
      if (!raw) continue
      const v = valueTransform ? valueTransform(key, raw) : raw
      next = writeCellInlineStr(next, cell(col, excelRow), v)
    }
  })
  return next
}

function writeEmrtMineralSelection(
  declXml: string,
  versionDef: TemplateVersionDef,
  snapshot: ReportSnapshotV1,
  sharedStrings: string[]
): string {
  if (versionDef.templateType !== 'emrt') return declXml
  if (versionDef.mineralScope.mode !== 'dynamic-dropdown') return declXml

  // EMRT v2 模板：通过选择 "(Delete X)" 来移除矿种
  const slots = ['D12', 'E12', 'G12', 'D13', 'E13', 'G13']
  const selected = new Set(snapshot.data.selectedMinerals ?? [])

  let next = declXml
  versionDef.mineralScope.minerals.forEach((mineral, index) => {
    const slot = slots[index]
    if (!slot) return
    const keep = readCellText(declXml, slot, sharedStrings) ?? humanizeMineralKey(mineral.key)
    const deleteLabel =
      readCellText(declXml, cell('C', 175 + index), sharedStrings) ??
      `(Delete ${keep})`
    next = writeCellInlineStr(next, slot, selected.has(mineral.key) ? keep : deleteLabel)
  })

  return next
}

function writeAmrtMineralSelection(
  declXml: string,
  versionDef: TemplateVersionDef,
  snapshot: ReportSnapshotV1,
  sharedStrings: string[]
): string {
  if (versionDef.templateType !== 'amrt') return declXml
  if (versionDef.mineralScope.mode !== 'dynamic-dropdown') return declXml

  const optionByKey = buildAmrtMineralOptionMap(declXml, sharedStrings, versionDef)

  // 选择区：D12:I13（12 个槽位，但业务约束 maxCount=10）
  const selectionSlots = [
    'D12', 'E12', 'F12', 'G12', 'H12', 'I12',
    'D13', 'E13', 'F13', 'G13', 'H13', 'I13',
  ]
  const selected = (snapshot.data.selectedMinerals ?? []).filter(Boolean)
  const values = selected
    .map((k) => optionByKey.get(k) ?? humanizeMineralKey(k))
    .slice(0, 10)

  let next = declXml
  selectionSlots.forEach((slot, idx) => {
    next = writeCellInlineStr(next, slot, values[idx] ?? '')
  })

  // 其他矿种文本输入区：D15:I16（12 槽位）
  const otherSlots = [
    'D15', 'E15', 'F15', 'G15', 'H15', 'I15',
    'D16', 'E16', 'F16', 'G16', 'H16', 'I16',
  ]
  const hasOther = selected.includes('other')
  const others = hasOther
    ? (snapshot.data.customMinerals ?? []).map((s) => s.trim()).filter(Boolean)
    : []
  otherSlots.forEach((slot, idx) => {
    next = writeCellInlineStr(next, slot, others[idx] ?? '')
  })

  return next
}

function writeDeclarationQuestionsAndCompany(
  declXml: string,
  versionDef: TemplateVersionDef,
  snapshot: ReportSnapshotV1,
  anchors: ReturnType<typeof getExcelDeclarationAnchors>
): string {
  // AMRT 的问题矩阵在 Excel 中依赖选择区动态生成（AA 列），布局与当前 UI 数据结构不一一对应；
  // 先避免错误写入导致覆盖/错位。AMRT 的问答导出后续单独实现。
  if (versionDef.templateType === 'amrt') return declXml

  // 坐标由离线脚本生成（scripts/generate-excel-mapping.js），运行时不再扫描模板内容。
  const answers = snapshot.data.questions ?? {}
  const comments = snapshot.data.questionComments ?? {}
  const companyAnswers = snapshot.data.companyQuestions ?? {}

  const answerCol = 'D'
  const commentCol = 'G'

  let next = declXml

  // Questions: by number -> versionDef.questions order
  for (let n = 1; n <= versionDef.questions.length; n += 1) {
    const def = versionDef.questions[n - 1]
    if (!def) continue
    const row = (anchors.questionHeaderRowByNumber as Record<string, number | undefined>)[String(n)]
    if (!row) continue
    if (def.perMineral) {
      const minerals = versionDef.mineralScope.minerals
      const span = (anchors.questionSpanByNumber as Record<string, number | undefined>)[String(n)] ?? 0
      const maxRows = Math.max(0, span)
      minerals.slice(0, maxRows).forEach((mineral, idx) => {
        const rr = row + 1 + idx
        const qv = answers[def.key]
        const cv = comments[def.key]
        const value =
          qv && typeof qv === 'object' ? (qv as Record<string, string>)[mineral.key] ?? '' : ''
        const comment =
          cv && typeof cv === 'object' ? (cv as Record<string, string>)[mineral.key] ?? '' : ''
        if (value) next = writeCellInlineStr(next, cell(answerCol, rr), value)
        if (comment) next = writeCellInlineStr(next, cell(commentCol, rr), comment)
      })
    } else {
      const qv = answers[def.key]
      const cv = comments[def.key]
      const value = typeof qv === 'string' ? qv : ''
      const comment = typeof cv === 'string' ? cv : ''
      if (value) next = writeCellInlineStr(next, cell(answerCol, row + 1), value)
      if (comment) next = writeCellInlineStr(next, cell(commentCol, row + 1), comment)
    }
  }

  // Company questions: find row per letter, then maybe perMineral subrows
  const companyByKey = new Map(versionDef.companyQuestions.map((q) => [q.key, q]))
  for (const [key, row] of Object.entries(anchors.companyHeaderRowByKey as Record<string, number>)) {
    const def = companyByKey.get(key as string)
    if (!def) continue

    if (def.perMineral) {
      const minerals = versionDef.mineralScope.minerals
      const span = (anchors.companySpanByKey as Record<string, number | undefined>)[key] ?? 0
      const maxRows = Math.max(0, span)
      const commentKey = `${key}_comment`
      minerals.slice(0, maxRows).forEach((mineral, idx) => {
        const rr = row + 1 + idx
        const v = companyAnswers[key]
        const value =
          v && typeof v === 'object' ? (v as Record<string, string>)[mineral.key] ?? '' : ''
        if (value) next = writeCellInlineStr(next, cell(answerCol, rr), value)

        if (!def.hasCommentField) return
        const c = companyAnswers[commentKey]
        const comment =
          c && typeof c === 'object' ? (c as Record<string, string>)[mineral.key] ?? '' : ''
        if (comment) next = writeCellInlineStr(next, cell(commentCol, rr), comment)
      })
      continue
    }

    const v = companyAnswers[key]
    const value = typeof v === 'string' ? v : ''
    if (value) next = writeCellInlineStr(next, cell(answerCol, row), value)

    const commentKey = `${key}_comment`
    const c = companyAnswers[commentKey]
    const comment = typeof c === 'string' ? c : ''
    if (comment) next = writeCellInlineStr(next, cell(commentCol, row), comment)
  }

  return next
}

function writeAmrtQuestions(
  declXml: string,
  versionDef: TemplateVersionDef,
  snapshot: ReportSnapshotV1,
  sharedStrings: string[],
  anchors: ReturnType<typeof getExcelDeclarationAnchors>
): string {
  if (versionDef.templateType !== 'amrt') return declXml

  const questions = snapshot.data.questions ?? {}
  const questionComments = snapshot.data.questionComments ?? {}

  const q1Row = anchors.amrtQ1Row as number | null
  const q2Row = anchors.amrtQ2Row as number | null
  if (!q1Row || !q2Row) return declXml

  const optionByKey = buildAmrtMineralOptionMap(declXml, sharedStrings, versionDef)
  const selected = (snapshot.data.selectedMinerals ?? []).filter(Boolean)
  const hasOther = selected.includes('other')
  const custom = hasOther
    ? (snapshot.data.customMinerals ?? []).map((s) => s.trim()).filter(Boolean)
    : []

  const minerals = selected
    .filter((k) => k !== 'other')
    .map((k) => ({
      key: k,
      label: optionByKey.get(k) ?? humanizeMineralKey(k) ?? k,
    }))

  const rows = [
    ...minerals,
    ...custom.map((label, index) => ({ key: `custom-${index}`, label })),
  ]
    .filter((x) => x.label.trim())
    .sort((a, b) => {
      const left = a.label.trim()
      const right = b.label.trim()
      const res = left.localeCompare(right)
      return res !== 0 ? res : a.key.localeCompare(b.key)
    })
    .slice(0, 10)

  const writeBlock = (
    baseXml: string,
    questionKey: string,
    startRow: number,
    endRow: number,
    answerCol: string,
    commentCol: string
  ) => {
    let next = baseXml
    const max = Math.min(rows.length, Math.max(0, endRow - startRow + 1))
    for (let i = 0; i < max; i += 1) {
      const rr = startRow + i
      const mineralKey = rows[i]!.key
      if (!mineralKey.startsWith('custom-')) {
        const qv = questions[questionKey]
        const cv = questionComments[questionKey]
        const value =
          qv && typeof qv === 'object' ? (qv as Record<string, string>)[mineralKey] ?? '' : ''
        const comment =
          cv && typeof cv === 'object' ? (cv as Record<string, string>)[mineralKey] ?? '' : ''
        if (value) next = writeCellInlineStr(next, cell(answerCol, rr), value)
        if (comment) next = writeCellInlineStr(next, cell(commentCol, rr), comment)
      }
    }
    return next
  }

  // Q1 mineral rows: q1Row+1 ... q2Row-1
  let next = declXml
  next = writeBlock(next, 'Q1', q1Row + 1, q2Row - 1, 'D', 'G')

  // Q2 mineral rows: q2Row+1 ... next header - 1 (or cap 10 rows)
  const q3Row = anchors.amrtQ3Row as number | null
  const end2 = q3Row ? q3Row - 1 : q2Row + 10
  next = writeBlock(next, 'Q2', q2Row + 1, end2, 'D', 'G')
  return next
}

/**
 * 将 snapshot 写入模板并导出 .xlsx（严格保留模板行为）。
 */
export async function exportToExcel({ templateXlsx, snapshot }: ExportExcelInput): Promise<Blob> {
  const versionDef = getVersionDef(snapshot.templateType, snapshot.versionId)
  const anchors = getExcelDeclarationAnchors(snapshot.templateType, snapshot.versionId)
  const ctx = await loadXlsxContext(templateXlsx)

  const readDeclCell = (cellRef: string) =>
    readCellText(getSheetXml(ctx, 'Declaration'), cellRef, ctx.sharedStrings)

  const readDvOptions = (cellRef: string): string[] => {
    // 仅用于少数“内部值与模板 DV 文本不一致”的字段（当前：declarationScope）。
    // 从模板里读取该 cell 对应的 DV formula1 并解析 options。
    // 这里走最小实现：已知 CMRT/CRT/EMRT/AMRT 的 declarationScope 都使用 P/Q/R 同行。
    if (cellRef === 'D9') {
      const opts = [readDeclCell('P9'), readDeclCell('Q9'), readDeclCell('R9')].filter(
        (v): v is string => Boolean(v && v.trim())
      )
      return opts
    }
    return []
  }

  // Declaration
  let declXml = getSheetXml(ctx, 'Declaration')
  declXml = writeEmrtMineralSelection(declXml, versionDef, snapshot, ctx.sharedStrings)
  declXml = writeAmrtMineralSelection(declXml, versionDef, snapshot, ctx.sharedStrings)
  declXml = writeCompanyInfo(declXml, versionDef, snapshot, readDvOptions)
  declXml = writeDeclarationQuestionsAndCompany(
    declXml,
    versionDef,
    snapshot,
    anchors
  )
  declXml = writeAmrtQuestions(declXml, versionDef, snapshot, ctx.sharedStrings, anchors)
  setSheetXml(ctx, 'Declaration', declXml)

  const amrtOptionMap =
    versionDef.templateType === 'amrt'
      ? buildAmrtMineralOptionMap(declXml, ctx.sharedStrings, versionDef)
      : null
  const toMineralLabel = (key: string) =>
    amrtOptionMap?.get(key) ?? humanizeMineralKey(key) ?? key

  // Smelter List
  if (snapshot.data.smelterList?.length) {
    const smelterXml = getSheetXml(ctx, 'Smelter List')
    let next = smelterXml

    const writeSmart = (
      baseXml: string,
      cellRef: string,
      value: string,
      allowOverwriteFormula: boolean
    ) => {
      if (!value) return baseXml
      if (isFormulaCell(baseXml, cellRef)) {
        return allowOverwriteFormula
          ? writeCellInlineStrOverwriteFormula(baseXml, cellRef, value)
          : baseXml // keep template formula
      }
      return writeCellInlineStr(baseXml, cellRef, value)
    }

    const rows = snapshot.data.smelterList as Array<Record<string, string | undefined>>
    rows.forEach((row, index) => {
      const r = 5 + index

      const smelterId = (row.smelterId ?? '').trim()
      const hasId = Boolean(smelterId)
      const allowOverwriteFormula = !hasId

      // Prefer the template's "Option A": write Smelter ID in column A and let formulas auto-fill.
      if (versionDef.smelterList.hasIdColumn && hasId) {
        next = writeCellInlineStr(next, cell('A', r), smelterId)
      }

      // If we don't have an ID, mimic user input by overwriting formula cells in the input columns.
      // This is required for cases like "Smelter not listed" where template expects B/C/D/E/... to be entered.
      const metal = row.metal?.trim()
      if (metal) next = writeSmart(next, cell('B', r), toMineralLabel(metal), allowOverwriteFormula)

      const lookup = row.smelterLookup?.trim()
      if (versionDef.smelterList.hasLookup && lookup) {
        next = writeSmart(next, cell('C', r), normalizeSmelterLookup(lookup), allowOverwriteFormula)
      }

      const smelterCountry = row.smelterCountry?.trim()
      if (smelterCountry) next = writeSmart(next, cell('E', r), smelterCountry, allowOverwriteFormula)

      const smelterIdentification = row.smelterIdentification?.trim()
      if (smelterIdentification) {
        next = writeSmart(next, cell('F', r), smelterIdentification, allowOverwriteFormula)
      }

      const sourceId = row.sourceId?.trim()
      if (sourceId) next = writeSmart(next, cell('G', r), sourceId, allowOverwriteFormula)

      const smelterStreet = row.smelterStreet?.trim()
      if (smelterStreet) next = writeSmart(next, cell('H', r), smelterStreet, allowOverwriteFormula)

      const smelterCity = row.smelterCity?.trim()
      if (smelterCity) next = writeSmart(next, cell('I', r), smelterCity, allowOverwriteFormula)

      const smelterState = row.smelterState?.trim()
      if (smelterState) next = writeSmart(next, cell('J', r), smelterState, allowOverwriteFormula)

      const combinedMetal = row.combinedMetal?.trim()
      if (versionDef.smelterList.hasCombinedColumn && combinedMetal) {
        next = writeSmart(next, cell('R', r), toMineralLabel(combinedMetal), allowOverwriteFormula)
      }
      const combinedSmelter = row.combinedSmelter?.trim()
      if (versionDef.smelterList.hasCombinedColumn && combinedSmelter) {
        next = writeSmart(next, cell('S', r), combinedSmelter, allowOverwriteFormula)
      }

      // Columns that are plain input cells in templates across versions.
      const smelterName = row.smelterName?.trim()
      if (smelterName) next = writeSmart(next, cell('D', r), smelterName, allowOverwriteFormula)

      const smelterContactName = row.smelterContactName?.trim()
      if (smelterContactName) next = writeSmart(next, cell('K', r), smelterContactName, allowOverwriteFormula)

      const smelterContactEmail = row.smelterContactEmail?.trim()
      if (smelterContactEmail) next = writeSmart(next, cell('L', r), smelterContactEmail, allowOverwriteFormula)

      const proposedNextSteps = row.proposedNextSteps?.trim()
      if (proposedNextSteps) next = writeSmart(next, cell('M', r), proposedNextSteps, allowOverwriteFormula)

      const mineName = row.mineName?.trim()
      if (mineName) next = writeSmart(next, cell('N', r), mineName, allowOverwriteFormula)

      const mineCountry = row.mineCountry?.trim()
      if (mineCountry) next = writeSmart(next, cell('O', r), mineCountry, allowOverwriteFormula)

      const recycledScrap = row.recycledScrap?.trim()
      if (recycledScrap) next = writeSmart(next, cell('P', r), recycledScrap, allowOverwriteFormula)

      const comments = row.comments?.trim()
      if (comments) next = writeSmart(next, cell('Q', r), comments, allowOverwriteFormula)
    })

    setSheetXml(ctx, 'Smelter List', next)
  }

  // Mine List (if exists in template)
  if (snapshot.data.mineList?.length && ctx.sheetPathByName.has('Mine List')) {
    const mineXml = getSheetXml(ctx, 'Mine List')
    const colByKey: Record<string, string> = {
      metal: 'A',
      smelterName: 'B',
      mineName: 'C',
      mineId: 'D',
      mineIdSource: 'E',
      mineCountry: 'F',
      mineStreet: 'G',
      mineCity: 'H',
      mineProvince: 'I',
      mineContactName: 'J',
      mineContactEmail: 'K',
      proposedNextSteps: 'L',
      comments: 'M',
    }
    const patched = writeListSheetRows(
      mineXml,
      5,
      snapshot.data.mineList as Array<Record<string, string | undefined>>,
      colByKey,
      (k, v) => {
        if (k !== 'metal') return v
        return toMineralLabel(v)
      }
    )
    setSheetXml(ctx, 'Mine List', patched)
  }

  // Product List
  if (snapshot.data.productList?.length) {
    const productXml = getSheetXml(ctx, 'Product List')
    const colByKey: Record<string, string> = versionDef.productList.hasRequesterColumns
      ? {
          productNumber: 'B',
          productName: 'C',
          requesterNumber: 'D',
          requesterName: 'E',
          comments: 'F',
        }
      : {
          productNumber: 'B',
          productName: 'C',
          comments: 'D',
        }
    const patched = writeListSheetRows(
      productXml,
      6,
      snapshot.data.productList as Array<Record<string, string | undefined>>,
      colByKey
    )
    setSheetXml(ctx, 'Product List', patched)
  }

  // Minerals Scope (AMRT)
  if (snapshot.templateType === 'amrt' && snapshot.data.mineralsScope?.length && ctx.sheetPathByName.has('Minerals Scope')) {
    const msXml = getSheetXml(ctx, 'Minerals Scope')
    const resolveMineral = (key: string) => {
      if (key.startsWith('other-')) {
        const index = Number(key.slice('other-'.length))
        const label = snapshot.data.customMinerals?.[index]?.trim()
        return label ?? ''
      }
      return toMineralLabel(key)
    }
    const rows = (snapshot.data.mineralsScope ?? []).map((r) => ({
      mineral: resolveMineral(r.mineral),
      reason: r.reason,
    }))
    const patched = writeListSheetRows(msXml, 8, rows, { mineral: 'B', reason: 'C' })
    setSheetXml(ctx, 'Minerals Scope', patched)
  }

  setFullCalcOnLoad(ctx.files)
  removeCalcChain(ctx.files)

  const out = await zipXlsx(ctx.files)
  const outBuf = out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer
  return new Blob([outBuf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}
