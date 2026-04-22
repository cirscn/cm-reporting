import zhCN from '@core/i18n/locales/zh-CN.json'
import { getVersionDef } from '@core/registry'
import type { MineRow } from '@core/types/tableRows'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

import { MineListTable } from './MineListTable'

function resolveMessage(key: string): string {
  const value = key
    .split('.')
    .reduce<unknown>((current, segment) => (
      current && typeof current === 'object'
        ? (current as Record<string, unknown>)[segment]
        : undefined
    ), zhCN)

  return typeof value === 'string' ? value : key
}

vi.mock('@ui/i18n/useT', () => ({
  useT: () => ({
    t: resolveMessage,
    locale: 'zh-CN',
    i18n: { t: resolveMessage, isInitialized: true },
  }),
}))

function renderTable(templateType: 'emrt' | 'amrt', versionId: string): string {
  const versionDef = getVersionDef(templateType, versionId)
  const firstMetal = versionDef.mineralScope.minerals[0]
  const rows: MineRow[] = [
    {
      id: 'mine-row-1',
      metal: firstMetal?.key ?? '',
      smelterName: '',
      mineName: '',
      mineCountry: '',
      mineId: '',
      mineIdSource: '',
      mineStreet: '',
      mineCity: '',
      mineProvince: '',
      mineDistrict: '',
      mineContactName: '',
      mineContactEmail: '',
      proposedNextSteps: '',
      comments: '',
    },
  ]

  return renderToStaticMarkup(
    <MineListTable
      config={versionDef.mineList}
      availableMetals={versionDef.mineralScope.minerals}
      rows={rows}
      onChange={() => undefined}
      countryOptions={[{ value: 'CN', label: '中国' }]}
      smelterOptions={[{ value: 'smelter-1', label: 'Smelter A' }]}
      smelterOptionsByMetal={{ [firstMetal?.key ?? '']: [{ value: 'smelter-1', label: 'Smelter A' }] }}
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

describe('MineListTable header alignment', () => {
  test('renders AMRT 1.1 headers in template order', () => {
    const html = renderTable('amrt', '1.1')

    expectLabelsInOrder(html, [
      '金属',
      '从该矿厂采购的冶炼厂的名称',
      '矿厂(矿场)名称',
      '矿厂识别（例如《CID》）',
      '冶炼厂出处识别号',
      '矿厂所在国家或地区',
      '矿厂所在街道',
      '矿厂所在城市',
      '矿厂地址：州/省',
      '矿厂联系人',
      '矿厂联系人电子邮件',
      '建议的后续步骤',
      '注释',
    ])

    expect(html).not.toContain('Country Code')
    expect(html).not.toContain('State / Province Code')
  })

  test('renders EMRT 2.1 headers in the same template order', () => {
    const html = renderTable('emrt', '2.1')

    expectLabelsInOrder(html, [
      '金属',
      '从该矿厂采购的冶炼厂的名称',
      '矿厂(矿场)名称',
      '矿厂识别（例如《CID》）',
      '冶炼厂出处识别号',
      '矿厂所在国家或地区',
      '矿厂所在街道',
      '矿厂所在城市',
      '矿厂地址：州/省',
      '矿厂联系人',
      '矿厂联系人电子邮件',
      '建议的后续步骤',
      '注释',
    ])

    expect(html).not.toContain('Country Code')
    expect(html).not.toContain('State / Province Code')
  })
})
