import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, test } from 'vitest'

import { getSheetXml, loadXlsxContext, readCellText } from './_xlsx'
import { exportToExcel } from './excel'
import { parseSnapshot, stringifySnapshot, type ReportSnapshotV1 } from './snapshot'

const NEW_VERSIONS = [
  { templateType: 'cmrt', versionId: '6.6.2' },
  { templateType: 'emrt', versionId: '2.11.2' },
] as const

type TemplateVersion = Pick<ReportSnapshotV1, 'templateType' | 'versionId'>

function createSnapshot(version: TemplateVersion): ReportSnapshotV1 {
  return {
    schemaVersion: 1,
    ...version,
    locale: 'zh-CN',
    data: {
      companyInfo: { companyName: '新版导出核验', declarationScope: 'B' },
      selectedMinerals: [],
      customMinerals: [],
      questions: {},
      questionComments: {},
      companyQuestions: {},
      mineralsScope: [],
      smelterList: [],
      mineList: [],
      productList: [{
        id: 'product-1', partNumber: 'PART-1', partName: '产品',
        requestPartNumber: 'REQUEST-1', requestPartName: '请求方产品', remark: '备注',
      }],
    },
  }
}

function loadTemplate({ templateType, versionId }: TemplateVersion): ArrayBuffer {
  const type = templateType.toUpperCase()
  const filename = `${type}_${versionId}.xlsx`
  const buffer = fs.readFileSync(path.resolve(process.cwd(), 'templates', type, filename))
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
}

async function exportContexts(snapshot: ReportSnapshotV1) {
  const templateXlsx = loadTemplate(snapshot)
  const original = await loadXlsxContext(templateXlsx)
  const blob = await exportToExcel({ templateXlsx, snapshot })
  const exported = await loadXlsxContext(await blob.arrayBuffer())
  return { original, exported }
}

function getCellXml(xml: string, ref: string): string {
  const match = xml.match(new RegExp(`<c\\b[^>]*\\br="${ref}"[^>]*>[\\s\\S]*?</c>`))
  if (!match) throw new Error(`测试工作表缺少单元格：${ref}`)
  return match[0]
}

describe('新版原始模板导出', () => {
  test.each(NEW_VERSIONS)('$templateType@$versionId 保留新版结构并写入填写内容', async (version) => {
    const snapshot = createSnapshot(version)
    const restored = parseSnapshot(JSON.parse(stringifySnapshot(snapshot)))
    expect(restored).toEqual(snapshot)
    const { original, exported } = await exportContexts(restored)

    expect([...exported.sheetPathByName.keys()]).toEqual([...original.sheetPathByName.keys()])
    expect(exported.sheetPathByName.has('Revision')).toBe(false)
    const declaration = getSheetXml(exported, 'Declaration')
    expect(readCellText(declaration, 'D8', exported.sharedStrings)).toBe('新版导出核验')
    expect(readCellText(declaration, 'J3', exported.sharedStrings)).toContain(version.versionId)
    const products = getSheetXml(exported, 'Product List')
    expect(readCellText(products, 'B6', exported.sharedStrings)).toBe('PART-1')
    expect(readCellText(products, 'D6', exported.sharedStrings)).toBe('REQUEST-1')
    for (const sheet of ['Smelter Look-up', 'L', 'C', 'SorP', 'Checker']) {
      expect(getSheetXml(exported, sheet)).toBe(getSheetXml(original, sheet))
    }
  })

  test.each(['6.6.1', '6.6.2'])('CMRT %s 保留对应的来源公式及修订表结构', async (versionId) => {
    const snapshot = createSnapshot({ templateType: 'cmrt', versionId })
    snapshot.data.smelterList = [{
      id: 'SM-1', smelterNumber: 'CID000001', metal: 'tantalum',
      smelterLookup: '', smelterName: '', smelterCountry: '', sourceId: '宿主来源',
    }]
    const { original, exported } = await exportContexts(snapshot)
    const source = getSheetXml(original, 'Smelter List')
    const output = getSheetXml(exported, 'Smelter List')
    for (const ref of ['G5', 'G2504']) {
      const originalCell = getCellXml(source, ref)
      expect(getCellXml(output, ref)).toBe(originalCell)
      expect(originalCell.includes('"Enter smelter details","RMI"')).toBe(versionId === '6.6.1')
      if (versionId === '6.6.2') expect(originalCell).toContain('"Enter smelter details",""')
    }
    expect(readCellText(output, 'A5', exported.sharedStrings)).toBe('CID000001')
    expect(exported.sheetPathByName.has('Revision')).toBe(versionId === '6.6.1')
  })

  test.each(['', '用户指定来源'])('CMRT 新版手工行保留来源输入 %j', async (sourceId) => {
    const snapshot = createSnapshot({ templateType: 'cmrt', versionId: '6.6.2' })
    snapshot.data.smelterList = [{
      id: 'smelter-new-1', metal: 'tantalum', smelterLookup: 'Smelter not listed',
      smelterName: '手工冶炼厂', smelterCountry: 'China', sourceId,
    }]
    const { original, exported } = await exportContexts(snapshot)
    const output = getSheetXml(exported, 'Smelter List')
    expect(readCellText(output, 'D5', exported.sharedStrings)).toBe('手工冶炼厂')
    if (sourceId) {
      expect(getCellXml(output, 'G5')).not.toContain('<f')
      expect(readCellText(output, 'G5', exported.sharedStrings)).toBe(sourceId)
      return
    }
    expect(getCellXml(output, 'G5')).toBe(getCellXml(getSheetXml(original, 'Smelter List'), 'G5'))
  })

  test('EMRT 新版可写入矿厂清单', async () => {
    const snapshot = createSnapshot({ templateType: 'emrt', versionId: '2.11.2' })
    snapshot.data.mineList = [{
      id: 'mine-1', metal: 'cobalt', smelterName: '冶炼厂', mineName: '矿厂',
      mineCountry: 'China', mineProvince: '浙江', mineDistrict: '', comments: '矿厂备注',
    }]
    const { exported } = await exportContexts(snapshot)
    const output = getSheetXml(exported, 'Mine List')
    expect(readCellText(output, 'A5', exported.sharedStrings)).toBe('Cobalt')
    expect(readCellText(output, 'C5', exported.sharedStrings)).toBe('矿厂')
    expect(readCellText(output, 'F5', exported.sharedStrings)).toBe('China')
    expect(readCellText(output, 'M5', exported.sharedStrings)).toBe('矿厂备注')
  })
})
