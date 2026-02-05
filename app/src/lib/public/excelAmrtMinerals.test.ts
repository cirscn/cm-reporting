import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, test } from 'vitest'

import { getSheetXml, loadXlsxContext, readCellText } from './_xlsx'
import { exportToExcel } from './excel'
import type { ReportSnapshotV1 } from './snapshot'

function findAmrtOtherOption(declXml: string, sharedStrings: string[]): string {
  for (let r = 68; r <= 90; r += 1) {
    const v = readCellText(declXml, `B${r}`, sharedStrings)
    if (v && v.trim().toLowerCase().includes('other')) return v.trim()
  }
  throw new Error('cannot find AMRT Other option text in template Declaration!B68:B90')
}

describe('excel export - AMRT mineral selection', () => {
  test('repeats Other and aligns custom mineral names (AMRT 1.3)', async () => {
    const templatePath = path.resolve(process.cwd(), 'templates/AMRT/RMI_AMRT_1.3.xlsx')
    const buf = fs.readFileSync(templatePath)

    const templateCtx = await loadXlsxContext(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
    const templateDeclXml = getSheetXml(templateCtx, 'Declaration')
    const otherOpt = findAmrtOtherOption(templateDeclXml, templateCtx.sharedStrings)

    const snapshot: ReportSnapshotV1 = {
      schemaVersion: 1,
      templateType: 'amrt',
      versionId: '1.3',
      locale: 'en-US',
      data: {
        companyInfo: {},
        selectedMinerals: ['aluminum', 'iridium', 'other'],
        customMinerals: ['My Custom Metal', 'Second Metal'],
        questions: {},
        questionComments: {},
        companyQuestions: {},
        mineralsScope: [],
        smelterList: [],
        mineList: [],
        productList: [],
      },
    }

    const blob = await exportToExcel({
      templateXlsx: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
      snapshot,
    })

    const out = new Uint8Array(await blob.arrayBuffer())
    const ctx = await loadXlsxContext(out.buffer)
    const declXml = getSheetXml(ctx, 'Declaration')

    // Selection slots (D12:E12...) should repeat Other for each custom mineral name (up to maxCount=10),
    // and the name cells below should align by slot index.
    expect(readCellText(declXml, 'D12', ctx.sharedStrings)).toBe(otherOpt)
    expect(readCellText(declXml, 'E12', ctx.sharedStrings)).toBe(otherOpt)
    expect((readCellText(declXml, 'F12', ctx.sharedStrings) ?? '').toLowerCase()).toContain('aluminum')
    expect((readCellText(declXml, 'G12', ctx.sharedStrings) ?? '').toLowerCase()).toContain('iridium')

    expect(readCellText(declXml, 'D15', ctx.sharedStrings)).toBe('My Custom Metal')
    expect(readCellText(declXml, 'E15', ctx.sharedStrings)).toBe('Second Metal')
  })
})

