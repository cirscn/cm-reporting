#!/usr/bin/env node
/**
 * @file generate-excel-mapping.js
 * @description Generate per-template/version Excel coordinate mapping for stable exports.
 *
 * Why:
 * - Runtime export must not "guess" row positions by scanning cached cell values.
 * - We still keep "patch the original template" approach (DV/format/formulas preserved).
 *
 * Output:
 * - src/lib/public/excelMappings.generated.ts (committed)
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { unzipSync } from 'fflate'

const __dirname = dirname(fileURLToPath(import.meta.url))
const APP_ROOT = resolve(__dirname, '..')

const TEMPLATES = [
  {
    typeUpper: 'CMRT',
    typeLower: 'cmrt',
    manifestPath: 'src/lib/core/registry/templates/cmrt/manifest.ts',
    versionArrayName: 'CMRT_VERSION_IDS',
  },
  {
    typeUpper: 'EMRT',
    typeLower: 'emrt',
    manifestPath: 'src/lib/core/registry/templates/emrt/manifest.ts',
    versionArrayName: 'EMRT_VERSION_IDS',
  },
  {
    typeUpper: 'CRT',
    typeLower: 'crt',
    manifestPath: 'src/lib/core/registry/templates/crt/manifest.ts',
    versionArrayName: 'CRT_VERSION_IDS',
  },
  {
    typeUpper: 'AMRT',
    typeLower: 'amrt',
    manifestPath: 'src/lib/core/registry/templates/amrt/manifest.ts',
    versionArrayName: 'AMRT_VERSION_IDS',
  },
]

function decodeXmlText(text) {
  return String(text)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

function uint8ToUtf8(u8) {
  return new TextDecoder().decode(u8)
}

function getFileText(files, path) {
  const file = files[path]
  if (!file) throw new Error(`xlsx missing file: ${path}`)
  return uint8ToUtf8(file)
}

function parseSharedStringsXml(xml) {
  const items = []
  const siRe = /<si\b[^>]*>([\s\S]*?)<\/si>/g
  let m
  while ((m = siRe.exec(xml))) {
    const si = m[1] ?? ''
    const ts = []
    const tRe = /<t\b[^>]*>([\s\S]*?)<\/t>/g
    let mt
    while ((mt = tRe.exec(si))) {
      ts.push(decodeXmlText(mt[1] ?? ''))
    }
    items.push(ts.join(''))
  }
  return items
}

function buildSheetPathByName(workbookXml, relsXml) {
  const rIdBySheetName = new Map()
  const sheetRe = /<sheet\b[^>]*\bname="([^"]+)"[^>]*\br:id="([^"]+)"[^>]*\/?>/g
  let m
  while ((m = sheetRe.exec(workbookXml))) {
    rIdBySheetName.set(decodeXmlText(m[1] ?? ''), m[2] ?? '')
  }

  const targetByRid = new Map()
  const relRe = /<Relationship\b[^>]*\bId="([^"]+)"[^>]*\bTarget="([^"]+)"[^>]*\/?>/g
  let mr
  while ((mr = relRe.exec(relsXml))) {
    targetByRid.set(mr[1] ?? '', decodeXmlText(mr[2] ?? ''))
  }

  const result = new Map()
  for (const [name, rid] of rIdBySheetName.entries()) {
    const target = targetByRid.get(rid)
    if (!target) continue
    const path = target.startsWith('/') ? target.slice(1) : `xl/${target}`
    result.set(name, path)
  }
  return result
}

function findCellElement(xml, cellRef) {
  const needle = `r="${cellRef}"`
  const idx = xml.indexOf(needle)
  if (idx < 0) return null
  const cStart = xml.lastIndexOf('<c', idx)
  if (cStart < 0) return null
  const tagEnd = xml.indexOf('>', idx)
  if (tagEnd < 0) return null
  const openTag = xml.slice(cStart, tagEnd + 1)
  if (openTag.endsWith('/>')) {
    return { openTag, body: '' }
  }
  const cEnd = xml.indexOf('</c>', tagEnd + 1)
  if (cEnd < 0) return null
  const body = xml.slice(tagEnd + 1, cEnd)
  return { openTag, body }
}

function readCellText(sheetXml, cellRef, sharedStrings) {
  const found = findCellElement(sheetXml, cellRef)
  if (!found) return null
  const { openTag, body } = found

  const tMatch = /\bt="([^"]+)"/.exec(openTag)
  const t = tMatch?.[1]

  if (t === 'inlineStr') {
    const tRe = /<t\b[^>]*>([\s\S]*?)<\/t>/
    const mt = tRe.exec(body)
    return mt ? decodeXmlText(mt[1] ?? '') : ''
  }

  const vRe = /<v>([\s\S]*?)<\/v>/
  const mv = vRe.exec(body)
  if (!mv) return ''
  const raw = decodeXmlText(mv[1] ?? '')

  if (t === 's') {
    const idx = Number(raw)
    return Number.isFinite(idx) ? (sharedStrings[idx] ?? '') : ''
  }

  return raw
}

function getSheetMaxRow(sheetXml) {
  const m = /<dimension\b[^>]*\bref="([^"]+)"/.exec(sheetXml)
  const ref = m?.[1]
  if (!ref) return 500
  const parts = ref.split(':')
  const right = parts[1] ?? parts[0]
  const rm = /(\d+)$/.exec(right)
  return rm ? Number(rm[1]) : 500
}

function extractVersions(manifestContent, arrayName) {
  const regex = new RegExp(`${arrayName}\\s*=\\s*\\[([^\\]]+)\\]`, 's')
  const match = manifestContent.match(regex)
  if (!match) return []
  const arrayContent = match[1]
  const versionRegex = /['"]([^'"]+)['"]/g
  const versions = []
  let versionMatch
  while ((versionMatch = versionRegex.exec(arrayContent)) !== null) {
    versions.push(versionMatch[1])
  }
  return versions
}

function loadXlsx(filePath) {
  const buf = readFileSync(filePath)
  const files = unzipSync(new Uint8Array(buf))
  const workbookXml = getFileText(files, 'xl/workbook.xml')
  const relsXml = getFileText(files, 'xl/_rels/workbook.xml.rels')
  const sheetPathByName = buildSheetPathByName(workbookXml, relsXml)

  const sharedStringsXml = files['xl/sharedStrings.xml']
    ? getFileText(files, 'xl/sharedStrings.xml')
    : ''
  const sharedStrings = sharedStringsXml ? parseSharedStringsXml(sharedStringsXml) : []

  return { files, sheetPathByName, sharedStrings }
}

function extractDeclarationAnchors({ declXml, sharedStrings, templateKey }) {
  const maxRow = getSheetMaxRow(declXml)
  const questionHeaderRowByNumber = {}
  const companyHeaderRowByKey = {}

  // Scan cached values in column B for stable anchors: "1)" and "A."
  for (let r = 1; r <= Math.min(maxRow, 400); r += 1) {
    const b = readCellText(declXml, `B${r}`, sharedStrings)
    if (!b) continue
    const s = b.trim()
    const qm = /^(\d+)\)/.exec(s)
    if (qm) {
      questionHeaderRowByNumber[Number(qm[1])] = r
      continue
    }
    const cm = /^([A-I])[).]/.exec(s)
    if (cm) companyHeaderRowByKey[cm[1]] = r
  }

  const allHeaderRows = [
    ...Object.values(questionHeaderRowByNumber),
    ...Object.values(companyHeaderRowByKey),
  ]
    .filter((x) => Number.isFinite(x))
    .map((x) => Number(x))
    .sort((a, b) => a - b)

  const headerNextRow = (row) => {
    for (const r of allHeaderRows) {
      if (r > row) return r
    }
    return null
  }

  const inferSpan = (row) => {
    const next = headerNextRow(row)
    if (next) return Math.max(0, next - row - 1)

    // Last header section: scan down until answer cells stop appearing.
    // We stop on the first run of N empty/non-existent rows.
    const N = 8
    let emptyRun = 0
    let span = 0
    for (let rr = row + 1; rr <= Math.min(maxRow + 50, 500); rr += 1) {
      const hasD = declXml.includes(`r="D${rr}"`)
      const hasG = declXml.includes(`r="G${rr}"`)
      const hasB = declXml.includes(`r="B${rr}"`)
      if (hasD || hasG || hasB) {
        emptyRun = 0
        span += 1
        continue
      }
      emptyRun += 1
      if (emptyRun >= N) break
      span += 1
    }
    return Math.max(0, span - emptyRun)
  }

  const questionSpanByNumber = {}
  for (const [k, row] of Object.entries(questionHeaderRowByNumber)) {
    questionSpanByNumber[k] = inferSpan(Number(row))
  }

  const companySpanByKey = {}
  for (const [k, row] of Object.entries(companyHeaderRowByKey)) {
    companySpanByKey[k] = inferSpan(Number(row))
  }

  // AMRT Q1/Q2 anchors: still in the same sheet, but we treat it separately.
  let amrtQ1Row = null
  let amrtQ2Row = null
  let amrtQ3Row = null
  for (let r = 1; r <= Math.min(maxRow, 400); r += 1) {
    const b = readCellText(declXml, `B${r}`, sharedStrings)
    if (!b) continue
    const s = b.trim()
    if (!amrtQ1Row && /^1\)/.test(s)) amrtQ1Row = r
    if (!amrtQ2Row && /^2\)/.test(s)) amrtQ2Row = r
    if (amrtQ1Row && amrtQ2Row) break
  }
  if (amrtQ2Row) {
    for (let r = amrtQ2Row + 1; r <= Math.min(maxRow, 450); r += 1) {
      const b = readCellText(declXml, `B${r}`, sharedStrings)
      if (!b) continue
      const s = b.trim()
      if (/^\d\)/.test(s)) {
        amrtQ3Row = r
        break
      }
    }
  }

  if (!Object.keys(questionHeaderRowByNumber).length && !Object.keys(companyHeaderRowByKey).length) {
    throw new Error(`No Declaration anchors found (column B). template=${templateKey}`)
  }

  return {
    questionHeaderRowByNumber,
    questionSpanByNumber,
    companyHeaderRowByKey,
    companySpanByKey,
    amrtQ1Row,
    amrtQ2Row,
    amrtQ3Row,
  }
}

function generate() {
  const out = {
    cmrt: {},
    emrt: {},
    crt: {},
    amrt: {},
  }

  for (const t of TEMPLATES) {
    const manifestPath = join(APP_ROOT, t.manifestPath)
    if (!existsSync(manifestPath)) {
      throw new Error(`Manifest file not found: ${t.manifestPath}`)
    }
    const manifestContent = readFileSync(manifestPath, 'utf-8')
    const versions = extractVersions(manifestContent, t.versionArrayName)
    if (!versions.length) {
      throw new Error(`Could not extract versions from ${t.manifestPath} (${t.versionArrayName})`)
    }

    for (const versionId of versions) {
      const templatePath = join(APP_ROOT, 'templates', t.typeUpper, `RMI_${t.typeUpper}_${versionId}.xlsx`)
      const templateKey = `${t.typeLower}@${versionId}`
      if (!existsSync(templatePath)) {
        throw new Error(`Template file not found: ${templatePath}`)
      }

      const ctx = loadXlsx(templatePath)
      const declPath = ctx.sheetPathByName.get('Declaration')
      if (!declPath) throw new Error(`xlsx missing sheet: Declaration (${templateKey})`)
      const declXml = getFileText(ctx.files, declPath)

      const anchors = extractDeclarationAnchors({
        declXml,
        sharedStrings: ctx.sharedStrings,
        templateKey,
      })

      out[t.typeLower][versionId] = anchors
    }
  }

  return out
}

function formatTs(obj) {
  // stable output: JSON with 2-space indent, then as const.
  const json = JSON.stringify(obj, null, 2)
  return `// This file is auto-generated by scripts/generate-excel-mapping.js\n// Do not edit manually.\n\nexport const EXCEL_TEMPLATE_ANCHORS = ${json} as const\n`
}

function main() {
  const anchors = generate()
  const outPath = join(APP_ROOT, 'src/lib/public/excelMappings.generated.ts')

  const nextText = formatTs(anchors)
  const checkMode = process.argv.includes('--check')
  if (checkMode) {
    const curText = existsSync(outPath) ? readFileSync(outPath, 'utf-8') : ''
    if (curText !== nextText) {
      console.error('Excel mapping is out of date. Please run: pnpm generate:excel-mapping')
      process.exit(1)
    }
    console.log('Excel mapping is up to date.')
    return
  }

  writeFileSync(outPath, nextText, 'utf-8')
  console.log(`Generated: ${outPath}`)
}

main()
