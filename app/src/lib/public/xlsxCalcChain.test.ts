import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, test } from 'vitest'

import { loadXlsxContext } from './_xlsx'
import { exportToExcel } from './excel'
import type { ReportSnapshotV1 } from './snapshot'

function decode(u8: unknown): string {
  if (!u8) return ''
  return new TextDecoder().decode(u8 as Uint8Array)
}

describe('xlsx patch - calcChain removal', () => {
  test('removes calcChain.xml and related rels/overrides (CMRT 6.01)', async () => {
    const templatePath = path.resolve(process.cwd(), 'templates/CMRT/RMI_CMRT_6.01.xlsx')
    const buf = fs.readFileSync(templatePath)

    const snapshot: ReportSnapshotV1 = {
      schemaVersion: 1,
      templateType: 'cmrt',
      versionId: '6.01',
      locale: 'en-US',
      data: {
        companyInfo: {},
        selectedMinerals: [],
        customMinerals: [],
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

    expect(ctx.files['xl/calcChain.xml']).toBeUndefined()

    const ct = decode(ctx.files['[Content_Types].xml'])
    expect(ct).not.toContain('/xl/calcChain.xml')

    const rels = decode(ctx.files['xl/_rels/workbook.xml.rels'])
    expect(rels).not.toContain('calcChain.xml')
    expect(rels).not.toContain('relationships/calcChain')
  })
})

