import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, test } from 'vitest'

import { getSheetXml, loadXlsxContext } from './_xlsx'
import { exportToExcel } from './excel'
import type { ReportSnapshotV1 } from './snapshot'

function cellSnippet(xml: string, cellRef: string, len = 300): string {
  const needle = `r="${cellRef}"`
  const idx = xml.indexOf(needle)
  if (idx < 0) return ''
  const start = Math.max(0, xml.lastIndexOf('<c', idx) - 10)
  return xml.slice(start, idx + len)
}

describe('excel export - Smelter List', () => {
  test('does not overwrite formula cells when smelterId is provided (CMRT 6.5)', async () => {
    const templatePath = path.resolve(process.cwd(), 'templates/CMRT/RMI_CMRT_6.5.xlsx')
    const buf = fs.readFileSync(templatePath)

    const snapshot: ReportSnapshotV1 = {
      schemaVersion: 1,
      templateType: 'cmrt',
      versionId: '6.5',
      locale: 'en-US',
      data: {
        companyInfo: {},
        selectedMinerals: [],
        customMinerals: [],
        questions: {},
        questionComments: {},
        companyQuestions: {},
        mineralsScope: [],
        smelterList: [
          {
            smelterId: 'CID000000',
            smelterContactName: 'Bob',
          },
        ] as unknown as ReportSnapshotV1['data']['smelterList'],
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
    const smelterXml = getSheetXml(ctx, 'Smelter List')

    // We write ID in A5 and keep B5's formula intact.
    expect(smelterXml).toContain('r="A5"')
    expect(cellSnippet(smelterXml, 'B5')).toContain('<f')
  })

  test('can overwrite template formula cells to represent manual entry (CMRT 6.5)', async () => {
    const templatePath = path.resolve(process.cwd(), 'templates/CMRT/RMI_CMRT_6.5.xlsx')
    const buf = fs.readFileSync(templatePath)

    const snapshot: ReportSnapshotV1 = {
      schemaVersion: 1,
      templateType: 'cmrt',
      versionId: '6.5',
      locale: 'en-US',
      data: {
        companyInfo: {},
        selectedMinerals: [],
        customMinerals: [],
        questions: {},
        questionComments: {},
        companyQuestions: {},
        mineralsScope: [],
        smelterList: [
          {
            metal: 'tantalum',
            smelterLookup: 'Smelter not listed',
            smelterName: 'Manual Smelter',
            smelterCountry: 'China',
          },
        ] as unknown as ReportSnapshotV1['data']['smelterList'],
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
    const smelterXml = getSheetXml(ctx, 'Smelter List')

    const b5 = cellSnippet(smelterXml, 'B5')
    expect(b5).not.toContain('<f')
    expect(b5).toContain('Tantalum')

    expect(cellSnippet(smelterXml, 'C5')).toContain('Smelter not listed')
    expect(cellSnippet(smelterXml, 'D5')).toContain('Manual Smelter')
    expect(cellSnippet(smelterXml, 'E5')).toContain('China')
  })
})
