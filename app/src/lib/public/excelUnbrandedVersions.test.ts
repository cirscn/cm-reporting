import fs from 'node:fs'
import path from 'node:path'

import type { TemplateType } from '@core/registry'
import { describe, expect, test } from 'vitest'

import { getSheetXml, loadXlsxContext } from './_xlsx'
import { exportToExcel } from './excel'
import type { ReportSnapshotV1 } from './snapshot'

const CASES: ReadonlyArray<{
  templateType: TemplateType
  versionId: string
  relativePath: string
}> = [
  {
    templateType: 'cmrt',
    versionId: '6.6.1',
    relativePath: 'templates/CMRT/CMRT_6.6.1.xlsx',
  },
  {
    templateType: 'emrt',
    versionId: '2.11.1',
    relativePath: 'templates/EMRT/EMRT_2.11.1.xlsx',
  },
  {
    templateType: 'amrt',
    versionId: '1.31.1',
    relativePath: 'templates/AMRT/AMRT_1.31.1.xlsx',
  },
]

function createEmptySnapshot(
  templateType: TemplateType,
  versionId: string
): ReportSnapshotV1 {
  return {
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
      companyQuestions: {},
      mineralsScope: [],
      smelterList: [],
      mineList: [],
      productList: [],
    },
  }
}

describe('unbranded template exports', () => {
  test.each(CASES)(
    'exports $templateType@$versionId with the official filename',
    async ({ templateType, versionId, relativePath }) => {
      const buffer = fs.readFileSync(path.resolve(process.cwd(), relativePath))
      const templateXlsx = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      )
      const snapshot = createEmptySnapshot(templateType, versionId)

      const blob = await exportToExcel({ templateXlsx, snapshot })
      const context = await loadXlsxContext(await blob.arrayBuffer())

      expect(getSheetXml(context, 'Declaration')).toContain('<worksheet')
    }
  )
})
