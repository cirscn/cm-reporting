import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, test } from 'vitest'

import { getSheetXml, loadXlsxContext, readCellText } from '../../public/_xlsx'

import enUS from './locales/en-US.json'
import zhCN from './locales/zh-CN.json'

const CASES = [
  { templateType: 'cmrt', versionId: '6.6.2', filename: 'CMRT_6.6.2.xlsx' },
  { templateType: 'emrt', versionId: '2.11.2', filename: 'EMRT_2.11.2.xlsx' },
] as const

const LANGUAGES = [
  { resource: enUS, sourceColumn: 'D' },
  { resource: zhCN, sourceColumn: 'E' },
] as const

function normalizeSource(value: string): string {
  return value.replace(/_x000D_/g, '').replace(/\r\n?/g, '\n').trim()
}

async function loadTemplateSource(template: typeof CASES[number]) {
  const templatePath = path.resolve(
    process.cwd(), 'templates', template.templateType.toUpperCase(), template.filename,
  )
  const buffer = fs.readFileSync(templatePath)
  const context = await loadXlsxContext(
    buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
  )
  const languageSheet = getSheetXml(context, 'L')
  const rowReferences = [...languageSheet.matchAll(/<row\b[^>]*\br="(\d+)"/g)]
    .map((match) => match[1])
  const sourceRow = (sheetName: string, cellRef: string) => {
    const row = rowReferences.find((reference) => (
      readCellText(languageSheet, `B${reference}`, context.sharedStrings) === sheetName
      && readCellText(languageSheet, `C${reference}`, context.sharedStrings) === cellRef
    ))
    expect(row, `${sheetName}!${cellRef}`).toBeDefined()
    return row
  }
  return (column: string, sheetName: string, cellRef: string) => {
    const value = readCellText(
      languageSheet, `${column}${sourceRow(sheetName, cellRef)}`, context.sharedStrings,
    )
    expect(value).toBeTruthy()
    return normalizeSource(value!)
  }
}

describe('新版模板说明资源', () => {
  test.each(CASES)(
    '$templateType@$versionId 的中英文说明与原始模板一致',
    async (template) => {
      const { templateType } = template
      const readSource = await loadTemplateSource(template)
      for (const { resource, sourceColumn } of LANGUAGES) {
        const docs = templateType === 'cmrt'
          ? resource.docs.cmrt['6.6.2']
          : resource.docs.emrt['2.11.2']
        expect(docs).toBeDefined()
        const sourceText = (sheetName: string, cellRef: string) => readSource(sourceColumn, sheetName, cellRef)

        expect(docs.instructions[1]).toBe(sourceText('Instructions', 'A3'))
        expect(docs.instructions.join('\n')).toContain('Issuer')
        expect(docs.instructions.join('\n')).not.toContain('_x000D_')
        expect(docs.definitions[0]).toEqual({
          term: sourceText('Definitions', 'B3'),
          definition: sourceText('Definitions', 'C3'),
        })
        expect(docs.smelterLookup).toEqual([sourceText('Smelter Look-up', 'A1')])
        expect(docs.smelterList).toEqual([
          sourceText('Smelter List', 'B2'), sourceText('Smelter List', 'B3'),
        ])
        expect(docs.productList).toEqual([sourceText('Product List', 'A1')])
        if (templateType === 'emrt') {
          expect(resource.docs.emrt['2.11.2'].mineList).toEqual([
            sourceText('Mine List', 'B2'), sourceText('Mine List', 'B3'),
          ])
        }
      }
    },
  )
})
