import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, test } from 'vitest'

import { getSheetXml, loadXlsxContext, writeCellInlineStr } from './_xlsx'

function snippet(xml: string, cellRef: string, len = 200): string {
  const needle = `r="${cellRef}"`
  const idx = xml.indexOf(needle)
  if (idx < 0) return ''
  const start = Math.max(0, xml.lastIndexOf('<c', idx) - 10)
  return xml.slice(start, idx + len)
}

describe('xlsx patch - writeCellInlineStr', () => {
  test('writing empty string to an already self-closing cell does not produce invalid XML', async () => {
    const templatePath = path.resolve(process.cwd(), 'templates/CMRT/RMI_CMRT_6.5.xlsx')
    const buf = fs.readFileSync(templatePath)

    const ctx = await loadXlsxContext(
      buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    )

    const sheet = getSheetXml(ctx, 'Smelter List')
    // A5 is a typical self-closing empty cell in Smelter List templates.
    const before = snippet(sheet, 'A5')
    expect(before).toContain('r="A5"')

    const patched = writeCellInlineStr(sheet, 'A5', '')
    const after = snippet(patched, 'A5')

    expect(after).toContain('r="A5"')
    expect(after).not.toContain('//>')
  })

  test('writing non-empty string to a self-closing cell produces valid non-self-closing <c> element', async () => {
    const templatePath = path.resolve(process.cwd(), 'templates/CMRT/RMI_CMRT_6.5.xlsx')
    const buf = fs.readFileSync(templatePath)

    const ctx = await loadXlsxContext(
      buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    )

    const sheet = getSheetXml(ctx, 'Smelter List')
    const patched = writeCellInlineStr(sheet, 'A5', 'CID123')
    const after = snippet(patched, 'A5', 260)

    expect(after).toContain('r="A5"')
    expect(after).toContain('t="inlineStr"')
    expect(after).toContain('<is><t')
    // The opening <c> tag must not be malformed as "<c .../ t=...>"
    expect(after).not.toContain('/ t="inlineStr"')
  })
})
