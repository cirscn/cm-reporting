import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, test } from 'vitest'

import { getSheetXml, loadXlsxContext, readCellText } from './_xlsx'
import { exportToExcel } from './excel'
import type { ReportSnapshotV1 } from './snapshot'

describe('exportToExcel', () => {
  test('fills company info and question answers without breaking template structure', async () => {
    const templatePath = path.resolve(
      process.cwd(),
      'templates/CMRT/RMI_CMRT_6.5.xlsx'
    )
    const buf = fs.readFileSync(templatePath)

    const snapshot: ReportSnapshotV1 = {
      schemaVersion: 1,
      templateType: 'cmrt',
      versionId: '6.5',
      locale: 'en-US',
      data: {
        companyInfo: {
          companyName: 'Acme Inc',
          declarationScope: 'A',
          authorizationDate: '2026-02-04',
        },
        selectedMinerals: [],
        customMinerals: [],
        questions: {
          // Q2 header row is present in CMRT template; we assert one cell gets written.
          Q2: {
            tantalum: 'Yes',
            tin: '',
            gold: '',
            tungsten: '',
          },
        },
        questionComments: {
          Q2: {
            tantalum: 'Note',
            tin: '',
            gold: '',
            tungsten: '',
          },
        },
        companyQuestions: {},
        mineralsScope: [],
        smelterList: [],
        mineList: [],
        productList: [],
      },
    }

    const blob = await exportToExcel({ templateXlsx: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), snapshot })
    const out = new Uint8Array(await blob.arrayBuffer())
    const ctx = await loadXlsxContext(out.buffer)
    const declXml = getSheetXml(ctx, 'Declaration')

    // Company name written into D8
    expect(readCellText(declXml, 'D8', ctx.sharedStrings)).toBe('Acme Inc')
    // Scope mapped from 'A' to template DV value
    expect(readCellText(declXml, 'D9', ctx.sharedStrings)?.startsWith('A.')).toBe(true)
    // Date converted to display format
    expect(readCellText(declXml, 'D22', ctx.sharedStrings)).toBe('04-Feb-2026')

    // Q2 tantalum answer/comment: D32 / G32 in CMRT 6.5 template
    expect(readCellText(declXml, 'D32', ctx.sharedStrings)).toBe('Yes')
    expect(readCellText(declXml, 'G32', ctx.sharedStrings)).toBe('Note')
  })

  test('writes requester columns into CMRT 6.6 product list', async () => {
    const templatePath = path.resolve(
      process.cwd(),
      'templates/CMRT/RMI_CMRT_6.6.xlsx'
    )
    const buf = fs.readFileSync(templatePath)

    const snapshot: ReportSnapshotV1 = {
      schemaVersion: 1,
      templateType: 'cmrt',
      versionId: '6.6',
      locale: 'en-US',
      data: {
        companyInfo: {
          companyName: 'Acme Inc',
          declarationScope: 'B',
          authorizationDate: '2026-02-04',
        },
        selectedMinerals: [],
        customMinerals: [],
        questions: {},
        questionComments: {},
        companyQuestions: {},
        mineralsScope: [],
        smelterList: [],
        mineList: [],
        productList: [
          {
            id: 'product-1',
            partNumber: 'RESP-001',
            partName: 'Responder Product',
            requestPartNumber: 'REQ-001',
            requestPartName: 'Requester Product',
            remark: 'Product note',
          },
        ],
      },
    }

    const blob = await exportToExcel({
      templateXlsx: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
      snapshot,
    })
    const out = new Uint8Array(await blob.arrayBuffer())
    const ctx = await loadXlsxContext(out.buffer)
    const productXml = getSheetXml(ctx, 'Product List')

    expect(readCellText(productXml, 'B6', ctx.sharedStrings)).toBe('RESP-001')
    expect(readCellText(productXml, 'C6', ctx.sharedStrings)).toBe('Responder Product')
    expect(readCellText(productXml, 'D6', ctx.sharedStrings)).toBe('REQ-001')
    expect(readCellText(productXml, 'E6', ctx.sharedStrings)).toBe('Requester Product')
    expect(readCellText(productXml, 'F6', ctx.sharedStrings)).toBe('Product note')
  })
})
