/**
 * @file public/_xlsx.ts
 * @description xlsx 最小 patch 工具：基于原始模板写入值，尽量不触碰其它结构。
 *
 * 目标：导出后的文件在 Excel 中保持 DV/格式/公式/隐藏 sheet 行为一致。
 * 非目标：zip 内容字节级一致（重新打包不可避免产生差异）。
 */

import type { Unzipped } from 'fflate'

type SheetPathByName = Map<string, string>

export interface XlsxContext {
  files: Unzipped
  sharedStrings: string[]
  sheetPathByName: SheetPathByName
}

function decodeXmlText(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

function encodeXmlText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function uint8ToUtf8(u8: Uint8Array): string {
  return new TextDecoder().decode(u8)
}

function utf8ToUint8(text: string): Uint8Array {
  return new TextEncoder().encode(text)
}

function getFileText(files: Unzipped, path: string): string {
  const file = files[path]
  if (!file) throw new Error(`xlsx missing file: ${path}`)
  return uint8ToUtf8(file as Uint8Array)
}

function setFileText(files: Unzipped, path: string, text: string) {
  files[path] = utf8ToUint8(text) as unknown as Unzipped[string]
}

function parseSharedStringsXml(xml: string): string[] {
  // sharedStrings.xml 可以包含富文本：<si><r><t>..</t></r>..</si>
  const items: string[] = []
  const siRe = /<si\b[^>]*>([\s\S]*?)<\/si>/g
  let m: RegExpExecArray | null
  while ((m = siRe.exec(xml))) {
    const si = m[1] ?? ''
    const ts: string[] = []
    const tRe = /<t\b[^>]*>([\s\S]*?)<\/t>/g
    let mt: RegExpExecArray | null
    while ((mt = tRe.exec(si))) {
      ts.push(decodeXmlText(mt[1] ?? ''))
    }
    items.push(ts.join(''))
  }
  return items
}

function buildSheetPathByName(workbookXml: string, relsXml: string): SheetPathByName {
  // workbook.xml: <sheet name="Declaration" ... r:id="rId3"/>
  const rIdBySheetName = new Map<string, string>()
  const sheetRe = /<sheet\b[^>]*\bname="([^"]+)"[^>]*\br:id="([^"]+)"[^>]*\/?>/g
  let m: RegExpExecArray | null
  while ((m = sheetRe.exec(workbookXml))) {
    rIdBySheetName.set(decodeXmlText(m[1] ?? ''), m[2] ?? '')
  }

  // workbook.xml.rels: <Relationship Id="rId3" Target="worksheets/sheet3.xml" .../>
  const targetByRid = new Map<string, string>()
  const relRe = /<Relationship\b[^>]*\bId="([^"]+)"[^>]*\bTarget="([^"]+)"[^>]*\/?>/g
  let mr: RegExpExecArray | null
  while ((mr = relRe.exec(relsXml))) {
    targetByRid.set(mr[1] ?? '', decodeXmlText(mr[2] ?? ''))
  }

  const result: SheetPathByName = new Map()
  for (const [name, rid] of rIdBySheetName.entries()) {
    const target = targetByRid.get(rid)
    if (!target) continue
    const path = target.startsWith('/') ? target.slice(1) : `xl/${target}`
    result.set(name, path)
  }
  return result
}

function findCellElement(xml: string, cellRef: string): { start: number; end: number; openTag: string; body: string } | null {
  const needle = `r="${cellRef}"`
  const idx = xml.indexOf(needle)
  if (idx < 0) return null
  const cStart = xml.lastIndexOf('<c', idx)
  if (cStart < 0) return null
  const tagEnd = xml.indexOf('>', idx)
  if (tagEnd < 0) return null
  const openTag = xml.slice(cStart, tagEnd + 1)
  // self-closing: <c .../>
  if (openTag.endsWith('/>')) {
    return { start: cStart, end: tagEnd + 1, openTag, body: '' }
  }
  const cEnd = xml.indexOf('</c>', tagEnd + 1)
  if (cEnd < 0) return null
  const body = xml.slice(tagEnd + 1, cEnd)
  return { start: cStart, end: cEnd + 4, openTag, body }
}

function stripAttr(openTag: string, attrName: string): string {
  // remove attrName="..."
  const re = new RegExp(`\\s+${attrName}="[^"]*"`, 'g')
  return openTag.replace(re, '')
}

export function isFormulaCell(sheetXml: string, cellRef: string): boolean {
  const found = findCellElement(sheetXml, cellRef)
  if (!found) return false
  return /<f[\s>]/.test(found.body)
}

export function readCellText(sheetXml: string, cellRef: string, sharedStrings: string[]): string | null {
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

export function writeCellInlineStr(sheetXml: string, cellRef: string, value: string): string {
  return writeCellInlineStrImpl(sheetXml, cellRef, value, { allowOverwriteFormula: false })
}

/**
 * 写入 inlineStr，允许覆盖公式单元格（等价于用户在 Excel 中直接输入，从而替换掉公式）。
 *
 * 注意：仅应在“模板允许用户编辑的输入列”使用；否则会破坏模板行为。
 */
export function writeCellInlineStrOverwriteFormula(sheetXml: string, cellRef: string, value: string): string {
  return writeCellInlineStrImpl(sheetXml, cellRef, value, { allowOverwriteFormula: true })
}

function writeCellInlineStrImpl(
  sheetXml: string,
  cellRef: string,
  value: string,
  opts: { allowOverwriteFormula: boolean }
): string {
  const found = findCellElement(sheetXml, cellRef)
  if (!found) {
    // 模板应当已经为可编辑单元格预置了带样式的 <c>，避免我们创建 cell 破坏样式/列宽等。
    throw new Error(`cell not found in template: ${cellRef}`)
  }

  const { start, end, openTag, body } = found
  if (!opts.allowOverwriteFormula && /<f[\s>]/.test(body)) {
    throw new Error(`refusing to overwrite formula cell: ${cellRef}`)
  }

  let nextOpen = openTag
  nextOpen = stripAttr(nextOpen, 't')
  // Normalize self-closing <c .../> into <c ...> before injecting attributes/body.
  nextOpen = nextOpen.replace(/\s*\/>$/, '>')
  // 强制 inlineStr（避免写 sharedStrings，减少对模板结构触碰）
  nextOpen = nextOpen.replace(/>$/, ' t="inlineStr">')
  nextOpen = nextOpen.replace(/\s+t="inlineStr"\s+t="inlineStr"/g, ' t="inlineStr"')

  const trimmed = value ?? ''
  const nextCell = trimmed
    ? `${nextOpen}<is><t xml:space="preserve">${encodeXmlText(trimmed)}</t></is></c>`
    : (() => {
        const stripped = stripAttr(openTag, 't')
        // If the template cell is already self-closing (<c .../>), keep it as-is.
        if (stripped.endsWith('/>')) return stripped
        return stripped.replace(/>$/, '/>')
      })()

  return sheetXml.slice(0, start) + nextCell + sheetXml.slice(end)
}

export async function loadXlsxContext(input: ArrayBuffer): Promise<XlsxContext> {
  const { unzipSync } = await import('fflate')
  const files = unzipSync(new Uint8Array(input)) as Unzipped

  const workbookXml = getFileText(files, 'xl/workbook.xml')
  const relsXml = getFileText(files, 'xl/_rels/workbook.xml.rels')

  const sharedStringsXml = files['xl/sharedStrings.xml']
    ? getFileText(files, 'xl/sharedStrings.xml')
    : ''
  const sharedStrings = sharedStringsXml ? parseSharedStringsXml(sharedStringsXml) : []

  return {
    files,
    sharedStrings,
    sheetPathByName: buildSheetPathByName(workbookXml, relsXml),
  }
}

export function setFullCalcOnLoad(files: Unzipped) {
  const workbookPath = 'xl/workbook.xml'
  let xml = getFileText(files, workbookPath)

  if (/<calcPr\b/.test(xml)) {
    // ensure fullCalcOnLoad="1"
    xml = xml.replace(/<calcPr\b([^>]*)\/>/, (_m, attrs) => {
      const has = /\bfullCalcOnLoad=/.test(attrs)
      if (has) {
        const nextAttrs = String(attrs).replace(/fullCalcOnLoad="[^"]*"/, 'fullCalcOnLoad="1"')
        return `<calcPr${nextAttrs}/>`
      }
      return `<calcPr${attrs} fullCalcOnLoad="1"/>`
    })
  } else {
    // insert near </workbook> end
    xml = xml.replace(/<\/workbook>/, '<calcPr fullCalcOnLoad="1"/></workbook>')
  }

  setFileText(files, workbookPath, xml)
}

export function removeCalcChain(files: Unzipped) {
  if (files['xl/calcChain.xml']) {
    delete files['xl/calcChain.xml']
  }

  const ctPath = '[Content_Types].xml'
  if (files[ctPath]) {
    let ct = getFileText(files, ctPath)
    ct = ct.replace(/<Override\b[^>]*PartName="\/xl\/calcChain\.xml"[^>]*\/>\s*/g, '')
    setFileText(files, ctPath, ct)
  }

  // Some templates also carry a Relationship entry for calcChain; remove it to avoid dangling rels.
  const relsPath = 'xl/_rels/workbook.xml.rels'
  if (files[relsPath]) {
    let rels = getFileText(files, relsPath)
    // remove by Target
    rels = rels.replace(/<Relationship\b[^>]*\bTarget="calcChain\.xml"[^>]*\/>\s*/g, '')
    rels = rels.replace(/<Relationship\b[^>]*\bTarget="\/xl\/calcChain\.xml"[^>]*\/>\s*/g, '')
    // remove by Type (order-insensitive)
    rels = rels.replace(
      /<Relationship\b[^>]*\bType="http:\/\/schemas\.openxmlformats\.org\/officeDocument\/2006\/relationships\/calcChain"[^>]*\/>\s*/g,
      ''
    )
    setFileText(files, relsPath, rels)
  }
}

export async function zipXlsx(files: Unzipped): Promise<Uint8Array> {
  const { zipSync } = await import('fflate')
  return zipSync(files, { level: 6 }) as Uint8Array
}

export function getSheetXml(ctx: XlsxContext, sheetName: string): string {
  const path = ctx.sheetPathByName.get(sheetName)
  if (!path) throw new Error(`xlsx missing sheet: ${sheetName}`)
  return getFileText(ctx.files, path)
}

export function setSheetXml(ctx: XlsxContext, sheetName: string, xml: string) {
  const path = ctx.sheetPathByName.get(sheetName)
  if (!path) throw new Error(`xlsx missing sheet: ${sheetName}`)
  setFileText(ctx.files, path, xml)
}
