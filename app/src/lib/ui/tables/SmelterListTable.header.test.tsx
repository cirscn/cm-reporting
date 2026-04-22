import { SMELTER_LOOKUP_META } from '@core/data/lookups'
import zhCN from '@core/i18n/locales/zh-CN.json'
import { getVersionDef } from '@core/registry'
import type { SmelterRow } from '@core/types/tableRows'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

import { SmelterListTable } from './SmelterListTable'

function resolveMessage(key: string): string {
  const value = key
    .split('.')
    .reduce<unknown>(
      (current, segment) =>
        current && typeof current === 'object'
          ? (current as Record<string, unknown>)[segment]
          : undefined,
      zhCN,
    )

  return typeof value === 'string' ? value : key
}

vi.mock('@ui/i18n/useT', () => ({
  useT: () => ({
    t: resolveMessage,
    locale: 'zh-CN',
    i18n: { t: resolveMessage, isInitialized: true },
  }),
}))

function renderTable(templateType: 'cmrt' | 'emrt' | 'crt' | 'amrt', versionId: string): string {
  const versionDef = getVersionDef(templateType, versionId)
  const firstMetal = versionDef.mineralScope.minerals[0]
  const rows: SmelterRow[] = [
    {
      id: 'row-1',
      metal: firstMetal?.key ?? '',
      smelterLookup: '',
      smelterName: '',
      smelterCountry: '',
      combinedMetal: '',
      combinedSmelter: '',
      smelterNumber: '',
      smelterIdentification: '',
      sourceId: '',
      smelterStreet: '',
      smelterCity: '',
      smelterState: '',
      smelterContactName: '',
      smelterContactEmail: '',
      proposedNextSteps: '',
      mineName: '',
      mineCountry: '',
      recycledScrap: '',
      comments: '',
    },
  ]

  return renderToStaticMarkup(
    <SmelterListTable
      templateType={templateType}
      versionId={versionId}
      versionDef={versionDef}
      config={versionDef.smelterList}
      availableMetals={versionDef.mineralScope.minerals}
      rows={rows}
      onChange={() => undefined}
      countryOptions={[{ value: 'CN', label: '中国' }]}
      smelterLookupMeta={SMELTER_LOOKUP_META}
    />,
  )
}

function expectLabelsInOrder(html: string, labels: string[]) {
  let lastIndex = -1

  for (const label of labels) {
    const index = html.indexOf(label, lastIndex + 1)
    expect(index, `未找到表头：${label}`).toBeGreaterThan(-1)
    expect(index, `表头顺序错误：${label}`).toBeGreaterThan(lastIndex)
    lastIndex = index
  }
}

function countOccurrences(html: string, text: string): number {
  return html.split(text).length - 1
}

function expectRequiredMarkCount(html: string, requiredColumnCount: number) {
  expect(countOccurrences(html, 'field-required-mark')).toBe(requiredColumnCount * 2)
}

describe('SmelterListTable header alignment', () => {
  test('renders CMRT 6.5 headers in template order and uses red required marks', () => {
    const html = renderTable('cmrt', '6.5')

    expectLabelsInOrder(html, [
      '冶炼厂识别号码输入列',
      '金属',
      '冶炼厂查找',
      '冶炼厂名称(1)',
      '冶炼厂所在国家或地区',
      '冶炼厂识别',
      '冶炼厂出处识别号',
      '冶炼厂所在街道',
      '冶炼厂所在城市',
      '冶炼厂地址：州/省',
      '冶炼厂联系人',
      '冶炼厂联系人电子邮件',
      '建议的后续步骤',
      '填写矿井名称，或如果所用矿产来自于回收料和报废料，请填写“回收”或“报废”。',
      '填写矿井所在国家或地区，或如果所用矿产来自于回收料和报废料，请填写“回收”或“报废”。',
      '冶炼厂的被冶炼物料是否 100% 来自于回收料或报废料？',
      '注释',
    ])

    expect(html).not.toContain('(*)')
    expectRequiredMarkCount(html, 3)
    expect(html).not.toContain('Standard Smelter Name')
    expect(html).not.toContain('Country Code')
    expect(html).not.toContain('State / Province Code')
  })

  test('renders EMRT 2.1 lookup and name columns separately and hides combined columns', () => {
    const html = renderTable('emrt', '2.1')

    expectLabelsInOrder(html, [
      '冶炼厂识别号码输入列',
      '金属',
      '冶炼厂查找',
      '冶炼厂名称',
      '冶炼工厂地址（国家）',
    ])

    expect(html).not.toContain('(*)')
    expectRequiredMarkCount(html, 4)
    expect(html).not.toContain('合并金属')
    expect(html).not.toContain('合并冶炼厂')
  })

  test('renders AMRT 1.1 without identification input or lookup columns', () => {
    const html = renderTable('amrt', '1.1')

    expectLabelsInOrder(html, [
      '金属',
      '冶炼厂名称',
      '冶炼厂所在国家或地区',
      '冶炼厂识别',
      '冶炼厂出处识别号',
    ])

    expect(html).not.toContain('(*)')
    expectRequiredMarkCount(html, 3)
    expect(html).not.toContain('冶炼厂识别号码输入列')
    expect(html).not.toContain('冶炼厂查找')
  })

  test('renders AMRT 1.3 with two smelter name headers and no combined columns', () => {
    const html = renderTable('amrt', '1.3')

    expectLabelsInOrder(html, [
      '冶炼厂识别号码输入列',
      '金属',
      '冶炼厂名称',
      '冶炼厂名称',
      '冶炼厂所在国家或地区',
    ])

    expect(html).not.toContain('(*)')
    expectRequiredMarkCount(html, 4)
    expect(countOccurrences(html, '冶炼厂名称')).toBeGreaterThanOrEqual(2)
    expect(html).not.toContain('合并金属')
    expect(html).not.toContain('合并冶炼厂')
  })
})
