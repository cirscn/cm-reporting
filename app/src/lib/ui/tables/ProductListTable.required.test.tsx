import zhCN from '@core/i18n/locales/zh-CN.json'
import { getVersionDef } from '@core/registry'
import type { ProductRow } from '@core/types/tableRows'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test, vi } from 'vitest'

import { ProductListTable } from './ProductListTable'

const REQUESTER_NUMBER_LABEL = '请求方的产品编号'
const REQUESTER_NAME_LABEL = '请求方的产品名称'

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

function renderTable(
  templateType: 'cmrt' | 'emrt' | 'amrt',
  versionId: '6.6' | '2.1' | '2.11' | '1.3',
  rows: ProductRow[],
): string {
  const versionDef = getVersionDef(templateType, versionId)

  return renderToStaticMarkup(
    <ProductListTable
      templateType={templateType}
      versionId={versionId}
      versionDef={versionDef}
      config={versionDef.productList}
      rows={rows}
      onChange={() => undefined}
      required
      showRequesterColumns={versionDef.productList.hasRequesterColumns}
    />,
  )
}

describe('ProductListTable required behavior', () => {
  test('shows requester product labels in zh-CN for CMRT 6.6 and EMRT 2.11', () => {
    const cmrtHtml = renderTable('cmrt', '6.6', [
      {
        id: 'row-1',
        productNumber: '',
        productName: '',
        requesterNumber: '',
        requesterName: '',
        comments: '',
      },
    ])

    const emrtHtml = renderTable('emrt', '2.11', [
      {
        id: 'row-1',
        productNumber: '',
        productName: '',
        requesterNumber: '',
        requesterName: '',
        comments: '',
      },
    ])

    expect(cmrtHtml).toContain(REQUESTER_NUMBER_LABEL)
    expect(cmrtHtml).toContain(REQUESTER_NAME_LABEL)
    expect(emrtHtml).toContain(REQUESTER_NUMBER_LABEL)
    expect(emrtHtml).toContain(REQUESTER_NAME_LABEL)
  })

  test('highlights only respondent product number as required for CMRT 6.6', () => {
    const html = renderTable('cmrt', '6.6', [
      {
        id: 'row-1',
        productNumber: '',
        productName: '',
        requesterNumber: '',
        requesterName: '',
        comments: '',
      },
    ])

    expect(html.split('class="field-required"').length - 1).toBe(1)
  })

  test('keeps requester columns for AMRT 1.3', () => {
    const html = renderTable('amrt', '1.3', [
      {
        id: 'row-1',
        productNumber: '',
        productName: '',
        comments: '',
      },
    ])

    expect(html).toContain(REQUESTER_NUMBER_LABEL)
    expect(html).toContain(REQUESTER_NAME_LABEL)
  })
})
