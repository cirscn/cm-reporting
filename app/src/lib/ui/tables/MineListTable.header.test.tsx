import zhCN from '@core/i18n/locales/zh-CN.json'
import { getVersionDef } from '@core/registry'
import type { MineRow } from '@core/types/tableRows'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

import { getMineHeaderProfile, type MineColumnId } from './mineHeaderProfile'
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

const HEADER_COLUMNS: MineColumnId[] = [
  'metal',
  'smelterName',
  'mineName',
  'mineId',
  'mineIdSource',
  'mineCountry',
  'mineStreet',
  'mineCity',
  'mineProvince',
  'mineContactName',
  'mineContactEmail',
  'proposedNextSteps',
  'comments',
]

function renderTable(
  templateType: 'emrt' | 'amrt',
  versionId: string,
  options: { withMetal?: boolean } = {},
): string {
  const versionDef = getVersionDef(templateType, versionId)
  const firstMetal = versionDef.mineralScope.minerals[0]
  const metal = options.withMetal === false ? '' : firstMetal?.key ?? ''
  const rows: MineRow[] = [
    {
      id: 'mine-row-1',
      metal,
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
      smelterOptions={[{ value: 'smelter-1', label: 'Smelter A' }]}
      smelterOptionsByMetal={{
        [firstMetal?.key ?? '']: [{ value: 'smelter-1', label: 'Smelter A' }],
      }}
    />,
  )
}

function getLabels(columns: MineColumnId[]): string[] {
  const headerProfile = getMineHeaderProfile({
    locale: 'zh-CN',
    t: resolveMessage,
  })
  return columns.map((column) => headerProfile.labels[column])
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

function expectRequiredHeaderLabels(html: string, labels: string[]) {
  for (const label of labels) {
    const index = html.indexOf(label)
    expect(index, `未找到必填表头：${label}`).toBeGreaterThan(-1)
    const thEndIndex = html.indexOf('</th>', index)
    const headerHtml = html.slice(index, thEndIndex)
    expect(headerHtml, `表头未显示必填标识：${label}`).toContain('field-required-mark')
  }
}

function expectNoRequiredHeaderLabels(html: string, labels: string[]) {
  for (const label of labels) {
    const index = html.indexOf(label)
    expect(index, `未找到表头：${label}`).toBeGreaterThan(-1)
    const thEndIndex = html.indexOf('</th>', index)
    const headerHtml = html.slice(index, thEndIndex)
    expect(headerHtml, `表头不应显示必填标识：${label}`).not.toContain('field-required-mark')
  }
}

describe('MineListTable header alignment', () => {
  test('renders AMRT 1.1 headers in template order', () => {
    const html = renderTable('amrt', '1.1')

    expectLabelsInOrder(html, getLabels(HEADER_COLUMNS))
    expect(html).not.toContain('Country Code')
    expect(html).not.toContain('State / Province Code')
  })

  test('renders EMRT 2.1 headers in the same template order', () => {
    const html = renderTable('emrt', '2.1')

    expectLabelsInOrder(html, getLabels(HEADER_COLUMNS))
    expect(html).not.toContain('Country Code')
    expect(html).not.toContain('State / Province Code')
  })

  test('marks mine row fields required after metal selection in headers', () => {
    const html = renderTable('emrt', '2.1')

    expectRequiredHeaderLabels(html, getLabels([
      'smelterName',
      'mineName',
      'mineCountry',
    ]))
  })

  test('hides mine row required marks before metal selection', () => {
    const html = renderTable('emrt', '2.1', { withMetal: false })

    expectNoRequiredHeaderLabels(html, getLabels([
      'smelterName',
      'mineName',
      'mineCountry',
    ]))
  })
})
