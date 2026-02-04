import fs from 'node:fs'
import path from 'node:path'

import { getVersionDef } from '@core/registry'
import { describe, expect, test } from 'vitest'

import { getSheetXml, loadXlsxContext, readCellText } from './_xlsx'
import { exportToExcel } from './excel'
import { getExcelDeclarationAnchors } from './excelMapping'
import type { ReportSnapshotV1 } from './snapshot'

describe('excel export - company questions', () => {
  test('writes perMineral company question comments (EMRT 2.1, C_comment)', async () => {
    const templateType = 'emrt'
    const versionId = '2.1'
    const versionDef = getVersionDef(templateType, versionId)
    const anchors = getExcelDeclarationAnchors(templateType, versionId)

    const templatePath = path.resolve(process.cwd(), `templates/EMRT/RMI_EMRT_${versionId}.xlsx`)
    const buf = fs.readFileSync(templatePath)
    const templateXlsx = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)

    const cobaltKey = versionDef.mineralScope.minerals[0]?.key
    expect(cobaltKey).toBe('cobalt')

    const snapshot: ReportSnapshotV1 = {
      schemaVersion: 1,
      templateType,
      versionId,
      locale: 'en-US',
      data: {
        companyInfo: {},
        selectedMinerals: [],
        customMinerals: [],
        questions: {},
        questionComments: {},
        companyQuestions: {
          C: { [cobaltKey!]: 'Yes' },
          C_comment: { [cobaltKey!]: 'comment-for-cobalt' },
        },
        mineralsScope: [],
        smelterList: [],
        mineList: [],
        productList: [],
      },
    }

    const blob = await exportToExcel({ templateXlsx, snapshot })
    const out = new Uint8Array(await blob.arrayBuffer())
    const ctx = await loadXlsxContext(out.buffer)
    const declXml = getSheetXml(ctx, 'Declaration')

    const row = anchors.companyHeaderRowByKey['C']
    expect(row).toBeTruthy()

    expect(readCellText(declXml, `D${row + 1}`, ctx.sharedStrings)).toBe('Yes')
    expect(readCellText(declXml, `G${row + 1}`, ctx.sharedStrings)).toBe('comment-for-cobalt')
  })
})
